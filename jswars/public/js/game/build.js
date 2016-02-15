/* ---------------------------------------------------------------------------------------------------------*\
    
    app.build handles the creation of new units, buildings or terrain on the map
    
\* ---------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.game = require('../menu/game.js');
app.buildings = require('../objects/buildings.js');
app.animate = require('../game/animate.js');
app.select =  require('../game/select.js');
//app.effect = require('../game/effect.js');
app.undo = require('../tools/undo.js');
app.display = require('../tools/display.js');


module.exports = function () {

    // create new unit if/after one is selected
    var createUnit = function (building, unitType, player) {

        var player = app.game.currentPlayer();

        // create a new unit object with input
        var newUnit = {
            x: building.x,
            y: building.y,
            obsticle: 'unit',
            player: player
        };

        // get the requested unit types information from its reposetory
        var unit = app.buildings[building.type][unitType];

        // get the cost of the selected unit type
        var cost = unit.cost;

        // subtract the cost of the unit from the current players gold if they have enough
        if (currentPlayer.gold - cost > 0) {
            currentPlayer.gold -= cost;
        }

        // get the properties of the requested unit type
        var unitProperties = unit.properties;

        // get the names of the properties
        var properties = Object.keys(unitProperties);

        for (var p = 0; p < properties.length; p += 1) {

            // go through and add each property to the new unit object
            newUnit[properties[p]] = unitProperties[properties[p]]; // this may cause issues if pointers to original object properties persist, probly not, but keep en eye out
        }

        // set movement to zero for newly created units
        newUnit.movement = 0;

        // return the new unit
        return newUnit;
    };

    return {

        // select and create units
        units: function () {

            // get the building types
            var building = app.select.building();
            if (building) {

                // display the unit select menu
                var unit = app.display.select('unitSelectionIndex', 'selectUnitScreen', app.effect.highlightListItem, 'ul', 7);

                // if a unit has been selected then create it
                if (unit) {

                    // create and add the new unit to the map
                    app.map.unit.push(createUnit(building, unit, app.game.currentPlayer().id));
                    app.undo.all(); // removes the selection screen and variables created during its existance
                    app.def.cursorMoved = true; // refreshes the hud system to detect new unit on map;
                    window.requestAnimationFrame(app.animate('unit')); // animate the changes
                }
            }
            return this;
        }
    };
}();