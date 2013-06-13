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

.service('facebook', ['$rootScope',
	function($rootScope) {

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
			FB.api('/me', function(response) {
				$rootScope.$apply(function() {
					$rootScope.fbUser = response;
					$rootScope.fbAuthorized = true;
				})
			});
		};


		this.login = function() {
			var self = this;
			FB.login(function(response) {
				self.getInfo();
			});
		};

		this.logout = function() {
			FB.logout(function() {
				$rootScope.$apply(function() {
					$rootScope.fbUser  = {};
					$rootScope.fbAuthorized = false;
				});
			});
		};
	}
]);