var filebutton = require('file-button')
var html = fs.readFileSync('./import.html')
var emitter = require('events').EventEmitter
var ipc = require('ipc')

module.exports = function(parent){

  if(!parent) parent = document.body
  parent.appendChild()

  filebutton.create({accept: 'audio/*'}).on('fileinput',function(input){
    _import(input.files, function(files){
      files.forEach(function(e){
        var _sample = createSample(e.buffer, function(_sample){
          var n = files[0].name
          n = n.slice(0, n.lastIndexOf('.'))
          _sample.name = n
          sample = _sample
          _sample.index = samples.length
          samples.push(_sample)
        })
      })
    })
  }).mount(menui.import)
}

