/**
 * Created by Johannes on 04.09.2016.
 */
var PathTravelAnimationLinearSpeed = function (tracks) {

  var color = d3.scaleOrdinal(d3.schemeCategory10);
  var duration = 10000;
  var timeScale = d3.scaleLinear()
    .domain([0, duration])
    .range([0, 1]);

  this.onDrawLayer = function (info) {
    // Prepare data
    var tracksP = [];
    var timeToPointScales = [];
    tracks.forEach(function (track, idx) {
      "use strict";
      var trackCoordinates = track.geom.coordinates;
      var points = [];
      for (var i = 0; i < trackCoordinates.length; i++) {
        var d = trackCoordinates[i];
        if (info.bounds.contains([d[1], d[0]])) {
          var dot = info.layer._map.latLngToContainerPoint([d[1], d[0]]);
          points.push(dot);
        }
      }
      tracksP.push(points);

      var timeToPointsScale = d3.scaleLinear()
        .domain([0, duration])
        // From 1 to max index since we use -1 to determine the start point
        .range([1, points.length - 1]);
      timeToPointScales.push(timeToPointsScale);
    });

    var canvas = info.canvas;
    var context = canvas.getContext('2d');

    (function (ctx) {
      "use strict";
      var timer = d3.timer(animate);

      function animate(t) {
        "use strict";

        context.clearRect(0, 0, canvas.width, canvas.height);

        if (t >= duration) {
          timer.stop();

          // Draw point at final position to ensure proper position at the end
          tracksP.forEach(function (points, idx) {
            drawPoint(ctx, points[points.length - 1]);
          });
          return;
        }
        var scaledTime = timeScale(t);

        // For each track get the points
        tracksP.forEach(function (points, idx) {
          var pointAtT = Math.round(timeToPointScales[idx](t));
          var pointStart = points[pointAtT - 1];
          var pointEnd = points[pointAtT];

          // Interpolate between
          var newX = d3.interpolateNumber(pointStart.x, pointEnd.x)(scaledTime);
          var newY = d3.interpolateNumber(pointStart.y, pointEnd.y)(scaledTime);

          drawPoint(ctx, {x: newX, y: newY});
        });
      }
    })(context);
  };

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
};
