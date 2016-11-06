var Resample = require('./resampler.js')
var shift = require('pitch-shift')
var jbuffers = require('jbuffers')
var frame_size = 512 * 2
var hop = 256 


module.exports = function(sr, buf, params){

  if(!(sr === params.sampleRate) && params.sampleRate) {
    var resample = new Resample(sr, params.sampleRate, 1, buf.length * sr / params.sampleRate)
    var buf = resample.resampler(buf)
    sr = params.sampleRate
  }

  
  if(!(params.pitch === 1) && params.pitch){

    var queue = jbuffers(6)
    var q = 1, e = Math.floor(buf.length / frame_size)
    var shifter = shift(function(data){
      var pusher = new Float32Array(frame_size)
      pusher.set(data)
      queue.push(pusher)

    }, function(t){ return params.pitch}, {
      frameSize: frame_size,
      hopSize: hop,
      sampleRate: sr,
      freqThreshold: .9,
      harmonicScale: 1/2
    }) 
  
    for(var x = 0; x < e; x++){
      shifter(new Float32Array(Array.prototype.slice.call(buf, x * frame_size, x * frame_size + frame_size)))
    }
 
    buf = queue.toBuffer()

  }
  if(!(params.amplitude === 1) && params.amplitude){
    buf = amp(buf, params.amplitude)
  }

  if(!(params.speed === 1) && params.speed){
    //buf = thrash(buf, params.speed)
    //  not ideal but should work for now
//    var resample = new Resample(sr, sr / params.speed, 1, buf.length / params.speed)
//    var buf = resample.resampler(buf)
//    sr = params.sampleRate
    buf = speed(buf, params.speed)
  }

  if(params.reverse){
    buf = Array.prototype.reverse.call(buf)
  }
  
  return buf
}

function thrash(_track, div, ac, offset){
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

function speed(buf, s){
  var nb = new Float32Array(Math.floor(buf.length / s))
  for(var x = 0; x < nb.length; x++){
    nb[x] = nb[x] + buf[Math.floor(x * s)]
  }
  return nb
}

function amp(buf, a){
  Array.prototype.forEach.call(buf, function(e, i){
    buf[i] = e * a
  })
  return buf
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
