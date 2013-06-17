angular.module('facebookService', [])

.run(['$rootScope', '$window', 'facebook',
	function($rootScope, $window, facebook) {

		$rootScope.fbUser = {};
		$rootScope.fbAuthorized = false;
		$rootScope.fb = facebook;

		$window.fbAsyncInit = function() {
			// init the FB JS SDK
			FB.init({
				appId: '207376306077755', // App ID from the app dashboard
				channelUrl: 'app/channel.html', // Channel file for x-domain comms
				status: true, // Check Facebook Login status
				cookie: true,
				xfbml: true // Look for social plugins on the page
			});

			facebook.observeResponseChange();
		};

		// Load the SDK asynchronously
		(function(d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {
				return;
			}
			js = d.createElement(s);
			js.id = id;
			js.async = true;
			js.src = "//connect.facebook.net/en_US/all.js";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
	}
])

.service('facebook', ['$rootScope', 'parse', '$q',
	function($rootScope, parse, $q) {

		this.observeResponseChange = function() {
			var self = this;
			FB.Event.subscribe('auth.authResponseChange', function(response) {
				switch (response.status) {
					case 'connected':
						self.getInfo();
						break;
					default:
						$rootScope.fbAuthorized = false;
				}
			})
		};

		this.getInfo = function() {
			FB.api('/me?fields=first_name,last_name,email,picture.type(large)', function(response) {
				$rootScope.$apply(function() {
					$rootScope.fbUser = response;
					if (response && !response.error)
						$rootScope.fbAuthorized = true;
				})
			});
		};


		this.login = function() {
			var self = this;
			FB.login(function(response) {
				self.getInfo();

				//Add to param
				FB.api('/me?fields=first_name,last_name,email,picture.type(large)', function(response) {
					$rootScope.$apply(function() {
						self.idExist(response.id).then(function(exist) {

							if(!exist) {

								//create json object to be entered into db
								var userData = {
									email: response.email,
									firstName: response.first_name,
									lastName: response.last_name,
									facebookId: response.id,
									picture: response.picture.data.url
								}

								//add to users table
								parse.add('Users', userData);
							}
						});
					});
				});
			});
		};

		this.logout = function() {
			FB.logout(function() {
				$rootScope.$apply(function() {
					$rootScope.fbUser = {};
					$rootScope.fbAuthorized = false;
				});
			});
		};

		this.idExist = function(facebookId) {
			return parse.getRowByColumn('Users', 'facebookId', facebookId).then(function(data) {
				if (data != null)
					return true;
				else
					return false;
			});
		}
	}
]);