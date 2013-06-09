'use strict';

/* Routing */
angular.module('beerMeApp', ['beerMeServices', 'beerMeFilters'])
.config(function($httpProvider){
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
})
.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/main.html',
        controller: 'listCtrl'
    })
    .when('/store/:storeId', {
        templateUrl: 'views/details.html',
        controller: 'detailsCtrl'
    })    
    .otherwise({
        redirectTo: '/'
    });
}]);

/* Services */
angular.module('beerMeServices', ['ngResource'])
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

// Geolocation factory
// Adapted from Brian Ford: http://briantford.com/blog/angular-phonegap.html
.factory('geoLocation', function ($rootScope) {
  return {
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

angular.module('beerMeFilters', [])
.filter('checkmark', function() {
  return function(input) {
    return input ? '\u2713' : '\u2718';
  };
})
.filter('yesno', function() {
    return function(input) {
        return input ? 'Yes' : 'No';
    };
});