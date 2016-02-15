/* ------------------------------------------------------------------------------------------------------*\
    
    app.select handles the selection and movement of map elements
    
\* ------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.undo = require('../tools/undo.js');
app.settings = require('../settings/game.js');
app.animate = require('../game/animate.js');
app.actions = require('../game/actions.js');
app.calculate = require('../game/calculate.js');
app.display = require('../tools/display.js');

module.exports = function () {

    var selected = {}, abs = Math.abs, active = false, range = [], hovered = false;

    // moves a unit
    var move = function (type, index) {

        // if there is a selected unit and select is active and the select key has been pressed
        if (selected.unit && active && app.key.pressed('enter')) {

            app.undo.keyPress(app.key.enter);

            // cursor location
            var cursor = app.settings.cursor;

            // selected unit
            var unit = select.unit;

            // check if square moving to has a unit on it
            var landing = gridPoint('unit');

            // get the unit to combine with
            if ( landing ) var combine = app.map.unit[landing.ind];

            // if the unit being landed on belongs to the current player, is the same type of unit but is not the same unit
            if( combine && combine.player === unit.player && combine.ind !== unit.ind ){

                // if is the same unit then combine units
                if ( combine.type === unit.type ){  
                    combine.combine = true;

                // if the unit is a transport and the unit being moved into can be loaded into that transport, then show the option to load into the transport
                }else if(combine.transport && unit.load.hasValue(unit.type) && unit.loaded.length < unit.transport.length){
                    combine.load = true;
                }
                if( combine.load || combine.combine ){
                    // get actions for the unit
                    var actions = app.actions.check(combine);

                    // if there are actions returned then display them
                    if(actions.wait) app.display.actions(actions);
                }
            }else{
                
                // calculate how many squares were moved
                var xmove = abs(unit.x - cursor.x);
                var ymove = abs(unit.y - cursor.y);

                // remove the amount of squares moved from the units allowed movement for the turn
                app.map.unit[unit.ind].movement -= xmove + ymove;

                // change selected units position to the cursor location
                app.map[type][index].x = cursor.x;
                app.map[type][index].y = cursor.y;
                socket.emit('moveUnit', {index:index, type:type, x:cursor.x, y:cursor.y});

                //animate the changes
                window.requestAnimationFrame(app.animate('unit'));

                // check to see if actions can be taken
                var actions = app.actions.check();
            }
            
            // remove the range and path hilights
            app.undo.effect('highlight').effect('path');

            // if there are actions that can be taken then display the necessary options
            if ( actions.wait ) {
                app.display.actions(actions);

            // if there are no actions then deselect the unit
            } else {
                app.undo.all();
            }
            return true;
        }
        return false;
    };

    var element = function (type, index) {
        //  if the index input is undefined or false then use the current cursor location (!index will fail for 0)
        if (index === undefined || index === false) {

            var hover = gridPoint(type);

            // if the selectable status is not false and the map element is defined then select it
            if (hover) select(type, hover.ind);

        } else {
            // if there is an index supplied then use it allong with the type
            select(type, index);
        }
        // if an object was selected then return true, otherwise return false
        return selected.unit ? true : false;
    };

    var select = function (type, index) {

        // if their is not a selection active and the cursor is not hovering over empty terrain, 
        // then do the following when the select key is pressed
        if (!active && type !== 'terrain' && app.key.pressed('enter')) {
            app.undo.keyPress(app.key.enter);
            attempt = app.map[type][index];

            // set properties for selected object if it can be selected
            // make sure the player attempting to interact with the object is the owner of the object
            if (!app.settings.notSelectable.hasValue(attempt.type) && attempt.player === app.game.currentPlayer().id) {
                
                selected[type] = attempt;
                selected[type].category = type;
                selected[type].ind = index;

                // if the selected object is a unit, do unit stuff
                if (selected.unit) {
                    range = app.calculate.range(); // set range of movement
                    app.display.range(); // highlight rang of movemet

                // otherwise do building stuff
                } else {
                    app.display.selectionInterface(selected.building.type, 'unitSelectionIndex');
                }

                // remove the terrain info display
                app.undo.display('hud');
                active = true;
                return true;
            }
        }
        return false;
    };

    // check what is occupying a specific point on the game map based on type
    var gridPoint = function (type, x, y) {

        // use current cursor location if one has not been passed in
        x = x ? x : app.settings.cursor.x;
        y = y ? y : app.settings.cursor.y;

        // get array of objects on map of specified type
        var arr = app.map[type];

        // look through array of objects and check if they are at the current or passed grid point
        for (var p = 0; p < arr.length; p += 1) {

            // if an object is found at the same grid pint return it 
            if (arr[p].x === x && arr[p].y === y) {
                return {
                    ind: p,
                    category: type,
                    stat: true
                };
            }
        }
        return false;
    };

    return {
        // returns info on the grid square currently hovered over
        hovered:gridPoint,

        // return the currently selected building/unit or return false if none are currently selected
        unit: function () {return selected.unit ? selected.unit : false;},
        building: function () {return selected.building ? selected.building : false;},

        // return whether select is active or not
        active: function (b) {return active;},

        // set active status to true
        activate: function () {active = true;},

        // returns an array of grid points that can be acted on
        range : function () {return range},

        // get info on the selected hovered for movement
        display : function (item) {hovered = item;},

        // set active status to false and reset selected and range to an empty
        deselect: function () {active = false; selected = {}; range = [];},

        // on press of the exit key ( defined in app.game.settings.keyMap ) undo any active select or interface
        exit: function () {
            if (app.key.pressed('esc')) app.undo.all();
            return this;
        },

        // allows selection and movement of objects on screen
        move: function (type) {

            // if theres no input then say so
            if (!hovered && !type) {
                throw new Error('no type or input specified, please enter a type of map element into the input of the "interact()" method or chain the "info()" method prior to the "interact()" method');

                // if there is an object being hovered over, or hovered is undefined ( meaning input is possibly from type input rather then hovered )
            } else if (hovered || hovered === undefined) {

                // get the type of object being hovered over
                if(!type) type = hovered.category;

                // get the index of the object being hovered over
                var intInd = !hovered ? undefined : hovered.ind;

                // if the map element is selectable and the selected map element is a unit then facilitate interaction with that unit
                if (element(type, intInd) && selected.unit) {
                    move('unit', selected.unit.ind);
                }
            }
        }
    };
}();