console.log('i am alive');

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

function deleteMarkers(markersArray) {
  for (var i = 0; i < markersArray.length; i++) {
    markersArray[i].setMap(null);
  }
  markersArray = [];
}

function initMap() {

  var bounds = new google.maps.LatLngBounds;
  var markersArray = [];

  // var origin = document.getElementById('origin_input');
  // var destination = document.getElementById('destination_input');


   navigator.geolocation.getCurrentPosition(function (position) {
     var position;
       var position = {
               lat: position.coords.latitude,
               lng: position.coords.longitude
           };
           console.log('position',position);
           var origin_place_id = null;
           var destination_place_id = null;
           var travel_mode = google.maps.TravelMode.WALKING;
    var map = new google.maps.Map(document.getElementById('map'), {
           center: position,
           zoom: 15
       });
       var marker1 = new google.maps.Marker({
           position: position,
           map: map,
           draggable: false,
           animation: google.maps.Animation.BOUNCE,
           title:"Hello World!"
       });
       // To add the marker to the map, call setMap();
       marker1.setMap(map);



  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  directionsDisplay.setMap(map);

  var origin_input = document.getElementById('origin-input');
  var destination_input = document.getElementById('destination-input');
  var modes = document.getElementById('mode-selector');

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(origin_input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(destination_input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(modes);

  var origin_autocomplete = new google.maps.places.Autocomplete(origin_input);
  origin_autocomplete.bindTo('bounds', map);
  var destination_autocomplete =
      new google.maps.places.Autocomplete(destination_input);
  destination_autocomplete.bindTo('bounds', map);

  // Sets a listener on a radio button to change the filter type on Places
  // Autocomplete.
  function setupClickListener(id, mode) {
    var radioButton = document.getElementById(id);
    radioButton.addEventListener('click', function() {
      travel_mode = mode;
    });
  }
  setupClickListener('changemode-walking', google.maps.TravelMode.WALKING);
  setupClickListener('changemode-transit', google.maps.TravelMode.TRANSIT);
  setupClickListener('changemode-driving', google.maps.TravelMode.DRIVING);

  function expandViewportToFitPlace(map, place) {
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
  }

  origin_autocomplete.addListener('place_changed', function() {
    var place = origin_autocomplete.getPlace();
    if (!place.geometry) {
      window.alert("Autocomplete's returned place contains no geometry");
      return;
    }
    expandViewportToFitPlace(map, place);

    // If the place has a geometry, store its place ID and route if we have
    // the other place ID
    origin_place_id = place.place_id;
    route(origin_place_id, destination_place_id, travel_mode,
          directionsService, directionsDisplay);
  });

  destination_autocomplete.addListener('place_changed', function() {
    var place = destination_autocomplete.getPlace();
    if (!place.geometry) {
      window.alert("Autocomplete's returned place contains no geometry");
      return;
    }
    expandViewportToFitPlace(map, place);

    // If the place has a geometry, store its place ID and route if we have
    // the other place ID
    destination_place_id = place.place_id;
    route(origin_place_id, destination_place_id, travel_mode,
          directionsService, directionsDisplay);
  });

  function route(origin_place_id, destination_place_id, travel_mode,
                 directionsService, directionsDisplay) {
    if (!origin_place_id || !destination_place_id) {
      return;
    } else {

      // deleteMarkers();

      var geocoder = new google.maps.Geocoder;

      var origin = document.getElementById("origin-input").value;
      var destination = document.getElementById("destination-input").value;
      console.log(origin);
      console.log(destination);

            var service = new google.maps.DistanceMatrixService;
            service.getDistanceMatrix({
              origins: [origin],
              destinations: [destination],
              travelMode: google.maps.TravelMode.TRANSIT,
              unitSystem: google.maps.UnitSystem.METRIC

            }, function(response, status) {
              if (status !== google.maps.DistanceMatrixStatus.OK) {
                alert('Error was: ' + status);
              } else {
                var originList = response.originAddresses;
                var destinationList = response.destinationAddresses;
                var outputDiv = document.getElementById('output');
                outputDiv.innerHTML = '';
                deleteMarkers(markersArray);

                var showGeocodedAddressOnMap = function(asDestination) {
                  //var icon = asDestination ? destinationIcon : originIcon;
                  return function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {

                      deleteMarkers();

                      map.fitBounds(bounds.extend(results[0].geometry.location));
                      markersArray.push(new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location,
                        //icon: icon
                      }));
                    } else {
                      alert('Geocode was not successful due to: ' + status);
                    }
                  };
                };

                for (var i = 0; i < originList.length; i++) {
                  var results = response.rows[i].elements;
                  geocoder.geocode({'address': originList[i]},
                      showGeocodedAddressOnMap(false));
                  for (var j = 0; j < results.length; j++) {
                    geocoder.geocode({'address': destinationList[j]},
                        showGeocodedAddressOnMap(true));
                    outputDiv.innerHTML += originList[i] + ' to ' + destinationList[j] +
                        ': ' + results[j].distance.text + ' in ' +
                        results[j].duration.text + '<br>';
                  }
                }


              }
            });
            directionsService.route({
              origin: {'placeId': origin_place_id},
              destination: {'placeId': destination_place_id},
              travelMode: travel_mode
            }, function(response, status) {
              if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
              } else {
                window.alert('Directions request failed due to ' + status);
              }//closing the else statement
            });//closing the directionsService
          }//closing the function route


    }


  // var geocoder = new google.maps.Geocoder;
  //
  // var origin = document.getElementById("origin-input").value;
  // var destination = document.getElementById("destination-input").value;
  //
  //       var service = new google.maps.DistanceMatrixService;
  //       service.getDistanceMatrix({
  //         origins: [origin],
  //         destinations: [destination],
  //         travelMode: google.maps.TravelMode.DRIVING,
  //         unitSystem: google.maps.UnitSystem.METRIC
  //
  //       }, function(response, status) {
  //         if (status !== google.maps.DistanceMatrixStatus.OK) {
  //           alert('Error was: ' + status);
  //         } else {
  //           var originList = response.originAddresses;
  //           var destinationList = response.destinationAddresses;
  //           var outputDiv = document.getElementById('output');
  //           outputDiv.innerHTML = '';
  //           //deleteMarkers(markersArray);
  //
  //           var showGeocodedAddressOnMap = function(asDestination) {
  //             //var icon = asDestination ? destinationIcon : originIcon;
  //             return function(results, status) {
  //               if (status === google.maps.GeocoderStatus.OK) {
  //                 map.fitBounds(bounds.extend(results[0].geometry.location));
  //                 markersArray.push(new google.maps.Marker({
  //                   map: map,
  //                   position: results[0].geometry.location,
  //                   //icon: icon
  //                 }));
  //               } else {
  //                 alert('Geocode was not successful due to: ' + status);
  //               }
  //             };
  //           };
  //
  //           for (var i = 0; i < originList.length; i++) {
  //             var results = response.rows[i].elements;
  //             geocoder.geocode({'address': originList[i]},
  //                 showGeocodedAddressOnMap(false));
  //             for (var j = 0; j < results.length; j++) {
  //               geocoder.geocode({'address': destinationList[j]},
  //                   showGeocodedAddressOnMap(true));
  //               outputDiv.innerHTML += originList[i] + ' to ' + destinationList[j] +
  //                   ': ' + results[j].distance.text + ' in ' +
  //                   results[j].duration.text + '<br>';
  //             }
  //           }
  //         }
  //       });

        //google.maps.event.addListenerOnce( map, 'idle', service );

      });

};//closing the getting current position function
//closing init map



