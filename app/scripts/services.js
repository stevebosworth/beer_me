// --------------------------------------------------------------------
/**
* Services
*
* RESTful services and GeoLocation services
*
*/

angular.module('beerMeServices', ['ngResource'])

    .run(function($rootScope, $location) {
        $rootScope.pageLocation = $location;
    })

    // --------------------------------------------------------------------
    /**
    * Store
    *
    * Provides us with several methods to access the LCBO API
    *
    */

    .factory('Store', function ($http) {
        return {
            // returns data for closest 25 stores
            getStoresList: function(position, num) {
                return $http({
                    url: 'http://lcboapi.com/stores',
                    method: 'JSONP',
                    params: {
                        callback: 'setJSON',
                        per_page: num,
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    }
                })
            },
            // returns data for a store
            searchStores: function(searchTerm, position) {
                return $http({
                    url: 'http://lcboapi.com/stores',
                    method: 'JSONP',
                    params: {
                        callback: 'setJSON',
                        q: searchTerm,
                        per_page: 25,
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    }
                })
            },

            getStoreById: function(id) {
                return $http({
                    url: 'http://lcboapi.com/stores/' + id,
                    method: 'JSONP',
                    params: {
                        callback: 'setJSON'
                    }
                });
            }
        }
    })

    // --------------------------------------------------------------------
    /**
    * Finder
    *
    * Finds data for the user using a combination of methods
    *
    */

    .factory('Finder', function ($rootScope, geoLocation, Store, CookieMonster, $filter) {
        return {
            // returns data for closest 25 stores
            nearbyStores: function(radius) {
                // check to see if we have the users location cached
                // if(!CookieMonster.checkCookie("cachedLocation")) {
                //     console.log("Read from GeoLocation");
                //     // get users current location
                //     geoLocation.getCurrentPosition(function (position) {
                //         console.log(position);
                //         processData(position);
                //     }, function() { alert('Failed to connect to GeoLocation'); });
                // } else {
                //     //console.log("Read from cookie");
                //     processData(CookieMonster.readLocation());
                // }

                geoLocation.getCurrentPosition(function (position) {
                    $rootScope.currentLocation = position;
                    processData(position);
                }, function() { alert('Failed to connect to GeoLocation'); });
                // after position is established
                function processData(position) {
                    // show users current location on map
                    $rootScope.center = { latitude: position.coords.latitude, longitude: position.coords.longitude };
                    $rootScope.markers = [];

                    // pass the users position to the getStoresList function
                    Store.getStoresList(position, radius).success(function(data) {
                        $rootScope.storesList = data.result;
                    }).error(function(data, status) {
                        if (json_data.status == 200) {
                            //add store open data
                            angular.forEach(json_data.result, function(v, i) {
                                v["is_open"] = ($filter('is_open')(v) == 'Open' ? true : false);
                            });

                            $rootScope.storesList = json_data.result;
                            $rootScope.showLoading = false;
                        }
                    });
                }
            },
            drawMarkers: function(stores, data) {
                for (var i = 0; i < stores; i++) {
                    var obj = {};
                    // -- deprecated after switching to popup modal --
                    // var html = '<div class="info-window">'
                    //             + '<h2>LCBO ' + data[i].name + '</h2><ul>'
                    //             + '<li>' + data[i].telephone + '</li>'
                    //             + '<li>' + data[i].city + '</li>'
                    //             + '<li>' + $filter('is_open')(data[i]) + '</li>'
                    //             + '</ul></div>';
                    // decide which icon is required
                    var state;
                    ($filter('is_open')(data[i]) == "Open") ? state = "o" : state = "c";
                    var setIcon = "img/icons/" + (i + 1) + state + ".png";
                    obj = { latitude: data[i].latitude, longitude: data[i].longitude, infoWindow: JSON.stringify(data[i]), icon: setIcon, title: data[i].name }
                    //console.log(obj);
                    $rootScope.markers.push(obj);
                };
            }
        }
    })

    // --------------------------------------------------------------------
    /**
    * Cookie Monster
    *
    * Provices us with methods to create and read cookies
    * Adapted from: http://www.quirksmode.org/js/cookies.html
    *
    */

    .factory('CookieMonster', function ($http) {
        return {
            createCookie: function(name, value, days) {
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime()+(days*24*60*60*1000));
                    var expires = "; expires="+date.toGMTString();
                }
                else var expires = "";
                document.cookie = name+"="+value+expires+"; path=/";
            },
            readCookie: function(name) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');
                for(var i = 0; i < ca.length; i++ ) {
                    var c = ca[i];
                    while (c.charAt(0)==' ') c = c.substring(1,c.length);
                    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
                }
                return null;
            },
            checkCookie: function(name) {
                if(document.cookie.indexOf(name) >= 0)
                    return true;
                else
                    return false;
            },
            eraseCookie: function(name) {
                this.createCookie(name, "", -1);
            },
            gpsCookie: function(location) {
                // gps cookies last 10 minutes, to cache the users location temporarily
                var expires = new Date();
                expires.setTime(expires.getTime() + (10 * 60 * 1000)); // Ten minutes

                // Date()'s toGMTSting() method will format the date correctly for a cookie
                document.cookie = "cachedLocation=" + location + "; expires=" + expires.toGMTString();
            },
            readLocation: function() {
                // returns an object of the users location if it exists
                if(this.checkCookie("cachedLocation"))
                    return JSON.parse(this.readCookie("cachedLocation"));
                else
                    return false;
            }
        }
    })

    // --------------------------------------------------------------------
    /**
    * geoLocation
    *
    * Adapted from Brian Ford's tutorial: Angular + PhoneGap
    * http://briantford.com/blog/angular-phonegap.html
    * - Creates gpsCookie when user looks up location
    * - Need to complete the control statement for cookie
    *
    */

    .factory('geoLocation', function ($rootScope, CookieMonster) {
        return {
            // provides us with user location
            getCurrentPosition: function (onSuccess, onError, options) {
                navigator.geolocation.getCurrentPosition(function () {
                    var that = this,
                    args = arguments;

                    if (onSuccess) {
                        $rootScope.$apply(function () {
                            onSuccess.apply(that, args);
                            //$rootScope.currentLocation = { coords:  { latitude: args[0].coords.latitude, longitude: args[0].coords.longitude } };
                            //console.log(args[0].coords.latitude + ',' + args[0].coords.longitude);
                            //CookieMonster.gpsCookie(JSON.stringify( { coords:  { latitude: args[0].coords.latitude, longitude: args[0].coords.longitude } } ));
                        });
                    }
                }, function () {
                    var that = this,
                    args = arguments;

                    if (onError) {
                        $rootScope.$apply(function () {
                            onError.apply(that, args);
                        });
                    }
                },
                options);
            }
        };
    })

    // --------------------------------------------------------------------
    /**
    * Products
    *
    * Provides us with several methods to access the LCBO APIs
    *
    */

    .factory('Products', function($http) {
        return {
            // returns data for upto 20 products matching search query
            // passes string
            //returns jsonp
            getProductsByQuery: function(query) {
                return $http({
                    url: 'http://lcboapi.com/products?q=' + query,
                    method: 'JSONP',
                    params: {
                        callback: 'setJSON',
                    }
                })
            },
            // returns data for a single product
            getProduct: function(id, center) {
                console.log(center);
                return $http({
                    url: 'http://lcboapi.com/products/' + id + '/stores',
                    method: 'JSONP',
                    params: {
                        callback: 'setJSON',
                        lat: center.coords.latitude,
                        lon: center.coords.longitude
                    }
                })
            },
            getStoresForProduct: function(productId){
                return $http({
                    url: 'http://lcboapi.com/products/' + productId + '/stores',
                    method: 'JSONP',
                    params: {
                        callback: 'setJSON'
                    }
                })
            }
        }
    })

    // --------------------------------------------------------------------
    /**
    * Favourites
    *
    * Access Parse API to retrieve favourite data
    *
    */

    .factory('Favourites', ['parse', function (parse) {
        return {
            isFavourite: function(Id, className, facebookId, params) {
                //set filter params
                // params = {
                //     userId : facebookId,
                //     storeId : storeId
                // };

                return parse.getByColumn(className, params).then(function(response) {
                    return response.data.results.length > 0;
                });
            },

            setFavourite: function(data, className) {
                //add favourites
                parse.add(className, data);
            },

            getFavouriteCount: function(userId, className) {
                return this.getFavourite(userId, className).then(function(response) {
                    return response.data.results.length;
                });
            },


            getFavourite: function(userId, className) {
                //set filter params
                params = {
                    userId : userId,
                };

                return parse.getByColumn(className, params);
            }
        }
    }])

    // --------------------------------------------------------------------
    /**
    * StoreRatings
    *
    * Access Parse API to retrieve store rating data
    *
    */

    .factory('StoreRatings', ['parse', function (parse) {
        return {
            checkVote: function(data) {
                //set filter params
                var params = {
                    userId : data.userId,
                    storeId : data.storeId
                };

                return parse.getByColumn('StoresRating', params).then(function(response) {
                    return response.data.results.length > 0;
                });
            },

            setVote: function(data) {
                //add favourites
                return parse.add("StoresRating", data);
            },

            countVotes: function(storeId) {
                // set filter params
                var params = {
                    storeId: storeId
                };

                return parse.getByColumn('StoresRating', params).then(function (response) {
                    var x = 0;
                    // cycle through the votes and determine the positive or negative rating
                    angular.forEach(response.data.results, function (value, key) {
                        if(value.rating == true)
                            x = x + 1;
                        else
                            x = x - 1;
                    });
                    return x;
                });
            }
        }
    }])
