module.exports = mergeTracks

function mergeTracks(tracks, a){
  a = a || 1
  var track = new Float32Array(tracks[0].length)
  for(var x = 0; x < track.length; x++){
    var y = 0
      for(var z = 0; z < tracks.length; z++){
        y += tracks[z][x] 
      }
    track[x] = y / tracks.length * a
  }
  return track
}
