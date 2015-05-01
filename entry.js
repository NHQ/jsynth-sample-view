var fileBuff = require('jsynth-file-sample')
var drop = require('drag-drop/buffer')
var draw = require('./draw')
var work = require('abre')
var jbuffers = require('jbuffers')
var ui = require('getids')(document.body)
var bus = require('page-bus')()
window.name = 'master'

var worker = work(require('./fft.js'), 'jsynth', ['width=0,height=0,menubar=no,scrollbars=no'])

bus.on('opened', function(){
  console.log('new window')
  worker.opener.focus()
})

document.body.removeChild(ui.sampletmp)

var context = new AudioContext
const sr = context.sampleRate 

drop(document.body, function(files){
  
  var buff = files[0].buffer

  fileBuff(context, buff, function(e, source){
    gotSource(e,source)
    var tracks = []
    for(var x = 0; x < source.buffer.numberOfChannels; x++){
      tracks.push(source.buffer.getChannelData(x))
    }
    
    var mono = mergeTracks(tracks)
    var parent = ui.sampletmp.cloneNode(true)
    document.body.appendChild(parent)
    var paint = draw(parent, context)    
    paint.setBuffer(mono)

    fbuff = jbuffers(6)

    ffts = []

    var size = 256 * 2 * 2 * 2 
    var secPerBin = 1 / (sr / size)
    var range = (sr / 2) / size
    var getRange = function(index){
      return [index * range, index * range + range]
    }

    var x = 0, subuff

    worker.addEventListener('message', function(ev){
      ffts.push(ev.data)  
      if(x<mono.length) getFreqn()
    })
   
//    getFreqn()

    function getFreqn(){
      if(x < mono.length) {
        var end = Math.min(x + size, mono.length)
        subuff = mono.subarray(x, end)
        worker.postMessage(subuff, window.location.origin)
        x+=size
      }
      else console.log(ffts)
    }

   


  })

  function gotSource (err, source){
    source.loop = true
    //source.playbackRate.value = 5/9;
    source.connect(context.destination)
    source.start(0)
  };

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
})
