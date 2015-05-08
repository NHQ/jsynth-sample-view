var on = require('dom-event')

var touchdown = require('touchdown')
var drop = require('drag-drop/buffer')
var sampler = require('./')
var context = new AudioContext
var ready = require('doc-ready')

ready(function(){
  drop(document.body, function(files){
    
    var buff = files[0].buffer

    var sample = new sampler(context, buff, function(err, source){
    
    })

  })
})
