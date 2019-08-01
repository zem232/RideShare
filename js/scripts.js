mapboxgl.accessToken = 'pk.eyJ1IjoiemVtMjMyIiwiYSI6ImNqdWQ5NXQxcDAydWw0NHBleGlnbDQ2NWIifQ.xzxdaO_DvGxl4eNCuIZ-Zg';
var map = new mapboxgl.Map({
  container: 'mapContainer',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-73.950348, 40.733210],
  zoom: 11
});

var zoomThreshold = 4;

function filterBy(vid) {
  //filtering for the hour, as defined by time slider
  var filters = ['==', 'Vehicle_ID', vid];
  map.setFilter('ride_paths', filters);
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
      id: 'paths',
      type: 'symbol',
      source: 'ride_paths',
      paint: {
        'fill-opacity': 0.7
      }
    });

    map.on('mousemove', function(e) {
      var features = map.queryRenderedFeatures(e.point, {
        layers: ['paths'],
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
    var slider = document.getElementById("vehicleID");
    var output = document.getElementById("timeOfDay");
    output.innerHTML = slider.value;

    slider.oninput = function() {
      $('#daily-legend').hide();
      $('#hourly-legend').show();
      $('#hourlyCount').show();
      $('#hourlyDescriptor').show();
      $('#dailyCount').hide();
      $('#dailyDescriptor').hide();
      output.innerHTML = this.value + ':00 (Military Time)';
      var VID= this.value
      console.log('Time: ',VID); // Checking to see if time scale values are registering
      console.log(typeof(VID)); // Checking type of time scale values

      // Changing the layer color for the complaints aggregated by specific time of day
      var hourlyColor = [
        'interpolate',
        ['linear'],
        ['get', 'hourly_counts'],
        0, '#f1eef6',
        2, '#d7b5d8',
        4, '#df65b0',
        6, '#dd1c77',
        8, '#980043'
      ];
      map.setPaintProperty('311-complaints-DayOf', 'fill-color', hourlyColor);

      // filtering the geojson file for each NTA for only the rows where the hour column
      // matches the hour dictated by UI
      filterBy(VID);

      // e is the event (js knows where cursor is when you move your mouse)
      map.on('mousemove', function(e) {
        var features = map.queryRenderedFeatures(e.point, {
          layers: ['311-complaints-DayOf'],
        });
        // get the first feature from the array of returned features
        const nta = features[0]
        if (nta) {
          // displaying the total counts and the complaint mode for each nta
          // in the left hand side of the website body
          $('#hourlyCount').text(nta.properties.hourly_counts);
          $('#hourlyDescriptor').text(nta.properties.complaint_type);
          // logging the complaint type
          console.log(nta.properties.complaint_type);
        }
      });

      // Creating a popup to display complaint into for nta
      var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      //
      map.on('click', '311-complaints-DayOf', function(e) {
        // Change the cursor style to a pointer
        map.getCanvas().style.cursor = 'pointer';
        // define the features of the area you clicked on the map.
        var feature = e.features[0]

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(e.lngLat)
          .setHTML(feature.properties.ntaname +
            '\n Complaints: ' + feature.properties.hourly_counts +
            '\n Common Type: ' + feature.properties.complaint_type)
          .addTo(map);
      });
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
