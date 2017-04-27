/* ------------------------------------------------------------------------------------------------------*\
   
    controller/terrain.js modifies and returns properties of terrain objects in game
   
\* ------------------------------------------------------------------------------------------------------*/

Validator = require("../tools/validator.js");
curry = require("../tools/curry.js");

module.exports = function () {

	// var validate = new Validator("controller/terrain.js");

	var restricted = {

        sea: ["sea", "reef", "shoal"],
        reef: this.sea,
        shoal: this.sea,
        road:["road"],
        pipe:["pipe"],
        bridge: ["bridge"],
        river:["river"]
    };

	var controller = {

		/*
			returns the position of a passed in element

			@element = Object, Terrain, Building or Unit
		*/

		position: function (element) { 

		    var position = element.position;

		    // var error = validate.isCoordinate(position);

		    // if (error) {

		    // 	throw error;
		    // };

		    return new Position(position.x, position.y);
		},

		/*
			returns a boolean stating whether the passed in elements position is occupied by a unit

			@element = Object, Terrain, Building or Unit
		*/

		occupied: function (element) {

		    return this.type(app.map.top(this.position(element))) === "unit"; 
		},

		/*
			returns the type of a passed in element

			@element = Object, Terrain, Building or Unit
		*/

		type: function (element) { 

			var type = element.type;
			// var error = validate.mapElementType(type);

			// if (error) {

			// 	throw error;
			// }

		    return type;
		},

		/*
			returns the name of a passed in element

			@element = Object, Terrain, Building or Unit
		*/

		name: function (element) { 

			var name = element.name.toLowerCase();

			// var error = validate.mapElementName(name);

			// if (error) {

			// 	throw error;
			// }

		    return name; 
		},

		/*
			returns the parameter name of the input element (element) that is to be drawn on canvas

			@element = Object, Terrain, Building or Unit
		*/

		draw: function (element) {

			var name = element.draw || element.name;
			var orientaion = element.orientaion || "";

			// var error = validate.isString(name) || validate.isString(orientaion);

			// if (error) {

			// 	throw error;
			// }

			return name + orientaion;
		},

		/*
			returns a boolean as to whether a map element is terrain

			@element = Object, Terrain, Building or Unit
		*/

		isTerrain: function (element) {

			return this.type(element) === "terrain";
		},

		/*
			returns a boolean as to whether a map element is a building

			@element = Object, Terrain, Building or Unit
		*/

		isBuilding: function (element) {

			return this.type(element) === "building";
		},

		/*
			returns a boolean as to whether a map element is a unit

			@element = Object, Terrain, Building or Unit
		*/

		isUnit: function (element) {

			return this.type(element) === "unit";
		}, 

		isSea: function (element) { 

	        return restricted.sea.hasValue(terrainController.name(element)); 
	    },

	    isShoal: function (element) {

	    	return this.name(element) === "shoal";
	    },

	    isReef: function (element) {

	    	return this.name(element) === "reef";
	    },

	    isRiver: function (element) {

	    	return this.name(element) === "river";
	    },

	    isBeach: function (element) {

	        if (this.isSea(element)) {

	            var neighbors = this.position(element).neighbors();

	            for (var i = 0; i < neighbors.length; i += 1) {

	                if (!isSea(neighbors[i])) {

	                    return true;
	                }
	            }
	        }

	        return false;
	    },

	    isPlain: function (element) {

	    	return this.name(element) === "plain";
	    },

	    restrictions: function (type) {

	    	return Object.assign(restricted[type]);
	    }
	};

	/*--------------------------------------------------------------------------------------*\
    \\ all functions below are curried functions, they are declared seperately so that they //
    // can maintain the context of "this"                                                   \\
    \*--------------------------------------------------------------------------------------*/

	/*
		returns the passed in element (element), modified by adding the name of its drawing (drawing)

		@element = Object, Terrain, Building or Unit
		@drawing = String
	*/

	controller.setDrawing = curry(function (drawing, element) {

		if (!isString(drawing)) {

			throw new Error("the second argument of \"setDrawing\": drawing, must be a string.", "controller/terrain.js");
		}

		element.draw = drawing;

		return element;
	
	}.bind(controller)),

	/*
		returns the passed in element (element), modified by adding the orientaion of its drawing (drawing)
		
		@orientaion = String
		@element = Object, Terrain, Building or Unit
	*/

	controller.setOrientation = curry(function (orientation, element) {

		var copy = Object.assign(element);

		if (!isString(drawing)) {

			throw new Error("the second argument of \"setDrawing\": drawing, must be a string.", "controller/terrain.js");
		}

		element.orientaion = orientaion;

		return element;
	
	}.bind(controller)),

	controller.setIndex = curry(function (index, element) {

		var copy = Object.assign(element);

		copy.index = index;

		return copy;
	
	}.bind(controller)),

	/*
		returns a boolean of whether the input element (element) is on the input position (target)

		@element = Object, Terrain, Building or Unit
	*/

	controller.on = curry(function (target, element) {

	    var position = this.position(element);

	    // var error = validate.isCoordinate(target) || validate.isCoordinate(position);

	    // if (error) {

	    // 	throw error;
	    // };

	    return position.x === target.x && position.y === target.y;
	
	}.bind(controller));

    return controller;
}();