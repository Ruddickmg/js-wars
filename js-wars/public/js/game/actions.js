/* ----------------------------------------------------------------------------------------------------------*\
    
    handles actions that a unit can take
    
\* ----------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.calculate = require('../game/calculate.js');
app.select = require('../game/select.js');
app.settings = require('../settings/game.js');
app.undo = require('../tools/undo.js');
app.animate = require('../game/animate.js');
app.units = require('../objects/units.js');
app.actions = require('../game/actions.js');
//app.display = require('../tools/display.js');
//app.game = require('../menu/game.js');

module.exports = function () {
    
    var prevIndex, len, prevLen, damage, undo, key, active = false, attackableArray;
    var options = {};
    var index = 0;
    var round = Math.round;

    // detect any attackable units within selected units attack range
    var attackable = function (selected) {

        var attackable = [];

        // get selected units position
        var x = selected.x;
        var y = selected.y;

        // find its neighbors 
        var neighbors = [{
            x: x + 1,
            y: y
        }, {
            x: x,
            y: y + 1
        }, {
            x: x - 1,
            y: y
        }, {
            x: x,
            y: y - 1
        }]; // to be replaced with a range algorithm

        // get list of units
        var units = app.map.unit;
        var neighbor, unit;

        // get unit types that the selected unit can attack
        if(selected.canAttack){

            var canAttack = selected.canAttack;

            // get the id of the current player
            var player = app.game.currentPlayer().id;

            if (!selected.attacked){
                for (var n = 0; n < neighbors.length; n += 1) {
                    // each neighbor
                    neighbor = neighbors[n];

                    for (var u = 0; u < units.length; u += 1) {
                        // each unit
                        unit = units[u];
                        unit.ind = u; // set for easy retrieval and editing;

                        // if the selected unit can attack its neighbor and the neighbor is not the current players unit
                        if (canAttack.hasValue(unit.transportaion) && neighbor.x === unit.x && neighbor.y === unit.y && unit.player !== player) {

                            // calcualte damage percentage for each attackable unit
                            unit.damage = app.calculate.damage(unit);

                            // add the neighbor to an array of neighbors the selected unit can attack
                            attackable.push(unit);
                        }
                    }
                }
                // if their are any units in the attackable array, then return it, otherwise return false
                if (attackable[0]){
                    return attackable;
                }
            }
        }
        return false;
    };

    // check if the building the selected unit has landed on can be captured or not
    var capturable = function (selected) {

        // if the selected unit can capture buildings then continue
        if (selected.capture && !selected.captured) {

            // get a list of buildings on the map
            buildings = app.map.building;

            for (var b = 0; b < buildings.length; b += 1) {

                building = buildings[b]; // each building

                // if the building does not already belong to the selected unit, and the unit is on the building then return it
                if (building.player !== selected.player && building.x === selected.x && building.y === selected.y) {
                    building.ind = b;
                    return building;
                }
            }
        }
        // return false if the building cannot be captured by the selected unit
        return false;
    };

    var destroy = function (ind) {app.map.unit.splice(ind, 1);};

    var unsetPersistingVars = function () {
        delete len; 
        delete prevLen;
        delete damage;
        options = {};
        index = 0;
    };

    var attack = function (attacked, damage, attacker, retaliate) {
        if(attacked.health - damage > 0){
            app.map.unit[attacked.ind].health = attacked.health - damage;
            var selected = attacker ? attacker : app.select.unit();
            app.map.unit[selected.ind].attacked = true; // show that unit has attacked this turn
            var retaliation = retaliate ? retaliate : round(app.calculate.damage(selected, app.map.unit[attacked.ind])/10);
            if(app.usersTurn) {
                socket.emit('attack', { 
                    attacker:selected,
                    unit:attacked,
                    damage:damage,
                    retaliation:retaliation
                });
            }
            if( selected.health - retaliation > 0 ){
                app.map.unit[selected.ind].health = selected.health - retaliation;
            }else{
                app.game.destroyUnit(selected.player);
                destroy(selected.ind);
            }
        }else{
            app.game.destroyUnit(attacked.player);
            destroy(attacked.ind);
        }
        if(app.usersTurn){
            unsetPersistingVars();
            delete app.settings.target;
            app.undo.all();
        }
        window.requestAnimationFrame(app.animate('unit'));
    };

    // display a target for selecting which opposing unit to attack
    var choseAttack = function (attackable) {

        attackableArray = attackableArray ? attackableArray : attackable; 

        if(!key) key = app.game.settings.keyMap;
        if(!undo) undo = app.undo.keyPress;
        if(!len || len !== attackableArray.length){
            len = attackableArray.length;
            prevLen = len;
        }

        // move to the next attackableArray unit
        if (app.key.pressed('up') || app.key.pressed('right')) { // Player holding up
            undo(key.up);
            undo(key.right);
            index += 1;
        }

        // move to the previous attackableArray unit
        if (app.key.pressed('down') || app.key.pressed('left')) { // Player holding down
            undo(key.down);
            undo(key.left);
            index -= 1;
        }

        if( index !== app.prev.actionIndex ){
            // cycle through target selectino
            if (index < 0 && index) index = len - 1;
            if (index === len) index = 0
            damage = attackableArray[index].damage;
            app.display.damage(damage);
            app.prev.actionIndex = index;

            // create target for rendering at specified coordinates
            app.settings.target = {
                x: attackableArray[index].x,
                y: attackableArray[index].y
            };
        }

        // if the target has been selected return it
        if (app.key.pressed('enter')) {
            undo(key.select);
            app.def.cursorMoved = true;
            window.requestAnimationFrame(app.animate('cursor')); // animate changes
            return {unit:attackableArray[index], damage:round(damage/10)};
        }
        window.requestAnimationFrame(app.animate('cursor')); // animate changes
    };

    return {

        unset:unsetPersistingVars,
        active: function () {return active},
        activate: function () {active = true},
        deactivate: function () {active = false},
        clear: function () {attackableArray = false},

        // check to see if any actions can be perfomed
        check: function (combine) {

            // use selected unit
            var selected = app.select.unit();

            // find any attackable opponents 
            var canAttack = attackable(selected);

            // find any capturable buildings
            var canCapture = capturable(selected);

            // add buildings or opponenets to an object containing possible actions
            if (canAttack) options.attack = canAttack;
            if (canCapture) options.capture = canCapture;
            if(combine){
                if (combine.combine) options.combine = combine;
                if (combine.load) options.load = combine;
            }
            if (canCapture || canAttack || combine) options.wait = true;

            // if there are any actions that can be taken then return them
            if (options.wait){
                return options;
            }
            return false;
        },

        // capture a building
        capture: function (capturing) {
            if(options.capture){
                var building = capturing ? capturing.building : options.capture;
                var unit = capturing ? capturing.unit : app.select.unit();
                if (app.usersTurn) socket.emit('capture', {building:building, unit:unit});
                var capture = app.game.currentPlayer.co.capture ? app.game.currentPlayer.co.capture(unit.health) : unit.health;

                // if the building has not between catpured all the way
                if (building.capture - capture > 0) {

                    // subtract the amount of capture dealt by the unit from the buildings capture level
                    app.map.building[building.ind].capture -= capture;
                    app.map.unit[unit.ind].captured = true;
                    app.undo.all();
                    return true;

                // if the building is done being captured and is not a headquarters
                } else if (building.type !== 'hq') {
                    // assign the building to the capturing player
                    app.map.building[building.ind].player = unit.player;
                    app.map.building[building.ind].capture = app.settings.capture;
                    app.map.unit[unit.ind].captured = true;
                    app.undo.all();
                    return true;
                }

                // otherwise assign all the buildings belonging to the owner of the captured hq to the capturing player
                var buildings = app.map.building;
                var defeated = buildings[building.ind].player;
                for(var b = 0; b < buildings.length; b += 1){
                    if( buildings[b].player === defeated ){
                        app.map.building[b].player = unit.player;
                    }
                }

                app.game.playerDefeated(defeated);
                app.map.unit[unit.ind].captured = true;
                app.undo.all();
                alert('player '+defeated+' defeated');
                if(app.game.players().length === 1){
                    alert('player '+app.game.players()[0].id+' wins!');
                }
            }
        },

        load: function () {
            if(options.load){
                var load = options.load;
                var selected = app.select.unit();
                app.map.unit[load.ind].loaded = load.loaded.concat(app.map.unit.splice(selected.ind,1));
                app.undo.all();
                window.requestAnimationFrame(app.animate('unit'));
            }
            return false;
        },

        combine: function (combine) {
            if (options.combine){    
                var combine = combine ? combine.combine : options.combine;
                var selected = combine ? combine.unit : app.select.unit();
                var props = app.settings.combinableProperties;

                // emit units to be combined to other players games for syncronization
                if (app.usersTurn) socket.emit('joinUnits', {combine:combine, unit:selected});

                // combine properties of the selected unit with the target unit
                for (var u = 0; u < props.length; u += 1){
                    prop = props[u];
                    max = app.units[selected.type].properties[prop];
                    if( combine[prop] + selected[prop] < max ){
                        app.map.unit[combine.ind][prop] += selected[prop];
                    }else{
                        app.map.unit[combine.ind][prop] = max;
                    }
                }

                // remove selected unit  
                app.map.unit.splice(selected.ind, 1);
                app.undo.all();
                window.requestAnimationFrame(app.animate('unit'));
            }
            return false;
        },

        wait: function () {
            unsetPersistingVars();
            app.undo.all();
            app.undo.display('actionHud');
        },

        attack: function (battle) {
            if( options.attack || battle ){
                if(!app.settings.hideCursor && app.actions.active()) app.settings.hideCursor = true;
                var attacked = battle ? battle : choseAttack(options.attack);
                if ( attacked ) {
                    delete options;
                    return attack(attacked.unit, attacked.damage, attacked.attacker, attacked.retaliation);
                }
                if (app.actions.active()) window.requestAnimationFrame(app.actions.attack);
            }
        }
    };
}();