//var level = require('levelup')
//var sublevel = require('level-sublevel')
var uuid = require('uuid')
var cookies = require('cookies')
var Keygrip = require('keygrip')
var ttl = 1000 * 60 * 60 * 6
module.exports = function(_db){

  var keygrip = Keygrip(['catpile', 'doglight'])

  var db = _db
  
  return cook
  
  function cook(req, res, next, reset){
  var cookie = new cookies(req, res, keygrip)
  var sessionID = cookie.get('signed', {signed: true})

  if(reset || !(sessionID)){ // create new session
    var session = {
      id: uuid.v1(), 
      created: new Date().getTime(),
      events: {
        server: {},
        client: {}
      }
    }
    session.expires = session.created + (ttl)
    db.put('session:'+session.id,  JSON.stringify(session),{ttl:ttl})
    cookie.set('signed', session.id, {signed: true, expires: new Date(session.expires)})
    req.session = session
    next()

  }
  else{
    db.get('session:'+sessionID, function(err, session){
      if(session) {
        req.session = JSON.parse(session);
        next()
      }
      else cook(req, res, next, true) // db got deleted
    })
  }
}}
