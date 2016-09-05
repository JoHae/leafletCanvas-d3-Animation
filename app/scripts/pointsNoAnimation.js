var PointsNoAnimation = function (tracks) {

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  this.onDrawLayer = function (info) {
    var ctx = info.canvas.getContext('2d');
    ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);

    tracks.forEach(function (track, idx) {
      "use strict";
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = color(idx);

      var trackCoordinates = track.geom.coordinates;
      for (var i = 0; i < trackCoordinates.length; i++) {
        var d = trackCoordinates[i];
        if (info.bounds.contains([d[1], d[0]])) {
          var dot = info.layer._map.latLngToContainerPoint([d[1], d[0]]);
          ctx.fillRect(dot.x - 2, dot.y - 2, 4, 4);
        }
      }
    });
  }
};
