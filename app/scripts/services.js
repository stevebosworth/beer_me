// --------------------------------------------------------------------
/**
* Services
*
* RESTful services and GeoLocation services
*
*/

angular.module('beerMeServices', ['ngResource'])

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
            getStore: function(id) {
                return $http({
                    url: 'http://lcboapi.com/stores/' + id,
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
    * Finder
    *
    * Finds data for the user using a combination of methods
    *
    */

    .factory('Finder', function ($rootScope, geoLocation, Store, $filter) {
        return {
            // returns data for closest 25 stores
            nearbyStores: function(radius) {
                // get users current location
                geoLocation.getCurrentPosition(function (position) {

                    $rootScope.currentLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
                    // show users current location on map
                    $rootScope.center = { latitude: position.coords.latitude, longitude: position.coords.longitude };
                    $rootScope.markers = [];

                    // pass the users position to the getStoresList function
                    Store.getStoresList(position, radius).success(function(data) {
                        $rootScope.storesList = data.result;
                    }).error(function(data, status) {
                        if (json_data.status == 200) {
                            $rootScope.storesList = json_data.result;

                            // draw the markers onto the map
                            for (var i = json_data.result.length - 1; i >= 0; i--) {
                                var html = '<div style="min-width: 300px; height: 150px;"">'
                                            + '<p class="lead">' + this.name + '<br /><small>Store ID: ' + this.id + ''
                                            + '<br />' + this.address_line_1 + ' ' + ((this.address_line_2 != null) ? this.address_line_2 : "")
                                            + '<br />' + $filter('is_open')(this) + '</small></p></div>';
                                $rootScope.markers.push({ latitude: this.latitude, longitude: this.longitude, infoWindow: html });
                            };
                        }
                    });

                }, function() { alert('Failed to connect to GeoLocation'); });
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
            // create a yummy cookie
            createCookie: function(name, value, days) {
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime()+(days*24*60*60*1000));
                    var expires = "; expires="+date.toGMTString();
                }
                else var expires = "";
                document.cookie = name+"="+value+expires+"; path=/";
            },
            // allows us to read a cookie
            readCookie: function(name) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');
                for(var i=0;i < ca.length;i++) {
                    var c = ca[i];
                    while (c.charAt(0)==' ') c = c.substring(1,c.length);
                    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
                }
                return null; 
            },
            eraseCookie: function(name) {
                createCookie(name, "", -1);
            },
            gpsCookie: function(location) {
                // gps cookies last 10 minutes, to cache the users location temporarily
                var expires = new Date();
                expires.setTime(expires.getTime() + (10 * 60 * 1000)); // Ten minutes

                // Date()'s toGMTSting() method will format the date correctly for a cookie
                document.cookie = "cachedLocation=" + location + "; expires=" + expires.toGMTString();     
            }
        }
    })    

    // --------------------------------------------------------------------
    /**
    * geoLocation
    *
    * Adapted from Brian Ford's tutorial: Angular + PhoneGap
    * http://briantford.com/blog/angular-phonegap.html
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
                            //console.log(args[0].coords.latitude + ',' + args[0].coords.longitude);
                            CookieMonster.gpsCookie(args[0].coords.latitude + ',' + args[0].coords.longitude);
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
    * Provides us with several methods to access the LCBO API
    *
    */

    .factory('Products', function($http) {
        return {
            // returns data for upto 20 products matching search
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
            getProduct: function(id, position, radius) {
                return $http({
                    url: 'http://lcboapi.com/products/' + id + '/stores',
                    method: 'JSONP',
                    params: {
                        callback: 'setJSON',
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    }
                })
            },
            getStoresForProduct: function(productId){
                return $http({
                    url: 'http://lcboapi.com/product/' + productId + '/stores',
                    method: 'JSONP',
                    params: {
                        callback: 'setJSON'
                    }
                })
            }
        }
    })