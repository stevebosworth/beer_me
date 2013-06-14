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
 * menuCtrl
 *
 * Used to show the list of all the stores available
 *
 */

function wrapperCtrl($scope) {

	$scope.showMenuBar = false;
	$scope.showOptionsBar = false;

	$scope.revealMenuBar = function(target) {

		switch(true)
		{
			case (target == 'left' && $scope.showMenuBar == true):
				$scope.showMenuBar = false;
				$scope.showOptionsBar = false;	
				break;
			case (target == 'left' && $scope.showMenuBar == false):
				$scope.showMenuBar = true;
				$scope.showOptionsBar = false;
				break;
			case (target == 'right' && $scope.showOptionsBar == true):
				$scope.showMenuBar = false;
				$scope.showOptionsBar = false;				
				break;
			case (target == 'right' && $scope.showOptionsBar == false):
				$scope.showMenuBar = false;
				$scope.showOptionsBar = true;			
				break;
		}
	}
}

// --------------------------------------------------------------------
/**
 * listCtrl
 *
 * Used to show the list of all the stores available
 *
 */

function listCtrl($scope, $rootScope, $filter, Finder, CookieMonster) {

	// enables new version of google maps
    google.maps.visualRefresh = true;

	// default settings
	$scope.stores = 5;
	//$scope.sidebarVisible = false;
	$scope.zoom = 12;
	$scope.orderStores = 'distance_in_meters';
	$scope.center = {
		// toronto
		latitude: 43.67023,
		longitude: -79.38676
	};	

	// get 25 stores on initial load
	Finder.nearbyStores(25);

    // watch the filtered expression and change the map based on new input
    $scope.$watch('filtered', function (newValue) {

        var whereami = CookieMonster.readLocation();

    	// reset the markers, place the users location in as a marker
    	$rootScope.markers = [ { latitude: whereami.coords.latitude, longitude: whereami.coords.longitude,  } ];

    	// this workaround resolves the issue with newValue.length being less than $scope.stores
    	// without it, the loop tries to draw stores that do not exist
    	var storesToDraw;
    	(newValue.length < $scope.stores) ? storesToDraw = newValue.length : storesToDraw = $scope.stores;

    	// draw the filtered markers
    	Finder.drawMarkers(storesToDraw, newValue);
    }, true);
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
 * Includes Stock Information and returns 20 closest stores
 *
 */

function productDetailsCtrl($scope, $routeParams, geoLocation, Products) {
    //$scope.productId = $routeParams.productId;
    geoLocation.getCurrentPosition(function (position) {

        $scope.currentLocation = {latitude: position.coords.latitude, longitude: position.coords.longitude};
        // show users current location on map

        // retrieve the data for the selected store
        Products.getProduct($routeParams.productId, position, 1).success(function(data) {
            $scope.product = data.product;
            $scope.store = data.result;
        }).error(function(data, status) {
            if (json_data.status == 200){
                //set default images
                if(!json_data.product['image_thumb_url']){
                    json_data.product['image_thumb_url'] = "img/glyphicons-halflings.png";
                }
                $scope.product = json_data.product;
                $scope.storesList = json_data.result;
                //console.log($scope.product);
            }
        });
    });
}

// --------------------------------------------------------------------
/**
 * Products in Store by Query listCtrl
 *
 * Used to display a list of products based on a query.
 *
 */

function storesForProductCtrl($scope, $routeParams, Products) {


        Products.getStoresForProduct($routeParams.productId).success(function(data){
            $scope.storesList = data.result;
            console.log($scope.storesList);
        }).error(function(data, status) {
            if (json_data.status == 200){
                $scope.storesList = json_data.result;
                console.log($scope.storesList);
            }
        });
        //$scope.productSearch();
}
