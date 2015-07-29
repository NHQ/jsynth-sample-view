var jbuf = require('jbuffers')

function recorder (){
  if(!(this instanceof recorder)) return new recorder
  var self = this
  this.buffers = jbuf(6)
  this.write = function(buf){
    self.buffers.push(buf)
  }
  this.concat = function(){
    return self.buffers.toBuffer()
  }
}



