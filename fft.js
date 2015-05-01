var fscope = require('frequency-viewer');
var pagebus = require('page-bus')

module.exports = function () {
    var bus = pagebus()
    
    window.onload = function(){
      bus.emit('opened')
      setTimeout(window.parent.focus,0)
    }

    addEventListener('message', function (ev) {
        ev.source.postMessage(fscope.worker(ev.data), ev.origin);
    });
};
