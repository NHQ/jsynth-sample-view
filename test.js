var chop = require('./chop')
var loop = require('./loop')

var buffer = new Float32Array(16)
for(var x = 0; x < buffer.length; x++){
  buffer[x] = x
}

//console.log(buffer)
console.log(chop(buffer, 4))
console.log(loop(buffer, 4.5))
