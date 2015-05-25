
module.exports = function(buf, click){

  var blob = new Blob([buf], {type: 'audio/wav'})

  var a = document.createElement('a')
  
  a.href = URL.createObjectURL(blob)
  
  a.download = buf.name ? buf.name  + '.wav' : 'untitled_track.wav'

  a.rel = a.name = buf.name || 'untitled-track.wav'
  
  if(click) {

    var ev = new CustomEvent('click')
    
    a.dispatchEvent(ev)

  }
  
  return a

}
