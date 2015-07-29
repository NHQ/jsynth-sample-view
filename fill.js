module.exports = function(buff, fill, sr){
  var ab = buff.buffer
  var d = buf.length / sr
  var l = fill * sr
  var diff = l - buff.length
  var nbuff = new Float32Array(Math.floor(l))
  for(var x = 0; x < loops; x++){
    nbuff.set(new Float32Array(ab.slice(0, ab.byteLength * Math.min(1, ((x + 1) % loops)))), buff.length * x)
  }

  return nbuff
}
