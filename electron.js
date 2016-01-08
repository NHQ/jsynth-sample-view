var spawn = require('child_process').spawn
var fs = require('fs')

console.log(fs.readFileSync('./entry.js', 'utf8'))

spawn('ls').stdout.on('data', function(data){
  console.log(data.toString())
})

spawn('ls').stdout.pipe(process.stdout)

