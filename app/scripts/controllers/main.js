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
 * setUserFavourites
 *
 * Ask Lucas
 *
 */

 function setUserFavourites(rootScope, Favourites, Store, Products, className, count, list) {
    //get favourite count
    rootScope[count] = Favourites.getFavouriteCount(rootScope.fbUser.id, className);

    //get favourite list
    rootScope[list] = Favourites.getFavourite(rootScope.fbUser.id, className).then(function(response) {
        if(response.data.results.length > 0) {
            angular.forEach(response.data.results, function(v, i) {
                switch(className) {
                    case 'Favourites': {
                        //add store name and other information based on id
                         Store.getStoreById(v.storeId).error(function() {
                            if(json_data.status == 200) {
                                v['storeInfo'] = json_data.result;
                            }
                        });
                        break;
                    }
                    case 'productsFavorites' : {
                        Products.getProduct(v.productId, rootScope.currentLocation).error(function(){
                            if(json_data.status == 200){
                                v['productInfo'] = json_data.product;
                            }
                        });
                        break;
                    }
                }
            });
        }
        return response.data.results;
    });
 }

// --------------------------------------------------------------------
/**
 * wrapperCtrl
 *
 * Used to control all global functions of the application:
 * search, menu, facebook favourites
 *
 */

function wrapperCtrl($scope, $rootScope, Store, $timeout, Finder, CookieMonster, Products, Favourites, geoLocation, parse) {
	$scope.showMenuBar = false;
	$scope.showOptionsBar = false;
    $rootScope.currentTime = (
            (((new Date().getHours()) % 12) ? ((new Date().getHours()) % 12) : 12) + ':' +
            (((new Date().getMinutes()) < 10) ? ('0' + (new Date().getMinutes())) : new Date().getMinutes()) + ' ' +
            (((new Date().getHours()) >= 12) ? 'PM' : 'AM')
        );

	$rootScope.revealMenuBar = function(target) {

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
            case (target == 'none'):
                $scope.showMenuBar = false;
                $scope.showOptionsBar = false;
                break;
		}
	}

    // watch searchText for user input
    var timer = false; // required
    $scope.$watch('searchText', function() {
        //console.log($scope.searchText);
        // make sure search is long enough
        if($scope.searchText != undefined) {
            if($scope.searchText.length > 2) {
                // do not search until user has stopped typing
                if(timer) {
                    $timeout.cancel(timer)
                }
                timer = $timeout(function(){
                    $scope.showMenuBar = true;
                    $scope.searchSpinner = true; // show spinner
                    // perform the search

                    geoLocation.getCurrentPosition(function(position) {
                        $rootScope.currentLocation = position;

                        Store.searchStores($scope.searchText, position)
                            .success(function(data) {
                                $scope.store = data.result;
                            })
                            .error(function(data, status) {
                                if (json_data.status == 200) {
                                    // once we apply the new data to storesList, the entire application will update
                                    $rootScope.storesList = json_data.result;

                                    //console.log($scope.searchResults);
                                    $scope.storesResultsCount = $rootScope.storesList.length;

                                    $scope.searchSpinner = false; // hide spinner
                                    $scope.searchComplete = true; // show results

                                    if($rootScope.storesList.length > 0) {
                                        $rootScope.stores = $rootScope.storesList.length; // make sure results are visible on map
                                        $scope.storesResultTitle = "Stores Results:";
                                        $scope.searchText = ""; // empty search bar
                                    } else {
                                        $scope.storesResultTitle = "No match found";
                                    }
                                }
                        });

                        Products.getProductsByQuery($scope.searchText)
                            .success(function(data){
                                $scope.product = data.result;
                            })
                            .error(function(data){
                                if (json_data.status == 200) {
                                    // once we apply the new data to productsList, the entire application will update
                                    $rootScope.productsList = json_data.result;
                                    //console.log($scope.searchResults);
                                    $scope.productsResultsCount = $rootScope.productsList.length;

                                    $scope.searchSpinner = false; // hide spinner
                                    $scope.searchComplete = true; // show results

                                    if($rootScope.productsList.length > 0) {
                                        // $rootScope.products = $rootScope.productsList.length; // make sure results are visible on map
                                        $scope.productsResultTitle = "Product Results:";
                                        //$scope.searchText = ""; // empty search bar
                                    } else {
                                        $scope.productsResultTitle = "No match found";
                                    }
                                }
                        });
                    });

                }, 1000) // set delay
            } else {
                $scope.searchSpinner = false;
            }
        }
    });

    $scope.resetHome = function () {
        $scope.searchText = "";
        // return user back to default search
        $scope.searchComplete = false;
        $rootScope.revealMenuBar('none');
        // get 25 stores on initial load
        $rootScope.stores = 5;
        Finder.nearbyStores(25);
    };

    //get favourite count
    $scope.$watch('fbUser', function() {
        if($rootScope.fbUser != undefined) {
            setUserFavourites($rootScope, Favourites, Store, null, 'Favourites', 'favouritesResultsCount', 'favouriteList');
        }
    });

   //show favourite
   $scope.toggleFavourite = function(showFavourite) {
        return !showFavourite;
   };
}

