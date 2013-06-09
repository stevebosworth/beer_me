'use strict';

// --------------------------------------------------------------------
/**
 * JSONP Callback Fix
 *
 * Fix for LCBO api issue: doesn't support Angular style callback functions
 * the API wants a function with only numbers, underscores, and letters
 * Angular uses a function title: angular.callbacks._xxx
 * which throws an error when used with the LCBO API
 *
 */

var json_data;
function setJSON(data) {
	json_data = data;
}

// --------------------------------------------------------------------
/**
 * listCtrl
 *
 * Used to show the list of all the stores available
 *
 */

function listCtrl($scope, $rootScope, Store, geoLocation) {

	$scope.orderStores = 'distance_in_meters';

	$scope.radius = 5;

	$scope.performSearch = function() {
		// get users current location
		geoLocation.getCurrentPosition(function (position) {

			// pass the users position to the getStoresList function
			Store.getStoresList(position, $scope.radius).success(function(data) {
				$scope.storesList = data.result;
			}).error(function(data, status) {
				if (json_data.status == 200)
					$scope.storesList = json_data.result;
			});

			// show users current location
			$scope.currentLocation = position.coords.latitude + ',' + position.coords.longitude;
		}, function() { alert('Failed to connect to GeoLocation'); });
	}

	$scope.performSearch();

};

// --------------------------------------------------------------------
/**
 * detailsCtrl
 *
 * Used to display data of the selected store 
 *
 */

function detailsCtrl($scope, $rootScope, $routeParams, Store) {
	$scope.storeId = $routeParams.storeId;

	// retrieve the data for the selected store
	Store.getStore($routeParams.storeId).success(function(data) {
		$scope.store = data.result;
	}).error(function(data, status) {
		if (json_data.status == 200)
			$scope.store = json_data.result;
	});
}