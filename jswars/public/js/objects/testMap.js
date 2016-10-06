module.exports = function () {

	var element = require('../objects/mapElement.js'),
	map = require('../objects/map.js');
	terrain = [
		new element('tallMountain', 5, 6),
		new element('tallMountain', 8, 9),
		new element('tallMountain', 3, 15),
		new element('tallMountain', 4, 20),
		new element('tallMountain', 10, 4),
		new element('tallMountain', 8, 12),
		new element('tallMountain', 5, 12),
		new element('tallMountain', 1, 15),
		new element('tallMountain', 3, 9),
		new element('tallMountain', 4, 6),
		new element('tallMountain', 4, 16),
		new element('tree', 2, 16),
		new element('tree', 1, 18),
		new element('tree', 3, 6),
		new element('tree', 3, 5),
		new element('tree', 15, 12),
		new element('tree', 10, 10),
		new element('tree', 11, 15),
		new element('tree', 20, 3),
		new element('tree', 19, 5)
	],
	buildings = [
		new element('hq', 0, 9, 1),
		new element('hq', 20, 9, 2),
		new element('base', 4, 9, 1),
		new element('base', 16, 9, 2)
	];
	return new map(null, 'test map #1', 2, {x:20, y:20}, terrain, buildings, []);
}