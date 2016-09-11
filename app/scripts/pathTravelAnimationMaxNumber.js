/**
 * Created by Johannes on 04.09.2016.
 */
var PathTravelAnimationMaxNumber = function (map, tracks) {
  // The longest track should last
  var duration = 3000;
  var timer;
  var animatedTracks = Utils.prepareLengthBasedTracks(map, tracks, duration);

  var currentTime = 0;
  var lastTime = 0;

  var currentlyAnimatedIdxs = [];
  var numberOfAnimatedTracks = 1;
  for (var i = 0; i < numberOfAnimatedTracks; i++) {
    currentlyAnimatedIdxs.push(i);
  }
  var nextAnimationIndex = currentlyAnimatedIdxs.length;

  this.onDrawLayer = function (info) {
    // Check whether timer is running and stop
    if (timer) {
      timer.stop();
      lastTime = currentTime;
      console.log("Timer stopped at: " + lastTime);
    }

    // Prepare data -- calculate container point positions
    var tracksP = [];
    animatedTracks.tracks.forEach(function (track, idx) {
      "use strict";
      var points = track.points;
      var newPoints = [];
      for (var i = 0; i < points.length; i++) {
        var d = points[i].point;
        var dot = info.layer._map.latLngToContainerPoint([d[1], d[0]]);
        dot.time = points[i].time;
        newPoints.push(dot);
      }
      tracksP.push(newPoints);
    });

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

        function setNewIndexDeleteOld(idx) {
          // Delete track index from list
          currentlyAnimatedIdxs.splice(currentlyAnimatedIdxs.indexOf(idx), 1);
          lastPointsUsed[idx] = 1;

          if (nextAnimationIndex >= tracksP.length) {
            nextAnimationIndex = 0;
          }
          currentlyAnimatedIdxs.push(nextAnimationIndex);
          nextAnimationIndex++;
        }

        currentTime = (lastTime + t) % duration;
        context.clearRect(0, 0, canvas.width, canvas.height);

         // Animate tracks
        currentlyAnimatedIdxs.forEach(function (idx) {
          var points = tracksP[idx];

          var maxTimeTrack = points[points.length - 1].time;
          var ct = currentTime;
          if(ct > maxTimeTrack) {
            // Scale it down
            ct = currentTime % maxTimeTrack;
          }

          var lastStart = points[lastPointsUsed[idx] - 1];
          // A track has reached its end if the last points do not fit into the current time we should be
          if (ct < lastStart.time) {
            setNewIndexDeleteOld(idx);
          }

          // If the length is greater than the last points distance to start we reached the end already
          if (ct >= points[points.length - 1].time) {
            setNewIndexDeleteOld(idx);
            return;
          }

          var pointStart;
          var pointEnd;
          for (var i = lastPointsUsed[idx]; i < points.length; i++) {
            if (ct <= points[i].time) {
              // Found the points
              pointStart = points[i - 1];
              pointEnd = points[i];
              lastPointsUsed[idx] = i;
              break;
            }
          }

          var timeNorm = (ct - pointStart.time) / (pointEnd.time - pointStart.time);

          // Interpolate between
          var newX = d3.interpolateNumber(pointStart.x, pointEnd.x)(timeNorm);
          var newY = d3.interpolateNumber(pointStart.y, pointEnd.y)(timeNorm);

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