// //var endPoint = "https:www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyA30BtAT-lBL3irQvEz_0w-yxeQNwz156o";
//
// var map;
// var lat;
// var lng;
// var circle;
// var trafficLayer;
// var transitLayer;
// var bikeLayer;
//
// // var trafficInCircle = {
// //     center: position,
// // }
//
//
//
//
//
//
// function toggleTraffic(){
//     if(trafficLayer.getMap() == null){
//         //traffic layer is disabled.. enable it
//         trafficLayer.setMap(map);
//     } else {
//         //traffic layer is enabled.. disable it
//         trafficLayer.setMap(null);
//     }
// };
//
// function toggleTransit(){
//     if(transitLayer.getMap() == null){
//         //traffic layer is disabled.. enable it
//         transitLayer.setMap(map);
//     } else {
//         //traffic layer is enabled.. disable it
//         transitLayer.setMap(null);
//     }
// };
//
// function toggleBike(){
//     if(bikeLayer.getMap() == null){
//         //traffic layer is disabled.. enable it
//         bikeLayer.setMap(map);
//     } else {
//         //traffic layer is enabled.. disable it
//         bikeLayer.setMap(null);
//     }
// };
//
//
//
//
//
// var options = {
//   enableHighAccuracy: true,
//   timeout: 5000,
//   maximumAge: 0
// };
//
// function success(pos) {
//   var crd = pos.coords;
//
//   console.log('Your current position is:');
//   console.log('Latitude : ' + crd.latitude);
//   console.log('Longitude: ' + crd.longitude);
//   console.log('More or less ' + crd.accuracy + ' meters.');
// };
//
// function error(err) {
//   console.log('ERROR(' + err.code + '): ' + err.message);
// };
//
// navigator.geolocation.getCurrentPosition(success, error, options);
//
// function initMap() {
//    navigator.geolocation.getCurrentPosition(function (position) {
//      var position;
//        var position = {
//                lat: position.coords.latitude,
//                lng: position.coords.longitude
//            };
//            console.log('position',position);
//        map = new google.maps.Map(document.getElementById('map'), {
//            center: position,
//            zoom: 15
//        });
//
//
//       //  for (var position in map ) {
//       //    circle = new google.maps.Circle({
//       //    center: position,
//       //    radius: 1500,
//       //    map: map,
//       //    fillColor: '#0000FF',
//       //    fillOpacity: 0.1,
//       //    strokeColor: '#0000FF',
//       //    strokeOpacity: 1.0
//       //
//       //
//        //
//       //    });
//       //  }
//
//
//        var circle = new google.maps.Circle({
//        center: position,
//        radius: 1500,
//        map: map,
//        fillColor: '#0000FF',
//        fillOpacity: 0.1,
//        strokeColor: '#0000FF',
//        strokeOpacity: 1.0
//
//
//
//        });
//
//       map.fitBounds(circle.getBounds());
//
      // var marker = new google.maps.Marker({
      //     position: position,
      //     map: map,
      //     draggable: true,
      //     animation: google.maps.Animation.DROP,
      //     title:"Hello World!"
      // });
      // // To add the marker to the map, call setMap();
      // marker.setMap(map);
