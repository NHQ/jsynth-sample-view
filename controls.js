var fs = require('fs')
var getids = require('getids')
var insert = require('insert-css')
var css = fs.readFileSync('ui/module.css', 'utf8')
var dial = fs.readFileSync('ui/dial.html', 'utf8')
var graph = fs.readFileSync('ui/graph.html', 'utf8')

insert(css)

var dialUI = ghost(dial)
var graphUI = ghost(graph)

module.exports = function(gparams){
  //console.log(g, gui)
  for(gp in gparams){
    if(gparams[gp].type == 'dial') {
      var g = ghost(dial)
      var gui = g.getElementsByClassName('dial')[0]
      gparams[gp].el = gui
    }
    else if(gparams[gp].type == 'amod') {
      var g = ghost(graph)
      var gui = g.getElementsByClassName('graph')[0]
      gui.classList.add(gparams[gp].type)
      gparams[gp].el = gui
    }
    else {
    }
  }
  return gparams 
}


function ghost(html){
  var div = document.createElement('div')
  div.innerHTML = html
  return div.firstChild
}

