var Main = function () {

  // A default map
  var map = L.map('map').setView([51.9414, 7.61083], 12);
  var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxZoom: 18,
  }).addTo(map);

  var tracks = new Data().tracks;

  // Make a featurecollection
  var collection = {};
  collection.type = "FeatureCollection";
  collection.features = [];
  tracks.forEach(function (track) {
    "use strict";
    var feature = {};
    feature.type = "Feature";
    feature.geometry = track.geom;
    feature.properties = {};
    feature.properties.id = track.id;

    collection.features.push(feature);
  });

  // SVG
  //var svgGeoPath = new SvgGeoPathAsLine(collection, map);

  // Canvas
  var pointNo = new PointsNoAnimation(tracks);
  var pointBasic = new PointsBasicAnimation(tracks);

  var lineNo = new LineNoAnimation(tracks);
  var lineNoGeoPath = new LineNoAnimationGeoPath(collection);
  var pathTravel = new PathTravelAnimation(tracks);
  var pathTravelLinear = new PathTravelAnimationConstSpeed(tracks);

  L.canvasLayer()
    .delegate(pathTravelLinear)
    .addTo(map);
};

new Main();

