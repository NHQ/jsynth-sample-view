module.exports = function(parent){
  if(!parent) parent = document.body
  var index = []

  return installCanvas

  function installCanvas(zIndex){
    zIndex = zIndex || index.length
    var canvas = document.createElement('canvas')
    canvas.width = parseFloat(getCSS(parent, 'width'))
    canvas.height = parseFloat(getCSS(parent, 'height'))
    canvas.style.width = '100%'//canvas.width + 'px'
    canvas.style.height = '100%'//canvas.height + 'px'
    //canvas.style.position = 'absolute'
    canvas.style.backgroundColor = 'transparent'
    canvas.style.zIndex = zIndex 
    //canvas.style.top = '0px'
    //canvas.style.left = '0px'
    index.splice(zIndex, 0, canvas)
    parent.appendChild(canvas)
    var ctx = canvas.getContext('2d')
    ctx.translate(.5, .5)
    return canvas
  }

}

function getCSS(el, prop){
  return document.defaultView.getComputedStyle(el).getPropertyValue(prop)
}

