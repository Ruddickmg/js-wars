/* ------------------------------------------------------------------------------------------------------*\
   
    matrixTracking.js keeps track of visited indices within a matrix, for pathfinding etc..
   
\* ------------------------------------------------------------------------------------------------------*/

Position = require("../objects/position.js");
terrainController = require("../controller/terrain.js");
unitController = require("../controller/unit.js");

module.exports = function () {

    var tracking = {};

    var tracker = {

        close: function (element) {

            this.add(unitController.position(element));

            return this;
        },

        add: function (position) {

            var x = position.x;
            var y = position.y;

            if (!tracking[x]) {

                tracking[x] = {};
            }

            tracking[x][y] = {

                position: new Position(x, y)
            };

            return this;
        },

        element: function (element) {

            return this.position(terrainController.position(element));
        },

        position: function (position) {

            var x = position.x;
            
            return tracking[x] ? tracking[x][position.y] : false;
        },

        setF: function (element, value) {

            set(element, value, 'f');

            return this;
        },

        setG: function (element, value) {

            set(element, value, 'g');

            return this;
        },

        setParent: function (element, value) {

            set(element, value, 'p');

            return this;
        },

        getF: function (element) {

            return get(element, 'f');
        },

        getG: function (element) {

            return get(element, 'g');
        },

        getParent: function (element) {

            return get(element, 'p');
        },

        clear: function () {

            tracking = {};

            return this;
        }
    };

    var set = function (element, value, property) {

        var p = terrainController.position(element);
        var x = p.x;
        var y = p.y;

        if (tracking[x]) {

            if (tracking[x][y]) {

                tracking[x][y][property] = value;
            }
        }
    };

    var get = function (element, property) {

        var e = this.element(element);

        return e ? e[property] : false;

    }.bind(tracker);

    return tracker;
};