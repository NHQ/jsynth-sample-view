module.exports = function(parent){
  if(!parent) parent = document.body
  var index = []

  return installCanvas

  function installCanvas(zIndex){
    zIndex = zIndex || index.length
    var canvas = document.createElement('canvas')
    canvas.width = parseFloat(getCSS(parent, 'width'))
    canvas.height = parseFloat(getCSS(parent, 'height'))
    canvas.style.width = canvas.width + 'px'
    canvas.style.height = canvas.height + 'px'
    //canvas.style.position = 'absolute'
    canvas.style.backgroundColor = 'transparent'
    canvas.style.zIndex = zIndex 
    //canvas.style.top = '0px'
    //canvas.style.left = '0px'
    index.splice(zIndex, 0, canvas)
    parent.appendChild(canvas)
    return canvas
  }

}

function getCSS(el, prop){
  return document.defaultView.getComputedStyle(el).getPropertyValue(prop)
}

