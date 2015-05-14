var on = require('dom-event')
var fs = require('fs')
var uis = require('getids')
var on = require('dom-event')
var touchdown = require('touchdown')
var drop = require('drag-drop/buffer')
var ready = require('doc-ready')

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
  
  var sample = new sampler(context, buff, div, function(err, source){
  })
  var ctrl = ctrls.cloneNode(true)
  div.appendChild(ctrl)
  var ui = uis(ctrl)
  var loop = 0 
  for(var el in ui) touchdown.start(ui[el])
  on(ui.$play, 'touchdown', function(e){
    sample.play()
//    sample.emit('play')
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
//    var cut = sample.slice('slice')
//    samples.push(cut)
  })
  return sample
}
