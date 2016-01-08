var level = require('level')
var sublevel = require('level-sublevel')
var ttl = require('level-ttl')
var path = require('path')
var way = path.resolve(__dirname, '../data')
var db = sublevel(level(way))
var enc = {valueEncoding: 'json'}

module.exports = function(name, _ttl){
  if(_ttl) return ttl(db.sublevel(name, enc))
  else return db.sublevel(name, enc)
}
