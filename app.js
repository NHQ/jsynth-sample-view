var app = require('app')
var bowser = require('browser-window')
var Menu = require('menu')
var MenuItem = require('menu-item')
var ipc = require('ipc')


app.on('ready', init) 

ipc.on('keypress', keypress)

function keypress(evt){
  
}


function openWindow (path, params){
  var window = new bowser(params)
  window.loadUrl('file://' + path)
  return window
}

function init(){
  openWindow(__dirname + '/menubar.html', {height: 200, width:400, title: 'filez'})
  var area = require('screen')
  var size = area.getPrimaryDisplay().workAreaSize
  var window = new bowser({
    width: size.width,
    height: size.height
  })
  window.loadUrl('file://' + __dirname + '/index.html')
  window.openDevTools()
  var menu = Menu.buildFromTemplate([{
    label: 'options',
    submenu: [{
      label: 'close',
      click: function(){
        app.quit()
      }
    }]
  }])
  Menu.setApplicationMenu(menu)
}

