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

function listCtrl($scope, $rootScope, $filter, Store, geoLocation, $log) {

    // Enable the new Google Maps visuals until it gets enabled by default.
    // See http://googlegeodevelopers.blogspot.ca/2013/05/a-fresh-new-look-for-maps-api-for-all.html
    google.maps.visualRefresh = true;

	// default location is Toronto
	$scope.center = {
		latitude: 43.67023,
		longitude: -79.38676
	};

	$scope.sidebarVisible = false;

	// default zoom
	$scope.zoom = 12;

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
			$scope.markers = [];

			// pass the users position to the getStoresList function
			Store.getStoresList(position, $scope.radius).success(function(data) {
				$scope.storesList = data.result;
			}).error(function(data, status) {
				if (json_data.status == 200) {
					$scope.storesList = json_data.result;

					// draw the markers onto the map
					angular.forEach(json_data.result, function(object) {
						var html = '<div style="min-width: 300px; height: 150px;"">'
									+ '<p class="lead">' + object.name + '<br /><small>Store ID: ' + object.id + '' 
									+ '<br />' + object.address_line_1 + ' ' + ((object.address_line_2 != null) ? object.address_line_2 : "")  
									+ '<br />' + $filter('is_open')(object) + '</small></p></div>';
						$scope.markers.push({ latitude: object.latitude, longitude: object.longitude, infoWindow: html });
					})

					//console.log($scope.markers);
						
				}
			});

		}, function() { alert('Failed to connect to GeoLocation'); });
	}

	// for some reason this fixed my query issue: filtered.length was showing 
	// incorrectly in the view, which the next function is reliant on, doesn't make sense
	// will investigate later
    $scope.$watch('query', function (newValue) {
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

/**
 * productDetailsCtrl
 *
 * Used to display detailed view of a product
 *
 */

function productDetailsCtrl($scope, $routeParams, Products) {
    //$scope.productId = $routeParams.productId;

    // retrieve the data for the selected store
    Products.getProduct($routeParams.productId).success(function(data) {
        $scope.product = data.result;
    }).error(function(data, status) {
        if (json_data.status == 200){
            $scope.product = json_data.result;
            //console.log($scope.product);
        }
    });
}
