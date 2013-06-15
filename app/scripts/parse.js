angular.module('parseService', [])

.service('parse', ['$rootScope', '$http',
	function($rootScope, $http) {
		var self = this;
		var baseUrl = 'https://api.parse.com/1/classes/';
		var applicationKey = 'maiqvOeWeNT1D8J1QgftguTE6wmOpcKhXfioe1S2';
		var apiKey = 'rcfocQkhqSiYPpw7OXNkxKqGZE1q4akU4xGo13qT';


		this.request = function(method, className, data, id) {
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
				headers: headers
			});
		}

		this.get = function(className) {
			return self.request("GET", className).then(function(response) {
				return response.data.results;
			});
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

		this.getByColumn = function(className, columnName, value) {

			return self.get(className).then(function(response) {
				var tempData = [];
				angular.copy(response, tempData); //clone object array
				tempData = []; //clear results in object array

				angular.forEach(response, function(obj, index) {
					if (angular.isDefined(obj[columnName]) && obj[columnName] == value) {
						//push only those that matches
						tempData.push(obj);
					}
				});
				//return new array
				return tempData;
			});
		}

		this.getRowByColumn = function(className, columnName, value) {
			return self.getByColumn(className, columnName, value).then(function(response) {
				if(response.length > 0)
					return response[0];
				else
					return null;
			});
		}
	}
]);


// 				return tempData;