console.log('i am alive');



// var url = "http://localhost:3000"; //For Local Dev
var url = 'https://dry-caverns-14430.herokuapp.com' //For Heroku
var originList;
var destinationList;
var resultDistance;
var resultDuration;
var container = document.getElementById('container');

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

// function deleteMarkers(markersArray) {
//     for (var i = 0; i < markersArray.length; i++) {
//         markersArray[i].setMap(null);
//     }
//     markersArray = [];
// }

function initMap() {

    var bounds = new google.maps.LatLngBounds;
    var markersArray = [];

    // var origin = document.getElementById('origin_input');
    // var destination = document.getElementById('destination_input');


    navigator.geolocation.getCurrentPosition(function(position) {
        var position;
        var position = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        console.log('position', position);
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
            title: "Hello World!"
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

                var origin = document.getElementById("origin-input")
                    .value;
                var destination = document.getElementById("destination-input")
                    .value;
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
                        window.originList = response.originAddresses;
                        window.destinationList = response.destinationAddresses;
                        var outputDiv = document.getElementById('output');
                        var saveButton = document.getElementById('saveMe');
                        //outputDiv.innerHTML = '';
                        // deleteMarkers(markersArray);

                        var showGeocodedAddressOnMap = function(asDestination) {
                            //var icon = asDestination ? destinationIcon : originIcon;
                            return function(results, status) {
                                if (status === google.maps.GeocoderStatus.OK) {

                                    // deleteMarkers();

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



                        var showDirections = function() {
                            for (var i = 0; i < originList.length; i++) {

                                var results = response.rows[i].elements;
                                geocoder.geocode({
                                        'address': originList[i]
                                    },
                                    showGeocodedAddressOnMap(false));
                                for (var j = 0; j < results.length; j++) {
                                    geocoder.geocode({
                                            'address': destinationList[j]
                                        },
                                        showGeocodedAddressOnMap(true));
                                        outputDiv.innerHTML = "";
                                        window.resultDistance = results[j].distance.text;
                                        window.resultDuration = results[j].duration.text;
                                        console.log(results[j].distance.text);
                                        console.log(results[j].duration.text);
                                        console.log(originList);
                                        console.log(destinationList);
                                    var directionsInfo = document.createTextNode("So to get from " + originList[i] + " to " + destinationList[i] +
                                    ", it's going to take you " + results[j].duration.text + " since you're traveling "
                                    + results[j].distance.text + ".");
                                    outputDiv.appendChild(directionsInfo);

                                    $(document).ready(function(){
                                        //$("#myBtn").click(function(){
                                            $("#routeInfo").modal();
                                        });
                                }

                            }
                        };
                          showDirections();
                        // var directions = document.getElementById('directionsButton');
                        // directions.addEventListener('click',showDirections());
                        //closing the event listener

                    }
                });
                directionsService.route({
                    origin: {
                        'placeId': origin_place_id
                    },
                    destination: {
                        'placeId': destination_place_id
                    },
                    travelMode: travel_mode
                }, function(response, status) {
                    if (status === google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    } else {
                        window.alert('Directions request failed because ' + status);
                    } //closing the else statement
                }); //closing the directionsService
            } //closing the function route


        }



    var saveBtn = document.getElementById('save');
    var container = document.getElementsByName('container');

    saveBtn.addEventListener('click', function(ev){
      ev.preventDefault();
      console.log(resultDistance);
      console.log(resultDuration);
      console.log(originList);
      console.log(destinationList);
      container.innerHTML = "";

      window.data = {
        origin : originList,
        destination : destinationList,
        time : resultDuration,
        distance : resultDistance,
      };

      $.ajax({
        url: url + "/possible-routes",
        method: "POST",
        data: data,
        dataType: "json"
      }).done(function (response){
        console.log("response: ",response);



      })

    });//closing saveBtn

    var showBtn = document.getElementById('showAll');
    showBtn.addEventListener('click', function(){
      container.innerHTML = "";
      $.ajax({
  url: url + '/gettingLate',
  dataType: 'json'
}).done(function(response){
  console.log("response: ", response);

  var container = document.getElementById('container');
  for (var i = 0; i < response.length; i++) {
          var liText = response[i];
          var dest = liText.destination[0];
          var orig = liText.origin[0];
          var dist = liText.distance;
          var time = liText.time;
          console.log(orig);
          console.log(dest);
          console.log(dist);
          console.log(time);
          var routeInfo = document.createTextNode(orig + " to " + dest + " in " + time + " covering " + dist + ".");
          console.log(routeInfo);
          var deleteBtn = document.createElement('button');
          var newDiv = document.createElement('div');
          newDiv.appendChild(routeInfo);
          newDiv.appendChild(deleteBtn);
          container.appendChild(newDiv);

  deleteBtn.addEventListener('click', function(){
    newDiv.innerHTML = "";
    $.ajax({
      url: url + '/gettingLate/delete',
      method: 'delete',
      data: data,
      dataType: 'json',
    }).done(function(response){
      console.log(deleteName + " has been deleted.");
      console.log(response);
    }); // end ajax
  }); // end delete button
};

  });


          // newDiv.appendChild

          // console.log(finalString);
          // var newDiv = document.createElement('div');
          // var deleteBut = document.createElement('button');
          // newDiv.appendChild(deleteBut);
          //
          // container.appendChild(newDiv);
          // var finalString = document.createTextNode(finalDestination + finalDistance);
          // container.appendChild(finalString);

          // container.appendChild(document.createTextNode(liText));
        });
  });
};


    //closing showBtn


    //closing the getting current position function
 //closing init map

// var saveBtn = document.getElementById('save');
// var container = document.getElementsByName('container');
//
// saveBtn.addEventListener('click', function(ev){
//   ev.preventDefault();
//   container.innerHTML = "";
//
//   var data = {
//     origin : originList,
//     destination : destinationList,
//     time : results[j].duration.text,
//     distance : results[j].distance.text,
//   };
//
//   $.ajax({
//     url: url + "/possible-routes",
//     method: "POST",
//     data: data,
//     dataType: "json"
//   }).done(function (response){
//     console.log("response: ",response);
//
//     container.innerHTML = "";
//
//   })
//
// });//closing saveBtn
