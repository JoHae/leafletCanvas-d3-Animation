/**
 * Created by Johannes on 05.09.2016.
 */
var Utils = {};

Utils.printRenderTime = function (renderTimes) {
  var sum = 0;
  var max = 0;
  var min = 10000000;
  var minI = 0;
  var maxI = 0;
  for (var i = 0; i < renderTimes.length; i++) {
    sum += renderTimes[i];
    if (renderTimes[i] < min) {
      min = renderTimes[i];
      minI = i;
    }
    if (renderTimes[i] > max) {
      max = renderTimes[i];
      maxI = i;
    }
  }
  var avg = sum / renderTimes.length;
  console.log("Render Time (avg): " + avg);
  console.log("Render Time (min): " + min + " at iteration: " + minI + "/" + renderTimes.length);
  console.log("Render Time (max): " + max + " at iteration: " + maxI + "/" + renderTimes.length);
};

Utils.prepareLengthBasedTracks = function (map, tracks, maxDuration) {
  "use strict";

  var maxLength = 0;
  // Get max length
  tracks.forEach(function (track, idx) {
    if (track.length > maxLength) {
      maxLength = track.length;
    }
  });

  var color = d3.scaleOrdinal(d3.schemeCategory10);
  var lengthToTimeScale = d3.scaleLinear()
    .domain([0, maxLength * 1000]) // Length in meters
    .range([0, maxDuration]); // seconds

  var animatedTracks = {};
  animatedTracks.tracks = [];
  tracks.forEach(function (track, idx) {
    "use strict";
    var trackCoordinates = track.geom.coordinates;
    var nTrack = {};
    nTrack.color = color(track.id);
    nTrack.points = [];
    var currentLength = 0;
    for (var i = 0; i < trackCoordinates.length; i++) {
      var d = trackCoordinates[i];
      var dot = {};
      dot.point = d;

      if (i > 0) {
        // Calculate the length to the point before
        var latlng = L.latLng(d[1], d[0]);
        var latlngBefore = L.latLng(trackCoordinates[i - 1][1], trackCoordinates[i - 1][0]);
        currentLength += latlng.distanceTo(latlngBefore);
      }
      dot.time = lengthToTimeScale(currentLength);

      nTrack.points.push(dot);
    }
    animatedTracks.tracks.push(nTrack);
  });


  return animatedTracks;
};
