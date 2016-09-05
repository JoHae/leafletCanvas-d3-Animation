var PointsBasicAnimation = function (tracks) {

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  var duration = 5000;
  var delay = function (d) {
    return d.i;
  };
  var maxDelay = 0;
  var timeScale = d3.scaleLinear()
    .domain([0, duration])
    .range([0, 1]);
  var ease = d3.easeBounceIn;
  var renderTime = 0;

  this.onDrawLayer = function (info) {
    var data = [];
    var originalData = [];

    tracks.forEach(function (track, idx) {
      "use strict";
      var c = color(idx);

      var trackCoordinates = track.geom.coordinates;

      for (var i = 0; i < trackCoordinates.length; i++) {
        var d = trackCoordinates[i];
        if (info.bounds.contains([d[1], d[0]])) {
          var dot = info.layer._map.latLngToContainerPoint([d[1], d[0]]);
          dot.i = i;
          dot.color = c;
          dot.trans = {
            i: d3.interpolateNumber(info.canvas.height, dot.y),
            delay: delay(dot)
          };
          if (dot.trans.delay > maxDelay) {
            maxDelay = dot.trans.delay;
          }
          data.push(dot);

          var origD = {};
          origD.x = dot.x;
          origD.y = dot.y;
          origD.c = c;
          originalData.push(origD);

        }
      }

    });

    (function (dots, can) {
      var ctx = can.getContext('2d');
      ctx.clearRect(0, 0, can.width, can.height);

      // Start the timer
      var timer = d3.timer(function (t) {
        // Calculate new position of dot
        dots.forEach(function (d) {
          var scaledTime = timeScale(t - d.trans.delay);
          var time = ease(scaledTime);
          d.y = d.trans.i(time);
        });

        // Draw the circles
        var start = new Date(); //d3.now()
        ctx.clearRect(0, 0, can.width, can.height);
        dots.forEach(function (d) {
          drawPoint(ctx, d);
        });
        var end = new Date(); //d3.now()
        renderTime += (end - start);

        // Check for abort
        if (t >= duration + maxDelay) {
          console.log('Render time:', renderTime);
          timer.stop();

          //ctx.clearRect(0, 0, can.width, can.height);
          originalData.forEach(function (d) {
            //drawPoint(ctx, d);
          });
        }
      }, 150);
    })(data, info.canvas);

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
