'use strict';

var beerMeApp = angular.module('beerMeApp', [])
  .config(function($httpProvider){
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
  })
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);