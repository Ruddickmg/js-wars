unitController = require("../controller/unit.js");
matrixTracker = require("../tools/matrixTracking.js");

module.exports = {

    diamond = function (position, allowed, map) {

        var dimensions = map.dimensions();
        var range = (allowed * 2);
        var right = position.x + allowed;
        var left = position.x - allowed;
        var array = [], abs = Math.abs;

        // get the diamond pattern of squares
        for (var i, y, t, b, x = left, inc = 0; x <= right, inc <= range; x += 1, inc += 1) {

            i = inc > allowed ? range - inc : inc;
            t = (t = position.y - i) > 0 ? t : 0; // top
            b = (b = position.y + i) < dimensions.y ? b : dimensions.y - 1; // bottom

            // add all reachable squares to array
            if (x >= 0 && x <= dimensions.x) {

                for (y = t; y <= b; y += 1) {

                    array.push(map.top(new Position(x,y)));
                }
            }
        }

        return array;
    },

    movement: function (unit, map, distance) {

        return this.reachable(unit, distance === undefined ? app.path.reachable(unit, true):
            this.setInitialPosition(position, this.diamond(Math.min(distance, unit.movement()))));
    },

    setInitialPosition: function (position, diamond) {

        var l = diamond.length, array = [];

        while (!sharedPosition(position, diamond[--l]));

        diamond.unshift(diamond.splice(l,1)[0]);

        return diamond;
    },

    reachable: function (unit, reachable) {

        var array = [];

        for (i = 0; i < reachable.length; i += 1) {

            if (unitController.isUnit(reachable[i]) || unitController.owns(reachable[i], unit)) {

                array.push(reachable[i]);
            }
        }

        return array;
    },

    show = function (unit, range) {

        var visited = matrixTracker();
        var neighbor, neighbors;
        var length = range.length;

        for (var j, i = 0; i < length; i += 1) {

            neighbors = app.map.getNeighbors(unitController.position(range[i]));

            for (j = 0, len = neighbors.length; j < len; j += 1) {

                neighbor = neighbors[j];

                if (!visited.element(neighbor)) {

                    visited.close(neighbor);
                    range.push(neighbor);
                }
            }
        }

        visited.clear();

        return range;
    },

    attack: function (range) {

        var range = [];
        var high = this.diamond(range.high);
        var low = this.diamond(range.low - 1);
        var highLen = high.length;
        var lowLen = low.length;

        for (var push, h = 0, h < highLen; h += 1) {

            push = true;

            for (var l = 0; l < lowLen; l += 1) {

                if (high[h].on(low[l])) {

                    push = false;
                }
            }

            if (push) range.push(high[h]);
        }

        return range;
    },

   attackable: function (position, range, unit) {

        var array = [], l = range.length;

        while (l--) {

            element = range[l];

            if (unitController.isUnit(element) && !unitController.owns(element, unit) && unitController.canAttack(element, unit)) {

                array.push(element);
            }
        }

        // if their are any units in the attackable array, then return it, otherwise return false
        return array.length ? array : false;
    },

    Unit.prototype.inRange = function (unit, range) {

        var l = range.length;

        while (l--) {

            if (unitController.on(range[l], unit)) {

                return true;
            }
        }
        
        return false;
    };
};