var fs = require('fs')
var http = require('http')
var body = require('body/form')
var router = require('router')
var uuid = require('uuid')
var stat = require('ecstatic')(__dirname + '/public')
var template = require('html-template')
var through2 = require('through2')
var through = require('through')
var bind = require('tcp-bind')
var arg = require('minimist')(process.argv)
var Router = require('router')
var cab = require('content-addressable-blob-store')
var xxx = require('../jmao')

var store = cab('./public/data')

var createdb = require('./lib/db')
var db = createdb('messages', false) // !TTL
var sessionStore = require('./lib/sessions.js')(createdb('sessions'), true)


var fd = bind(arg.p)
process.setgid(arg.g)
process.setuid(arg.u)
var ttl = 1000 * 60 * 60 * 6;

var router = Router()
router.get('/posted/:id', function(req, res){
  db.get('posted!' +  req.params.id, 
    function(err, data){
      if(data){
        var key = data
        var rs = db.createReadStream({gte:key, lt:key+'~'})
        tinplate(req, res, rs)
      }
      else {
        res.writeHead(307, {'Location':'/'})
        res.end()
      } 
    }
  )
})
router.get('/bounce/:id', function(req, res){
  db.get('posted!' +  req.params.id, 
    function(err, key){
      db.get(key, function(err, data){
        data = JSON.parse(data)
        var own = req.session.id === data.session.id
        if(own){
          db.del('posted!' + req.params.id)
          db.del(key)
        }
        res.writeHead(307, {'Location':'/'})
        res.end()
      })
    }
  )
})

var server = http.createServer(function(req, res){
  sessionStore(req, res, function(){
    router(req, res, function(){
      if(req.method == 'POST' && req.url == '/contact'){
        body(req, res, function(err, body){
          if(err) console.log(err)
          else{
            body.session = req.session
            body.id = uuid.v1()
            var now = new Date().toISOString()
            var key = 'messages!' + now + '!' + body.session.id
            db.batch([
            { 
              type: 'put',
              key: key,
              value: JSON.stringify(body)
            },
            { 
              type: 'put',
              key: 'posted!'+ body.id, 
              value: key
            },
            ], function(){
              res.writeHead(307, {'Location':'/'})
              res.end()
            }) 
          }
        })    
      }
      else if(!(req.url === '/')) stat(req, res)
      else {
        var html = template()
        var hacker = html.template('hacker')
        fs.createReadStream(__dirname + '/public/index.html').pipe(html).pipe(res)
        var r = db.createReadStream({
            gt: 'messages!',
            lt: 'messages!~'
        })
        r.pipe(through(
          function(data){
            var data = JSON.parse(data.value)
            var own = req.session.id === data.session.id
            hacker.write({
               '[key=bounce]': own ? '<a class=bounce href=/bounce/'+data.id+'>bounce</a>' : '',
              '[key=handle]':'<a class=alias href=/posted/'+data.id+'>@'+data.handle+'</a>',
              '[key=hourly]':data.hourly,
              '[key=buzzwords]':data.buzzwords
            })
          },
          function(){hacker.end()}
        ))
      }
    })
  })
})

server.listen({fd:fd})

function tinplate(req, res, db){
  var html = template()
  var hacker = html.template('hacker')
  fs.createReadStream(__dirname + '/templates/post.html').pipe(html).pipe(res)
  db.pipe(through(
    function(data){
      var data = JSON.parse(data.value)
      var own = req.session.id === data.session.id
      hacker.write({
         '[key=bounce]': own ? '<a class=bounce href=/bounce/'+data.id+'>bounce</a>' : '',
        '[key=handle]':data.handle,
        '[key=hourly]':data.hourly,
        '[key=buzzwords]':data.buzzwords,
        '[key=info]':data.info
      })
    },
    function(){hacker.end()}
  ))
}
