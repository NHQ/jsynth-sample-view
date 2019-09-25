var emitter = require('events').EventEmitter
var inherits = require('inherits')
inherits(sampler, emitter)
//var cis = Ciseaux///require('../ciseaux')
var resample = require('./resample.js')
var fileBuff = require('jsynth-file-sample')
var streamBuff = require('../jsynth-stream-buf')
var pitcher = require('../jsynth-pitch-shift')
var on = require('dom-event')
var touchdown = require('touchdown')
var charcode = require('keycode')
var draw = require('./draw')
//var work = require('abre')
var jbuffers = require('jbuffers')
var ui = require('getids')(document.body)
//var bus = require('page-bus')()
//window.name = 'master'
//var worker = work(require('./fft.js'), 'jsynth', ['width=0,height=0,menubar=no,scrollbars=no'])


var chop = require('./chop')
var loop = require('./loop')

//document.body.removeChild(ui.sampletmp)
const sampletmp = document.createElement('div')
sampletmp.classList.add('sample')

module.exports = sampler 

function sampler (master, buff, parel, cb){

  if(!(this instanceof sampler)) return new sampler(master, buff, parel, cb)

  emitter.call(this)
/*
   cis.from(buff).then(function(tape){
      tape.render(master).then(function(node){console.log(node)})
      console.log(tape) 
    })

  master.decodeAudioData(buff, function(data){
    cis.from(data).then(function(tape){
      console.log(tape)
      tape.render(master).then(function(node){
        console.log(node.numberOfChannels)
        var source = master.createBufferSource()
        source.buffer = node
//        source.connect(master.destination)
//        source.start(0)
      })
    })
  })
*/

  var self = this
  const sr = master.sampleRate 


  var pitchNode = pitcher(master, function(t){
    return pitchFn(t)
  }, 256*2*2*2*2)

  function pitchFn(t){return self.pitch}

  parel = parel || document.body
  self.parelWidth = parseFloat(window.getComputedStyle(parel).getPropertyValue('width'))
  this.file = buff // try to keep original file around, maybe not 
  this.buff = buff
  self.replaying = false
  self.parent = sampletmp.cloneNode(true)
  parel.appendChild(self.parent)
  self.looping = false
  self.playing = false
  self.paused = true
  self.reversed = false
  self.pitch = 1
  self.pitched = false
  self.playbackRate = 1
  self.epochStart = Date.now()
  self.chop = function(n, cb){
    var chops = chop(self.mono, n)
    cb(null, chops)
  }
  self.getTime = function(){
    return self.source.currentTime//master.currentTime - self.startTime + self.inPos
  }
  
  self.amplitude = function(x){
    self.source.gain = x
  }
  self.setPitch = function(x){
    if(isNaN(x)) x = 1
    self.pitch = x
    if(!self.pitched && !(self.pitch === 1)){
      self.pitched = true
      self.source.disconnect(master.destination)
      self.source.connect(pitchNode)
      pitchNode.connect(master.destination)
    }
  }
  self.connect = function(x){
    self.source.connect(x)
  }
  self.disconnect = function(x){
    self.source.disconnect()
  }
  self.speed = function(x){
    self.playbackRate = self.source.playbackRate = x
  }
  self.reverse = function(){
    self.reversed = !self.reversed
    self.source.reverse()
    var action = self.reversed ? 'add' : 'remove'
    self.paint.parent.children[0].classList[action]('reverse')
  }

  self.pause = function(){
    self.pauseStart = self.source.currentTime; //self.getTime()
    self.epochPauseStart = Date.now()
    self.source.stop(0)
    self.source.disconnect()
    self.playing = false
    self.paused = true
  } 
  self.loop = function(aye){
    self.looping = aye
    self.source.loop = aye 
  }
  self.screw = function(delta){
    var t = self.getTime() + delta / self.playbackRate
    self.source.resetTime(t)
    self.source.resetIndex(Math.floor(t * master.sampleRate))
    self.setIn()
  }
  self.play = function(time){
    if(self.playing && !self.replaying) {
      self.replaying = true
      self.source.stop(0)
      self.source.disconnect()
      fireSample(self.mono, time || self.inPos)
    }
    if(self.paused){
      self.replaying = false
      fireSample(self.mono, self.pauseStart)
    }
  }
  self.getParams = function(){
    var p = {}
    p.sampleRate = sr
    p.speed = self.source.playbackRate
    p.amplitude = self.source.gain
    p.pitch = self.pitch
    return p
  }
  self.split = function(d, offset){
    var buf = self.source.getBuffer().buffer
    var l = Math.ceil(buf.byteLength / 4 / d) 
    var cuts = []
    var o = offset || 0
    for(var x = 0; x < buf.length; x+=d){
      var s = buf.slice(x * l + o, x * l + 0 + l)
      var b = new Float32Array(l)
      b.set(s)
      if(o > 0 && x === d - 1){
        b.set(o, buf.slice(0, l - o))
      }
      cuts.push(b)
    }
    return cuts
  }
  self.slice = function(i,o){
    i = i || self.source._loopStart || 0 
    o = o || self.source._loopEnd || self.source.buffer.length - 1
    return new Float32Array(self.source.getBuffer().buffer.slice(i * 4, o * 4))
  }
  self.setIn = function(){ 
    self.inPos = self.source.currentTime
    if(self.looping) {
      self.source.loopStart = self.source.currentTime//epochlapsed + self.inPos//source.loopStart
      self.paint.needles[1] = self.paint.needles[0]
      self.inPos = self.source.loopStart
      self.loopDuration = self.source.loopEnd - self.source.loopStart//epochlapsed//source.buffer.duration - source.loopStart
    }
    if(!(self.playing))self.paint.setNeedles()    
  }
  self.setOut = function(){ 
    self.paint.needles[2] = self.paint.needles[0]
    self.source.loopEnd = self.source.currentTime//epochlapsed + self.inPos//source.loopStart
    self.outPos = self.source.loopStart
    self.loopDuration = self.source.loopEnd - self.source.loopStart//epochlapsed//source.buffer.duration - source.loopStart
    if(!(self.playing))self.paint.setNeedles()    
  }
  var tracks = buff
  var mono = mergeTracks(tracks)
  self.mono = mono
  self.duration = tracks[0].length / master.sampleRate
  streamBuff(master, mono, function(err, src){
    self.source = src
    src.playbackRate = 1
    src.loopStart = 0
    src.loopEnd = src.buffer.duration
    // needs to be moved from here
    touchdown.start(self.parent)
    on(self.parent, 'touchdown', curseHandle) // handler down below... 
    on(document,'keydown', function(evt){
      keydown(evt)
    })
    self.paint = draw(self.parent, master)    
    self.paint.setBuffer(mono)
    // to here

    cb(null, src)
  })
/*
  fileBuff(master, buff, function(e, source){
    cb()
    self.source = source  
    var tracks = []
    for(var x = 0; x < source.buffer.numberOfChannels; x++){
      tracks.push(source.buffer.getChannelData(x))
    }
    var mono = mergeTracks(tracks)
    self.mono = mono
    source.playbackRate = 1
    touchdown.start(self.parent)
    on(self.parent, 'touchdown', curseHandle) // handler down below... 
    on(document,'keydown', function(evt){
      keydown(evt)
    })
    self.source.loopStart = 0
    self.source.loopEnd = source.buffer.duration
    self.paint = draw(self.parent, master)    
    self.paint.setBuffer(mono)
    self.duration = tracks[0].length / master.sampleRate
    fireSample(mono, 0, false)
  })
*/
  function onePass(buf, pos){
    streamBuff(master, buf, function(e, s){
      s.play(pos)
      s.connect(master.destination)
      s.onended(function(){
        s.disconnect()
        console.log('ended')
      })
    })
  }


  function fireSample(buf, pos, fire){
    pos = pos || 0
    self.inPos = pos
    streamBuff(master, buf, function(e, s){
      self.playing = true
      self.paused = false
      self.mono = s.getBuffer()
      self.duration = s.buffer.duration
      self.loopDuration = s.buffer.duration - (self.source.loopStart || pos)
      self.goopDuration = s.buffer.duration - pos // for those out-of-loop restarts
      s.playbackRate = self.playbackRate || 1
      s.loop = self.looping
      s.loopStart = self.loop ? self.source.loopStart : pos 
      s.loopEnd = self.source.loopEnd || self.source.buffer.duration
      s.playbackRate= self.playbackRate
      s.onended = function(){
        console.log('emded')
        s.disconnect()
        self.playing = false
        self.paused = true
        self.pauseStart = pos
      }
      self.epochStart = Date.now()
      self.startTime = master.currentTime
      self.timeOffset = -self.startTime + pos
      self.currentTime = self.startTime + pos
      var g = self.source.gain || 1
      self.source = s;
      self.amplitude(g) 
      if(self.reversed) {
        self.reversed = false
        self.reverse()
      }
      if(!(fire === false)) {
        self.replaying = false
        s.connect(master.destination)
        s.start(0, pos)
      }
      if(!(self.pitch === 1)){
        self.setPitch(self.pitch)
      }
      moveNeedle(self.inPos)
    })

  }
  function moveNeedle(pos){
    window.requestAnimationFrame(function(){
       if(true && self.playing){
        var t = self.source.currentTime //* self.source.playbackRate
        self.paint.needles[0] = (t / self.duration) * self.parent.children[0].width
        // ugly fix for animation glitch on pause then start
        if(!isNaN(self.paint.needles[0])) self.paint.setNeedles()
        if(self.playing) moveNeedle(pos)
      }
      /*
      else if(!(self.inPos === self.source.loopStart)){
        var t;
        var elapsed = ((t = master.currentTime) - self.startTime) % self.goopDuration
        if(self.source.loopStart <= elapsed + self.inPos){
          self.startTime = t// source.loopStart - self.inPos
          self.epochStart = Date.now()
          self.inPos = self.source.loopStart
          console.log('truwoowoowoo')
        }
        else{
          self.paint.needles[0] = ((elapsed / self.duration) + (self.inPos / self.duration)) * self.parent.children[0].width 
          self.paint.setNeedles()
          if(self.playing) moveNeedle(pos)
        }
        //  click to start play somewheres outside of the loop
        //  if the current play position is in between the loop, the original code should work
        //  else some other calculation
        //  remains to be known if this works for play start after loopEnd
       
      }        
      else{
        var elapsed = (master.currentTime - self.startTime) % self.loopDuration
        self.currentTime = elapsed//(master.currentTime + self.timeOffset) % self.duration
        self.paint.needles[0] = ((elapsed / self.duration) + (self.source.loopStart / self.duration)) * self.parent.children[0].width 
        self.paint.setNeedles()
        if(self.playing) moveNeedle(pos)
      }
      */
    })
  }

  function keydown(evt){
    var char = charcode(evt)
    var timeIn = (evt.timeStamp - self.epochStart / 1000) % self.loopDuration || self.duration
    if(!self.selected) return
    if(char === 'i'){
      if(self.playing) {
        self.paint.needles[1] = self.paint.needles[0]
        self.source.loopStart = self.source.currentTime//epochlapsed + self.inPos//source.loopStart
        self.inPos = self.source.loopStart
        self.startTime = master.currentTime
        self.loopDuration = self.source.loopEnd - self.source.loopStart//epochlapsed//source.buffer.duration - source.loopStart
        self.loop(true)
      }
    }
    if(char === 'o'){
      if(self.playing) {
        self.paint.needles[2] = self.paint.needles[0]
        self.source.loopEnd = self.source.currentTime//epochlapsed + self.inPos//source.loopStart
        self.outPos = self.source.loopStart
        self.loopDuration = self.source.loopEnd - self.source.loopStart//epochlapsed//source.buffer.duration - source.loopStart
      }
    }
  }

  function curseHandle  (evt){
    self.source.disconnect()
     var x =  evt.detail.offsetX / self.parelWidth* self.duration
    if(self.playing) {
      self.source.stop(0)
      //self.source.start(0, x)
      fireSample(self.mono, x)
      self.paint.needles[0] = evt.detail.offsetX
      self.paint.setNeedles()    
    }
    else{
      self.inPos = x
      self.pauseStart = x
      self.source.currentTime = x
      self.paint.needles[0] = evt.detail.offsetX
      self.paint.setNeedles()    
    }
  }

  function trash(_track, div, ac, offset){
    var track = new Float32Array(Math.floor(_track.length / div))
    for(var x = 0; x < track.length; x++){
      var y = 0
      for(var z = 0; z < div; z++){
        y += _track[x * z]
      }
      track[x] = y / div
    }
    if(ac){
      var tt = new Float32Array(Math.floor(_track.length / ac))
      offset = tt.length * offset 
      tt.set(track, offset || 0)
      return tt
    }else return track 
  }

  function mergeTracks(tracks, a){
    a = a || 1
    var track = new Float32Array(tracks[0].length)
    for(var x = 0; x < track.length; x++){
      var y = 0
        for(var z = 0; z < tracks.length; z++){
          y += tracks[z][x] 
        }
      track[x] = y / tracks.length * a
    }
    return track
  }
}


