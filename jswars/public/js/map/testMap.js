Position = require("../objects/position.js");
Map = require("../map/map.js");
module.exports = function () {

	var element = require("../map/mapElement.js"),
	map = require("../map/map.js");

	terrain = [
		new element("tallMountain", new Position(5, 6)),
		new element("tallMountain", new Position(8, 9)),
		new element("tallMountain", new Position(3, 15)),
		new element("tallMountain", new Position(4, 20)),
		new element("tallMountain", new Position(10, 4)),
		new element("tallMountain", new Position(8, 12)),
		new element("tallMountain", new Position(5, 12)),
		new element("tallMountain", new Position(1, 15)),
		new element("tallMountain", new Position(3, 9)),
		new element("tallMountain", new Position(4, 6)),
		new element("tallMountain", new Position(4, 16)),
		new element("tree", new Position(2, 16)),
		new element("tree", new Position(1, 18)),
		new element("tree", new Position(3, 6)),
		new element("tree", new Position(3, 5)),
		new element("tree", new Position(15, 12)),
		new element("tree", new Position(10, 10)),
		new element("tree", new Position(11, 15)),
		new element("tree", new Position(20, 3)),
		new element("tree", new Position(19, 5))
	],

	buildings = [
		new element("hq", new Position(0, 9), 1),
		new element("hq", new Position(20, 9), 2),
		new element("base", new Position(4, 9), 1),
		new element("base", new Position(16, 9), 2)
	];

	return new Map(null, "test map #1", 2, {x:20, y:20}, terrain, buildings, []);
}