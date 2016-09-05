/**
 * Created by Johannes on 04.09.2016.
 */
var PathTravelAnimationConstSpeed = function (tracks) {

  var color = d3.scaleOrdinal(d3.schemeCategory10);
  var duration = 10000;
  var timeScale = d3.scaleLinear()
    .domain([0, duration])
    .range([0, 1]);

  this.onDrawLayer = function (info) {
    // Prepare data
    var tracksP = [];
    var timeToLengthScales = [];
    tracks.forEach(function (track, idx) {
      "use strict";
      var trackCoordinates = track.geom.coordinates;
      var points = [];
      var currentLength = 0;
      for (var i = 0; i < trackCoordinates.length; i++) {
        var d = trackCoordinates[i];
        var dot = info.layer._map.latLngToContainerPoint([d[1], d[0]]);
        dot.color = color(tracks[0].id);

        if (i > 0) {
          // Calculate the length to the point before
          var latlng = L.latLng(d[1], d[0]);
          var latlngBefore = L.latLng(trackCoordinates[i - 1][1], trackCoordinates[i - 1][0]);
          currentLength += latlng.distanceTo(latlngBefore);
          dot.distToStart = currentLength;
        } else {
          dot.distToStart = 0;
        }

        points.push(dot);
      }
      tracksP.push(points);

      var timeToLengthScale = d3.scaleLinear()
        .domain([0, duration])
        // Length of the tracks in meters
        .range([0, currentLength]);
      timeToLengthScales.push(timeToLengthScale);
    });


    var canvas = info.canvas;
    var context = canvas.getContext('2d');

    var renderTimes = [];

    function printRenderTime() {
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
    }

    (function (ctx) {
      "use strict";
      var timer = d3.timer(animate);
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

          printRenderTime();

          // Draw point at final position to ensure proper position at the end
          tracksP.forEach(function (points, idx) {
            drawPoint(ctx, points[points.length - 1]);
          });
          return;
        }

        // For each track get the points
        tracksP.forEach(function (points, idx) {
          // ~~ is equivalent to Math.floor
          var lengthWeShouldBe = timeToLengthScales[idx](t);

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
          var length = pointEnd.distToStart - pointStart.distToStart;
          var lengthOff = lengthWeShouldBe - pointStart.distToStart;
          var lengthNorm = lengthOff / length;

          // Interpolate between
          var newX = d3.interpolateNumber(pointStart.x, pointEnd.x)(lengthNorm);
          var newY = d3.interpolateNumber(pointStart.y, pointEnd.y)(lengthNorm);

          drawPoint(ctx, {x: newX, y: newY, color: color(tracks[0].id)});
        });

        renderTimes.push(new Date() - start);
      }
    })(context);
  };

  function drawPoint(ctx, point) {
    "use strict";
    ctx.fillStyle = point.color;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }
};
