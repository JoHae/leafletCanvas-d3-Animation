var Main = function () {

  // A default map
  var map = L.map('map').setView([51.9414, 7.61083], 12);
  var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxZoom: 18,
  }).addTo(map);

  var tracks = new Data().tracks;

  console.log(tracks);

  var pointNo = new PointsNoAnimation(tracks);
  var pointBasic = new PointsBasicAnimation(tracks);
  var lineNo = new LineNoAnimation(tracks);
  var lineBasic = new LineBasicAnimation(tracks);

  L.canvasLayer()
    .delegate(lineBasic) // -- if we do not inherit from L.CanvasLayer  we can setup a delegate to receive events from L.CanvasLayer
    .addTo(map);

  // L.canvasLayer()
  //    .delegate(no)
  //    .addTo(map);
};

new Main();

