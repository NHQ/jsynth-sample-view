module.exports = function(buff, loops){
  var ab = buff.buffer
  var nbuff = new Float32Array(Math.floor(buff.length * loops))
  var y = 1
  for(var x = 0; x < loops; x++){
    nbuff.set(new Float32Array(ab.slice(0, ab.byteLength * Math.min(1, ((x + 1) % loops)))), buff.length * x)
  }

  return nbuff
}
