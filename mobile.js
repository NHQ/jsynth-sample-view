var argb = require('minimist')(process.argv)
var sample_port = argb.port || 11003 
var ui = require('getids')()
var drop = require('drag-drop/buffer')
var on = require('dom-event')
var key = require('keycode')
var jsynth = require('../jsynth')
var $ = require('./cheatcode.js')
var pui = require('../parametrical')
var ctrls = require('./controls.js')
var keys = {}
//var td = require('../touchdown')
var sampler = require('./')
var master //= new AudioContext()
var sample, samples = []

//var loopify = require('./loopsy.js')(master, ui.loopify, sample_port)

window.addEventListener('keydown', kdown)
window.addEventListener('keyup', kup)

var sui = ctrls({
  screwInterval: {type: 'dial', value: 4, min: 0, max: 1},
  chopInterval: {type: 'dial', value: 1, min: 0, max: 1},
  chopCount: {type: 'dial', value: 4, min: 0, max: 1},
  muey: {type: 'dial', value: 0, min: 0, max: 1},
  puey: {type: 'bpm', value: 0, min: 0, max: 1},
  fb_track: {type: 'dial', value: 0},
  mix_track: {type: 'dial', value: 0},
  delay_track: {type: 'dial', value: 0},
  speed_track: {type: 'dial', value: 0},
  pitch_track: {type: 'dial', value: 0},
  fb_chop:  {type: 'dial', value: 0},
  mix_chop: {type: 'dial', value: 0},
  delay_chop: {type: 'dial', value: 0},
  speed_chop: {type: 'dial', value: 0},
  pitch_chop: {type: 'dial', value: 0}
})
for(x in ui) if(sui[x]) ui[x].appendChild(sui[x].el)
sui.puey.el = ui.bpmTap//.appendChild(puey.el)
var gui = pui(sui, function(e, d){console.log(e,d)})
var state = gui.state// Object.assign({}, ui)
console.log(state)
var modes = [].map.call(document.querySelectorAll('fieldset'), e=> e)
modes.forEach(e => {
  e.addEventListener('change', evt => {
    state[evt.target.id] = true
  })
})
var master = new AudioContext
var track, chop, time, recnode
var bpm = 76
var rec
var jstreambuf = require('../jsynth-stream-buf')
var jsynthb = require('../jsynth-buffer')
var dlblob = require('./recblob.js')
var recording = false
console.log(ui)
ui.$record.onclick = e => {
  recording = !recording
  console.log(e)
  if(recording){
    rec = jstreambuf(master, null, (e, source)=>{
      if(e) console.log(e) 
    })
    recnode = jsynthb(master, (input) => {
      rec.push(input.slice(0))
    })
    //track = streambuf
    track.connect(recnode)
    recnode.connect(master.destination)
    // push it to some list of samples, give it to the looper, bury the choppa!
  }
  else if(rec){
    track.disconnect(recnode)

    var blob = rec.getBuffer().buffer
    dlblob(new Float32Array(blob), master.sampleRate, null, true, (e, a)=>{
      console.log(a)
      a.click()
      //ui.system.appendChild(a)
      //track = undefined
    })
  }
}

function kdown (e){
  let k = key(e)
  keys[k] = true
  console.log(k)
  switch(k){
    case 'space': {
      master = new AudioContext()
      master.resume()
      var choptime = $.zerone(bpm, master.sampleRate)
      var clock = jsynth(master, t => { 
        choptime.tick(t)
      }).connect(master.destination)
      choptime.beat(state.screwInterval, [Array(state.chopCount).fill(1)], function(){
        console.log(arguments)
      }) 
    }
    break;
    case 'j':
      // chop a 1 unit sample @ screw interval and play it
      // screw sets the interval diff from current time
      // chop sets the length of cut, or how many @ some unit?
      // pros and cons
      // set lenght, and then repeat with keydown (or multiple key presses debounced)
      // or, use global interval (or numerals?) and let chop be how many times to repeat
      // A: global, use numerics for how many chops (simplest, best use of keyboard for now)
      // ergo chop interval is now a stepped dial rel: unit interval dial
      // does the screw point move with time or stay put (on/off)
      // does play-time cease when chopping, or pause and pick up (on/off)
      // chop, screw, ~~trap~~, ~~vape~~, repeat
      // delays always rec'v input, but output is zero'd unless activated?
    break;
  }
}

var kup = e => {
  let k = key(e)
  keys[k] = false
}



drop(ui.$track, function(files){
  files.forEach(function(e){
    var div = createSample(e.buffer, function(_sample){
      var n = files[0].name
      n = n.slice(0, n.lastIndexOf('.'))
      _sample.name = n
      sample = _sample
      track = sample
      _sample.index = samples.length
      samples.push(_sample)
      sample.loop(true)
      sample.play()
       var bpm = 72 * 4 / 5 / 100
      setInterval(_ => {
       sample.screw(-60/bpm*8*Math.random()) 
       setTimeout(_ => {
       }, 60/bpm/1 * 1000)
       setTimeout(_ => {
       sample.screw(60/bpm*7 * Math.random()) 
        
      }, 60/bpm/6 * 1000)
      
      }, 60 / bpm * 7 * 1000)
    
    })
    

  })
})

function createSample(buff, cb){
  master.resume()
  var div = document.createElement('div')
  div.classList.add('sample-container')
  div.setAttribute('tabIndex', samples.length + 1)
  //ui.$track.innerHTML = ''//appendChild(div)
  //ui.$track.appendChild(div)
  on(div, 'focus', function(){
    console.log(this.tabIndex)
    sample = samples[this.tabIndex-1]
    console.log(sample)
  })
  if(Array.isArray(buff)){

    // buf is an array of channel datas in float32 type arrays
    // no need to decode

    var tracks = buff

    var s = new sampler(master, tracks, ui.$track, function(err, src){})

    cb(s)

  }
  else{
    master.decodeAudioData(buff, function(buffer){
      var tracks = []
      for(var x = 0; x < buffer.numberOfChannels; x++){
        tracks.push(buffer.getChannelData(x))
      }

      var s = new sampler(master, tracks, ui.$track, function(err, src){})

      cb(s)

    })
  }
  return div
}



