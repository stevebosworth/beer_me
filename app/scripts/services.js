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

    .factory('Store', function($http) {
      return {
          // returns data for closest 25 stores
          getStoresList: function(position) {
              return $http({
                  url: 'http://lcboapi.com/stores',
                  method: 'JSONP',
                  params: {
                      callback: 'setJSON',
                      per_page: '25',
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
     * geoLocation 
     *
     * Adapted from Brian Ford's tutorial: Angular + PhoneGap
     * http://briantford.com/blog/angular-phonegap.html
     *
     */

    .factory('geoLocation', function ($rootScope) {
      return {
        // provides us with user location
        getCurrentPosition: function (onSuccess, onError, options) {
          navigator.geolocation.getCurrentPosition(function () {
            var that = this,
              args = arguments;

            if (onSuccess) {
              $rootScope.$apply(function () {
                onSuccess.apply(that, args);
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
    });
