console.log('i am alive');

$(document).ready(function(){
    //$("#myBtn").click(function(){
        $("#askModal").modal();
    });



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
                        var originList = response.originAddresses;
                        var destinationList = response.destinationAddresses;
                        var outputDiv = document.getElementById('output');
                        var saveButton = document.getElementById('saveMe');
                        //outputDiv.innerHTML = '';
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
                                    var directionsInfo = document.createTextNode(originList[i] + ' to ' + destinationList[j] +
                                        ': ' + results[j].distance.text + ' in ' +
                                        results[j].duration.text);
                                    outputDiv.appendChild(directionsInfo);
                                }

                            }
                        };

                        var directions = document.getElementById('directionsButton');
                        directions.addEventListener('click',showDirections());





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

    });//closing the getting current position function

}; //closing init map

// var saveButton = document.getElementById('saveMe');
// saveButton.addEventListener('click', function(){
//   console.log("The save button is working!");
//
//   var data = {directionsInfo};
//
//   $.post({
//           url: 'http://localhost:3000/gettingLate',
//           data: data,
//           dataType: 'json'
//       })
//       .don(function(data) {
//           console.log(data);
//       });
// })
