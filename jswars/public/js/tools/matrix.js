terrainController = require("../controller/terrain.js");
unitController = require("../controller/unit.js");
Terrain = require('../map/terrain.js');

/* ----------------------------------------------------------------------------------- *\

	Matrix holds map elements in a matrix for quick access during map analysis

\* ----------------------------------------------------------------------------------- */

module.exports = function (dimensions) {

	matrix = {};
	dummies = [];

	return {

		/*
		*	insert takes a map element and inserts it into the matrix 
		*	position representing its location on a grid
		*/

		insert: function (element) {

			var p = terrainController.position(element);

			if (!matrix[p.x]) {

				matrix[p.x] = {};
			}

			matrix[p.x][p.y] = element;

		    return matrix[p.x][p.y];
		},

		remove: function (element) {

			var existing = this.get(element);

			if (!terrainController.isBuilding(existing)) {

				if (terrainController.isUnit(element)) {

					if (unitController.isSame(existing, element)) {

						this.insert(unitController.occupies(element));
					}

				} else {

					this.insert(new Terrain('plain', terrainController.position(element)));
				}
			}

			return element;
		},

		position: function (p, init) {

			var e, d = dimensions, x = matrix[p.x];

			if (p.x <= d.x && p.x >= 0 && p.y <= d.y && p.y >= 0) {

				if ((!x || !x[p.y]) && !init) {

					dummies.push(p);

					this.insert(new Terrain('plain', p));
				}

				return matrix[p.x][p.y];
			}

			return false;
		},

		clean: function () {

			var x, p, e, l = dummies.length;

			while (l--) {

				p = dummies[l];
				x = matrix[p.x];
				e = x ? x[p.y] : false;

				if (e && !terrainController.isUnit(e) && !terrainController.isBuilding(e)) {

					delete matrix[p.x][p.y];
				}
			}

			dummies = [];
		},

		get: function (element) {

			return this.position(terrainController.position(element));
		}
	};
};