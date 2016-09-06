/**
 * Created by Johannes on 04.09.2016.
 */
var PathTravelAnimationMaxDuration = function (map, tracks) {
  // The longest track should last
  var duration = 10000;
  var timer;
  var animatedTracks = Utils.prepareLengthBasedTracks(map, tracks);

  this.onDrawLayer = function (info) {
    // Check whether timer is running and stop
    if(timer) {
      console.log("Timer exists. Stop.");
      timer.stop();
    }

    // Prepare data -- calculate container point positions
    var tracksP = [];
    var maxLength = animatedTracks.maxLength;
    animatedTracks.tracks.forEach(function (track, idx) {
      "use strict";
      var points = track.points;
      var newPoints = [];
      for (var i = 0; i < points.length; i++) {
        var d = points[i].point;
        var dot = info.layer._map.latLngToContainerPoint([d[1], d[0]]);
        dot.distToStart = points[i].distToStart;
        newPoints.push(dot);
      }
      tracksP.push(newPoints);
    });

    var timeToLengthScale = d3.scaleLinear()
      .domain([0, duration])
      // Length of the tracks in meters
      .range([0, maxLength]);

    var canvas = info.canvas;
    var context = canvas.getContext('2d');
    var renderTimes = [];

    (function (ctx) {
      "use strict";
      timer = d3.timer(animate);
      var searchIndexStart = [];
      tracksP.forEach(function (points, idx) {
        searchIndexStart.push(1);
      });

      function animate(t) {
        "use strict";
        var start = new Date();

        context.clearRect(0, 0, canvas.width, canvas.height);

        if (t >= duration) {
          timer.stop();

          Utils.printRenderTime(renderTimes);

          // Draw point at final position to ensure proper position at the end
          tracksP.forEach(function (points, idx) {
            drawPoint(ctx, points[points.length - 1], animatedTracks.tracks[idx].color);
          });
          return;
        }

        var lengthWeShouldBe = timeToLengthScale(t);

        // For each track get the points
        tracksP.forEach(function (points, idx) {
          // If the length is greater than the last points distance to start we reached the end already
          if(lengthWeShouldBe >= points[points.length - 1].distToStart) {
            drawPoint(ctx, points[points.length - 1], animatedTracks.tracks[idx].color);
            return;
          }

          var pointStart;
          var pointEnd;
          for (var i = searchIndexStart[idx]; i < points.length; i++) {
            if (lengthWeShouldBe <= points[i].distToStart) {
              // Found the points
              pointStart = points[i - 1];
              pointEnd = points[i];
              searchIndexStart[idx] = i;
              break;
            }
          }
          var lengthNorm = (lengthWeShouldBe - pointStart.distToStart) / (pointEnd.distToStart - pointStart.distToStart);

          // Interpolate between
          var newX = d3.interpolateNumber(pointStart.x, pointEnd.x)(lengthNorm);
          var newY = d3.interpolateNumber(pointStart.y, pointEnd.y)(lengthNorm);

          drawPoint(ctx, {x: newX, y: newY}, animatedTracks.tracks[idx].color);
        });

        renderTimes.push(new Date() - start);
      }
    })(context);
  };

  function drawPoint(ctx, point, color) {
    "use strict";
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }
};
