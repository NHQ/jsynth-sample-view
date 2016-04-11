var waveformer = require('../jsynth-waveform');
var installCanvas = require('./install-canvas')
var emitter = require('events').EventEmitter
var inherits = require('inherits')

module.exports = draw
inherits(draw, emitter)

function draw(parent, master){ 
  if(!(this instanceof draw)) return new draw(parent, master)
  emitter.call(this)
  
  var self = this
  
  this.parent = parent
  this.sr = master.sampleRate
  this.master = master
  this.paintWave = paintWave
  this.setBuffer = function(buf){
    self.duration = buf.length / self.sr
    self.buffer = buf
    self.paintWave()
  }
  this.setNeedles = setNeedles
  var l = this.layers = new Array(3)
  var install = installCanvas(parent)
  this.wave = install()
  l.push(this.wave)
  this.needle = install()
  l.push(this.needle)
  this.cover = install()
  l.push(this.cover)

  // x offset for play time, seek, in point, and out point
  this.needles = [-100, 0, this.cover.width, -100]

  function setNeedles(){
    var canvas = self.needle
    var ctx = canvas.getContext('2d')
    var w = canvas.width
    var h = canvas.height
    ctx.clearRect(0,0,w,h)
    self.needles.forEach(function(n, i){
      if(i === 0) ctx.strokeStyle = 'yellow'
      else ctx.strokeStyle = 'blue'
      ctx.lineWidth = '2'
      ctx.beginPath()
      ctx.moveTo(n, 0)
      ctx.lineTo(n, h)
      ctx.stroke()
    })
  }

  function paintWave(){
    var o = {}
    o.buffer = self.buffer
    o.canvas = self.wave
    o.sampleRate = self.sr
    o.chunkSize = Math.floor(self.duration / 720 * o.sampleRate);
    o.positive = 'rgba(20,20,20,1)';
    o.negative = 'rgba(255,255,255,.1)'; // the default
    o.in = null; //default to 0
    o.out = null//default to buffer length
    o.width = self.wave.width
    o.height = self.wave.height
    o.y = 0
    o.x = 0;
    waveformer(o);
  }
}
