var parallel = require('run-parallel')
var blobToBuffer = require('blob-to-buffer')

module.exports = function (files, cb) {
  var tasks = Array.prototype.map.call(files, function (file) {
    return function (cb) {
      blobToBuffer(file, function (err, buffer) {
        if (err) return cb(err)
        buffer.name = file.name
        buffer.size = file.size
        buffer.type = file.type
        buffer.lastModifiedDate = file.lastModifiedDate
        cb(null, buffer)
      })
    }
  })
  parallel(tasks, function (err, results) {
    if (err) throw err
    cb(results)
  })
}
