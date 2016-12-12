'use strict';

// Declare app level module which depends on views, and components
angular.module('taxiApp', [
	'ngMap',
	'ngRoute',
	'taxiApp.viewLogin',
	'taxiApp.viewRegister',
	'taxiApp.viewBooking',
	'taxiApp.version'
]).config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
	$locationProvider.hashPrefix('!');

	$routeProvider.otherwise({redirectTo: '/login'});
}]);
