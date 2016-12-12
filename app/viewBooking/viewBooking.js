'use strict';

angular.module('taxiApp.viewBooking', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/booking', {
			templateUrl: 'viewBooking/viewBooking.html',
			controller: 'ViewBookingCtrl'
		});
	}])

	.controller('ViewBookingCtrl', function ($scope, $q, NgMap) {
		// initialize controller variables
		var vm = this;

		// if we want to debug
		vm.DEBUG = false;

		// icon files for the markers for clarity
		vm.pickupMarkerIcon = "https://www.google.com/mapfiles/marker_greenA.png";
		vm.dropoffMarkerIcon = "https://www.google.com/mapfiles/marker_greenB.png";

		// initializing distance between coordinates to be 0
		vm.distance = 0;

		// initializing client form data
		vm.formData = {
			isDisabled: true,
			clientPickupAddress: "Raatuse 22, 51009 Tartu, Estonia",
			clientPickupLat: 0.0,
			clientPickupLon: 0.0,
			clientDropoffAddress: "Vabaduse puiestee, 51004 Tartu, Estonia",
			clientDropoffLat: 0.0,
			clientDropoffLon: 0.0,
			clientPhone: "nil"
		};

		// declaring geocoder and infowindow services initialized later
		var geocoder;
		var infowindow;

		// initialize initilizes helper variables and centers the map to GPS coords.
		vm.initialize = function () {
			geocoder = new google.maps.Geocoder;
			infowindow = new google.maps.InfoWindow;
			NgMap.getMap({id: 'map'}).then(function (map) {
				vm.map = map;
				vm.addressToCoords(vm.formData.clientPickupAddress).then(function(latlng){
					var coords = new google.maps.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]));
					vm.map.setCenter(coords);
				});
			});
		};

		// callbackFunc is callback for ngmap init
		vm.callbackFunc = function (param) {
			vm.initialize();
			vm.formData.isDisabled = false;
			console.log("Callback Test: " + param);
			vm.clientCurrentLocation().then(function (position) {
				console.log("Your location is: " + position.coords.latitude + "," + position.coords.longitude);
				console.log("Accuracy is: " + position.coords.accuracy + "m");
				vm.formData.clientPickupLat = position.coords.latitude;
				vm.formData.clientPickupLon = position.coords.longitude;
				vm.coordsToAddress(position.coords.latitude, position.coords.longitude).then(function (address) {
					console.log("Address is:" + address);
					vm.formData.clientPickupAddress = address;
				});
			});
		};

		// locateMePickup me is a function that returns the current GPS location of the client and sets it
		// in the pickup input angular model
		vm.locateMePickup = function () {
			vm.clientCurrentLocation().then(function (position) {
				vm.formData.clientPickupLat = position.coords.latitude;
				vm.formData.clientPickupLon = position.coords.longitude;
				vm.coordsToAddress(position.coords.latitude, position.coords.longitude).then(function (address) {
					console.log("Address is:" + address);
					vm.formData.clientPickupAddress = address;
					var to = new google.maps.LatLng(vm.formData.clientDropoffLat, vm.formData.clientDropoffLon);
					var from = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
					vm.distance = vm.calcDistance(from, to);
				});
			});
		};

		// locateMeDropoff me is a function that returns the current GPS location of the client and sets it
		// in the dropoff input angular model
		vm.locateMeDropoff = function () {
			vm.clientCurrentLocation().then(function (position) {
				vm.formData.clientDropoffLat = position.coords.latitude;
				vm.formData.clientDropoffLon = position.coords.longitude;
				vm.coordsToAddress(position.coords.latitude, position.coords.longitude).then(function (address) {
					console.log("Address is:" + address);
					vm.formData.clientDropoffAddress = address;
					var from = new google.maps.LatLng(vm.formData.clientPickupLat, vm.formData.clientPickupLon);
					var to = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
					vm.distance = vm.calcDistance(from, to);
				});
			});
		};

		// calcDistance calculates distance in km between two geo points using google,
		// takes in google.maps.LatLng type values
		vm.calcDistance = function(from, to){
			return (google.maps.geometry.spherical.computeDistanceBetween(from, to) / 1000).toFixed(2);
		};

		// onDragPickupMarkerPos is an on-drag handler for pick up marker
		vm.onDragPickupMarkerPos = function (event) {
			var latlng = [event.latLng.lat(), event.latLng.lng()];
			console.log("Pickup: " + latlng);
			vm.formData.clientPickupLat = event.latLng.lat();
			vm.formData.clientPickupLon = event.latLng.lng();

			vm.coordsToAddress(event.latLng.lat(), event.latLng.lng()).then(function (address) {
				console.log("Pickup address: " + address);
				vm.formData.clientPickupAddress = address;
				var from = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
				var to = new google.maps.LatLng(vm.formData.clientDropoffLat, vm.formData.clientDropoffLon);
				vm.distance = vm.calcDistance(from, to);
			});
		};

		// onDragDropoffMarkerPos is an on-drag handler for drop off marker
		vm.onDragDropoffMarkerPos = function (event) {
			var latlng = [event.latLng.lat(), event.latLng.lng()];
			console.log("Dropoff: " + latlng);
			vm.formData.clientDropoffLat = event.latLng.lat();
			vm.formData.clientDropoffLon = event.latLng.lng();

			vm.coordsToAddress(event.latLng.lat(), event.latLng.lng()).then(function (address) {
				console.log("Dropoff address: " + address);
				vm.formData.clientDropoffAddress = address;
				var to = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
				var from = new google.maps.LatLng(vm.formData.clientPickupLat, vm.formData.clientPickupLon);
				vm.distance = vm.calcDistance(from, to);
			});
		};

		// coordsToAddress is ahelper-function to get address from coordinates(uses promise)
		vm.coordsToAddress = function (lat, lng) {
			var deferred = $q.defer();
			var latlng = new google.maps.LatLng(lat, lng);
			geocoder.geocode({
				'latLng': latlng
			}, function (results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					if (results[1]) {
						deferred.resolve(results[1].formatted_address);
					} else {
						console.log("No results found");
					}
				} else {
					console.log("Geocoder failed due to: " + status);
				}
			});
			return deferred.promise;
		};

		// addressToCoords is a helper-function to get coordinates from address(uses promise)
		vm.addressToCoords = function (address) {
			var deferred = $q.defer();
			geocoder.geocode({
				'address': address
			}, function (results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					deferred.resolve([results[0].geometry.location.lat(), results[0].geometry.location.lng()]);
				} else {
					console.log('Geocode was not successful for the following reason: ' + status);
				}
			});
			return deferred.promise;
		};

		// clientCurrentLocation is a helper-function to geolocate client(uses promise)
		vm.clientCurrentLocation = function () {
			var deferred = $q.defer();

			navigator.geolocation.getCurrentPosition(
				successCallback,
				errorCallback_highAccuracy,
				{maximumAge: 600000, timeout: 5000, enableHighAccuracy: true}
			);

			// if high accuracy is supported
			function errorCallback_highAccuracy(position) {
				if (error.code == error.TIMEOUT) {
					// Attempt to get GPS loc timed out after 5 seconds,
					// try low accuracy location
					console.log("attempting to get low accuracy location");
					navigator.geolocation.getCurrentPosition(
						successCallback,
						errorCallback_lowAccuracy,
						{maximumAge: 600000, timeout: 10000, enableHighAccuracy: false});
					return;
				}

				var msg = "Can't get your location (high accuracy attempt). Error = ";
				if (error.code == 1)
					msg += "PERMISSION_DENIED";
				else if (error.code == 2)
					msg += "POSITION_UNAVAILABLE";
				msg += ", msg = " + error.message;

				console.log(msg);
			}

			// lower accuracy fall-back
			function errorCallback_lowAccuracy(position) {
				var msg = "Can't get your location (low accuracy attempt). Error = ";
				if (error.code == 1)
					msg += "PERMISSION_DENIED";
				else if (error.code == 2)
					msg += "POSITION_UNAVAILABLE";
				else if (error.code == 3)
					msg += "TIMEOUT";
				msg += ", msg = " + error.message;

				console.log(msg);
			}

			// on success
			function successCallback(position) {
				deferred.resolve(position);
			}

			return deferred.promise;
		};
	});