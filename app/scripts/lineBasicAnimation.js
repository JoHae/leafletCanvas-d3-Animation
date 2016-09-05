/**
 * Created by Johannes on 04.09.2016.
 */
var LineBasicAnimation = function (tracks) {

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  var duration = 5000;

  this.onDrawLayer = function (info) {
    var canvas = info.canvas;
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    tracks.forEach(function (track, idx) {
      "use strict";
      var dots = [];
      var trackCoordinates = track.geom.coordinates;
      for (var i = 0; i < trackCoordinates.length; i++) {
        var d = trackCoordinates[i];
        var dot = info.layer._map.latLngToContainerPoint([d[1], d[0]]);
        dots.push(dot);
      }

      var path = d3.geoPath()
        .context(context);

      var test = path();

      console.log(test);

      // var line = d3.line()
      //   .x(function(d) { return d.x; })
      //   .y(function(d) { return d.y; })
      //   .context(context);
      //
      // (function (pathNode, can) {
      //   var timeToDistanceScale = d3.scaleLinear()
      //     .domain([0, duration])
      //     .range([0, totalLength]);
      //   var ctx = can.getContext('2d');
      //
      //   // Start the timer
      //   var timer = d3.timer(function (t) {
      //     // Calculate new position of dot
      //     var distanceAtTime = timeToDistanceScale(t);
      //     var pos = pathNode.getPointAtLength(distanceAtTime);
      //
      //     // Draw the circles
      //     ctx.clearRect(0, 0, can.width, can.height);
      //
      //
      //     // Check for abort
      //     if (t >= duration) {
      //       console.log('Rendered');
      //       timer.stop();
      //     }
      //   }, 150);
      // })(pathNode, info.canvas);




    });

    function drawPoint(ctx, point) {
      "use strict";
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }

  }
};