//
//       marker.bindTo("position", circle, "center");
//
//       trafficLayer = new google.maps.TrafficLayer();
//        google.maps.event.addDomListener(document.getElementById('trafficToggle'), 'click', toggleTraffic);
//
//        trafficLayer.bindTo("position", circle, "center");
//
//       transitLayer = new google.maps.TransitLayer();
//       google.maps.event.addDomListener(document.getElementById('transitToggle'), 'click', toggleTransit);
//
//       bikeLayer = new google.maps.BicyclingLayer();
//       google.maps.event.addDomListener(document.getElementById('bikeToggle'), 'click', toggleBike);
//
//    });
//
//
//
//
//
// };//ending init map
//
// var screenshot = document.getElementById('screenshot');
// var img = document.getElementById('img');
// var body = document.querySelector(body);
// screenshot.addEventListener("click", function(){
//   var test1 = imagify(document.body,(base64)=>{
//     console.log('WORK!');
//     $('body.img').append('<img src="'+base64+'"/>')
// });
//
//       //img.appendChild(test1);
//   });
//
// // var findBtn = document.getElementById('findme');
// // findBtn.addEventListener('click', function() {
// //   var inputRadius = document.getElementById('inputRadius');
// //   console.log(inputRadius.value);
// //   circle = new google.maps.Circle({
// //   center: position in initMap(),
// //   radius: inputRadius.value,
// //   map: map,
// //   fillColor: '#0000FF',
// //   fillOpacity: 0.1,
// //   strokeColor: '#0000FF',
// //   strokeOpacity: 1.0
// //
// //
// //
// //   });
// //
// //  map.fitBounds(circle.getBounds());
//
// //});
// //
// //     $.post({
// //             url: endPoint,
// //             dataType: 'json'
// //         })
// //         .done(function(response) {
// //             console.log('response', response);
// //             var lat = response.location.lat;
// //             var lng = response.location.lng;
// //             var location = response;
// //             var mapContainer = document.getElementById('whereami');
// //             //mapContainer.appendChild(lat);
// //             mapContainer.appendChild(document.createTextNode('lat: ' + lat + '  long: ' + lng));
// //             // initMap();
// //
// //         });
//
//
//
// //});