// --------------------------------------------------------------------
/**
 * listCtrl
 *
 * Used to show the list of all the stores available
 *
 */

function listCtrl($scope, $rootScope, $filter, Finder, CookieMonster, $log) {

	// enables new version of google maps
    google.maps.visualRefresh = true;

    $scope.center = {
        latitude: 79.4042,
        longitude: 43.6481
    };

	// default settings
	$rootScope.stores = 5;
	$scope.zoom = 12;
	$scope.orderStores = 'distance_in_meters';

    // get 25 stores on initial load
    Finder.nearbyStores(25);

    $scope.dataBarVisible = true;

    $rootScope.getStoreInfo = function(obj) {
        $scope.zoom = 17;
        // $rootScope.revealMenuBar('none');
        $rootScope.storeInfo = obj;
        $scope.center = {
            latitude: obj.latitude,
            longitude: obj.longitude
        }
    }

    $rootScope.getProductInfo = function(obj){
        // console.log(obj);
        console.log($scope.stockList);
        //$scope.showHide = true;
        //console.log($scope.showHide);
        $rootScope.productInfo = obj;
    }

    // once data is loaded, load the sliced array into the view
    $scope.$watch('storesList', function(storesListValue) {
        if(storesListValue != undefined) {
            $scope.storesWithLimit = $scope.storesList.slice(0, $scope.stores);
        }
    });

    // wait for user to change the value of the stores listing and reassign the array based on values
    // stored still in storesList
    $scope.$watch('stores', function(storesValue) {
        if(typeof $scope.storesList !== "undefined") {
            $scope.storesWithLimit = $scope.storesList.slice(0, $scope.stores);
        }
    });

    // watch the filtered expression and change the map based on new input
    $scope.$watch('filtered', function (filteredValue) {
        // watch checks on load, when data does not exist yet
        if(typeof filteredValue !== "undefined") {
        	// reset the markers, place the users location in as a marker
        	$rootScope.markers = [ { latitude: $rootScope.currentLocation.coords.latitude, longitude: $rootScope.currentLocation.coords.longitude, icon: 'img/icons/current_location.png'  } ];

        	// this workaround resolves the issue with filteredValue.length being less than $scope.stores
        	// without it, the loop tries to draw stores that do not exist
        	var storesToDraw = 5;
        	(filteredValue.length < $scope.stores) ? storesToDraw = filteredValue.length : storesToDraw = $scope.stores;

        	// draw the filtered markers
        	Finder.drawMarkers(storesToDraw, filteredValue);
        }
    }, true);
};


// --------------------------------------------------------------------
/**
 * storeDetails
 *
 * Used by store modal popup
 *
 */

