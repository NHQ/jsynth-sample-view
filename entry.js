var path = require('path')
//var hboot = require('hyperboot/rpc')
//hboot.toggle()
var on = require('dom-event')
var fs = require('fs')
//var nb = require('../nbfs') // note-bene
//nb.setStorage(5 * 1024 * 1024 * 1024)
var uis = require('getids')
var on = require('dom-event')
var touchdown = require('touchdown')
var charcode = require('keycode')
var drop = require('drag-drop/buffer')
var ready = require('doc-ready')
var hover = require('../mousearound')
var filebutton = require('file-button')
var resample = require('jsynth-resampler')
var dlblob = require('./blob')
var _import = require('./import')
var sampler = require('./')
var master = new AudioContext
var sample = undefined // selected sample
var ctrls = fs.readFileSync('./controls.html', 'utf8')
var menu = fs.readFileSync('./menubar.html', 'utf8')
var samples = []
var body = document.body 


ready(function(){
  ctrls = ghost(ctrls)
  body.appendChild(ctrls[0])
  menu = ghost(menu)[0]
  body.appendChild(menu)
  var menui = uis(menu)
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

  function ghost(html){
    var div = document.createElement('div')
    div.innerHTML = html
    return div.children
  }


  var ui = uis(ctrls[0])
  var loop = 0 
  for(var el in ui) touchdown.start(ui[el])
  on(ui.export, 'touchdown', function(e){
    var buf = sample.slice()
    buf.name = sample.name
    dlblob(buf, master.sampleRate, true, function(e, a){
      console.log(e, a)
      document.body.appendChild(a)
    })
  })
  on(ui.speedRange, 'input', function(e){
    ui.speed.value = parseFloat(e.target.value)
    sample.speed(parseFloat(e.target.value))
  })
  on(ui.pitchRange, 'input', function(e){
    ui.pitch.value = parseFloat(e.target.value)
    sample.setPitch(parseFloat(e.target.value))
  })
  on(ui.ampRange, 'input', function(e){
    ui.amplitude.value = parseFloat(e.target.value)
    sample.amplitude(parseFloat(e.target.value))
  })
  on(ui.amplitude, 'input', function(e){
    sample.amplitude(e.target.valueAsNumber)
    ui.ampRange.value = ui.ampRange.textContent = e.target.valueAsNumber
  })
  on(ui.pitch, 'input', function(e){
    sample.setPitch(e.target.valueAsNumber)
    ui.pitchRange.value = ui.pitchRange.textContent = e.target.valueAsNumber
  })
  on(ui.speed, 'input', function(e){
    sample.speed(e.target.valueAsNumber)
    ui.speedRange.value = ui.speedRange.textContent = e.target.valueAsNumber
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
/*  on(ui.$xchop, 'touchdown', function(e){
    var n = parseInt(ui.$xchopval.value)
    sample.chop(n, function(e, chops){
      chops.forEach(function(e){
        createSample([e], function(_sample){
          console.log(_sample)
          _sample.index = samples.length
          samples.push(_sample)
        })
    })})
  })
*/
  on(ui.$slice, 'touchdown', function(e){
    var cut = sample.slice()
    var params = sample.getParams()
    console.log(params)
    cut = resample(master.sampleRate, cut, params)
    console.log(cut)
    createSample([cut], function(_sample){
       
      samples.push(_sample)
    })
  })
  drop(body, function(files){
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

  on(document,'keydown', function(evt){
    keydown(evt)
  })
})

function keydown(evt){
  var char = charcode(evt)
  if(evt.srcElement.tagName === 'INPUT') return
  console.log(char)
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
    case 'space':
      evt.preventDefault()
      sample.play()
    break;
    case 'delete':
    break;
    case char.match(/[0-9]/) && char.match(/[0-9]/)[0]:
      sample = samples[parseInt(char)-1]
    break;
  }
  if(char === 'i'){
  }
  if(char === 'o'){
  }
}
function createSample(buff, cb){
  var div = document.createElement('div')
  div.classList.add('sample-container')
  div.setAttribute('tabIndex', samples.length + 1)
  document.body.appendChild(div)
  on(div, 'focus', function(){
    console.log(this.tabIndex)
    sample = samples[this.tabIndex-1]
    console.log(sample)
  })
  if(Array.isArray(buff)){
    
    // buf is an array of channel datas in float32 type arrays
    // no need to decode

    var tracks = buff

    var s = new sampler(master, tracks, div, function(err, src){})

    cb(s)

  }
  else{
    master.decodeAudioData(buff, function(buffer){
      var tracks = []
      for(var x = 0; x < buffer.numberOfChannels; x++){
        tracks.push(buffer.getChannelData(x))
      }

      var s = new sampler(master, tracks, div, function(err, src){})

      cb(s)

    })
  }
  return div 
}
