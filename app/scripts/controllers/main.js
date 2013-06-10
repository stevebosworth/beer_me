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

function listCtrl($scope, $rootScope, Store, geoLocation, $log) {

    // Enable the new Google Maps visuals until it gets enabled by default.
    // See http://googlegeodevelopers.blogspot.ca/2013/05/a-fresh-new-look-for-maps-api-for-all.html
    google.maps.visualRefresh = true;

	// default location is Toronto
	$scope.center = {
		latitude: 43.67023,
		longitude: -79.38676
	};

	// default zoom
	$scope.zoom = 12;

	// ******** testing ********
	// from: http://nlaplante.github.io/angular-google-maps/#!/api
	// $scope.eventsProperty = {
	// 	click: function (mapModel, eventName, originalEventArgs) {	
	// 		// 'this' is the directive's scope
	// 		$log.log("user defined event on map directive with scope", this);
	// 		$log.log("user defined event: " + eventName, mapModel, originalEventArgs);
	// 	}
	// };

	$scope.orderStores = 'distance_in_meters';

	$scope.radius = 5;

	$scope.performSearch = function() {
		// get users current location
		geoLocation.getCurrentPosition(function (position) {

			$scope.currentLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
			// show users current location on map
			$scope.center = { latitude: position.coords.latitude, longitude: position.coords.longitude };
			$scope.markers = [{ latitude: position.coords.latitude, longitude: position.coords.longitude }];

			// pass the users position to the getStoresList function
			Store.getStoresList(position, $scope.radius).success(function(data) {
				$scope.storesList = data.result;
			}).error(function(data, status) {
				if (json_data.status == 200) {
					$scope.storesList = json_data.result;

					// draw the markers onto the map
					for (var i = json_data.result.length - 1; i >= 0; i--) {
						$scope.markers.push({ latitude: json_data.result[i].latitude, longitude: json_data.result[i].longitude });
					};
				}
			});

		}, function() { alert('Failed to connect to GeoLocation'); });
	}

	// for some reason this fixed my query issue
    $scope.$watch('query', function (newValue) {
        console.log(newValue);
    }, true);

    // watch the filtered expression and change the map based on new input
    $scope.$watch('filtered', function (newValue) {
    	$scope.markers = newValue;
    }, true);

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

// --------------------------------------------------------------------
/**
 * Products by Query listCtrl
 *
 * Used to display a list of products based on a query.
 *
 */

function productsListCtrl($scope, Products) {

    $scope.productSearch = function() {
        console.log("woo!");
        Products.getProductsByQuery($scope.query).success(function(data){
            $scope.productsList = data.result;
            console.log(data.result);
        }).error(function(data, status) {
            if (json_data.status == 200){
                $scope.productsList = json_data.result;
            }
        });
        //$scope.productSearch();
    }
}
