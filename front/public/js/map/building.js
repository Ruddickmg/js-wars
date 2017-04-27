createTerrain = require("../map/terrain.js");
composer = require("../tools/composition.js");

module.exports = function (type, position, player, index) {
    
	var building = composer.exclude(["type", "name"]).compose({

		type: "building",
		player: player,
		health: 20,
		name: type,
		index: index,

	}, createTerrain(type, position));

	return building;
};