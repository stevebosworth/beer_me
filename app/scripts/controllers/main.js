'use strict';

beerMeApp.controller('MainCtrl', function($scope, $http) {
  $scope.awesomeThings = [
    'HTML5 Boilerplate',
    'AngularJS',
    'Testacular'
  ];

  var url = 'http://lcboapi.com/stores.json';
    $http.get(url).success(function(data) {
        console.log(data);
        //$scope.results = data;
    });


});


