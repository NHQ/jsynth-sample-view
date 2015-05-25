var path = require('path')
var on = require('dom-event')
var fs = require('fs')
var nb = require('../nbfs') // note-bene
nb.setStorage(5 * 1024 * 1024 * 1024)
var uis = require('getids')
var on = require('dom-event')
var touchdown = require('touchdown')
var charcode = require('keycode')
var drop = require('drag-drop/buffer')
var ready = require('doc-ready')
var hover = require('../mousearound')
var resample = require('jsynth-resampler')
var dlblob = require('./blob')
var sampler = require('./')
var master = new AudioContext
var sample = undefined // selected sample
var ctrls = fs.readFileSync('./controls.html', 'utf8')
var div = document.createElement('div')
div.innerHTML = ctrls
ctrls = div.firstChild
var samples = []
var body = document.body 
body.appendChild(ctrls)

  var ui = uis(ctrls)
  var loop = 0 
  for(var el in ui) touchdown.start(ui[el])
  on(ui.$download, 'touchdown', function(e){
    var buf = sample.slice()
    buf.name = sample.name
    dlblob(buf, true)
  })
  on(ui.amplitude, 'input', function(e){
    sample.amplitude(e.target.valueAsNumber)
  })
  on(ui.pitch, 'input', function(e){
    sample.setPitch(e.target.valueAsNumber)
  })
  on(ui.speed, 'input', function(e){
    sample.speed(e.target.valueAsNumber)
  })
  on(ui.$reverse, 'touchdown', function(e){
    sample.reverse()
  })
  on(ui.$setIn, 'touchdown', function(e){
    sample.setIn()
  })
  on(ui.$setOut, 'touchdown', function(e){
    sample.setOut()
  })
  on(ui.$play, 'touchdown', function(e){
    sample.play()
  })
  on(ui.$loop, 'touchdown', function(e){
      sample.loop(Boolean(++loop % 2))
//    sample.emit('loop')
  })
  on(ui.$pause, 'touchdown', function(e){
    sample.pause()
//    sample.emit('pause')
  })
  on(ui.$slice, 'touchdown', function(e){
    var cut = sample.slice()
    var params = sample.getParams()
    console.log(params)
    cut = resample(master.sampleRate, cut, params)
    console.log(cut)
    var _sample = createSample(cut)
    samples.push(_sample)
  })

ready(function(){
  drop(body, function(files){
    var buff = files[0].buffer
    var _sample = createSample(buff)
    var n = files[0].name
    n = n.slice(0, n.lastIndexOf('.'))
    _sample.name = n
    sample = _sample
    _sample.index = samples.length
    samples.push(_sample)
  })

  on(document,'keydown', function(evt){
    keydown(evt)
  })
})

function keydown(evt){
  var char = charcode(evt)
  console.log('char es %s', char)
  var timeIn = evt.timeStamp 
  switch (char){
    case 'i':
    break;
    case 'o':
    break;
    case 'p':
    break;
    case 'u':
    break;
    case 'r':
    break;
    case '[':
    break;
    case ']':
    break;
    case 'delete':
    break;
    case char.match(/[0-9]/) && char.match(/[0-9]/)[0]:
      sample = samples[parseInt(char)-1]
      console.log(sample.parel)
    break;
  }
  if(char === 'i'){
  }
  if(char === 'o'){
  }
}
function createSample(buff){
  var div = document.createElement('div')
  div.classList.add('sample-container')
  div.setAttribute('tabIndex', samples.length + 1)
  document.body.appendChild(div)
  on(div, 'focus', function(){
    console.log(this.tabIndex)
    sample = samples[this.tabIndex-1]
  })
  return new sampler(master, buff, div, function(err, source){})
}
