module.exports = function(buff, chops){
  var ab = buff.buffer
  var buffs = []
  var l = Math.floor(buff.length / chops)
  for(var x = 0; x < chops; x++){
    var nbuff = new Float32Array(l)
    var y = x * 4 * l
    nbuff.set(new Float32Array(ab.slice(y, y + l * 4)))
    buffs.push(nbuff)
  }
  return buffs
}
