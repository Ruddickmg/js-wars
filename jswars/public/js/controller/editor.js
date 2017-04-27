/* -------------------------------------------------------------------------------- *\

	controller/editor.js controls actions of the map editor.

\* -------------------------------------------------------------------------------- */

app = require("../settings/app.js");

createTerrain = require("../map/terrain.js");
createBuilding = require("../map/building.js");
createUnit = require("../map/unit.js");

unitController = require("../controller/unit.js");
terrainController = require("../controller/terrain.js");
buildingController = require("../controller/building.js");
mapController = require("../controller/map.js");

curry = require("../tools/curry.js");

Position = require("../objects/position.js");
Validator = require("../tools/validator.js");
Matrix = require("../tools/matrix.js");

module.exports = function () {
	
	var editor = composer.add({

		build: function (element, p) {

            var position = new Position(p.x, p.y);
            var type = terrainController.type(element);
            var existing = occupants(position);

            return {
                unit: buildUnit(element, position, existing),
                building: buildBuilding(element, position, existing),
                terrain: buildTerrain(element, position, type, existing)
            }[type];
        },

        adjustOrientation: function (element) {

	        return terrainController.setOrientation(
	        	element, 
	        	this.facing(element) + terrainController.name(element)
	        );
	    },

        surplus: function (map) { 

            return { 
            	building: this.maxBuildings(map), 
            	unit: this.maxUnits(map) 
            };
        },

        displaySurplus: function (){},
        displayPlayers: function (){}

	}, createMapController());

	/*--------------------------------------------------------------------------------------*\
    \\ all functions below are curried functions, they are declared seperately so that they //
    // can maintain the context of "this"                                                   \\
    \*--------------------------------------------------------------------------------------*/

    editor.buildTerrain = curry(function (element, position, existing, map) {

        if (terrainController.isRiver(element) && terrainController.isSea(existing.terrain) 
        	|| terrainController.isShoal(element) && !terrainController.isBeach(existing.terrain)) {

            return map;
        }

        element = adjustOrientation(createTerrain(terrainController.draw(element), new Position(position.x, position.y)));
        element = terrainController.setIndex(element, this.terrain(map).length);

        var copy = this.adjustSurroundings(element, map);
        var matrix = this.matrix(copy);
    
        if (terrainController.isPlain(existing.terrain)) {

            this.terrain(copy)[this.detectIndex(existing.terrain, copy)] = element;

        } else {

            this.terrain(copy).push(element);
        }
        
        if (existing.building) {

            this.buildings(copy).splice(this.detectIndex(existing.building, copy), 1);
        }

        if (existing.unit && !unitController.canBuildOn(existing.unit, element)) {

            units.splice(this.detectIndex(existing.unit, copy), 1);

            matrix.insert(element);

        	return this.setMatrix(matrix, copy);

        } else if (!existing.unit) {

            matrix.insert(element);

            return this.setMatrix(matrix, copy);
        }

        return copy;
    
    }.bind(editor));

    editor.buildBuilding = curry(function (building, position, existing, map) {

        building = createBuilding(
            buildingController.name(building), 
            new Position(position.x, position.y), 
            buildings.length, 
            buildingController.player(building)
        );

        var hq = this.indexOfHQ(building, map);
        var buildings = this.buildings(map);
        var matrix = this.matrix(map);

        if (buildingController.isHQ(building) && hq >= 0) {

            matrix.remove(buildings[hq]);

            buildings.splice(hq, 1);
        }

        if (existing.building) {

            buildings[this.detectIndex(existing.building)] = building;
        
        } else {

            buildings.push(building);
        }

        var copy = this.setBuildings(buildings, map);

        if (!terrainController.isPlain(existing.terrain)) {

        	var terrain = this.terrain(map);
			var neighbor, neighbors = neighbors(new Position(p.x,p.y));
            var l = neighbors.length;

            terrain.splice(this.detectIndex(existing.terrain), 1);            

            while (l--) {

                neighbor = neighbors[l];
                terrain[this.detectIndex(neighbor)] = adjustOrientation(neighbor);
            }

            copy = this.setTerrain(terrain, map);
        }

        if (!existing.unit) {

            matrix.insert(building);
        }

        this.decBuldingMax(copy);

        return this.setMatrix(matrix, copy);
    
    }.bind(editor));

    editor.indexOfHQ = curry(function (hq, map) {

    	var buildings = this.buildings(map);
        var building, l = buildings.length;

        while (l--) {

            building = buildings[l];

            if (buildingController.isHQ(building) && hq.owns(building)) {

                return l;
            }
        }

        return -1;
    
    }.bind(editor));

    editor.buildUnit = curry(function (unit, position, existing, map) {

        var element = existing.building || existing.terrain;

        unit = createUnit(unitController.player(unit), new Position(position.x, position.y), unitController.name(unit));

        if (existing.unit && unitController.canBuildOn(unitController.occupies(existing.unit), unit)) {

            allowedUnits -= 1;

            var units = this.units(map);
            var matrix = this.matrix(map);

            units[this.detectIndex(existing.unit)] = matrix.insert(unit);

            return composer.functions([
            	this.setUnits(units),
            	this.setMatrix(matrix),
            ], Object.assign(map));

        } else if (element && unitController.canBuildOn(element, unit)) {

            return composer.functions([
            	this.addUnit(unit),
            	this.decUnitMax;
            ], map);
        }

        return map;
    
    }.bind(editor));

    editor.adjustSurroundings = curry(function (element, map) {

        var position = terrainController.position(element);
        var surroundings = position.surrounding();
        var adjusted, neighbor, name; 
        var l = surroundings.length;
        var copy = Object.assign(map);
        var matrix = this.matrix(copy);

        while (l--) {

            neighbor = matrix.position(surroundings[l]);

            if (terrainController.isShoal(neighbor) || terrainController.isReef(element) && !terrainController.isSea(neighbor)) {

                this.deleteElement(neighbor, "sea");
            
            } else if ((adjusted = adjustOrientation(neighbor, copy))) {

                this.terrain(copy)[this.detectIndex(neighbor, copy)] = adjusted;

                if (terrainController.isUnit(matrix.get(neighbor))) {

                    matrix.insert(adjusted);
                }
            }
        }

        return this.setMatrix(matrix, copy);
    
    }.bind(editor));

	editor.deleteElement = curry(function (element, map) {

    	var copy = Object.assign(map);
    	var matrix = this.matrix(copy);

        if (terrainController.isUnit(element)) {

            allowedUnits += 1;
            copy = this.removeUnit(element, copy);
        
        } else if (terrainController.isBuilding(element)) {

            allowedBuildings += 1;

            copy = this.setBuildings(this.buildings(copy).splice(
            	this.detectIndex(element, copy), 
            	1, 
            	matrix.remove(element)
            ), copy);
        
        } else if (terrainController.isSea(element)) {

            copy = this.setTerrain(this.terrain(copy).splice(
            	this.detectIndex(element, copy), 
            	1,
            	matrix.insert(adjustOrientation(createTerrain("sea", element.position())))
            ), copy);
        
        } else {

            matrix.remove(position);
        }

        return this.setMatrix(matrix, copy);
    
    }.bind(editor));

    editor.facing = curry(function (element, map) {

        var position = terrainController.position(element);
        var neighbors = position.neighbors();
        var elem, allowed, i, open = {};
        var l = neighbors.length;

        if (!(allowed = terrainController.restrictions(terrainController.name(element)))) {

            return "";
        }

        while (l--) {

            elem = mapController.top(neighbors[l], map);

            if (allowed.hasValue(terrainController.name(elem))) {

                open[neighbors[l].orientation] = true;
            }
        }

        if (open.north && open.south && open.west && open.east) {

            return "";
        }

        if (open.north) {

            if (open.south && !open.east && !open.west) {

                return "verticle";
            }

            if (open.west) {

                return open.east ? "north" : "northWest";
            }
            else if (open.east) {

                return "northEast";
            }
            else {

                return "closedNorth";
            }

        } else if(open.east) {

            if (!open.south) {

                return open.west ? "horazontal" : "closedEast";
            }

            return "southEast";

        } else if (open.south) {

            return open.west ? "southWest" : "closedSouth";
        
        } else if (open.west) {

            return "closedWest"
        }

        return "single";
    
    }.bind(editor));

	return editor;
};