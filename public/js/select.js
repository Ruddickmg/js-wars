/* ------------------------------------------------------------------------------------------------------*\
    
    app.select handles the selection and movement of map elements
\* ------------------------------------------------------------------------------------------------------*/

app.select = function () {

    var abs = Math.abs;

    // moves a unit
    var move = function (type, index) {

        // if there is a selected unit and select is active and the select key has been pressed
        if (app.temp.selectedUnit && app.temp.selectActive && app.settings.keyMap.select in app.keys) {

            var cursor = app.settings.cursor;

            app.undo.keyPress(app.settings.keyMap.select);

            // selected unit
            var unit = app.temp.selectedUnit;

            // check if square moving to has a unit on it
            var landing = gridPoint('unit').ind;

            // get the unit to combine with
            if ( landing !== undefined ) var combine = app.map.unit[landing];

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
                var xmove = abs(app.temp.selectedUnit.x - cursor.x);
                var ymove = abs(app.temp.selectedUnit.y - cursor.y);

                // remove the amount of squares moved from the units allowed movement for the turn
                app.map.unit[unit.ind].movement -= xmove + ymove;

                // change selected units position to the cursor location
                app.map[type][index].x = app.settings.cursor.x;
                app.map[type][index].y = app.settings.cursor.y;

                //animate the changes
                window.requestAnimationFrame(app.animateUnit);

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
        //  if the index input is undefined or false then use the current cursor location
        if (index === undefined || index === false) {

            var hover = app.select.hovered(type);

            // if the selectable status is not false and the map element is defined then select it
            if (hover !== undefined && hover.stat !== false) {
                select(type, hover.ind);
            }
        } else {
            // if there is an index supplied then use it allong with the type
            select(type, index);
        }

        // if an object was selected then return true, otherwise return false
        if (app.temp.selectedUnit) { 
            return true;
        }
        return false;
    };

    var select = function (type, index) {

        // create key value pairs that name selectedObject by type
        var objectClass = {
            building: 'selectedBuilding',
            unit: 'selectedUnit'
        };

        // if their is not a selection active and the cursor is not hovering over empty terrain, 
        // then do the following when the select key is pressed
        if (app.temp.selectActive === false && type !== 'terrain' && app.settings.keyMap.select in app.keys) {
            app.undo.keyPress(app.settings.keyMap.select);
            attempt = app.map[type][index];

            // set properties for selected object
            if (!app.settings.notSelectable.hasValue(attempt.type) && attempt.player === app.temp.player.id) {
                app.temp[objectClass[type]] = attempt;
                app.temp[objectClass[type]].objectClass = type;
                app.temp[objectClass[type]].ind = index;

                // if the selected object is a unit, do unit stuff
                if (app.temp.selectedUnit) {
                    app.temp.range = app.calculate.range(); // set range of movement
                    app.display.range(); // highlight rang of movemet

                    // otherwise do building stuff
                } else {
                    app.display.selectionInterface(app.temp.selectedBuilding.type, 'unitSelectionIndex');
                }

                // remove the terrain info display
                app.undo.display('hud');
                app.temp.selectActive = true;
                return true;
            }
        }
        return false;
    };

    // check what is occupying a specific point on the game map based on type
    var gridPoint = function (type, x, y) {
        x = x === null || x === undefined || x === false ? app.settings.cursor.x : x;
        y = y === null || y === undefined || y === false ? app.settings.cursor.y : y;

        var arr = app.map[type];
        for (var p = 0; p < arr.length; p += 1) {
            if (arr[p].x === x && arr[p].y === y) {
                return {
                    ind: p,
                    objectClass: type,
                    stat: true
                };
            }
        }
        return {
            objectClass: type,
            stat: false
        };
    };

    return {

        // on press of the exit key ( defined in app.settings.keyMap ) undo any active select or interface
        exit: function (exit) {
            if (app.settings.keyMap.exit in app.keys) {
                app.undo.all();
            }
            return this;
        },

        // returns info on the grid square currently hovered over
        hovered: function (type, x, y) {
            return gridPoint(type, x, y);
        },

        // allows selection and movement of objects on screen
        move: function (type) {

            // if theres no input then say so
            if (!app.temp.hovered && !type) {
                throw new Error('no type or input specified, please enter a type of map element into the input of the "interact()" method or chain the "info()" method prior to the "interact()" method');

                // if there is an object being hovered over, or hovered is undefined ( meaning input is possibly from type input rather then hud )
            } else if (app.temp.hovered || app.temp.hovered === undefined) {

                // get the type of object being hovered over
                var typ = type === undefined ? app.temp.hovered.objectClass : type;

                // get the index of the object being hovered over
                var intInd = app.temp.hovered === undefined ? undefined : app.temp.hovered.ind;

                // if the map element is selectable and the selected map element is a unit then facilitate interaction with that unit
                if (element(typ, intInd) && app.temp.selectedUnit) {
                    move('unit', app.temp.selectedUnit.ind);
                }
            }
        }
    };
}();

