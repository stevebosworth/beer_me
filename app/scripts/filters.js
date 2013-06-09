// --------------------------------------------------------------------
/**
 * Filters
 *
 * Provides us filters to alter the presentation of content
 *
 */

angular.module('beerMeFilters', [])

	// --------------------------------------------------------------------
	/**
	 * checkmark
	 *
	 * If true, return Check, else return X
	 *
	 */

	.filter('checkmark', function() {
		return function(input) {
			return input ? '\u2713' : '\u2718';
		};
	})

	// --------------------------------------------------------------------
	/**
	 * yesno
	 *
	 * If true, return Yes, else No
	 *
	 */

	.filter('yesno', function() {
		return function(input) {
			return input ? 'Yes' : 'No';
		};
	});