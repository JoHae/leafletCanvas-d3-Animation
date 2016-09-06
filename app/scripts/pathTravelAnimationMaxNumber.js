/**
 * Created by Johannes on 04.09.2016.
 */
var PathTravelAnimationMaxNumber = function (map, tracks, numberOfAnimatedTracks) {
  // The longest track should last
  var duration = 3000;
  var timer;
  var animatedTracks = Utils.prepareLengthBasedTracks(map, tracks);

  var currentTime = 0;
  var lastTime = 0;

  var currentlyAnimatedIdxs = [];
  for (var i = 0; i < numberOfAnimatedTracks; i++) {
    currentlyAnimatedIdxs.push(i);
  }

  this.onDrawLayer = function (info) {
    // Check whether timer is running and stop
    if (timer) {
      timer.stop();
      lastTime = currentTime;
      console.log("Timer stopped at: " + lastTime);
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

    var lastPointsUsed = [];
    tracksP.forEach(function () {
      // We start at index 1
      lastPointsUsed.push(1);
    });

    (function (ctx) {
      "use strict";
      timer = d3.timer(animate);

      function animate(t) {
        "use strict";
        var start = new Date();

        currentTime = (lastTime + t) % duration;

        context.clearRect(0, 0, canvas.width, canvas.height);

        var lengthWeShouldBe = timeToLengthScale(currentTime);

        function setNewIndexDeleteOld(idx) {
          "use strict";
          var nextIdx = d3.max(currentlyAnimatedIdxs) + 1;
          if (nextIdx < tracksP.length) {
            currentlyAnimatedIdxs.push(nextIdx);
          } else {
            // Start from beginning
            currentlyAnimatedIdxs.push(0);
          }
          // Delete track index from list
          currentlyAnimatedIdxs.splice(currentlyAnimatedIdxs.indexOf(idx), 1);
          lastPointsUsed[idx] = 1;
        }

        tracksP.forEach(function (points, idx) {
          // Is this track currently animated ?
          if (currentlyAnimatedIdxs.indexOf(idx) === -1) {
            return;
          }

          var lastStart = points[lastPointsUsed[idx] - 1];
          // A track has reached its end if the last points do not fit into the current length we should be
          if (lengthWeShouldBe < lastStart.distToStart) {
            setNewIndexDeleteOld(idx);
          }

          // If the length is greater than the last points distance to start we reached the end already
          if (lengthWeShouldBe >= points[points.length - 1].distToStart) {
            setNewIndexDeleteOld(idx);
            return;
          }

          var pointStart;
          var pointEnd;
          for (var i = lastPointsUsed[idx]; i < points.length; i++) {
            if (lengthWeShouldBe <= points[i].distToStart) {
              // Found the points
              pointStart = points[i - 1];
              pointEnd = points[i];
              lastPointsUsed[idx] = i;
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
