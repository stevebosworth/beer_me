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
	 * ratingarrow
	 *
	 * If the number is greater than 0, show plus arrow, if product
	 * is less than 0 show down arrow
	 *
	 */

	.filter('ratingarrow', function() {
		return function(input) {
			if(input > 0) {
				return '\f10c';
			} else {
				return '\f10c';
			}
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
	})

	// --------------------------------------------------------------------
	/**
	 * mtokm
	 *
	 * Converts meters to km, rounds up to 2 decimal places
	 *
	 */

	.filter('mtokm', function() {
		return function(input) {
			return Math.round((input / 1000) * 100) / 100 + 'km' ;
		};
	})

	// --------------------------------------------------------------------
	/**
	 * slice
	 *
	 * Allows us to filter ng-repeater based # of records requested
	 *
	 */

	.filter('slice', function() {
		return function(arr, start, end) {
			return arr.slice(start, end);
		};
	})

	// --------------------------------------------------------------------
	/**
	 * inventorydiversity
	 *
	 * Converts the store product count to a corresponding string
	 *
	 */

	.filter('inventorydiversity', function() {
		return function(input) {
			switch(true)
			{
				case (input < 4000):
					return "Small";
					break;
				case (input > 8000):
					return "Large";
					break;
				case (input > 12500):
					return "Massive";
					break;
				default:
					return "Medium";
					break;
			}
		};
	})

	// --------------------------------------------------------------------
	/**
	 * is_open
	 *
	 * Checks the current time vs. the time the store is opened
	 *
	 */

	.filter('is_open', function() {
		return function(data) {
			var currentDay = new Date().getDay();
			var currentMSM = (new Date().getHours() * 60)  + (new Date().getMinutes());
			var open, close;

			switch(currentDay)
			{
				case 0:
					open = data.sunday_open;
					close = data.sunday_close;
					break;
				case 1:
					open = data.monday_open;
					close = data.monday_close;
					break;
				case 2:
					open = data.tuesday_open;
					close = data.tuesday_close;
					break;
				case 3:
					open = data.wednesday_open;
					close = data.wednesday_close;
					break;
				case 4:
					open = data.thursday_open;
					close = data.thursday_close;
					break;
				case 5:
					open = data.friday_open;
					close = data.friday_close;
					break;
				case 6:
					open = data.saturday_open;
					close = data.saturday_close;
					break;
			}
			// so now I have the open and close time of today at the specified store
			// compare it to the current seconds since midnight on the client
			return (currentMSM > open && currentMSM < close) ? "Open" : "Closed";
		};
	})