function storeDetails($scope, $rootScope, parse, Store, StoreRatings, Favourites, Products, $timeout, Finder, CookieMonster) {

    // create empty data object
    var data = {
        userId: $rootScope.fbUser.id
    };

    //get favourite count
    $scope.$watch('fbUser', function() {
        if($rootScope.fbUser != undefined) {
            setUserFavourites($rootScope, Favourites, Store, null, 'Favourites', 'favouritesResultsCount', 'favouriteList');
            setUserFavourites($rootScope, Favourites, null, Products, 'productsFavorites', 'favouriteProductsResultsCount', 'favouriteProductsList');
        }
    });

    $scope.saveReview = function(result) {

        // establish data object
        var data = {
            rating: result,
            storeId: $scope.storeInfo.id,
            userId: $rootScope.fbUser.id
        }

        // check if the user has previously voted
        StoreRatings.checkVote(data).then(function(response) {
            if(!response) {
                // user hasn't voted, lets save their vote
                StoreRatings.setVote(data).then(function(response) {
                    // check if object successfully created
                    if(response.status == 201) {
                        console.log('Successfully added review');
                        // hide the voting li
                        $scope.checkVote = true;
                        $scope.storeVoteTotal = StoreRatings.countVotes(data.storeId);
                    }
                });
            } else {
                console.log('Invalid vote, user has already cast vote for this store.');
            }
        });
    };

    // make sure storeInfo is loaded before checking if store is favourite
    $scope.$watch('storeInfo', function(data) {
        if($scope.storeInfo != undefined){
            $scope.favourite = Favourites.isFavourite($scope.storeInfo.id, 'Favourites', $rootScope.fbUser.id, params);

            data.userId = $rootScope.fbUser.id;
            data.storeId = $scope.storeInfo.id;

            // check if the user has yet voted on this store, hide it if so
            StoreRatings.checkVote(data).then(function(votestatus) {
                $scope.checkVote = votestatus;
            });

            // count the amount of votes placed for this store
            StoreRatings.countVotes($scope.storeInfo.id).then(function(votecount) {
                $scope.storeVoteTotal = votecount;
            });
        }
    });

    $scope.setFavourite = function() {

        var data = {
            isFavourite: true,
            storeId: $scope.storeInfo.id,
            userId: $rootScope.fbUser.id
        }

        Favourites.isFavourite(data.storeId, "Favourites", data.userId, data).then(function(response){
            //already set to favourite
            if(response) {
                //set filter parameters
                params = {
                    userId : data.userId,
                    storeId : data.storeId
                };

                //remove favourite
                parse.getByColumn('Favourites', params).then(function(response) {
                    //loop through to match the store
                    angular.forEach(response.data.results, function(v, i) {
                        if(v.storeId == data.storeId) {
                            //remove from database
                            parse.remove('Favourites', v.objectId);
                        }
                    });

                    //set favourite to false
                    $scope.favourite = false;
                });
            } else {
                //add to favourite
                Favourites.setFavourite(data, 'Favourites');
                $scope.favourite = true;
            }

            $timeout(function() {
                setUserFavourites($rootScope, Favourites, Store, null, 'Favourites', 'favouritesResultsCount', 'favouriteList');
            }, 1500);
        });
    };
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


// --------------------------------------------------------------------
/**
 * Products in Store by Query listCtrl
 *
 * Used to display a list of products based on a query.
 *
 */

function storesForProductCtrl($scope, $rootScope, $routeParams, Products, Favourites, geoLocation, parse, $timeout) {

    //get stores for product based on rootScope ID

    //hide stores in Details Modal
    $scope.showHide = true;
    console.log($scope.showHide);
    geoLocation.getCurrentPosition(function (position) {

        //reset current location in scope
        $scope.currentLocation = {latitude: position.coords.latitude, longitude: position.coords.longitude};

        // retrieve the data for the selected store
        Products.getProduct($routeParams.productId, position, 1).success(function(data) {
            $scope.product = data.product;
            $scope.store = data.result;
        }).error(function(data, status) {
            if (json_data.status == 200){
                $rootScope.product = json_data.product;
                $rootScope.storesList = json_data.result;
            }
        });
    });

    $scope.$watch('productInfo', function(data) {
         if($scope.productInfo != undefined) {
            //set params for .isFavourite
            params = {
                userId : $rootScope.fbUser.id,
                productId : $scope.productInfo.id
            };
            $scope.favourite = Favourites.isFavourite($scope.productInfo.id, 'productsFavorites', $rootScope.fbUser.id, params);
        }
    });


    //get current location
    $scope.getStoresInStock = function (){

        Products.getProduct($rootScope.productInfo.id, $rootScope.center, 5).success(function(data){
            $scope.stockList = data.result;
        }).error(function(data, status) {
            if (json_data.status == 200){
                $scope.stockList = json_data.result;
                //console.log($scope.stockList);
                $scope.showHide = false;
                console.log($scope.showHide);
            }
        });
    }



    $scope.setProductFavourite = function() {
        var data = {
            isFavourite: true,
            productId : $scope.productInfo.id,
            userId: $rootScope.fbUser.id
        }

        console.log(data);

        Favourites.isFavourite(data.productId, 'productsFavorites', data.userId, data).then(function(response){
            //already set to favourite
            if(response) {
                //set filter parameters
                params = {
                    userId : data.userId,
                    productId : data.productId
                };

                //remove favourite
                parse.getByColumn('productsFavorites', params).then(function(response) {
                    //loop through to match the store
                    angular.forEach(response.data.results, function(v, i) {
                        if(v.productId == data.productId) {
                            //remove from database
                            parse.remove('productsFavorites', v.objectId);
                        }
                    });

                    //set favourite to false
                    $scope.favourite = false;
                });
            } else {
                //add to favourite
                Favourites.setFavourite(data, 'productsFavorites');
                $scope.favourite = true;
            }

            $timeout(function() {
                setUserFavourites($rootScope, Favourites, null, Products, 'productsFavorites', 'favouriteProductsResultsCount', 'favouriteProductsList');
            }, 1000);
        });
    };
        //$scope.productSearch();
}

function facebookCtrl($scope, facebook) {
    $scope.login = facebook.login();
    $scope.logout = facebook.logout();
}


