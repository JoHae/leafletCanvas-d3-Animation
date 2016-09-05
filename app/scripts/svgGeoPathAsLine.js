/**
 * Created by Johannes on 04.09.2016.
 */
var SvgGeoPathAsLine = function (tracks, map) {

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  var svg = d3.select(map.getPanes().overlayPane).append("svg");
  var g = svg.append("g").attr("class", "leaflet-zoom-hide");

  var transform = d3.geoTransform({point: projectPoint});
  var path = d3.geoPath().projection(transform);

  g.selectAll("path")
    .data(collection.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr('stroke-width', 2)
    .attr('stroke', function (d) {
      return color(d.properties.id);
    });

  var bounds = path.bounds(collection),
    topLeft = bounds[0],
    bottomRight = bounds[1];

  svg.attr("width", bottomRight[0] - topLeft[0])
    .attr("height", bottomRight[1] - topLeft[1])
    .style("left", topLeft[0] + "px")
    .style("top", topLeft[1] + "px");

  g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }
};
