'use strict';

angular.module('taxiApp.viewLogin', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/login', {
			templateUrl: 'viewLogin/viewLogin.html',
			controller: 'ViewLoginCtrl'
		});
	}])

	.controller('ViewLoginCtrl', [function () {

	}]);