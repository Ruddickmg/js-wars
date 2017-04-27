/* ------------------------------------------------------------------------------------------------------*\
   
    Building.js controls modification and interaction with building map elements 
   
\* ------------------------------------------------------------------------------------------------------*/

Validator = require("../tools/validator.js");
composer = require("../tools/composition.js");
terrainController = require("../controller/terrain.js");
createUnit = require("../map/unit.js");
createDefaults = require('../definitions/defaults.js');
terrainDefaults = require("../definitions/properties.js");
buildingDefaults = require("../definitions/buildings.js");
unitDefaults = require("../definitions/units.js");
playerController = require("../controller/player.js");
app.players = require("../controller/players.js");
curry = require("../tools/curry.js");

module.exports = function () {

	var validate = new Validator("controller/building.js");
    var defaults = createDefaults(unitDefaults, buildingDefaults, terrainDefaults);

	var controller = composer.exclude("draw").compose({

		/*
			returns the id of the owner (player id) of the passed in element

			@element = building or unit object
		*/

		playerId: function (element) {

			var player = this.player(element);

			if (!player) {

				player = element;
			}

		    var id = playerController.id(player);

		    return !isBoolean(id) && id !== undefined ? id : player;
	    },

		/*
			returns the units produced by the building type passed to the element

			@element = building object
		*/

		units: function (element) {

		    return defaults.units(element); 
		},

		/*
			returns the health of a passed in building

			@element = Object, building
		*/

		health: function (element) { 

		    return defaults.health(element); 
		},

		/*
			returns the id of the player of a passed in element, may need to be modified

			@element = Object, building or unit
			@player = Integer, player number
		*/

		player: function (element) {

		    var player = element.player

		    return player; 
		},

		/*
			returns the player of a passed in element, may need to be modified

			@element = Object, building or unit
			@player = Integer, player number
		*/

        getPlayer: function (element) {

        	var id = this.player(element);

        	if (!isNaN(id) || isString(id)) {

        		return app.players.byId(id);
        	}

        	throw new Error("Invalid id pulled from element passed to \"getPlayer\".", "controller/building.js");
        },

		/*
			returns the color of an element

			@element = Object, building or unit
		*/

		color: function (element) { 

		    return this.player(element) ? this.player(element).color() : "default"; 
		},

		/*
			modifies the passed in building, restoring it to its default health, then returns it

			@element = Object, building
		*/

		restore: function (element) { 

		    element.health = defaults.health(element); 

		    return element;
		},

		/*
			returns the saved index of the passed in building

			@element = Object, building
		*/

		indexOf: function (element) { 

		    return element.index; 
		},

		/*
			returns the match of the passed in element from the buildings array

			@element = Object, building
		*/

		get: function (element) { 

		    return app.map.buildings()[this.indexOf(element)]; 
		},

		/*
			returns a string from the selected parameter from the bulding object

			@building = Object, building
		*/

		selected: function (building) {

			if (!isString(building.selected)) {

				throw new Error("parameter of building object: \"selected\" must be a string. in method: \"selected\".", "controller/bulding.js");
			}

			return building.selected;
		},

		/*
			returns a boolean representing whether the passed in bulding is a headquarters or not

			@building = Object, building
		*/

		isHQ: function (building) {

			return this.name(building) === "hq";
		}

	}, terrainController);

    /*--------------------------------------------------------------------------------------*\
    \\ all functions below are curried functions, they are declared seperately so that they //
    // can maintain the context of "this"                                                   \\
    \*--------------------------------------------------------------------------------------*/

	/*
		returns a modified building, with its selected parameter set to its second argument

		@building = Object, building
		@selected = String
	*/

	controller.select = curry(function (selected, building) {

		if (!isString(selected)) {

			throw new Error("parameter of building object: \"selected\" must be a string, in method: \"select\".", "controller/bulding.js");
		}

		building.selected = selected;

		return building;
	
	}.bind(controller));

	/*
		returns a boolean that tests whether one object has the same owner as the other

		@Object1 & Object2 = Object, building or unit
	*/

	controller.owns = curry(function (object1, object2) {

	    return this.playerId(object1) === this.playerId(object2); 
	
	}.bind(controller));

	/*
		modifies the building passed in, subtracting the amount it has been captured from its health, then returns it

		@element = Object, building
		@capture = Integer
	*/

	controller.capture = curry(function (capture, element) {

	    element.health -= capture; 

	    return element;
	
	}.bind(controller)),

	/*
		modifies the building object passed to the function, changing the player who owns the building, then returns it

		@element = Object, building
		@player = Integer, player number
	*/

	controller.changeOwner = curry(function (player, element) { // <--- remove, just use map

	    app.map.changeOwner(element, player); 

	    return element;
	
	}.bind(controller)),

	/*
		returns a unit object

		@element = Object, building
		@type = String, type of unit to be built
	*/

	controller.build = curry(function (type, element) {

	    var playerId = this.playerId(element);
	    var position = this.position(element);

	    return createUnit(type, new Position(position.x, position.y), playerId);
	
	}.bind(controller)),

	/*
		modifies the passed in element, setting its player to the passed in player, then returns it

		@element = Object, building or unit
		@player = Integer, player number
	*/

	controller.setPlayer = curry(function (player, element) {

	    element.player = player;

	    return element;
	
	}.bind(controller)),



	/*
		returns a boolean as to whether the passed in building can build a specified unit type

		@element = Object, building object
		@type = String, building type
	*/

	controller.canBuild = curry(function (type, element) { 

	    return defaults.build(element).indexOf(type) >= 0; 
	
	}.bind(controller)),

	/*
		returns a boolean as to whether a passed in unit (unit) can be healed by the passed in building (element)

		@element = Object, building
		@unit = Object, unit
	*/

	controller.canHeal = curry(function (unit, element) { 

		var canHeal = defaults.canHeal(element);
		var transportation = defaults.transportation(unit);

	   	return canHeal ? canHeal.indexOf(transportation) >= 0 : false; 
	
	}.bind(controller));

	return controller;
}();