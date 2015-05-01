var waveformer = require('jsynth-waveform');
var installCanvas = require('./install-canvas')
var touchdown = require('touchdown')
var emitter = require('events').EventEmitter
var on = require('dom-event')

module.exports = draw

function draw(parent, master){ 
  if(!(this instanceof draw)) return new draw(parent, master)
  console.log(this)
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
  this.setNeedle = setNeedle
  this.shade = shade
  var l = this.layers = new Array(3)
  var install = installCanvas(parent)
  this.wave = install()
  l.push(this.wave)
  this.needle = install()
  l.push(this.needle)
  this.cover = install()
  l.push(this.cover)
  
  touchdown.start(parent)
  on(parent, 'touchdown', self.setNeedle) 

  function shade(pts){
    var canvas = this.cover
  } 
  
  function setNeedle(evt, move){
    var canvas = self.needle
    var ctx = canvas.getContext('2d')
    var w = canvas.width
    var h = canvas.height
    if(move){
      ctx.clearRect(0,0,w,h)
    }
    ctx.strokeStyle = 'yellow' 
    ctx.lineWidth = '3'
    ctx.beginPath()
    ctx.moveTo(evt.detail.offsetX, 0)
    ctx.lineTo(evt.detail.offsetX, h)
    ctx.stroke()
  }

  function paintWave(){
    var o = {}
    o.buffer = self.buffer
    o.canvas = self.wave
    o.sampleRate = self.sr
    o.chunkSize = Math.floor(o.sampleRate / 12);
    o.positive = 'rgba(20,20,20,1)';
    o.negative = 'rgba(255,255,255,.1)'; // the default
    o.in = null; //default to 0
    o.out = null//default to buffer length
    o.width = self.wave.width
    o.height = self.wave.height
    o.y = 0
    o.x = 0;
    console.log(o)
    waveformer(o);
  }
}
