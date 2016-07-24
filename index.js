console.log('i am alive');


//var endPoint = "https:www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyA30BtAT-lBL3irQvEz_0w-yxeQNwz156o";

var map;
var lat;
var lng;
var circle;
var trafficLayer;

// var trafficInCircle = {
//     center: position,
// }






function toggleTraffic(){
    if(trafficLayer.getMap() == null){
        //traffic layer is disabled.. enable it
        trafficLayer.setMap(map);
    } else {
        //traffic layer is enabled.. disable it
        trafficLayer.setMap(null);
    }
};



var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

function success(pos) {
  var crd = pos.coords;

  console.log('Your current position is:');
  console.log('Latitude : ' + crd.latitude);
  console.log('Longitude: ' + crd.longitude);
  console.log('More or less ' + crd.accuracy + ' meters.');
};

function error(err) {
  console.log('ERROR(' + err.code + '): ' + err.message);
};

navigator.geolocation.getCurrentPosition(success, error, options);

function initMap() {
   navigator.geolocation.getCurrentPosition(function (position) {
     var position;
       var position = {
               lat: position.coords.latitude,
               lng: position.coords.longitude
           };
           console.log('position',position);
       map = new google.maps.Map(document.getElementById('map'), {
           center: position,
           zoom: 15
       });


      //  for (var position in map ) {
      //    circle = new google.maps.Circle({
      //    center: position,
      //    radius: 1500,
      //    map: map,
      //    fillColor: '#0000FF',
      //    fillOpacity: 0.1,
      //    strokeColor: '#0000FF',
      //    strokeOpacity: 1.0
      //
      //
       //
      //    });
      //  }


       var circle = new google.maps.Circle({
       center: position,
       radius: 1500,
       map: map,
       fillColor: '#0000FF',
       fillOpacity: 0.1,
       strokeColor: '#0000FF',
       strokeOpacity: 1.0



       });

      map.fitBounds(circle.getBounds());

      var marker = new google.maps.Marker({
          position: position,
          map: map,
          draggable: true,
          animation: google.maps.Animation.DROP,
          title:"Hello World!"
      });
      // To add the marker to the map, call setMap();
      marker.setMap(map);

      marker.bindTo("position", circle, "center");

      trafficLayer = new google.maps.TrafficLayer();
       google.maps.event.addDomListener(document.getElementById('trafficToggle'), 'click', toggleTraffic);

       //trafficLayer.bindTo("position", circle, "center");
   });



};

// var findBtn = document.getElementById('findme');
// findBtn.addEventListener('click', function() {
//   var inputRadius = document.getElementById('inputRadius');
//   console.log(inputRadius.value);
//   circle = new google.maps.Circle({
//   center: position in initMap(),
//   radius: inputRadius.value,
//   map: map,
//   fillColor: '#0000FF',
//   fillOpacity: 0.1,
//   strokeColor: '#0000FF',
//   strokeOpacity: 1.0
//
//
//
//   });
//
//  map.fitBounds(circle.getBounds());

//});
//
//     $.post({
//             url: endPoint,
//             dataType: 'json'
//         })
//         .done(function(response) {
//             console.log('response', response);
//             var lat = response.location.lat;
//             var lng = response.location.lng;
//             var location = response;
//             var mapContainer = document.getElementById('whereami');
//             //mapContainer.appendChild(lat);
//             mapContainer.appendChild(document.createTextNode('lat: ' + lat + '  long: ' + lng));
//             // initMap();
//
//         });



//});
