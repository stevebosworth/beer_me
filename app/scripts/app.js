'use strict';

// --------------------------------------------------------------------
/**
 * Config
 *
 * Configuration options for the application, routing
 * Injects services and filters into the application
 *
 */

angular.module('beerMeApp', ['beerMeServices', 'beerMeFilters', 'facebookService', 'beerMeDirectives', 'parseService' ,'google-maps'])

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
        $httpProvider.defaults.useXDomain = true;
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
        .when('/products', {
            templateUrl: 'views/products.html',
            controller: 'productsListCtrl'
        })
        .when('/product/:productId', {
            templateUrl: 'views/product.html',
            controller: 'productDetailsCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
    }]);

