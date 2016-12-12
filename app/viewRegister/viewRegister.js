'use strict';

angular.module('taxiApp.viewRegister', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/register', {
			templateUrl: 'viewRegister/viewRegister.html',
			controller: 'ViewRegisterCtrl'
		});
	}])

	.controller('ViewRegisterCtrl', [function () {

	}]);