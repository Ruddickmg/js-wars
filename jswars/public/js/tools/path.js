/* --------------------------------------------------------------------------------------*\
    
    Path.js controls pathfinding

\* --------------------------------------------------------------------------------------*/

Position = require('../objects/position.js');
matrixTracker = require("../tools/matrixTracking.js");
heap = require('../tools/binaryHeap.js');
unitController = require("../controller/unit.js");
terrainController = require("../controller/terrain.js");
composer = require("../tools/composition.js");
curry = require("../tools/curry.js");

module.exports = function (map) {
    
    var coordinates = [];
    var visited = matrixTracker();
    
    var getNeighbors = function (position) {

        var x = position.x;
        var y = position.y;

        return [

            new Position(x - 1, y),
            new Position(x + 1, y),
            new Position(x, y - 1),
            new Position(x, y + 1)

        ].reduce(function (neighbors, position) {

            var neighbor = app.map.top(position);

            if (neighbor && !visited.element(neighbor)) {

                neighbors.push(neighbor);
            }

            return neighbors;

        }, []);
    };

    var distance = function (position, origin, target) {

        var dx1 = position.x - target.x;
        var dy1 = position.y - target.y;
        var dx2 = origin.x - target.x;
        var dy2 = origin.y - target.y;

        var cross = Math.abs((dx1 * dy2) - (dx2 * dy1));
        var rand = Math.floor(Math.random()+1) / 1000;

        return ((Math.abs(dx1) + Math.abs(dy1)) + (cross * rand));
    };

    var getF = function (element) {

        return visited.getF(element);
    };

    return {

        show: function (effect) { 

            app.animate('effects'); 
        },
        
        size: function () { 

            return coordinates.length; 
        },

        clear: function () { 

            coordinates = []; 

            return this; 
        },

        set: function (p) { 

            return (coordinates = coordinates.concat(p)); 
        },
        
        get: function () { 

            return coordinates; 
        },

        reachable: function (unit, movement) {

            var open = heap(getF);
            var reachable = [unit];
            var allowed = movement || unitController.movement(unit);
            var neighbor, neighbors, current, cost;

            visited.close(unit);
            open.push(visited.element(unit));

            while ((current = open.pop())) {

                getNeighbors(unitController.position(current)).forEach(function (neighbor) {

                    cost = (visited.getF(current) || 0) + unitController.moveCost(neighbor, unit);

                    if (cost <= allowed) {

                        visited.close(neighbor).setF(neighbor, cost);

                        open.push(visited.element(neighbor));

                        reachable.push(neighbor);
                    }
                });
            }

            return reachable;
        },

        find: function (unit, target) {

            var open = heap(getF);
            var current, cost, neighbor, g;
            var position = unitController.position(unit);
            var allowed = unitController.movement(unit);
            var getElement = composer.functions([app.map.top, unitController.position]);
            var scope = this;

            visited.close(unit).setF(unit, distance(position, position, target));
            open.push(visited.close(unit).element(unit));

            while ((current = open.pop())) {

                position = unitController.position(current);

                // if the targetination has been reached, return the array of values
                if (position.on(target)) {

                    var path = [getElement(current)];

                    while ((current = visited.getParent(current))) {

                        path.unshift(getElement(current));
                    }

                    visited.clear();

                    return this.set(path);
                }

                getNeighbors(position).forEach(function (neighbor) {

                    var currentG = (visited.getG(current) || 0);
                    var moveCost = unitController.moveCost(neighbor, unit);
 
                    cost = currentG + moveCost;

                    g = visited.getG(neighbor);

                    if (cost <= allowed && !g || g >= visited.getG(current)) {

                        visited.close(neighbor)
                            .setG(neighbor, cost)
                            .setF(neighbor, cost + distance(
                                unitController.position(neighbor),
                                unitController.position(unit),
                                target
                            ))
                            .setParent(neighbor, current);

                        open.push(visited.element(neighbor));
                    }
                });
            }

            visited.clear();

            return false;
        },

        visited: function () {

            return visited;
        },

        clean: function () {

            visited.clear();
        }
    };
};