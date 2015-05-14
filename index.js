var emitter = require('events').EventEmitter
var inherits = require('inherits')
inherits(sampler, emitter)

var fileBuff = require('jsynth-file-sample')
var streamBuff = require('../jsynth-stream-buf')
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

document.body.removeChild(ui.sampletmp)

module.exports = sampler 

function sampler (master, buff, parel, cb){

  if(!(this instanceof sampler)) return new sampler

  emitter.call(this)

  var self = this
  const sr = master.sampleRate 

  parel = parel || document.body
  this.file = buff // try to keep original file around, maybe not 
  this.buff = buff
  self.parent = ui.sampletmp.cloneNode(true)
  parel.appendChild(self.parent)
  self.looping = false
  self.playing = false
  self.paused = true
  self.epochStart = Date.now()
  self.getTime = function(){
    return master.currentTime - self.startTime + self.inPos
  }
  self.pause = function(){
    
    console.log(self.source.currentTime)
    self.pauseStart = self.source.currentTime; //self.getTime()
    self.epochPauseStart = Date.now()
    self.source.stop(0)
    self.source.disconnect()
    self.playing = false
    self.paused = true
  } 
  self.loop = function(aye){
    console.log('loop %s', aye)

    self.looping = aye
    self.source.loop = aye 
  }
  self.play = function(){
    if(self.playing) {
      self.source.stop(0)
      self.source.disconnect()
      fireSample(self.mono, self.inPos)
    }
    if(self.paused){
      console.log(self.pauseStart)
      fireSample(self.mono, self.pauseStart)
    }
  }
  fileBuff(master, buff, function(e, source){
    cb()
    var tracks = []
    for(var x = 0; x < source.buffer.numberOfChannels; x++){
      tracks.push(source.buffer.getChannelData(x))
    }
    var mono = mergeTracks(tracks)
    self.mono = mono
    touchdown.start(self.parent)
    on(self.parent, 'touchdown', curseHandle) // handler down below... 
    on(document,'keydown', function(evt){
      keydown(evt)
    })
    self.source = source  
    self.source.loopStart = 0
    self.source.loopEnd = source.buffer.duration
    //on(parent, 'deltavector', curseHandle) 
    
    self.paint = draw(self.parent, master)    
    self.paint.setBuffer(mono)
    //source.start(0) 
    //source.connect(master.destination)
    self.duration = tracks[0].length / master.sampleRate

//    freqency analysis experimentation.
//    probably gonna find itself in its own module
//    getFreqn()
/*
  fbuff = jbuffers(6)
    var size = 256 * 2 * 2 * 2 
    var secPerBin = 1 / (sr / size)
    var range = (sr / 2) / size
    var getRange = function(index){
      return [index * range, index * range + range]
    }
    ffts = []
    var x = 0, subuff
    worker.addEventListener('message', function(ev){
      ffts.push(ev.data)  
      if(x<mono.length) getFreqn()
    })
    function getFreqn(){
      if(x < mono.length) {
        var end = Math.min(x + size, mono.length)
        subuff = mono.subarray(x, end)
        worker.postMessage(subuff, window.location.origin)
        x+=size
      }
      else console.log(ffts)
    }

*/
  })

  function fireSample(buf, pos){
    pos = pos || 0
    self.inPos = pos
    streamBuff(master, buf, function(e, s){
      self.playing = true
      self.paused = false
      self.duration = s.buffer.duration
      self.loopDuration = s.buffer.duration - (self.source.loopStart || pos)
      self.goopDuration = s.buffer.duration - pos // for those out-of-loop restarts
      s.loop = self.looping
      s.loopStart = self.loop ? self.source.loopStart : pos 
      s.loopEnd = self.source.loopEnd || self.source.buffer.duration
      s.onended = function(){
          console.log('ended')
        if(!(self.loop)) self.playing = false
        else {
          fireSample(buf, pos)
        }
      }
      self.epochStart = Date.now()
      self.startTime = master.currentTime
      self.timeOffset = -self.startTime + pos
      self.currentTime = self.startTime + pos
      self.source = s
      s.connect(master.destination)
      s.start(0, pos, Math.pow(2, 16))
      moveNeedle(self.inPos)
    })

  }
  function moveNeedle(pos){
    window.requestAnimationFrame(function(){
       if(true && self.playing){
        var t = self.source.currentTime
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
    if(char === 'i'){
      if(self.playing) {
        self.paint.needles[1] = self.paint.needles[0]
        var epochlapsed = (evt.timeStamp - self.epochStart) / 1000
        self.epochStart = evt.timeStamp
        epochlapsed %= self.loopDuration
//          var elapsed = (master.currentTime - self.startTime) % self.loopDuration
        self.source.loopStart = self.source.currentTime//epochlapsed + self.inPos//source.loopStart
        self.inPos = self.source.loopStart
        self.startTime = master.currentTime
        self.loop(true)
        self.loopDuration = self.source.buffer.duration - self.source.loopStart//epochlapsed//source.buffer.duration - source.loopStart
        //source.disconnect()
        //fireSample(mono, epochlapsed + self.inPos)
      }
    }
    if(char === 'o'){
      if(self.playing) {
        self.paint.needles[2] = self.paint.needles[0]
        var epochlapsed = (evt.timeStamp - self.epochStart) / 1000
        //self.epochStart = evt.timeStamp
        epochlapsed %= self.loopDuration
//          var elapsed = (master.currentTime - self.startTime) % self.loopDuration
        self.source.loopEnd = self.source.currentTime//epochlapsed + self.inPos//source.loopStart
        self.outPos = self.source.loopStart
        //self.startTime = master.currentTime
        self.loopDuration = self.source.loopEnd - self.source.loopStart//epochlapsed//source.buffer.duration - source.loopStart
      }
    }
  }

  function curseHandle  (evt){
    self.source.disconnect()
    if(self.playing) self.source.stop(0)
    var x = 0
    fireSample(self.mono, x=  evt.detail.offsetX / self.parent.children[0].width * self.duration)
    self.paint.needles[0] = evt.detail.offsetX
    self.paint.setNeedles()    
    self.paint.emit('something') // i'll be back
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


