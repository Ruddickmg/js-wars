Defaults = function (properties) {

	var ammo = properties.ammo;
	var fuel = properties.fuel;
	var movement = properties.movement;
	var vision = properties.vision;
	var property, l = 4;

	while (l--) {

		property = [ammo, fuel, movement, vision][l];

		if (isNaN(property)) {

			throw new Error("One of the default properties is not defined.", "unitDefaults.js");
		}
	}

	return {
		ammo: function () { return this.properties.ammo; },
		fuel: function () { return this.properties.fuel; },
		movement: function () { return this.properties.movement; },
		vision: function () { return this.properties.vision; },
		health: function() { return 100; }
	};
}();