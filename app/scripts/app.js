'use strict';

// --------------------------------------------------------------------
/**
 * Config
 *
 * Configuration options for the application, routing
 * Injects services and filters into the application
 *
 */

angular.module('beerMeApp', ['beerMeServices', 'beerMeFilters', 'google-maps'])

    // --------------------------------------------------------------------
    /**
     * X-Requested-With
     *
     * This is supposed to allow CORS within Angular framework, doesn't
     * seem to work in our case
     * https://github.com/angular/angular.js/pull/1454
     *
     */
    
    .config(function($httpProvider){
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    })

    // --------------------------------------------------------------------
    /**
     * Routing
     *
     * Configures routes & controllers for application
     *
     */    
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

