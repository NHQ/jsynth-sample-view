var on = require('dom-event')
var fs = require('fs')
var uis = require('getids')
var on = require('dom-event')
var touchdown = require('touchdown')
var drop = require('drag-drop/buffer')
var ready = require('doc-ready')
var hover = require('../mousearound')

var sampler = require('./')
var context = new AudioContext

var ctrls = fs.readFileSync('./controls.html', 'utf8')
var div = document.createElement('div')
div.innerHTML = ctrls
ctrls = div.firstChild
var samples = []
var body = document.body 

ready(function(){
  drop(body, function(files){
    
    var buff = files[0].buffer

    var sample = createSample(buff)

    samples.push(sample)

  })
})

function createSample(buff){
  var div = document.createElement('div')
  div.classList.add('sample-container')
  document.body.appendChild(div)
  var sample = new sampler(context, buff, div, function(err, source){})
  var ctrl = ctrls.cloneNode(true)
  div.appendChild(ctrl)
  var ui = uis(ctrl)
  var loop = 0 
  for(var el in ui) touchdown.start(ui[el])
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
    var _sample = createSample(cut)
    samples.push(cut)
  })
  return sample
}
