/* ------------------------------------------------------------------------------------------------------*\

    controller/map.js controls the setting up and modification of the map

\* ------------------------------------------------------------------------------------------------------*/

"use strict";

const
    calculate = require("../tools/calculate.js"),
    // Validator = require("../tools/validator.js"),
    Matrix = require("../tools/matrix.js"),
    createTerrain = require("../map/terrain.js"),
    createBuilding = require("../map/building.js"),
    createUnit = require("../map/unit.js"),
    Position = require("../objects/position.js"),
    unitController = require("../controller/unit.js"),
    terrainController = require("../controller/terrain.js"),
    buildingController = require("../controller/building.js"),
    app = require("../settings/app.js");

app.settings = require("../settings/game.js");
app.players = require("../controller/players.js");
app.units = require("../definitions/units.js");
app.animate = require("../animation/animationHandler.js");

export default function() {

    let
        focused,
        matrix,
        allowedUnits,
        allowedBuildings,
        map = {},
        buildings = [],
        terrain = [],
        units = [];

    // const validate = new Validator("mapEditor");

    const sea = ["sea", "reef", "shoal"];
    const restricted = {

        bridge: ["bridge"],
        pipe: ["pipe"],
        reef: sea,
        river: ["river"],
        road: ["road"],
        sea,
        shoal: sea,
    };
    const occupants = ({x,y}) => {

        const
            onSamePosition = terrainController.on,
            type = terrainController.type,
            mapElements = [units, buildings, terrain],
            terrain = createTerrain("plain", new Position(x, y));

        return mapElements.reduce((occupants, elements) => {

            const occupant = elements.find((element) => onSamePosition(terrain, element));

            if (occupant) {

                occupants[type(occupant)] = occupant;
            }

            return occupants;

        }, {});
    };
    const detectIndex = (element) => {

        const
            type = terrainController.type(element),
            mapElements = {
                unit: units,
                building: buildings,
                terrain: terrain
            } [type];

        return getIndex(element, mapElements);
    };

    const getIndex = (element, elements) => {

        const elementId = unitController.id(element);
        const position = terrainController.position(element);

        return elements.findIndex((comparison: any) => {

            const comparisonId = unitController.id(comparison);
            const onSamePosition = terrainController.on(position, comparison);

            return elementId === comparisonId || onSamePosition;
        });
    };
    const refresh = (hide) => app.animate("unit", hide);
        neighbors = (position) => {

            const positions = position.neighbors();

            return positions.reduce((neighbors, neighbor) => {

                const element = matrix.position(neighbor);

                if (element) {

                    neighbors.push(element);
                }

                return neighbors;
            });
        },
        remove = {

            unit(element) {

                allowedUnits += 1;

                app.map.removeUnit(element);
            },
            building(element) {

                const
                    index = detectIndex(element),
                    storedBuilding = matrix.remove(element);

                allowedBuildings += 1;

                buildings.splice(index, 1, storedBuilding);
            },
            sea(element) {

                const
                    index = detectIndex(element),
                    position = element.position(),
                    seaTerrain = createTerrain("sea", position),
                    orientedTerrain = adjustOrientation(seaTerrain),
                    storedSeaTerrain = matrix.insert(orientedTerrain);

                terrain.splice(index, 1, storedSeaTerrain);
            }
        },
        addUnit = (unit) => {

            units.push(matrix.insert(unit));

            refresh();
        },
        deleteElement = (element) => {

            const
                type = terrainController.type(element),
                removeElement = remove[type];

            if (removeElement) {

                removeElement(element);

            } else {

                matrix.remove(element.position());
            }
        };

    var facing = function (element) {

        let allowed, elem, i;

        const
            position = element.position(),
            neighbors = position.neighbors(),
            name = terrainController.name(element),
            allowed = restricted[name],
            open = {};

        if (!allowed) {

            return "";
        }

        for (i = 0; i < neighbors.length; i += 1) {

            elem = app.map.top(neighbors[i]);

            if (allowed.indexOf(terrainController.name(elem)) > -1) {

                open[neighbors[i].orientation] = true;
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
    };
    
    var adjustOrientation = function (element) {

        return terrainController.setDrawing(facing(element) + terrainController.name(element), element);
    };

    var adjustSurroundings = function (element) {

        var position = terrainController.position(element);
        var surroundings = position.surrounding();

        for (var adjusted, neighbor, name, i = 0; i < surroundings.length; i += 1) {

            neighbor = matrix.position(surroundings[i]);

            if (terrainController.isShoal(neighbor) || terrainController.isReef(element) && !terrainController.isSea(neighbor)) {

                deleteElement(neighbor, "sea");
            
            } else if ((adjusted = adjustOrientation(neighbor))) {

                terrain.splice(detectIndex(neighbor), 1, adjusted);

                if (terrainController.isUnit(matrix.get(neighbor))) {

                    matrix.insert(adjusted);
                }
            }
        }
    };

    var isBeach = function (element) {

        if (isSea(element)) {

            var neighbors = terrainController.position(element).neighbors();

            for (var i = 0; i < neighbors.length; i += 1) {

                if (!isSea(neighbors[i])) {

                    return true;
                }
            }
        }

        return false;
    };

    var buildUnit = function (unit, position, existing) {

        var element = existing.building || existing.terrain;

        unit = createUnit(unitController.player(unit), new Position(position.x, position.y), unitController.name(unit));

        if (existing.unit && unitController.canBuildOn(unitController.occupies(existing.unit), unit)) {

            allowedUnits -= 1;

            return units.splice(detectIndex(existing.unit), 1, matrix.insert(unit));

        } else if (element && unitController.canBuildOn(element, unit)) {

            allowedUnits -= 1;

            return addUnit(unit);
        }

        return false;
    };

    var indexOfHQ = function (hq) {

        var building, l = buildings.length;

        while (l--) {

            building = buildings[l];

            if (buildingController.isHQ(building) && hq.owns(building)) {

                return l;
            }
        }

        return false;
    };

    var buildBuilding = function (building, position, existing) {

        var hq;

        building = createBuilding(

            buildingController.name(building), 
            new Position(position.x, position.y), 
            buildingController.player(building),
            buildings.length
        );

        if (buildingController.isHQ(building) && (hq = indexOfHQ(building)) !== false) {

            matrix.remove(buildings[hq]);
            buildings.splice(hq, 1);
        }

        if (existing.building) {

            buildings.splice(detectIndex(existing.building), 1, building);
        
        } else {

            buildings.push(building);
        }

        if (!terrainController.isPlain(existing.terrain)) {

            terrain.splice(detectIndex(existing.terrain), 1);

            var neighbor, neighbors = neighbors(new Position(position.x,position.y));
            var l = n.length;

            while (l--) {

                neighbor = neighbors[l]

                terrain.splice(detectIndex(neighbor), 1, adjustOrientation(neighbor));
            }
        }

        if (!existing.unit) {

            matrix.insert(building);
        }

        allowedBuildings -= 1;

        return building;
    };

    var buildTerrain = function (element, position, type, existing) {

        if (type === "river" && isSea(existing.terrain) || type === "shoal" && !isBeach(existing.terrain)) {

            return false;
        }

        element = adjustOrientation(createTerrain(element.draw(), new Position(position.x, position.y)));

        element.index = terrain.length;

        adjustSurroundings(element);
    
        if (!terrainController.isPlain(existing.terrain)) {

            terrain.splice(detectIndex(existing.terrain), 1, element);

        } else {

            terrain.push(element);
        }
        
        if (existing.building) {

            buildings.splice(detectIndex(existing.building), 1);
        }

        if (existing.unit) {

            if (!unitController.canBuildOn(element, existing.unit)) {

                units.splice(detectIndex(existing.unit), 1);

                return matrix.insert(element);
            }

        } else {

            return matrix.insert(element);
        }

        return element;
    };

    return {

        getNeighbors: neighbors,
        detectIndex: detectIndex,
        getIndex: getIndex,
        occupantsOf: occupants,
        addUnit: addUnit,

        id: function () { 

            return map.id; 
        },

        name: function () { 

            return map.name; 
        },

        players: function () { 

            return map.players; 
        },

        setUnits: function (u) {

            if (!isArray(u)) {

                throw new Error("First argument of \"setUnits\" must be an array.");
            }

            units = u;
        },

        getUnit: function (unit) { 

            return units[getIndex(unit, units)]; 
        },

        category: function () { 

            return map.category; 
        },

        dimensions: function () { 

            var dimensions = map.dimensions;

            return  { x: dimensions.x, y: dimensions.y };
        },

        background: function () { 

            return background; 
        },

        setBackground: function (type) { 

            background = createTerrain(type); 
        },

        buildings: function () { 

            return buildings; 
        },

        setBuildings: function (b) {

            if (!b.isArray()) {

                throw new Error("First argument of \"setBuildings\" must be an array.");
            }

            buildings = b;
        },

        terrain: function () { 

            return terrain; 
        },

        insert: function (element) { 

            return matrix.insert(element); 
        },

        units: function () {

            return units; 
        },

        top: function (position, replace) {

            return matrix.position(position, replace); 
        },

        get: function () { 

            return map; 
        },

        set: function (selectedMap) { 

            map = selectedMap; 
        },

        initialize: function (editor) {

            var dim = map.dimensions, product = (dim.x * dim.y);

            matrix = new Matrix(dim);

            allowedBuildings = Math.ceil(product/10) - 1;
            allowedUnits = Math.ceil(product/12.5);

            terrain =  map.terrain.map(function (t) {

                return matrix.insert(createTerrain(terrainController.type(t), terrainController.position(t)));
            });

            buildings = map.buildings.map(function (b, index) {

                var player = buildingController.player(b);

                return matrix.insert(
                    createBuilding(
                        buildingController.type(b) || buildingController.name(b), 
                        buildingController.position(b), 
                        (editor ? player : playerController.id(app.players.number(player))),
                        index
                    )
                );
            });

            units = map.units.map(function (u) {

                var player = unitController.player(u);

                var unit = createUnit(
                    unitController.type(u) || unitController.name(u),
                    (editor ? player : playerController.id(app.players.number(player))),
                    unitController.position(u)
                );

                if (map.saved || app.game.started()) {

                    unitController.update(unit, u);
                }

                return matrix.insert(unit);
            });
        },

        moveUnit: function (unit, target) {

            console.log(unit);

            var index = getIndex(unit, units);
            var current = units[index];
            var element = matrix.position(target);

            if (current) {

                matrix.remove(current);
            
            } else {

                current = unit;
            }

            current = unitController.setPosition(target, current);

            if (!element || !terrainController.isUnit(element)) {

                matrix.insert(current);
            }

            units.splice(index, 1, current);
            
            refresh();

            return current;
        },

        removeUnit: function (unit) {

            console.log("-- removing --");
            console.log(unit);

            var index = getIndex(unit, units);

            if (!isNaN(index)) {

                unit = units.splice(index, 1)[0];
            }

            if ((element = matrix.get(unit)) && terrainController.isUnit(element) && unitController.isSame(element, unit)) {

                matrix.remove(unit);
            }

            refresh();

            return unit;
        },

        attackUnit: function (unit, damage) {

            var health = unitController.health(unit);

            units[getIndex(unit, units)].takeDamage(health - damage);

            matrix.get(unit).takeDamage(health - damage);
        },

        changeOwner: function (element, player) {

            var element = matrix.get(element);

            building = terrainController.isUnit(element) ? unitController.occupies(element) : element;

            buildingController.setPlayer(player, building);
            building.restore();

            if (!buildingController.isBuilding(b)) {

                throw new Error("Attempted capture on a non building mapEditor element");
            }

            buildingController.setPlayer(player, building).restore(building);

            refresh();
        },

        takeHQ: function (hq) {

            var index = buildingController.indexOf(hq);

            var building = createBuilding(
                "city",
                buildingController.position(hq),
                buildingController.player(hq),
                index
            );

            buildings.splice(index, 1, building);

            Matrix.insert(building);
        },

        printMatrix:function () {

            matrix.log();
        },

        clean: function () { 

            matrix.clean();

            return this;
        },

        focus: function () {

            if (app.key.keyUp(app.key.map()) && app.key.undoKeyUp(app.key.map())) {

                app.hud.show();
                app.coStatus.show();
                app.cursor.show();
                refresh();
                focused = false;

            } else if (app.key.pressed(app.key.map()) && app.key.undo(app.key.map()) && !focused) {

                app.hud.hideCurrentElement();
                app.coStatus.hideCurrentElement();
                app.cursor.hideCurrentElement();
                refresh(true);
                focused = true;
            }

            refresh();
        },

        focused: function () { 

            return focused; 
        },

        refresh: function () {

            app.animate(["unit","building"]);
        },

        build: function (element, p) {

            var position = new Position(position.x, position.y);
            var type = terrainController.type(element);
            var existing = occupants(position);

            return {
                unit: buildUnit(element, position, existing),
                building: buildBuilding(element, position, existing),
                terrain: buildTerrain(element, position, type, existing)
            }[type];
        },

        surplus: function () { 

            return { building: allowedBuildings, unit: allowedUnits }; 
        },

        displaySurplus: function (){},
        displayPlayers: function (){},

        raw: function (player) {

            return {

                player: player,
                name: map.name,
                players: map.players,
                category: map.category,
                dimensions: map.dimensions,
                terrain: app.map.terrain(),
                buildings: app.map.buildings(),
                units: app.map.units(),
                background: background
            };
        },

        unitsInfo: function () {

            return units.map(function (unit) {

                return {
                    unit: unitController.name(unit),
                    hp: unitController.health(unit),
                    gas: unitController.fuel(unit),
                    rounds: unitController.ammo(unit)
                };
            });
        }
    };
}

module.exports = mapController();