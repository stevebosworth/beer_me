'use strict';
var json_data;
function setJSON(data) {
  json_data = data;
}

beerMeApp.controller('MainCtrl', function($scope, $http) {

  var url = 'http://lcboapi.com/stores?callback=setJSON';
  $http.jsonp(url).success(function(data) {
  }).error(function(data, status, headers, config) {

    if (json_data.status == 200)
      $scope.awesomeThings = json_data.result;
  });

});
