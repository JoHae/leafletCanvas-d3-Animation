/**
 * Created by Johannes on 04.09.2016.
 */
var LineNoAnimation = function (tracks) {

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  this.onDrawLayer = function (info) {
    var canvas = info.canvas;
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    var line = d3.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .context(context);

    tracks.forEach(function (track, idx) {
      "use strict";

      var dots = [];
      var trackCoordinates = track.geom.coordinates;
      for (var i = 0; i < trackCoordinates.length; i++) {
        var d = trackCoordinates[i];
        if (info.bounds.contains([d[1], d[0]])) {
          dots.push(info.layer._map.latLngToContainerPoint([d[1], d[0]]));
        }
      }

      context.beginPath();
      context.globalAlpha = 0.8;
      line(dots);
      context.lineWidth = 2;
      context.strokeStyle = color(idx);
      context.stroke();
      context.closePath();
    });
  }
};
