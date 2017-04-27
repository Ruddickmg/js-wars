app.properties = require("../definitions/properties.js");
terrainController = require("../controller/terrain.js");
composer = require("../tools/composition.js");

module.exports = function (units, buildings, terrain) {

	var elements = {
		unit: units,
		building: buildings,
		terrain: terrain
	};

	var healing = {

        hq:["foot", "wheels"],
        city:["foot", "wheels"],
        base:["foot", "wheels"],
        seaport:["boat"],
        airport:["flight"]
    };

	var get = function (element) {

		return elements[element.type.toLowerCase()][element.name.toLowerCase()];
	};

	var property = function (element) { 

		return get(element).properties; 
	};

	var cost = function (element) {

		return get(element).cost;
	};

	return {

		canHeal: function (building) {

			var name = buildingController.name(building);

			if (!isString(name)) {

				throw new Error("\"name\" property of argument \"building\" must be a string.");
			}

			return healing[buildingController.name(building).toLowerCase()] || false;
		},

		name: function (type) {

			var name = (elements.terrain[type] || elements.building[type] || elements.unit[type]).name;

			return name;
		},

		find: function (type) {

			return elements.unit[type] || false;
		},

		ammo: function (unit) { 

			return property(unit).ammo; 
		},

		fuel: function (unit) { 

			return property(unit).fuel; 
		},

		movement: function (unit) { 

			return property(unit).movement; 
		},

		vision: function (unit) { 

			return property(unit).vision; 
		},

		canAttack: function (unit) { 

			return property(unit).canAttack; 
		},

		range: function (unit) { 

			return property(unit).range; 
		},

		damageType: function (unit) { 

			return property(unit).damageType; 
		},

		movementCost: function (unit, obsticle) {

			var name = obsticle.name.toLowerCase();

			var key = {

				plains:"plain",
				woods:"wood",
				base:"building",
				seaport:"building",
				airport:"building",
				hq:"building"
				
			}[name];

			return property(unit).movementCosts[key || name]; 
		},

		movable: function (unit) { 

			return property(unit).movable; 
		},

		transportation: function (unit) { 

			return property(unit).transportation; 
		},

		capture: function (unit) { 

			return property(unit).capture; 
		},

		weapon1: function (unit) { 

			return property(unit).weapon1; 
		},

		weapon2: function (unit) { 

			return property(unit).weapon2; 
		},

		maxLoad: function (unit) { 

			return property(unit).maxLoad; 
		},

		load: function (unit) { 

			return property(unit).load; 
		},

		loaded: function (unit) { 

			return property(unit).loaded; 
		},

		health: function() { 

			return 100; 
		},

		cost: function (unit) {

			return get(unit).cost;
		}
	};
};