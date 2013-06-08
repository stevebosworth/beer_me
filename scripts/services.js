.module('beerMeServices', ['ngResource']).
    factory('Store', function($resource){
  return $resource('http://lcboapi.com/stores.js?callback=jsonp_callback', {callback: 'J'}, {
    query: {method:'JSONP'}
  });
});