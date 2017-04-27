/*------------------------------------------------------------------------------*\

	Composition, composes an array of objects or functions into a single object

\*------------------------------------------------------------------------------*/

module.exports = function () {

	var makeArray = function (elements) {

		return elements.constructor === Array ? elements : [elements];
	};

	// condenses a list of objects together into a single object
	var combine = function (objects) {

		var l = objects.length, object = {};

		while (l--) {

			Object.assign(object, objects[l]);
		}

		return object;
	};

	var exclusive = function (exclusions, object1, object2) {

		var composed = Object.assign({}, object1);
		var keys = Object.keys(object2);
		var k, l = keys.length;

		while (l--) {

			k = keys[l];

			if (!exclusions[k] && !composed[k]) {

				composed[k] = object2[k];
			}
		}

		return composed;
	};

	var inclusive = function (inclusions, object1, object2) {

		var composed = Object.assign({}, object1);
		var i, l = inclusions.length;

		while (l--) {

			i = inclusions[l];

			if (!composed[i]) {

				composed[i] = object2[i];
			}
		}

		return composed;
	};

	return {

		include: function (elements) {

			var including = makeArray(elements);

			return {

				excluding: this.excluding,
				including: including,
				include: this.include,
				compose: this.compose,
				functions: this.functions
			};
		},

		exclude: function (elements) {

			var exclude = {};
			var list = makeArray(elements);
			var l = list.length;

			while (l--) {

				exclude[list[l]] = true;
			}

			return {
				
				excluding: exclude,
				including: this.including,
				include: this.include,
				compose: this.compose,
				functions: this.functions
			};
		},

		compose: function () {

			var args = [].slice.call(arguments);
			var length = args.length;

			if (length < 1) {

				throw new Error ("compose must take at least one argument, found none.", "composition.js");
			}

			var object = Object.assign({}, args[0]);
			var objects = args.slice(1);

			if (objects.length < 1) {

				return object;
			}
			
			var combined = combine(objects);
			var composed = false;

			if (this.excluding) {

				composed = exclusive(this.excluding, object, combined);

				this.excluding = false;
			}

			if (this.including) {

				composed = inclusive(this.including, object, combined);

				this.including = false;
			}

			if (!composed) {

				composed = Object.assign(object, combined);
			}

			return composed;		
		},

		/*
			composes a list of functions (functions) together and returns the generated value, if no value is input for the
			second argument (input), then a function is returned that will recieve the input and apply the functions to that
			input when it is called.

			@functions = [(a -> b)]
			@input = a
		*/

		functions: function (functions, input) {

			var compose = function (input) {

				var l = functions.length - 1;

				var value = functions[l](input);

				while (l--) {

					value = functions[l](value);
				}

				return value;
			};

			return input === undefined ? compose : compose(input);
		}
	}
}();