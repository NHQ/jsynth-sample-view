var archiver = require('archiver')
var concat = require('concat-stream')

module.exports = function(bufs, name, click){
  
  var zip = archiver('zip')

  var a = document.createElement('a')
  
  zip.pipe(concat(function(zipped){
    
    var blob = new Blob([zipped], {type: 'application/octet-stream'})
    
    a.href = URL.createObjectURL(blob)
    
    a.rel = a.name = name

    a.download = true
    
    if(click) {

      var ev = new CustomEvent('click')
      
      a.dispatchEvent(ev)

    }
  
  }))

  bufs.forEach(function(e){
    zip.append(e, {name: e.name})
  })

  zip.finalize()
  
  return a

}
