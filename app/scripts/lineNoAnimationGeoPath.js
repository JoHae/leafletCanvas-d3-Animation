/**
 * Created by Johannes on 04.09.2016.
 */
var LineNoAnimationGeoPath = function (collection) {

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  this.onDrawLayer = function (info) {
    var transform = d3.geoTransform({point: projectPoint});
    var map = info.layer._map;
    var canvas = info.canvas;
    var context = canvas.getContext('2d');
    var path = d3.geoPath().projection(transform).context(context);

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 0.8;
    context.lineWidth = 2;

    collection.features.forEach(function (feature) {
      "use strict";
      context.strokeStyle = color(feature.properties.id);
      context.beginPath();
      path(feature);
      context.stroke();
      context.closePath();
    });

    function projectPoint(x, y) {
      var point = map.latLngToContainerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

  };
};
