angular.module('parseService', [])

.service('parse', ['$rootScope', '$http',
	function($rootScope, $http) {
		var self = this;
		var baseUrl = 'https://api.parse.com/1/classes/';
		var applicationKey = 'maiqvOeWeNT1D8J1QgftguTE6wmOpcKhXfioe1S2';
		var apiKey = 'rcfocQkhqSiYPpw7OXNkxKqGZE1q4akU4xGo13qT';


		this.request = function(method, className, data, id, params) {
			//set header
			headers = {
				"X-Parse-Application-Id": applicationKey,
				"X-Parse-REST-API-KEY": apiKey,
				"Content-Type": "application/json"
			};

			return $http({
				method: method,
				url: baseUrl + className + (id != null ? ('/' + id) : ''),
				data: data,
				params: params,
				headers: headers
			});
		}

		this.get = function(className) {
			return self.request("GET", className);
		};

		this.add = function(className, data) {
			return self.request("POST", className, data);
		}

		this.remove = function(className, id) {
			return self.request("DELETE", className, null, id);
		}

		this.update = function(className, data, id) {
			return self.request("PUT", className, data, id);
		}

		this.getByColumn = function(className, params) {
			return self.request("GET", className, null, null, {"where": params});
		}
	}
]);