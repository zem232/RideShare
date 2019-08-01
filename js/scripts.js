mapboxgl.accessToken = 'pk.eyJ1IjoiemVtMjMyIiwiYSI6ImNqdWQ5NXQxcDAydWw0NHBleGlnbDQ2NWIifQ.xzxdaO_DvGxl4eNCuIZ-Zg';
var map = new mapboxgl.Map({
  container: 'mapContainer',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-73.9649257, 40.776106],
  zoom: 12
});

var zoomThreshold = 4;

function filterBy(vid) {
  //filtering for the hour, as defined by time slider
  var filters = ['==', 'Vehicle_ID', vid];
  map.setFilter('vpaths', filters);
}

// Upon initial map load, the choropleth layer will show daily complaint counts
map.on('load', function() {
  $('#hourly-legend').hide();

  // loading the Day Of election data
  $.getJSON('Data/vehicle_paths_100.geojson', function(data) {
    data.features.map(function(feature) {});

    map.addSource('ride_paths', {
      type: 'geojson', // other types of sources include: video, vector tile, & others
      data: data,
    });

    map.addLayer({
      id: 'vpaths',
      type: 'circle',
      source: 'ride_paths',
      paint: {
        "circle-color": "#11b4da",
        "circle-radius": 4,
        "circle-opacity": 0.3}
    });

    map.on('mousemove', function(e) {
      var features = map.queryRenderedFeatures(e.point, {
        layers: ['vpaths'],
      });
      const lot = features[0]
      if (lot) {
        //console.log(lot.properties.address);
    //    $('#neighborHood').text(lot.properties.ntaname);
      //  $('#dailyCount').text(lot.properties.count);
      //  $('#dailyDescriptor').text(lot.properties.mode);
      }
    });

    // Created a sliding time scale for the user to select a time of day
    // https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_js_rangeslider
    var slider = document.getElementById("myRange");
    var output = document.getElementById("vehicleID");
    output.innerHTML = slider.value;

    slider.oninput = function() {
      var VID= parseInt(this.value)
      console.log('Time: ',VID); // Checking to see if time scale values are registering
      console.log(typeof(VID)); // Checking type of time scale values
      filterBy(VID);
      output.innerHTML = this.value;

    };
  });
});


// This is Bootstrap's sidebar to find out more info about this project
$(document).ready(function() {
  $("#sidebar").mCustomScrollbar({
    theme: "minimal"
  });
  // when the dismiss arrow button is clicked on the sidebar, the sidebar will collapse.
  $('#sidebarCollapse, .overlay').on('click', function() {
    $('#sidebar').removeClass('active');
    $('.overlay').removeClass('active');
  });
  // This is the more info button that will expand the sidebar
  $('#moreInfo').on('click', function() {
    $('#sidebar').addClass('active');
    $('.overlay').addClass('active');
    $('.collapse.in').toggleClass('in');
    $('a[aria-expanded=true]').attr('aria-expanded', 'false');
  });
});
