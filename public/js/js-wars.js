/* ---------------------------------------------------------------------------------------------------------*\
    
    socket connection handlers
    
\* ---------------------------------------------------------------------------------------------------------*/

var socket = io.connect("http://jswars-jswars.rhcloud.com:8000");

// listen to other players cursor movement 
socket.on('cursorMove', function(data) {
    app.keys.push(data);
});

socket.on('moveUnit', function(move){
    app.map[move.type][move.index].x = move.x;
    app.map[move.type][move.index].y = move.y;
    window.requestAnimationFrame(app.animateUnit);
});

socket.on('attack', function(attack){
    app.actions.attack(attack);
});

socket.on('joinUnits', function(combine){
    app.actions.combine(combine);
});

socket.on('capture', function(capture){
    app.actions.capture(capture);
});

// end turn
socket.on('endTurn', function(end){
    app.options.end()
});

// Add a disconnect listener
socket.on('disconnect', function() {
  console.log('The client has disconnected!');
});

/* ---------------------------------------------------------------------------------------------------------*\
    
    add useful methods to prototypes
    
\* ---------------------------------------------------------------------------------------------------------*/

// add first letter capitalization funcitonality
String.prototype.uc_first = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// simple check if value is in a flat array
Array.prototype.hasValue = function (value) {
    return this.indexOf(value) > -1;
};

// remove one arrays values from another
Array.prototype.offsetArray = function (offsetArray) {
    for (var z = 0; z < offsetArray.length; z += 1) {
        for (var n = 0; n < this.length; n += 1) {
            if (this[n].x === offsetArray[z].x && this[n].y === offsetArray[z].y) {
                this.splice(n, 1);
            }
        }
    }
    return this;
};

/* ---------------------------------------------------------------------------------------------------------*\
	
	app is a container and holds low level variables for all elements of the application 
\* ---------------------------------------------------------------------------------------------------------*/

app = {

    turn: function (){
        // make note of whose turn it is
        if( app.game.currentPlayer.fbid === app.user.fbid ){
            app.usersTurn = true;
        }else{
            app.usersTurn = false;
        }
    },

    // target element to insert before
    domInsertLocation: document.getElementById('before'),

    game: {
        started: false,
        currentPlayer:null,
        players: [], // array of players
        defeated: [], // array of defeated players
    },

    // holds temporary shared variables, usually info on game state changes that need to be accessed globally
    temp: {
    	selectionIndex: 1,
        selectActive: false,
        cursorMoved: true,
        path: []
    },

    users: [{
        co: 'sami',
        name: 'grant'
    }, {
        co: 'andy',
        name: 'steve'
    }],
    cache: {},
    keys: [], // holds array of key pressed events

    // create a new player object
    player: function (co, name, id) {

        // assign head quarters to player
        var getHQ = function () {

            // list off all buildings on map
            var buildings = app.map.building;

            for (var b = 0; b < buildings.length; b += 1) {

                // if the building shares an id with the player and is an hq then it is theirs
                if (buildings[b].type === 'hq' && buildings[b].player === id) {

                    // return the building
                    return buildings[b];
                }
            }
        };

        // get look st the co list and add the proper co
        var getCO = function (player) {
            return app.co[co](player);
        };

        // return the player object
        return {
            // player id
            id: id,
            // player name
            name: name,
            hq: getHQ(),
            // holds amount of special built up
            special: 0,
            unitsLost: 0,
            gold: 0,
            co: getCO(this) // chosen co
        };
    },

    // set custom animation repo if desired
    setAnimationRepo: function (repo) {
        this.animationRepo = repo;
        return this;
    }
};

/* ---------------------------------------------------------------------------------------------------------*\
	
	event listeners
	
\* ---------------------------------------------------------------------------------------------------------*/

window.addEventListener("keydown", function (e) {
    if( !app.game.started || app.usersTurn || e.keyCode === app.settings.keys.exit || app.temp.optionsActive ){
        app.keys[e.keyCode] = true;
    }
}, false);

window.addEventListener("keyup", function (e) {
    app.keys[e.keyCode] = false;
    app.keys.splice(e.keyCode, 1);
}, false);

/* ---------------------------------------------------------------------------------------------------------*\
	
	app.start sets up the game with the players and other info necessary for the new game
\* ---------------------------------------------------------------------------------------------------------*/

// initiate game by getting all the players, creating objects for them and assigning player one for first turn
app.start = function (players) {
    for (var p = 0; p < players.length; p += 1) {

        // add each player to the players array
        app.game.players.push(
            app.player(
                players[p].fbid,
                players[p].co, 
                players[p].screenName, 
                p + 1
            )
        );
    }

    // assign the first player as the current player
    app.game.currentPlayer = app.game.players[0];

    // check whose turn it is
    app.turn();

    // set inital gold amount
    app.game.currentPlayer.gold = app.calculate.income(app.game.currentPlayer);

    // begin game animations
    app.animateBackground();
    app.animateTerrain();
    app.animateBuildings();
    app.animateUnit();
    app.animateCursor();

    // if the current player has been assigned return true
    if (app.game.currentPlayer){
        app.game.started = true;
        return true;
    } 
    return false;
};

/* ---------------------------------------------------------------------------------------------------------*\
	
	app.init creates a new canvas instance, taking the name of the target canvas id and optionally the context
	as a second perameter, it defaults to a 2d context. init also provides methods for rendering, setting 
	animations and returning the screen dimensions
\* ---------------------------------------------------------------------------------------------------------*/

app.init = function (element, context) {

    var canvas = document.getElementById(element);

    // check if browser supports canvas
    if (canvas.getContext) {

        // if the context is not set, default to 2d
        app.ctx = context === undefined || context === null ? '2d' : context;

        // get the canvas context and put canvas in screen
        var animate = canvas.getContext(app.ctx);

        // get width and height
        var sty = window.getComputedStyle(canvas);
        var padding = parseFloat(sty.paddingLeft) + parseFloat(sty.paddingRight);
        var screenWidth = canvas.clientWidth - padding;
        var screenHeight = canvas.clientHeight - padding;
        var screenClear = function () {
            //animate.clearRect( element.positionX, element.positionY, element.width, element.height );
            animate.clearRect(0, 0, screenWidth, screenHeight);
        };

        return {

            // set the context for the animation, defaults to 2d
            setContext: function (context) {
                this.context = context;
                return this;
            },

            // insert animation into canvas
            setAnimations: function (animations) {
                this.animations = animations;
                return this;
            },

            // draw to canvas
            render: function (loop, gridSquareSize) { // pass a function to loop if you want it to loop, otherwise it will render only once, or on demand
                if (!this.animations) { // throw error if there are no animations
                    throw new Error('No animations were specified');
                }
                screenClear();
                var drawings = app.draw(animate, {
                    width: screenWidth,
                    height: screenHeight
                }, gridSquareSize);
                this.animations(drawings);
                if (loop) window.requestAnimationFrame(loop);
            },

            // return the dimensions of the canvas screen
            dimensions: function () {
                return {
                    width: screenWidth,
                    height: screenHeight
                };
            }
        };
    } else {
        // if canvas not supported then throw an error
        throw new Error("browser does not support canvas element. canvas support required for animations");
    }
};

/* ---------------------------------------------------------------------------------------------------------*\
	
	app.build handles the creation of new units, buildings or terrain on the map
\* ---------------------------------------------------------------------------------------------------------*/

app.build = function () {

    // create new unit if/after one is selected
    var createUnit = function (building, unitType, player) {

        var player = app.game.currentPlayer;

        // creaate a new unit object with input
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
            var building = app.temp.selectedBuilding;
            if (building) {

                // display the unit select menu
                var unit = app.display.select('unitSelectionIndex', 'selectUnitScreen', app.effect.highlightListItem, 7);

                // if a unit has been selected then create it
                if (unit) {

                    // create and add the new unit to the map
                    app.map.unit.push(createUnit(building, unit, app.game.currentPlayer.id));
                    app.undo.all(); // removes the selection screen and variables created during its existance
                    app.temp.cursorMoved = true; // refreshes the hud system to detect new unit on map;
                    window.requestAnimationFrame(app.animateUnit); // animate the changes
                }
            }
            return this;
        }
    };
}();

/* ---------------------------------------------------------------------------------------------------------*\
	
	app.undo handles the cleanup and disposal of elements that are no longer needed or need to be removed
\* ---------------------------------------------------------------------------------------------------------*/

app.undo = function () {

    // show undoes a hide of an element
    var show = function (hiddenElement) {

        // get hidden element
        var hidden = document.getElementById(hiddenElement);

        // show element
        if (hidden) hidden.style.display = '';
    };

    return {

        // remove a pressed key from the keys array
        keyPress: function (key) {
            if (app.keys.splice(key, 1)) return true;
            return false;
        },

        // undo the selection of map elements
        selectElement: function () {
            if (app.temp.range) app.temp.range.splice(0, app.temp.range.length);
            app.temp.selectActive = false;
            if (app.temp.selectedBuilding) delete app.temp.selectedBuilding;
        },

        hudHilight:function(){
            app.temp.selectionIndex = 1;
            if(app.temp.prevIndex) delete app.temp.prevIndex;
            if (app.temp.optionsActive) {
                show('coStatusHud');
                delete app.temp.optionsActive;
            }
        },

        selectUnit:function(){
            if (app.temp.selectedUnit) {
                delete app.temp.selectedUnit;
                window.requestAnimationFrame(app.animateUnit);
            }
        },

        actionsSelect: function (){
            if(app.temp.actionsActive){
                app.actions.unset();
                delete app.settings.target;
                delete app.temp.prevActionIndex;
                delete app.temp.attackableArray;
                this.display('actionHud');
                this.display('damageDisplay');
                app.temp.cursorMoved = true;
                app.settings.hideCursor = false;
                app.temp.actionsActive = false;
                window.requestAnimationFrame(app.animateCursor);
            }
        },

        effect: function (effect) {
            if (app.effect[effect]) {
                app.effect[effect].splice(0, app.effect[effect].length);
                window.requestAnimationFrame(app.animateEffects);
            }
            return this;
        },

        display: function (element) {
            var remove = document.getElementById(element);
            if (remove) remove.parentNode.removeChild(remove);
            return this;
        },

        buildUnitScreen: function () {
            var removeArray = ['buildUnitScreen', 'unitInfoScreen', 'optionsMenu'];
            for (r = 0; r < removeArray.length; r += 1) {
                var remove = document.getElementById(removeArray[r]);
                if (remove) remove.parentNode.removeChild(remove);
            }
            return this;
        },

        all: function () {
            this.selectUnit();
            this.selectElement();
            this.actionsSelect();
            this.hudHilight();
            this.keyPress(app.game.settings.keyMap.select);
            this.buildUnitScreen();
            this.effect('highlight').effect('path');
            app.temp.cursorMoved = true; // refreshes the hud system to detect new unit on map
            return this;
        }
    };
}();

/* ----------------------------------------------------------------------------------------------------------*\
	
	app.options handles the in game options selection, end turn, save etc.
\* ----------------------------------------------------------------------------------------------------------*/

app.options = function () {

    // move to next player on turn change
    var nextPlayer = function () {

        // if the player is the last in the array return the first player
        if (app.game.currentPlayer.id === app.game.players.length) return app.game.players[0];

        // return the next player
        return app.game.players[app.game.currentPlayer.id];
    };

    var endTurn = function () {
        // get the next player
        var player = nextPlayer();

        // end power if it is active
        player.co.endPower();

        // assign the next player as the current player
        app.game.currentPlayer = player;

        // make note of whose turn it is
        app.turn();

        // move the screen to the next players headquarters
        app.move.screenToHQ(player);

        // refresh the movement points of the players units
        app.move.refresh(player);

        // add this turns income
        app.game.currentPlayer.gold += app.calculate.income(player);
    };

    return {
        unit: function () {
            alert('unit!');
        },

        intel: function () {
            alert('intel');
        },

        options: function () {
            alert('options');
        },

        save: function () {
            alert('save');
        },

        // end turn
        end: function () {
            endTurn();
            if(app.usersTurn) socket.emit('endTurn', 'end');
            return this;
        }
    };
}();

/* ----------------------------------------------------------------------------------------------------------*\
	
	app.actions handles actions that a unit can take
\* ----------------------------------------------------------------------------------------------------------*/

app.actions = function () {
    
    var prevIndex, len, prevLen, damage, undo, key;
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
            var player = app.game.currentPlayer.id;

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

    var destroy = function (ind) {
        app.map.unit.splice(ind, 1);
    };

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
            var selected = attacker ? attacker : app.temp.selectedUnit;
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
                app.game.players[selected.player - 1].unitsLost += 1;
                destroy(selected.ind);
            }
        }else{
            app.game.players[attacked.player - 1].unitsLost += 1;
            destroy(attacked.ind);
        }
        if(app.usersTurn){
            unsetPersistingVars();
            delete app.settings.target;
            app.undo.all();
        }
        window.requestAnimationFrame(app.animateUnit);
    };

    // display a target for selecting which opposing unit to attack
    var choseAttack = function (attackable) {

        if(!app.temp.attackableArray) app.temp.attackableArray = attackable;
        var attackableArray = app.temp.attackableArray; 

        if(!key) key = app.game.settings.keyMap;
        if(!undo) undo = app.undo.keyPress;
        if(!len || len !== attackableArray.length){
            len = attackableArray.length;
            prevLen = len;
        }

        // move to the next attackableArray unit
        if (key.up in app.keys || key.right in app.keys) { // Player holding up
            undo(key.up);
            undo(key.right);
            index += 1;
        }

        // move to the previous attackableArray unit
        if (key.down in app.keys || key.left in app.keys) { // Player holding down
            undo(key.down);
            undo(key.left);
            index -= 1;
        }

        if( index !== app.temp.prevActionIndex ){
            // cycle through target selectino
            if (index < 0 && index) index = len - 1;
            if (index === len) index = 0
            damage = attackableArray[index].damage;
            app.display.damage(damage);
            app.temp.prevActionIndex = index;

            // create target for rendering at specified coordinates
            app.settings.target = {
                x: attackableArray[index].x,
                y: attackableArray[index].y
            };
        }

        // if the target has been selected return it
        if (key.select in app.keys) {
            undo(key.select);
            app.temp.cursorMoved = true;
            window.requestAnimationFrame(app.animateCursor); // animate changes
            return {unit:attackableArray[index], damage:round(damage/10)};
        }
        window.requestAnimationFrame(app.animateCursor); // animate changes
    };

    return {

        // check to see if any actions can be perfomed
        check: function (combine) {

            // use selected unit
            var selected = app.temp.selectedUnit;

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
                var unit = capturing ? capturing.unit : app.temp.selectedUnit;
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

                app.game.defeated.concat(app.game.players.splice(defeated - 1, 1));
                app.map.unit[unit.ind].captured = true;
                app.undo.all();
                alert('player '+defeated+' defeated');
                if(app.game.players.length === 1){
                    alert('player '+app.game.players[0].id+' wins!');
                }
            }
        },

        load: function () {
            if(options.load){
                var load = options.load;
                var selected = app.temp.selectedUnit;
                app.map.unit[load.ind].loaded = load.loaded.concat(app.map.unit.splice(selected.ind,1));
                app.undo.all();
                window.requestAnimationFrame(app.animateUnit);
            }
            return false;
        },

        combine: function (combine) {
            if (options.combine){    
                var combine = combine ? combine.combine : options.combine;
                var selected = combine ? combine.unit : app.temp.selectedUnit;
                var props = app.settings.combinableProperties;

                // emit units to be combined to other players games for syncronization
                if (app.usersTurn) socket.emit('joinUnits', {combine:combine, unit:selected});

                // combine properties of the selected unit with the target unit
                for (u = 0; u < props.length; u += 1){
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
                window.requestAnimationFrame(app.animateUnit);
            }
            return false;
        },

        unset:function (){
            unsetPersistingVars();
        },

        wait: function () {
            unsetPersistingVars();
            app.undo.all();
            app.undo.display('actionHud');
        },

        attack: function (battle) {
            if( options.attack || battle ){
                if(!app.settings.hideCursor && app.temp.actionsActive) app.settings.hideCursor = true;
                var attacked = battle ? battle : choseAttack(options.attack);
                if ( attacked ) {
                    delete options;
                    return attack(attacked.unit, attacked.damage, attacked.attacker, attacked.retaliation);
                }
                if (app.temp.actionsActive) window.requestAnimationFrame(app.actions.attack);
            }
        }
    };
}();

/* ----------------------------------------------------------------------------------------------------------*\
	
	app.calculate handles the more intense calculations like pathfinding and the definition of movement range
\* ----------------------------------------------------------------------------------------------------------*/

app.calculate = function () {

    var abs = Math.abs;
    var floor = Math.floor;
    var random = Math.random;
    var round = Math.round;

    var findTerrain = function (unit){
        terrain = app.map.terrain;
        for ( t = 0; t < terrain.length; t += 1){
            if(terrain[t].x === unit.x && terrain[t].y === unit.y){
                return terrain[t];
            }
        }
        return false;
    };

    var rand = function(){return floor((random() * 9) + 1)};

    var calcDamage = function (attacked, attacker) {
        var r = rand();
        var baseDamage = attacker.baseDamage[attacked.type];
        var coAttack = app.game.currentPlayer.co.attack(attacker);
        var coDefense = app.game.players[attacked.player - 1].co.defense(attacked);
        var terrainDefense = findTerrain(attacked).def;
        terrainDefense = !terrainDefense ? 1 : terrainDefense;
        var defenderHP = attacked.health;
        var attackerHP = attacker.health;
        return round((abs(baseDamage * coAttack/100 + r) * (attackerHP/10) * abs((200-(coDefense + terrainDefense * defenderHP))/100)));
    };

    var attackRange = function () {

    };

    // create a range of movement based on the unit allowed square movement
    var movementCost = function (origin, x, y) {

        // calculate the difference between the current cursor location and the origin, add the operation on the axis being moved on
        return abs((origin.x + x) - origin.x) + abs((origin.y + y) - origin.y);
    };

    // calculate true offset location considering movement and position
    var offset = function (off, orig) {
        var ret = [];
        var inRange = function (obj) {
            if (abs(obj.x - orig.x) + abs(obj.y - orig.y) <= orig.movement && obj.x >= 0 && obj.y >= 0) {
                return true;
            }
            return false;
        };

        // if the selected unit can move on the terrain ( obsticle ) then calculate the offset
        if (orig.movable.hasValue(off.obsticle)) {
            var opX = off.x < orig.x ? -1 : 1;
            var opY = off.y < orig.y ? -1 : 1;
            var x = (orig.x + (orig.movement * opX) - (off.cost * opX) + opX);
            var y = (orig.y + (orig.movement * opY) - (off.cost * opY) + opY);
            var objX = {
                x: x,
                y: off.y
            };
            var objY = {
                x: off.x,
                y: y
            };
            if (inRange(objX)) ret.push(objX);
            if (inRange(objY)) ret.push(objY);
        } else {
            // otherwise add the specific location of the obsticle to the offset array 
            ret.push({
                x: off.x,
                y: off.y
            }); // check this if issues with unit offset, could be faulty method of dealing with this problem
        }
        return ret;
    };

    // detect if a square is an obsticle
    var findObsticles = function (x, y) {

        // loop over obsticle types
        for (var ot = 0; ot < app.settings.obsticleTypes.length; ot += 1) {

            // check if the currently examined grid square is one of the obsticle types
            var obs = app.select.hovered(app.settings.obsticleTypes[ot], x, y);

            // if it is and has a cost etc.. then return it
            if (obs.stat === true) {
                return app.map[obs.objectClass][obs.ind];
            }
        }
    };

    var pathfinder = function (orig, dest, grid, mode) {
        var mov = orig.movement;
        var ret = [];
        var open = [grid[0]];
        var closed = [];
        var index = 0;
        var neighbor, opi, x, y, cur;

        var cleanGrid = function (g) {
            var del = ['ind', 'p', 'f', 'g', 'visited', 'close'];
            for (var a = 1; a < g.length; a += 1) {
                for (var b = 0; b < del.length; b += 1) {
                    delete g[a][del[b]];
                }
            }
        };

        var getNeighbors = function (c) {
            var x = c.x;
            var y = c.y;
            var g, gpx, gpy;
            var neighbors = [];
            for (var l = 0; l < grid.length; l += 1) {
                g = grid[l];
                gpx = abs(g.x - x);
                gpy = abs(g.y - y);
                if (gpx < 2 && gpy < 2 && gpx !== gpy) {
                    neighbors.push(g);
                }
            }
            if (mode === undefined) {}
            return neighbors;
        };

        var inOpen = function (id) {
            for (var o = 0; o < open.length; o += 1) {
                if (open[o].id === id) return o;
            }
            return false;
        };

        var dist = function (c) {
            var dx1 = c.x - dest.x;
            var dy1 = c.y - dest.y;
            var dx2 = orig.x - dest.x;
            var dy2 = orig.y - dest.y;
            var cross = abs(dx1 * dy2 - dx2 * dy1);
            return ((abs(c.x - dest.x) + abs(c.y - dest.y)) + (cross * 0.001));
        };
        
        while (open[0]) {
            
            // set the current starting point to the point closest to the destination
            for (var f = 0; f < length; f += 1) {
                if (open[f].f < open[index]) {
                    index = f;
                }
            }

            cur = open[index];
            closed = closed.concat(open.splice(index, 1));
            grid[cur.ind].close = true;

            // if the destination has been reached, return the array of values
            if (dest.x === cur.x && dest.y === cur.y) {
                ret = [cur];
                while (cur.p) {
                    for (var c = 0; c < closed.length; c += 1) {
                        if (cur.p === closed[c].id) {
                            cur = closed[c];
                            ret.push(cur);
                        }
                    }
                }
                if (ret.length <= mov + 1) {
                    cleanGrid(grid);
                    if (mode === undefined) {
                        return ret;
                    }
                    return undefined;
                }
            }

            n = getNeighbors(cur);

            for (var i = 0; i < n.length; i += 1) {

                neighbor = n[i]; // current neighboring square
                cost = cur.g + neighbor.cost;

                if (neighbor.close) continue; // if the neghboring square has been inspected before then ignore it
                if (cost > mov) continue; // if the cost of moving to the neighboring square is more then allowed then ignore it

                // check to see if the currently inspected square is in the open array, return the index if it is
                opi = inOpen(neighbor.id);

                // if the current square is in the open array and a better position then update it
                if (opi && neighbor.g > cur.g) {
                    open[opi].g = cost; // distance from start to neighboring square
                    open[opi].f = cost + neighbor.h; // distance from start to neighboring square added to the distance from neighboring square to destination
                    open[opi].p = cur.id;

                    // if the neighboring square hasent been encountered add it to the open list for comparison
                } else if (neighbor.ind === undefined) {
                    n[i].g = cost; // distance from start to neighboring square
                    n[i].h = cost + dist(neighbor, dest); // distance from neighboring to destination
                    n[i].ind = i; // save the index to help with future identification of this neighboring square
                    n[i].p = cur.id; // add the current square as this neighboring squares parent
                    open.push(n[i]); // add the neighboring square to the open list for further comparison
                }
            }
        }
        cleanGrid(grid); // clean all assigned variables from grid so they wont interfier with future path finding in a loop
        if (mode !== undefined) { // if the goal is to tell if a path can be reached or not, and it couldnt be reached

            // return the destination as an unreachable location
            return dest;
        }
    };

    // calculate the movement costs of terrain land marks etc..
    var evaluateOffset = function (origin, dest, grid) {

        var range = [];

        for (var i = 0; i < dest.length; i += 1) {

            var g = grid.slice(0);

            var path = pathfinder(origin, dest[i], g, 'subtract');

            if (path) range.push(path);
        }

        return range;
    };

    // check which side of the screen the cursor is on
    var checkSide = function (axis) {
    	var d = app.cursorCanvas.dimensions();
        var m = axis === 'x' ? d.width / 64 : d.height / 64; // screen width
        var x = app.settings.cursor.scroll[axis]; // map position relative to scroll
        if (app.settings.cursor.x > (m / 2) + x) return true;
        return false;
    };

    // calculate income
    var calcIncome = function (player) {

        // get the amount of income per building for current game
        var income = app.game.settings.income;
        var owner, count = 0;
        var buildings = app.map.building; // buildings list

        for (var b = 0; b < buildings.length; b += 1) {

            // count the number of buildings that belong to the current player
            if (buildings[b].player === player) {
                count += 1;
            }
        }
        // return the income ( amount of buildings multiplied by income per building set for game )
        return count * income;
    };

    return {

        damage: function (attacked, attacker) {
            attacker = !attacker ? app.temp.selectedUnit : attacker;
            return calcDamage( attacked, attacker );
        },

        // finds path
        path: function (orig, dest, grid, mode) {
            return pathfinder(orig, dest, grid, mode);
        },

        // returns cursor location ( left or right side of screen )
        side: function (axis) {
            if (checkSide(axis)) return 'right';
            return 'left';
        },

        // calculate income
        income: function (player) {
            return calcIncome(player.id);
        },

        // find range of allowed movement over variable terrain
        range: function () {

            if (app.temp.selectedUnit) {

                var id = 0; // id for grid point identificaion;
                var range = [];
                var offs = [];
                var selected = app.temp.selectedUnit;

                // amount of allotted movement for unit
                var len = selected.movement;

                // loop through x and y axis range of movement
                for (var ex = -len; ex <= len; ex += 1) {
                    for (var wy = -len; wy <= len; wy += 1) {

                        // if movement cost is less then or eual to the allotted movement then add it to the range array
                        if (movementCost(selected, ex, wy) <= selected.movement) {

                            // incremient id
                            id += 1;

                            // add origin to range of movement values
                            var x = selected.x + ex;
                            var y = selected.y + wy;

                            // locate obsticles									
                            var obsticle = findObsticles(x, y);

                            if (obsticle !== undefined) {

                                // get the number of offset movement from the obsticle based on unit type and obsticle type
                                var obsticleOffset = app.settings.obsticleStats[obsticle.obsticle][app.temp.selectedUnit.type];

                                if (obsticleOffset !== undefined) {
                                    if (selected.x === x && selected.y === y) {
                                        range.unshift({
                                            x: x,
                                            y: y,
                                            cost: 0,
                                            g: 0,
                                            f: 0,
                                            ind: 0,
                                            id: id,
                                            type: 'highlight'
                                        });
                                    } else {
                                        // make an array of obsticleOffset values, starting point, plus movement, and the amount of obsticleOffset beyond that movement
                                        obsticle.cost = obsticleOffset;
                                        obsticle.id = id;
                                        range.push(obsticle);
                                        offs = offs.concat(offset(obsticle, selected));
                                    }
                                }
                            } else {
                                range.push({
                                    x: x,
                                    y: y,
                                    cost: 1,
                                    id: id,
                                    type: 'highlight'
                                });
                            }
                        }
                    }
                }
                return range.offsetArray(evaluateOffset(selected, offs, range));
            }
            return false;
        }
    };
}();

/* ------------------------------------------------------------------------------------------------------*\
	
	app.select handles the selection and movement of map elements
\* ------------------------------------------------------------------------------------------------------*/

app.select = function () {

    var abs = Math.abs;

    // moves a unit
    var move = function (type, index) {

        // if there is a selected unit and select is active and the select key has been pressed
        if (app.temp.selectedUnit && app.temp.selectActive && app.game.settings.keyMap.select in app.keys) {

            var cursor = app.settings.cursor;

            app.undo.keyPress(app.game.settings.keyMap.select);

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
                app.map[type][index].x = cursor.x;
                app.map[type][index].y = cursor.y;
                socket.emit('moveUnit', {index:index, type:type, x:cursor.x, y:cursor.y});

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
        if (app.temp.selectActive === false && type !== 'terrain' && app.game.settings.keyMap.select in app.keys) {
            app.undo.keyPress(app.game.settings.keyMap.select);
            attempt = app.map[type][index];

            // set properties for selected object
            if (!app.settings.notSelectable.hasValue(attempt.type) && attempt.player === app.game.currentPlayer.id) {
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

        // on press of the exit key ( defined in app.game.settings.keyMap ) undo any active select or interface
        exit: function (exit) {
            if (app.game.settings.keyMap.exit in app.keys) {
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

/* ------------------------------------------------------------------------------------------------------*\
	
	app.hud handles all the display screens and the users interaction with them
\* ------------------------------------------------------------------------------------------------------*/

app.display = function () {

    var sideX, sideY, selectionIndex, selectedElement, hide, len, prevX;
    var optionsActive, unitSelectionActive = false;

    // format is where the login is coming from, allowing different actions for different login sources
    var loginToSetup = function (user, format){

        if(user && user.id) {

            app.user = user;

            socket.emit('addUser', user);

            // remove login screen
            var loginScreen = document.getElementById('login');
                loginScreen.parentNode.removeChild(loginScreen);

            // display the game selection menu
            selectMode();

            return true;
        }
    };

    var selectMode = function () { 

        // height of each mode element
        var height = app.settings.selectedModeHeight;

        // menu layout
        var menu = app.settings.selectModeMenu; 

        // (war room, campaign) eventually integrate ai opponents?
        var selectModeScreen = document.createElement('article');
        selectModeScreen.setAttribute('id','selectModeScreen');

        // create list of selectable modes
        var selectMenu = document.createElement('ul');
        selectMenu.setAttribute('id', 'selectModeMenu');

        // create and insert information for each mode
        for( var m = 0; m < menu.length; m += 1){
            var mi = menu[m];

            // create li item for each mode
            var item = document.createElement('li');
            item.setAttribute('modeItemIndex', m + 1);
            item.setAttribute('class','modeItem');
            item.style.height = height;

            // set displayed text for mode selection
            item.innerHTML = mi.display;

            // if there are further options for the mode
            if(mi.options){

                // create list of options
                var options = document.createElement('ul');
                var length = mi.options.length;
                options.setAttribute('id', mi.id);
                options.setAttribute('class', 'modeOptions');

                // default to not showing options (hide them when not selected)
                options.style.display = 'none';

                for(var o = 0; o < length; o += 1){

                    // create li item for each option
                    var option = document.createElement('li');
                    option.setAttribute('class', 'modeOption');
                    option.setAttribute('modeSelectionIndex', o + 1);
                    option.setAttribute('id', mi.options[o] + mi.id);

                    // create id and display name for each option
                    option.innerHTML = mi.options[o];

                    // add each option to options list
                    options.appendChild(option);
                }
                // add options to the item
                item.appendChild(options);
            }
            // add items to select menu
            selectMenu.appendChild(item);
        }
        // add select menu to select mode screen
        selectModeScreen.appendChild(selectMenu);

        // insert select mode screen into dom
        var exists = document.getElementById('selectModeScreen');
        if(exists) {
            exists.parentNode.replaceChild(selectModeScreen, exists);
        }else{
            document.body.insertBefore(selectModeScreen, app.domInsertLocation);
        }
    };

    var setup = function (name) {
        var room = {};
        var hq = [];
        var buildings = app.map.building;
        for ( var b = 0; b < buildings.length; b += 1){
            if(buildings[b].type === 'hq') hq.push(buildings[b]);
        }
        room.name = name
        room.map = app.map;
        room.max = hq.length;
        room.mapId = mapId;
        socket.emit('newRoom', room);
    };

    var login = function () {

        // create login screen
        var loginScreen = document.createElement('article');
        loginScreen.setAttribute('id', 'login');

        // create button for fb login
        var fbButton = document.createElement('fb:login-button');
        fbButton.setAttribute('scope', 'public_profile, email');
        fbButton.setAttribute('onLogin', 'app.display.checkLoginState();');
        fbButton.setAttribute('id', 'fbButton');

        // create a holder for the login status
        var fbStatus = document.createElement('div');
        fbStatus.setAttribute('id', 'status');

        loginScreen.appendChild(fbButton);
        loginScreen.appendChild(fbStatus);

        document.body.insertBefore(loginScreen, app.domInsertLocation);

        window.fbAsyncInit = function() {
            FB.init({
                appId      : '1481194978837888',
                cookie     : true,  // enable cookies to allow the server to access 
                xfbml      : true,  // parse social plugins on this page
                version    : 'v2.3' // use version 2.2
            });

            FB.getLoginStatus(function(response) {
                statusChangeCallback(response);
            });
        };

        // Load the SDK asynchronously
        (function(d, s, id) {

            var js, fjs = d.getElementsByTagName(s)[0];

            if (d.getElementById(id)) return;

            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);

        }(document, 'script', 'facebook-jssdk'));

        // move to game setup
        app.gameSetup();
    };

    // Here we run a very simple test of the Graph API after login is
    // successful.  See statusChangeCallback() for when this call is made.
    var testAPI = function () {
        FB.api('/me', function(response) {
            return loginToSetup(response, 'facebook');
        });
    };

    // allow login through fb ---- fb sdk
    // This is called with the results from from FB.getLoginStatus().
    var statusChangeCallback = function (response) {
        // if connected then return response
        if (response.status === 'connected') {
            return testAPI();
        } else if (response.status === 'not_authorized') {
            document.getElementById('status').innerHTML = 'Log in to play JS-WARS!';
        } else {
            document.getElementById('status').innerHTML = 'Please log in to facebook if you want to use fb login credentials';
        }
    };

    var optionsHud = function () {
        var elements = {
            section: 'optionsMenu',
            div: 'optionSelect'
        };
        var element = displayInfo(app.settings.options, app.settings.optionsDisplay, elements, 'optionSelectionIndex');
        if (element) {
        	optionsActive = true;
            return element;
        }
        return false;
    };

    // display damage percentage
    var damageDisplay = function (percentage){

        var exists = document.getElementById('damageDisplay');
        var damageDisp = document.createElement('div');
        var damageDiv = document.createElement('div');

        damageDisp.setAttribute('id', 'damageDisplay'); 
        damageDiv.setAttribute('id', 'damage');

        var heading = document.createElement('h1');
        var percent = document.createElement('h2');

        heading.innerHTML = 'DAMAGE';
        percent.innerHTML = percentage + '%';

        damageDisp.appendChild(heading);
        damageDiv.appendChild(percent);
        damageDisp.appendChild(damageDiv);
        if(exists){
            exists.parentNode.replaceChild(damageDisp, exists);
        }else{
            document.body.insertBefore(damageDisp, app.domInsertLocation);
        }
    };

    var coStatus = function (player) {

        if (sideX !== app.temp.side || unitSelectionActive) {

            app.temp.side = sideX;

            var coHud = document.getElementById('coStatusHud');

            // create container section, for the whole hud
            var hud = document.createElement('section');
            hud.setAttribute('id', 'coStatusHud');
            if (sideX === 'left' && !unitSelectionActive) hud.style.left = '864px';
            unitSelectionActive = false;

            // create a ul, to be the gold display
            var gold = document.createElement('ul');
            gold.setAttribute('id', 'gold');

            // create a canvas to animate the special level	
            var power = document.createElement('canvas');
            var context = power.getContext(app.ctx);
            power.setAttribute('id', 'coPowerBar');
            power.setAttribute('width', 310);
            power.setAttribute('height', 128);

            // create the g for  gold
            var g = document.createElement('li');
            g.setAttribute('id', 'g');
            g.innerHTML = 'G.';
            gold.appendChild(g);

            // add the amount of gold the player currently has
            var playerGold = document.createElement('li');
            playerGold.setAttribute('id', 'currentGold');
            playerGold.innerHTML = player.gold;
            gold.appendChild(playerGold);

            // put it all together and insert it into the dom
            hud.appendChild(gold);
            hud.appendChild(power);

            if (coHud) {
                coHud.parentNode.replaceChild(hud, coHud);
            } else {
                document.body.insertBefore(hud, app.domInsertLocation);
            }

            // return the context for animation of the power bar
            return context;
        }
        return false;
    };

    var action = function (actions) {
    	app.temp.actionsActive = true;
    	unitSelectionActive = true;
        var elements = {
            section: 'actionHud',
            div: 'actions'
        };
        displayInfo(actions, app.settings.actionsDisplay, elements, 'actionSelectionIndex');
    };

    var unitInfo = function (building, unit, tag) {

        var elements = {
            section: 'unitInfoScreen',
            div: 'unitInfo'
        };
        var props = app.buildings[building][unit].properties;
        var allowed = app.settings.unitInfoDisplay;
        var properties = {};
        var propName = Object.keys(props);

        for (var n = 0; n < propName.length; n += 1) {
            if (allowed.hasValue(propName[n])) {
                properties[propName[n]] = {
                    property: propName[n].uc_first(),
                    value: props[propName[n]]
                };
            }
        }
        displayInfo(properties, allowed, elements);
    };

    var selectionInterface = function (building) {
        // get the selectable unit types for the selected building
        unitSelectionActive = true;
        var units = app.buildings[building];
        var elements = {
            section: 'buildUnitScreen',
            div: 'selectUnitScreen'
        };
        displayInfo(units, app.settings.unitSelectionDisplay, elements, 'unitSelectionIndex', 7);
    };

    var displayInfo = function (properties, allowedProperties, elements, tag) {

        // build the outside screen container or use the existing element
        var display = document.createElement('section');
        display.setAttribute('id', elements.section);

        // build inner select screen or use existing one
        var exists = document.getElementById(elements.div);
        var innerScreen = document.createElement('div');
        innerScreen.setAttribute('id', elements.div);

        // get each unit type for looping over
        var keys = Object.keys(properties);

        for (u = 0; u < keys.length; u += 1) {

            // create list for each unit with its cost
            var list = createList(properties[keys[u]], keys[u], allowedProperties, tag);
            if (tag) list.ul.setAttribute(tag, u + 1);

            // add list to the select screen
            innerScreen.appendChild(list.ul);
        }

        if (exists) {
            exists.parentNode.replaceChild(innerScreen, exists);
        } else {
            // add select screen to build screen container
            display.appendChild(innerScreen);

            // insert build screen into dom
            document.body.insertBefore(display, app.domInsertLocation);
        }
        return true;
    };

    var times = 0;

    var select = function (tag, id, display, max) {

        if(app.temp.modeOptionsActive) console.log(app.temp.modeOptionsActive);

        // if the index is not the same as it was prior, then highlight the new index ( new element )
        if ( app.temp.prevIndex !== app.temp.selectionIndex ) {

            console.log('in');

            // all the ul children from the selected element for highlighting
            var hudElement = document.getElementById(id);
            var elements = hudElement.getElementsByTagName('ul');
            var prev = app.temp.prevIndex;
            selectionIndex = app.temp.selectionIndex;
            len = elements.length;
            key = app.game.settings.keyMap;
            undo = app.undo.keyPress;

            // if there is no max set then set max to the length of he array
            if (!max) max = len;

            // hide elements to create scrolling effect
            if (selectionIndex > max) {
                hide = selectionIndex - max;
                for (var h = 1; h <= hide; h += 1) {

                    // find each element that needs to be hidden and hide it
                    var hideElement = findElementByTag(tag, h, elements);
                    hideElement.style.display = 'none';
                }
            } else if (selectionIndex <= len - max && hide) {

                // show hidden elements as they are hovered over
                var showElement = findElementByTag(tag, selectionIndex, elements);
                showElement.style.display = '';
            }

            selectedElement = findElementByTag(tag, selectionIndex, elements);

            if( times === 0 ) {
                console.log('passing selected');
                if(selectedElement) console.log(selectedElement);
                times += 1;
            }

            // callback that defines how to display the selected element ( functions located in app.effect )
            if (selectedElement){
                console.log(display);
                display(selectedElement, tag, selectionIndex, prev, elements, len);
            }

            // store the last index for future comparison
            app.temp.prevIndex = selectionIndex;
        }

        // if the select key has been pressed and an element is available for selection then return its id
        if(!app.temp.modeOptionsActive){
            if (key.select in app.keys && selectedElement) {
                undo(key.select);
                app.temp.selectionIndex = 1;
                delete app.temp.prevIndex;
                delete selectedElement;
                delete selectionIndex;
                delete prev;
                delete hide;
                return selectedElement.getAttribute('id');

                // if the down key has been pressed then move to the next index ( element ) down
            } else if (key.down in app.keys) {

                // only movement if the index is less then the length ( do not move to non existant index )
                if (selectionIndex < len) {

                    // increment to next index
                    app.temp.selectionIndex += 1;
                }
                undo(key.down);

                // same as above, but up
            } else if (key.up in app.keys) {

                if (selectionIndex > 1) app.temp.selectionIndex -= 1;
                undo(key.up);
            }
        }
        return false;
    };

    // find each element by their tag name, get the element that matches the currently selected index and return it
    var findElementByTag = function (tag, index, element) {
        var elements = []
        for (var e = 0; e < len; e += 1) {
            // element returns a string, so must cast the index to string for comparison
            // if the element tag value ( index ) is equal to the currently selected index then return it
            if (element[e].getAttribute(tag) === index.toString()) {
                elements.push(element[e]);
            }
        }
        if(elements.length > 1) return elements;
        return elements[0];
    };

    // get information on terrain and return an object with required information for display
    var terrainInfo = function (info) {
        
        var list;
        
        // if there is a selectable element then return its info
        if (info !== undefined && info.stat !== false) {

            // get information from the map to return on the currently hovered over map square
            var object = app.map[info.objectClass][info.ind];

            // create a ul with the information
            list = createList(object, info.objectClass, app.settings.hoverInfo, 'hud');

            // return the list of information
            return {
                ul: list.ul,
                ind: info.ind,
                canvas: list.canvas,
                type: object.type
            };

            // if there is nothing found it means that it is plains, return the default of the plain object
        } else if (info.objectClass === 'terrain') {

            // make a list with info on plains
            list = createList(app.map.plain, info.objectClass, app.settings.hoverInfo, 'hud');

            // return the list
            return {
                ul: list.ul,
                ind: false,
                canvas: list.canvas,
                type: 'plain'
            };
        }
        return false;
    };

    // create a canvas to display the hovered map element in the hud
    var hudCanvas = function (canvasId, type, objectClass) {

        var canvas = document.createElement('canvas'); // create canvas
        var context = canvas.getContext(app.ctx); // get context

        // set width, height and id attributes
        canvas.setAttribute('width', 128);
        canvas.setAttribute('height', 128);
        canvas.setAttribute('id', type + canvasId + 'Canvas');

        // return canvas info for further use
        return {
            canvas: canvas,
            context: context,
            type: type,
            objectClass: objectClass
        };
    };

    var createList = function (object, id, displayedAttributes, canvasId) {
        var canvas;
        if (canvasId) {
            // create canvas and add it to the object
            canvas = hudCanvas(canvasId, object.type, id);
            object.canvas = canvas.canvas;
        }

        // get a list of property names
        var properties = Object.keys(object);

        // create an unordered list and give it the specified id
        var ul = document.createElement('ul');
        ul.setAttribute("id", id);

        // go through each property and create a list element for ivart, then add it to the ul;
        for (var i = 0; i < properties.length; i += 1) {

            // properties
            var props = properties[i];

            // only use properties specified in the displayed attributes array
            if (displayedAttributes === '*' || displayedAttributes.hasValue(props)) {

                // create list element and give it a class defining its value
                var li = document.createElement('li');
                li.setAttribute('class', props);

                // if the list element is a canvas then append it to the list element
                if (props === 'canvas') {
                    li.appendChild(object[props]);

                    // if the list is an object, then create another list with that object and append it to the li element
                } else if (typeof (object[props]) === 'object') {
                    var list = createList(object[props], props, displayedAttributes);
                    li.appendChild(list.ul);

                    // if the list element is text, add it to the innerHTML of the li element
                } else {
                    li.innerHTML = object[props];
                }
                // append the li to the ul
                ul.appendChild(li);
            }
        }
        // return the ul and canvas info
        return {
            ul: ul,
            canvas: canvas
        };
    };

    // display informavartion on currently selected square, and return selectable objects that are being hovered over
    var displayHUD = function () {

    	// unset cursor move
        app.temp.cursorMoved = false;

        sideX = app.calculate.side('x');
        sideY = app.calculate.side('y');

        // create hud element or remove the existing element
        var exists = document.getElementById('hud');
        var display = document.createElement('div');
        display.setAttribute('id', 'hud');
        var object;
        // array holds what properties should exist in hud
        // array of map elements, ordered by which will be selected and displayed over the other
        var canvas = [];
        var properties = [];
        var selected = ['unit', 'building', 'terrain'];

        // move through each possible map element, display informavartion to 
        // the dom and return info on selectable map elements
        for (var x = 0; x < selected.length; x += 1) {

            // check if the currsor is over the map element type, 
            // if so get the coordinates and info on the map element
            var hovering = terrainInfo(app.select.hovered(selected[x]));

            // if the cursor is over the current map element...
            if (hovering) {

                // add canvas image to its array if exists
                if (hovering.canvas) canvas.push(hovering.canvas);

                // push the map element type into the props array so that
                // a diff can be performevard between it and the current dom
                properties.push(selected[x]);

                // if the map element needs to be added to the dom then do so
                if (hovering.ul) {
                    display.appendChild(hovering.ul);
                }

                // if the return value has not been set, ( meaning the previous map element is not being hovered over)
                // then set it for tvarhe current map element ( which is being hovered over )
                if (selected[x] === 'unit' || properties[0] !== 'unit') {
                    object = {
                        objectClass: selected[x],
                        ind: hovering.ind
                    };
                }
                if (selected[x] === 'building') break;
            }
        }

        // apply proper width to element 
        var displayWidth = app.settings.hudWidth * properties.length;
        var hudLeft = app.settings.hudLeft - 120;

        // if there is more then one element to display then double the width of the hud to accomidate the difference
        display.style.left = properties.length > 1 ? hudLeft.toString() + 'px' : app.settings.hudLeft.toString() + 'px';
        display.style.width = displayWidth.toString() + 'px';
        display.style.height = app.settings.hudHeight.toString() + 'px';

        // if the element already exists then replace it
        if (exists) {
            exists.parentNode.replaceChild(display, exists);

            // otherwise insert it into the dom
        } else {
            document.body.insertBefore(display, document.getElementById("before"));
        }

        // if there was a canvas elemnt added for display, then render it
        if (canvas) {
            for (var c = 0; c < canvas.length; c += 1) {
                if (canvas[c].objectClass !== 'unit' && canvas.length > 1) canvas[c].canvas.setAttribute('class', 'secondHudCanvas');
                app.draw(canvas[c].context).hudCanvas(canvas[c].type, canvas[c].objectClass);
            }
        }
        return object;
    };

    // hide an element
    var hideElement = function (hideElement) {
        // get  element
        var hidden = document.getElementById(hideElement);

        // hide element
        hidden.style.display = 'none';
    };

    return {

        findElementByTag: function (tag, index, element) {
            return findElementByTag(tag, index, element);
        },

        checkLoginState: function () {
            FB.getLoginStatus(function(response) {
                statusChangeCallback(response);
            });
        },

        login: function() {
           login();
        },

        // 
        actions: function (options) {
            var actions = Object.keys(options);
            var actionsObj = {};
            for (var a = 0; a < actions.length; a += 1) {
                actionsObj[actions[a]] = { name: actions[a] };
            }
            hideElement('coStatusHud'); // hide co status hud
			action(actionsObj);
            return this;
        },

        selectionInterface: function (building, tag) {
            return selectionInterface(building, tag);
        },

        select: function (tag, id, display, selected, max) {
            return select(tag, id, display, selected, max);
        },

        listen: function () {

       		var selection;

        	// if the options hud has been activated 
            if (app.temp.actionsActive && app.temp.selectActive) {

                // make the options huds list items selectable
                selection = select('actionSelectionIndex', 'actions', app.effect.highlightListItem);
            }else if(app.temp.optionsActive){
                selection = select('optionSelectionIndex', 'optionsMenu', app.effect.highlightListItem);
            }

            // if one has been selected activate the corresponding method from the options class
            if (selection) {
                if(app.temp.actionsActive){
                    app.actions[selection]();
                    app.undo.hudHilight();
                    app.undo.display('actionHud');
                    app.temp.selectActive = false;
                    app.temp.cursorMoved = true;
                } if(app.temp.optionsActive && !app.temp.actionsActive ){
                    app.options[selection]();
                    app.undo.all(); // remove display
                }
            }
            return this;
        },

        // display terrain info
        hud: function () {

            // if the cursor has been moved, and a selection is active then get the display info for the new square
            if (app.temp.cursorMoved && !app.temp.selectActive) app.temp.hovered = displayHUD();
            return this; 
        },

        options: function () {
            // if nothing is selected and the user presses the exit key, show them the options menu
            if (app.game.settings.keyMap.exit in app.keys && !app.temp.selectActive && !app.temp.actionsActive ) {
                app.undo.keyPress(app.game.settings.keyMap.exit);
                app.temp.optionsActive = true; // set options hud to active
                app.temp.selectActive = true; // set select as active
                optionsHud(); // display options hud
                hideElement('coStatusHud'); // hide co status hud
            }
            return this;
        },

        coStatus: function () {
            if (!app.temp.optionsActive && !app.temp.actionsActive) coStatus(app.game.currentPlayer);
            return this;
        },

        damage: function (damage) {
            return damageDisplay(damage);
        },

        path: function (cursor) {
            // get the range
            var grid = app.temp.range.slice(0);

            // calculate the path to the cursor
            var p = app.calculate.path(app.temp.selectedUnit, cursor, grid);

            // if there is a path then set it to the path highlight effect for rendering
            if (p) app.effect.path = app.effect.path.concat(p);

            // animate changes
            window.requestAnimationFrame(app.animateEffects);
        },

        range: function () {
            // set the range highlight to the calculated range
            app.effect.highlight = app.effect.highlight.concat(app.temp.range);

            // animate changes
            window.requestAnimationFrame(app.animateEffects);
        }
    };
}();

/* ------------------------------------------------------------------------------------------------------*\
	
	app.move handles all the movement in the game, the cursor, scrolling, and moving of units etc..
\* ------------------------------------------------------------------------------------------------------*/

app.move = function () {

    var abs = Math.abs;

    var refreshMovement = function (player) {
        var unit;
        var units = app.map.unit;

        // used for accessing the correct building array via what type of transportation the unit uses
        var ports = {
            air: 'airport',
            foot: 'base',
            wheels: 'base',
            boat: 'seaport'
        };
        for (var u = 0; u < units.length; u += 1) {
            unit = units[u];
            // check for units that belong to the current player
            if (unit.player === player) {
                // add the original movement allowance to each unit on the board belonging to the current player
                app.map.unit[u].movement = app.units[unit.type].properties.movement;

                // reset attack abilities
                app.map.unit[u].attacked = false;   

                // reset capture abilities
                app.map.unit[u].captured = false;
            }
        }
        return true;
    };

    // screenRefresh the postions on the screen of all the units/terrain/buildings/etc
    var screenRefresh = function () {
        window.requestAnimationFrame(app.animateTerrain);
        window.requestAnimationFrame(app.animateBuildings);
        window.requestAnimationFrame(app.animateUnit);
    };

    var moveScreen = function (axis, x, screenDim) {

        var delay = app.settings.scrollSpeed;
        var screenZeroWidth = app.settings.cursor.scroll[axis];
        var midScreen = screenDim / 2;
        var lower = screenZeroWidth + midScreen;
        var scroll = app.settings.cursor.scroll[axis] + screenDim;
        var dimensions = app.map.dimensions[axis];

        if (!app.temp.scrollTimer) app.temp.scrollTimer = new Date();

        app.settings.cursor[axis] = x;

        // if the hq is located to the right or below the center of the screen then move there
        if (x > scroll - midScreen) {
            // loop with a recursive function so that the time can be delayed
            // creating the effect of moving the screen rather then immediately jumping to the hq
            (function loopDelay(i, dim) {
                setTimeout(function () { // set delay time
                    screenDim += 1;
                    app.settings.cursor.scroll[axis] += 1;
                    screenRefresh();
                    // if the distance between the center screen position and the hq has not been traveled
                    // then keep going, or if the screen has reached the limit of the map dimensions then stop
                    if (--i && screenDim <= dim) loopDelay(i, dim);
                }, delay); // <--- delay time
            })(x - (scroll - midScreen), dimensions);

            // if its to the left or above the screen then move the opposite direction
        } else if (x < lower) {
            (function loopDelay2(i, dim) {
                setTimeout(function () { // set delay time
                    screenZeroWidth -= 1;
                    app.settings.cursor.scroll[axis] -= 1;
                    screenRefresh();
                    if (--i && screenZeroWidth > dim) loopDelay2(i, dim);
                }, delay); // <--- delay time
            })(lower - x, 0);
        }
    };

    // checks if movement is within allowed range
    var canMove = function (move, range) {

        for (var o = 0; o < range.length; o += 1) {

            if (range[o].x === move.x && range[o].y === move.y) {
                return true;
            }
        }
        return false;
    };

    // creates scrolling effect allowing movement and map dimensions beyond screen dimensions
    var scrol = function (incriment, axis, operation) {

        var d = app.map.dimensions[axis]; // map dimensions
        var screenDimensions = {
            x: 15,
            y: 10
        }; // screen dimensions
        var s = screenDimensions[axis];
        var c = app.settings.cursor.scroll[axis];

        // if the resulting movement is greater then the screen size but within the dimensions of the map then scroll
        if (incriment >= s + c && incriment <= d) {
            app.settings.cursor.scroll[axis] += operation;
            screenRefresh();

            // if the resulting movement is less then the screen size but within the dimensions of the map then scroll back
        } else if (incriment < c && incriment >= 0) {
            app.settings.cursor.scroll[axis] += operation;
            screenRefresh();
        }
    };

    var cursor = function (axis, comparison, operation) {

        var temp = app.temp;

        if (!temp.selectedBuilding && !temp.optionsActive && !temp.actionsActive) {

            var cursor = app.settings.cursor[axis]; // cursor location

            scrol(cursor + operation, axis, operation); // handle scrolling

            if (app.temp.selectedUnit) {
                var result = limit(axis, operation);
                if (result) {
                    app.undo.effect('path');
                    app.display.path({
                        x: result.x,
                        y: result.y
                    });
                    return true;
                }
            } else if (operation < 0) {
                if (cursor + operation >= comparison) {
                    app.settings.cursor[axis] += operation;
                    return true;
                }
            } else {
                if (cursor + operation <= comparison) {
                    app.settings.cursor[axis] += operation;
                    return true;
                }
            }
        }
        return false;
    };

    var limit = function (axis, operation) {
        var oAxis = axis === 'x' ? 'y' : 'x';
        var a = {};
        var d = app.map.dimensions;

        a[axis] = app.settings.cursor[axis] + operation;
        a[oAxis] = app.settings.cursor[oAxis];

        if (canMove(a, app.temp.range) && a[axis] >= 0 && a.x <= d.x && a.y <= d.y) {
            app.settings.cursor[axis] += operation;
            return app.settings.cursor;
        }
        return false;
    };

    return {

        refresh: function (player) {
            return refreshMovement(player.id);
        },

        // move screen to current players hq
        screenToHQ: function (player) {
            var sd = app.cursorCanvas.dimensions();
            var screenWidth = sd.width / 64;
            var screenHeight = sd.height / 64;
            var x = player.hq.x;
            var y = player.hq.y;

            moveScreen('x', x, screenWidth);
            moveScreen('y', y, screenHeight);
        },

        // keep track of cursor position
        cursor: function () {
            if (!app.temp.selectedBuilding && !app.temp.optionsActive && !app.temp.actionsActive) {
                var d = app.map.dimensions;
                var key = app.game.settings.keyMap;
                var pressed;

                if (key.up in app.keys) { // Player holding up
                    // if the cursor has moved store a temporary varibale that expresses this @ app.temp.cursorMoved
                    if (cursor('y', 0, -1)) pressed = key.up;
                }
                if (key.down in app.keys) { // Player holding down
                    if (cursor('y', d.y, 1)) pressed = key.down;
                }
                if (key.left in app.keys) { // Player holding left
                    if(cursor('x', 0, -1)) pressed = key.left;
                }
                if (key.right in app.keys) { // Player holding right
                   if (cursor('x', d.x, 1)) pressed = key.right;
                }
                if(pressed){
                    app.temp.cursorMoved = true;
                    socket.emit('cursorMove', pressed);
                };
                window.requestAnimationFrame(app.animateCursor);
            }
            return this;
        }
    };
}();

/* --------------------------------------------------------------------------------------*\
    
    app.game.settings consolidates all the user customizable options for the game into
    an object for easy and dynamic manipulation
\* --------------------------------------------------------------------------------------*/

app.game.settings = {
    // amount of income per building per turn, 1000 - 9500 incrimenting by 500, default is 1000
    income: 1000,

    // toggle fog
    fog:false,

    // toggle weather setting
    weather:'random',

    // end of game on number of turns completed 1 - 99, 0 is off
    turns:0,

    // end game on cartain number of buildings captured 1 - 52,  0 is off
    capture:0,

    //  toggle co powers active.. default on
    power: true,

    // toggle attack animations.. default off
    visuals: false,

    // keyboard settings
    keyMap: {
        exit: 27,
        select: 13,
        up: 38,
        down: 40,
        left: 37,
        right: 39
    }
};

/* --------------------------------------------------------------------------------------*\
	
	app.settings consolidates all the customizable options and rules for the game into
	an object for easy and dynamic manipulation
\* --------------------------------------------------------------------------------------*/

app.settings = {

    // speed at which the screen will move to next hq at the changinf of turns
    scrollSpeed: 50,

    // types to look through when determining terrains effect on unit movement
    obsticleTypes: ['unit', 'terrain'],

    // list of the effects each obsticle has on each unit type
    obsticleStats: {
        mountain: {
            infantry: 2,
            apc:2
        },
        wood: {
            infantry: 1,
            apc:2
        },
        plain: {
            infantry: 1,
            apc:1
        },
        unit: {
            infantry: 1,
            apc:1
        }
    },

    selectedModeHeight: 150,

    selectModeMenu:[{
            id:'logout',
            display:'Logout',
            type:'exit',
            color:'grey',
        },{
            id:'game',
            display:'Game Setup',
            type:'setup',
            color:'blue',
            options:['new', 'continue']
        },{
            id:'join',
            display:'Join',
            type:'join',
            color:'yellow',
            options:['new', 'continue']
        },{
            id:'design',
            display:'Design',
            type:'design',
            color:'green',
            options:['map', 'CO']

        },{
            id:'store',
            display:'Game Store',
            type:'store',
            color:'red',
    }],

    capture: 20,

    combinableProperties:['fuel','health','ammo'],

    // terrain each unit is allowed to walk on
    movable: {
        foot: ['plain', 'river', 'mountain', 'wood', 'road', 'building'],
        wheels: ['plain', 'wood', 'road', 'building'],
        flight: ['plain', 'river', 'mountain', 'wood', 'road', 'water', 'building'],
        boat: ['water', 'building']
    },

    options: {
        unit: {
            name: 'Unit'
        },
        intel: {
            name: 'Intel'
        },
        options: {
            name: 'Options'
        },
        save: {
            name: 'Save'
        },
        end: {
            name: 'End'
        }
    },

    // dimensions of diplay hud
    hudWidth: 120,
    hudHeight: 200,
    hudLeft: 1050,

    // spacing / positioning of mode menu selection elements
    modeMenuSpacing:20,

    // which attributes of objects ( unit, buildings etc ) will be displayed in hud
    hoverInfo: ['ammo', 'health', 'name', 'fuel', 'def', 'canvas'],

    // which actions can be displayed
    actionsDisplay: ['attack', 'capture', 'wait', 'name'],

    // unit info attributes for display
    unitInfoDisplay: ['movement', 'vision', 'fuel', 'weapon1', 'weapon2', 'property', 'value'],

    // which attributes of units will be displayed on unit selection/purchase/building hud
    unitSelectionDisplay: ['name', 'cost'],

    // options attributes for displ
    optionsDisplay: ['options', 'unit', 'intel', 'save', 'end', 'name'],

    // map elements that cannot be selected
    notSelectable: ['terrain', 'hq', 'city'],

    // cursor settings
    cursor: {
        x: 6,
        y: 4,
        speed: 50,
        scroll: {
            x: 0,
            y: 0
        }
    },
};


/* --------------------------------------------------------------------------------------*\
	
	app.effect is holds the coordinates for effects, these are dynamic, hence the empty
	arrays, they will fill and remove data as necessary to animate the game effects, it 
    also holds logic for display effects

\* --------------------------------------------------------------------------------------*/

app.effect = function () {

    var previous, pre, key, undo, selectIndex;

    var highlight = function (element) {

        console.log('highlight');

        element.style.backgroundColor = 'tan';
        if(previous) previous.style.backgroundColor = '';
        previous = element;
    };

    var select = function(options) {

        console.log('select');

        if(!selectIndex) selectIndex = 0;
        if (key.select in app.keys && selectedElement) {
            undo(key.select);
            delete app.temp.modeOptionsActive;
            delete selectIndex;
            delete previous;
            options[selectIndex].parentNode.style.display = 'none';
            return options[selectIndex].getAttribute('id');

        }else if(key.up in app.keys){
            selectIndex -= 1;
            app.undo.keyPress(key.up);

        }else if(key.down in app.keys){
            selectIndex += 1;
            app.undo.keyPress(key.down);
        }

        if(selecIndex === options.length ){
            selectIndex = 0;
        }else if(selectIndex > 0){
            selectIndex = options.length - 1;
        }

        if(selectIndex !== pre || !pre){
            highlight(options[selectIndex]);
            pre = selectIndex;
        }
        return false;
    };

    var menuItemOptions = function ( selectedElement, options ) {
        if (!key) key = app.game.settings.keyMap;
        if (!undo) undo = app.undo.keyPress;

        console.log('menuItemOptions');

        // show options
        options[0].parentNode.style.display = '';

        if(key.left in app.keys){
            app.temp.modeOptionsActive = false;
            highlight(selectedElement);
            undo(key.left);
            return true;
        }else if(key.right in app.keys){
            app.temp.modeOptionsActive = true;
            select(options);
            undo(key.right);
            return true;
        }
        return false;
    };

    return {

        highlightListItem: function (selectedElement, tag, index, prev, elements) {

            // apply highlighting 
            selectedElement.style.backgroundColor = 'tan';

            // display info on the currently hovered over element
            if (id === 'selectUnitScreen') unitInfo(selected, selectedElement.id);

            // check if there was a previous element that was hovered over
            if (prev) {

                // if there is then remove its highlighting
                var prevElement = app.display.findElementByTag( tag, prev, elements);
                prevElement.style.backgroundColor = '';
            }
        },

        scrollSetupMenu:function (selectedElement, tag, index, prev, elements, length){ 

            console.log('2707 scroll setup menu here!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            console.log(selectedElement);

            var num = app.settings.modeMenuSpacing;

            var options = app.display.findElementByTag('class', 'modeOption', [selectedElement]);

            var oneAbove = index - 1 > 0 ? index - 1 : length;
            var twoAbove = oneAbove -1 > 0 ? index - 1 : length;
            var oneBelow = index + 1 > length ? 1 : index + 1;
            var twoBelow = oneBelow + 1 > length ? 1 : index + 1;

            var twoUp = app.display.findElementByTag(tag, oneAbove, elements);
            var oneUp = app.display.findElementByTag(tag, twoAbove, elements);
            var oneDown = app.display.findElementByTag(tag, oneBelow, elements);
            var twoDown = app.display.findElementByTag(tag, twoBelow, elements);

            twoUp.style.left = (num - num - num).toString() +'px';
            oneUp.style.left = (num - num).toString() +'px';
            selectedElement.style.left = (num).toString() +'px';
            selectedElement.style.height = (app.settings.selectedModeHeight * 2).toString() + 'px';
            oneDown.style.left = (num - num).toString() +'px';
            twoDown.style.left = (num - num - num).toString() +'px';

            if (options) var selection = menuItemOptions(selectedElement, options);
            if (selection) return selection;
            return false;
        },
        highlight: [],
        path: []
    }
}();

/* --------------------------------------------------------------------------------------*\
	
	app.map contains all the settings for the map, unit locations, terrain, buildings, etc. 
	it holds coordinates of objects that correspond to animations in the animation repo
	maps can be built and edited dynamically by inserting or removing objects from/into the 
	arrays
\* --------------------------------------------------------------------------------------*/

app.map = {
    background: {
        type: 'plain',
        x: 20,
        y: 20
    },
    dimensions: {
        x: 20,
        y: 20
    },
    plain: {
        type: 'plain',
        name: 'Plains',
        def: 1
    },
    terrain: [{
        x: 1,
        y: 7,
        type: 'tallMountain',
        name: 'Mountain',
        obsticle: 'mountain',
        def: 2
    }, {
        x: 2,
        y: 5,
        type: 'tallMountain',
        name: 'Mountain',
        obsticle: 'mountain',
        def: 2
    }, {
        x: 3,
        y: 4,
        type: 'tallMountain',
        name: 'Mountain',
        obsticle: 'mountain',
        def: 2
    }, {
        x: 8,
        y: 5,
        type: 'tallMountain',
        name: 'Mountain',
        obsticle: 'mountain',
        def: 2
    }, {
        x: 1,
        y: 1,
        type: 'tallMountain',
        name: 'Mountain',
        obsticle: 'mountain',
        def: 2
    }, {
        x: 1,
        y: 5,
        type: 'tree',
        name: 'Woods',
        obsticle: 'wood',
        def: 3
    }, {
        x: 1,
        y: 6,
        type: 'tree',
        name: 'Woods',
        obsticle: 'wood',
        def: 3
    }, {
        x: 1,
        y: 8,
        type: 'tree',
        name: 'Woods',
        obsticle: 'wood',
        def: 3
    }, {
        x: 3,
        y: 5,
        type: 'tree',
        name: 'Woods',
        obsticle: 'wood',
        def: 3
    }, {
        x: 6,
        y: 2,
        type: 'tree',
        name: 'Woods',
        obsticle: 'wood',
        def: 3
    }, {
        x: 6,
        y: 3,
        type: 'tree',
        name: 'Woods',
        obsticle: 'wood',
        def: 3
    }, {
        x: 9,
        y: 5,
        type: 'tree',
        name: 'Woods',
        obsticle: 'wood',
        def: 3
    }, {
        x: 9,
        y: 6,
        type: 'tree',
        name: 'Woods',
        obsticle: 'wood',
        def: 3
    } ],
    building: [{
        x: 0,
        y: 5,
        type: 'hq',
        name: 'HQ',
        capture: app.settings.capture,
        obsticle: 'building',
        player: 1,
        color: 'red',
        def: 4
    }, {
        x: 20,
        y: 5,
        type: 'hq',
        name: 'HQ',
        capture: app.settings.capture,
        obsticle: 'building',
        player: 2,
        color: 'blue',
        def: 4
    }, {
        x: 0,
        y: 4,
        type: 'base',
        name: 'Base',
        capture: app.settings.capture,
        obsticle: 'building',
        player: 1,
        color: 'red',
        def: 4
    }, {
        x: 15,
        y: 4,
        type: 'base',
        name: 'Base',
        capture: app.settings.capture,
        obsticle: 'building',
        player: 2,
        color: 'blue',
        def: 4
    }],
    unit: []
};

/* --------------------------------------------------------------------------------------*\
    
    app.co holds all the co's, their skills and implimentation

\* --------------------------------------------------------------------------------------*/

app.co = function () {

    var percent = function (amount) {
        return amount / 100;
    };

    var addToEach = function(player, funk, property, amount, parameter1, parameter2, parameter3) {
        if(!parameter) parameter = 100;
        var units = app.map.unit;
        for ( var u = 0; u < units.length; u += 1 ){
            if( units[u].player === player.id ){
                app.map.unit[u][property] = funk( unit[u], property, amount, parameter1, parameter2, parameter3 );
            }
        }
    };

    var editProperty = function(unit, property, amount, parameter){
        if( unit[property] + amount > parameter ){
            return parameter;
        }else{
            return unit[property] + amount;
        }
    };

    var filter = function (unit, property, amount, max, parameter1, parameter2){
        if(unit[parameter1] === parameter2){
            if(unit[property] + amount > max){
                return max;
            }else{
                return unit[property] + amount;
            }
        }
    };

    var editRange = function (unit, property, amount){
        if(unit.damageType === 'ranged'){
            unit.range.hi += amount;
            return unit.range;
        }
    };

    var editArray = function (unit, property, amount, parameter1, parameter2){
        var baseDamage = {};
        var damage = Object.keys(unit[property]);
        for(var d = 0; d < damage.length; d += 1 ){

            // if there is no perameter then simply find the percentage added to all units
            if(!parameter1){
                var dam = unit[property][damage[d]];

                // add the damage plus the percent of increase
                baseDamage[damage[d]] *= amount;

            // if there is a parameter then only add to the damage type specified in the perameter
            }else if ( unit[parameter1] === parameter2 ){

                var dam = unit[property][damage[d]];
                baseDamage[damage[d]] *= amount
            }
        }
        return baseDamage;
    };

    return {

        andy: function (player) {

            var special = 100;
            var powerActive = false;
            var superPowerActive = false;
            var damage = 100;

            return {
                name:'Andy',
                power:function(){
                    addToEach(player, editProperty(), 'health', 2, 10);
                },
                superPower:function(){
                    superPowerActive = true;
                    addToEach(player, editProperty(),'health', 5, 10);
                    addToEach(player, editProperty(),'movement', 1);
                    special = 130;
                },
                attack:function(){
                    return damage * percent(special);
                },
                defense:function(){
                    return 100;
                },
                endPower:function(){
                    if(superPowerActive){
                        addToEach(player, editProperty(),'movement', -1);
                        special = 100;
                        superPowerActive = false;
                    }
                }
            }
        },
        max: function (player) {

            var damage = 100;
            var special = 120;
            var powerActive = false;
            var superPowerActive = false;  

            return {
                name:'Max',     
                power:function(){
                    powerActive = true;
                    special = 140;
                },
                superPower:function(){
                    powerActive = true;
                    special = 170;
                },
                attack:function(unit){
                    if( unit.damageType === 'direct' ){
                        return damage * percent(special);
                    }else{
                        return damage;
                    }
                },
                defense:function(){
                    return 100;
                },
                endPower:function(){
                    if(powerActive){
                        special = 120;
                        powerActive = false;
                    }
                },
                build:function(unit){
                    unit.range.hi -= 1;
                    return unit;
                }
            }
        },
        sami: function (player) {

            var damage = 100;
            var special = 120;
            var powerActive = false;
            var superPowerActive = false;  
            var capSpecial = 150;
            var penalty = 90;

            return {
                name:'Sami',
                power: function (){
                    powerActive = true;
                    addToEach(player, filter(), 'movement', 1, 20, 'transportaion', 'foot');
                    special = 170;
                },
                superPower: function(){
                   superPowerActive = true;
                    addToEach(player, filter(), 'movement', 2, 20, 'transportaion', 'foot');
                    special = 200;
                    capSpecial = 2000;
                },
                attack: function(unit){
                    if(unit.transportaion === 'foot'){
                        return damage * percent(special);
                    }else if(unit.damageType === direct){
                        return damage * percent(penalty);
                    }
                    return damage;
                },
                defense:function(){
                    return 100;
                },
                endPower:function(){
                    if(powerActive){
                        addToEach(player, filter(), 'movement', -1, 20, 'transportaion', 'foot');
                    }else if(superPowerActive){
                        addToEach(player, filter(), 'movement', -2, 20, 'transportaion', 'foot');
                    }
                    special = 120;
                },
                capture: function (capture){
                    return capture * percent(capSpecial);
                }
            };
        }
    };
}();

/* --------------------------------------------------------------------------------------*\
	
	app.units is a repo for the units that may be created on the map and their stats

\* --------------------------------------------------------------------------------------*/

app.units = {
    infantry: {
        properties: {
            type: 'infantry',
            name: 'Infantry',
            movement: 3,
            vision: 2,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 55,
                mech:45,
                recon:12,
                tank:5,
                midTank:1,
                neoTank:1,
                apc:14,
                artillery:15,
                rockets:25,
                antiAir:5,
                missles:25,
                bCopter:7,
                tCopter:30,
                pipe:1
            },
            movable: app.settings.movable.foot,
            transportaion: 'foot',
            capture: true,
            canAttack: ['wheels', 'foot'],
            health: 10,
            ammo: 10,
            fuel: 99,
            weapon1: {},
            weapon2: {}
        },
        name: 'Infantry',
        cost: 1000
    },
    mech: {
        properties: {
            type: 'mech',
            name: 'Mech',
            movement: 2,
            vision: 2,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 65,
                mech:55,
                recon:85,
                tank:55,
                midTank:15,
                neoTank:15,
                apc:75,
                artillery:70,
                rockets:85,
                antiAir:65,
                missles:85,
                bCopter:9,
                tCopter:35,
                pipe:15
            },
            movable: app.settings.movable.foot,
            transportaion: 'foot',
            capture: true,
            health: 10,
            ammo: 10,
            fuel: 70,
            weapon1: {},
            weapon2: {}
        },
        name: 'Mech',
        cost: 3000
    },
    recon: {
        properties: {
            type: 'recon',
            name: 'Recon',
            movement: 8,
            vision: 5,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 70,
                mech:65,
                recon:32,
                tank:6,
                midTank:1,
                neoTank:1,
                apc:45,
                artillery:45,
                rockets:55,
                antiAir:4,
                missles:28,
                bCopter:10,
                tCopter:35,
                pipe:1
            },
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 80,
            weapon1: {},
            weapon2: {}
        },
        name: 'Recon',
        cost: 4000
    },
    apc: {
        properties: {
            type: 'apc',
            name: 'APC',
            movement: 6,
            vision: 1,
            range: {
                lo: 1,
                hi: 1
            }, // steal supplies!
            load:1,
            load:['infantry', 'mech'],
            loaded:[],
            canAttack:[],
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            fuel: 70,
            weapon1: {},
            weapon2: {}
        },
        name: 'APC',
        cost: 5000
    },
    antiAir: {
        properties: {
            type: 'antiAir',
            name: 'Anti-Air',
            movement: 6,
            vision: 2,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 105,
                mech:105,
                recon:60,
                tank:25,
                midTank:10,
                neoTank:5,
                apc:50,
                artillery:50,
                rockets:55,
                antiAir:45,
                missles:55,
                bCopter:120,
                tCopter:120,
                fighter:65,
                bomber:75,
                pipe:55
            },
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 60,
            weapon1: {},
            weapon2: {}
        },
        name: 'Anti-Aircraft',
        cost: 8000
    },
    tank: {
        properties: {
            type: 'tank',
            name: 'Tank',
            movement: 6,
            vision: 3,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 75,
                mech:70,
                recon:85,
                tank:55,
                midTank:15,
                neoTank:15,
                apc:75,
                artillery:70,
                rockets:85,
                antiAir:65,
                missles:85,
                bCopter:10,
                tCopter:40,
                bShip:1,
                lander:10,
                cruiser:5,
                sub:1,
                pipe:15
            },
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 60,
            weapon1: {},
            weapon2: {}
        },
        name: 'Tank',
        cost: 7000
    },
    midTank: {
        properties: {
            type: 'midTank',
            name: 'Mid Tank',
            movement: 5,
            vision: 1,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 105,
                mech:95,
                recon:105,
                tank:85,
                midTank:55,
                neoTank:45,
                apc:105,
                artillery:105,
                rockets:105,
                antiAir:105,
                missles:105,
                bCopter:12,
                tCopter:45,
                bShip:10,
                lander:35,
                cruiser:45,
                sub:10,
                pipe:55
            },
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 50,
            weapon1: {},
            weapon2: {}
        },
        name: 'Mid Tank',
        cost: 16000
    },
    artillery: {
        properties: {
            type: 'artillery',
            name: 'Artillary',
            movement: 5,
            vision: 1,
            damageType:'ranged',
            range: {
                lo: 2,
                hi: 3
            },
            damageType:'direct',
            baseDamage:{
                infantry: 90,
                mech:85,
                recon:80,
                tank:70,
                midTank:45,
                neoTank:40,
                apc:70,
                artillery:75,
                rockets:80,
                antiAir:75,
                missles:80,
                bShip:40,
                lander:55,
                cruiser:65,
                sub:60,
                pipe:45
            },
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 50,
            weapon1: {},
            weapon2: {}
        },
        name: 'Artillery',
        cost: 6000
    },
    rockets: {
        properties: {
            type: 'rockets',
            name: 'Rockets',
            movement: 5,
            vision: 1,
            range: {
                lo: 3,
                hi: 5
            },
            damageType:'ranged',
            baseDamage:{
                infantry: 95,
                mech:90,
                recon:90,
                tank:80,
                midTank:55,
                neoTank:50,
                apc:80,
                artillery:80,
                rockets:85,
                antiAir:85,
                missles:90,
                bShip:55,
                lander:60,
                cruiser:85,
                sub:85,
                pipe:55
            },
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 50,
            weapon1: {},
            weapon2: {}
        },
        name: 'Rockets',
        cost: 15000
    },
    missles: {
        properties: {
            type: 'missles',
            name: 'Missles',
            movement: 4,
            vision: 1,
            range: {
                lo: 3,
                hi: 5
            },
            damageType:'ranged',
            baseDamage:{
                fighter:100,
                bomber:100,
                bCopter:120,
                tCopter:120
            },
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 50,
            weapon1: {},
            weapon2: {}
        },
        name: 'Missles',
        cost: 12000
    },
    neoTank: {
        properties: {
            type: 'neoTank',
            name: 'Neo Tank',
            movement: 6,
            vision: 1,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 125,
                mech:115,
                recon:125,
                tank:105,
                midTank:75,
                neoTank:55,
                apc:125,
                artillery:115,
                rockets:125,
                antiAir:115,
                missles:125,
                bCopter:22,
                tCopter:55,
                bShip:15,
                lander:40,
                cruiser:50,
                sub:15,
                pipe:75
            },
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 99,
            weapon1: {},
            weapon2: {}
        },
        name: 'Neo Tank',
        cost: 22000
    },
    tCopter: {
        properties: {
            type: 'tCopter',
            name: 'T-Copter',
            movement: 6,
            vision: 2,
            range: {
                lo: 1,
                hi: 1
            },
            load:['infantry', 'mech'],
            loaded:[],
            transport:1,
            movable: app.settings.movable.flight,
            transportaion: 'flight',
            health: 10,
            canAttack:[],
            fuel: 99,
            weapon1: {},
            weapon2: {},
            fpt: 2
        },
        name: 'T-Copter',
        cost: 5000
    },
    bCopter: {
        properties: {
            type: 'bCopter',
            name: 'B-Copter',
            movement: 6,
            vision: 3,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 75,
                mech:75,
                recon:55,
                tank:55,
                midTank:25,
                neoTank:20,
                apc:60,
                artillery:65,
                rockets:65,
                antiAir:25,
                missles:65,
                bCopter:65,
                tCopter:95,
                bShip:25,
                lander:25,
                cruiser:55,
                sub:25,
                pipe:25
            },
            movable: app.settings.movable.flight,
            transportaion: 'flight',
            health: 10,
            ammo: 10,
            fuel: 99,
            weapon1: {},
            weapon2: {},
            fpt: 1
        },
        name: 'B-Copter',
        cost: 9000
    },
    fighter: {
        properties: {
            type: 'fighter',
            name: 'Fighter',
            movement: 9,
            vision: 2,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                bCopter:100,
                tCopter:100,
                bomber:100,
                fighter:55
            },
            movable: app.settings.movable.flight,
            transportaion: 'flight',
            health: 10,
            ammo: 10,
            fuel: 99,
            weapon1: {},
            weapon2: {},
            fpt: 5
        },
        name: 'Fighter',
        cost: 20000
    },
    bomber: {
        properties: {
            type: 'bomber',
            name: 'Bomber',
            movement: 7,
            vision: 2,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 110,
                mech:110,
                recon:105,
                tank:105,
                midTank:95,
                neoTank:90,
                apc:105,
                artillery:105,
                rockets:105,
                antiAir:95,
                missles:105,
                bShip:75,
                lander:95,
                cruiser:85,
                sub:95,
                pipe:95
            },
            movable: app.settings.movable.flight,
            transportaion: 'flight',
            health: 10,
            ammo: 10,
            fuel: 99,
            weapon1: {},
            weapon2: {},
            fpt: 5
        },
        name: 'Bomber',
        cost: 22000
    },
    lander: {
        properties: {
            type: 'lander',
            name: 'Lander',
            movement: 6,
            vision: 1,
            range: {
                lo: 1,
                hi: 1
            },
            transport:2,
            load:[
                'infantry', 
                'mech', 
                'tank', 
                'midTank',
                'apc', 
                'missles', 
                'rockets',
                'neoTank',
                'antiAir',
                'artillery',
                'recon'
            ],
            loaded:[],
            movable: app.settings.movable.boat,
            transportaion: 'boat',
            health: 10,
            fuel: 99,
            weapon1: {},
            weapon2: {},
            fpt: 1
        },
        name: 'Lander',
        cost: 12000
    },
    cruiser: {
        properties: {
            type: 'cruiser',
            name: 'Cruiser',
            movement: 6,
            vision: 3,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                bCopter:115,
                tCopter:115,
                fighter:55,
                bomber:65,
                sub:90
            },
            transport:2,
            load:['tCopter', 'bCopter'],
            loaded:[],
            movable: app.settings.movable.boat,
            transportaion: 'boat',
            health: 10,
            ammo: 10,
            fuel: 99,
            weapon1: {},
            weapon2: {},
            fpt: 1
        },
        name: 'Cruiser',
        cost: 18000
    },
    submerine: {
        properties: {
            type: 'submerine',
            name: 'Submerine',
            movement: 5,
            vision: 5,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                bShip:55,
                lander:95,
                cruiser:25,
                sub:55
            },
            movable: app.settings.movable.boat,
            transportaion: 'boat',
            health: 10,
            ammo: 10,
            fuel: 60,
            weapon1: {},
            weapon2: {},
            fpt: 1,
            divefpt: 5
        },
        name: 'Submerine',
        cost: 20000
    },
    bShip: {
        properties: {
            type: 'bShip',
            name: 'B-Ship',
            movement: 5,
            vision: 2,
            range: {
                lo: 2,
                hi: 6
            },
            damageType:'ranged',
            baseDamage:{
                infantry:95,
                mech:90,
                recon:90,
                tank:80,
                midTank:55,
                neoTank:50,
                apc:80,
                artillery:80,
                rockets:85,
                antiAir:85,
                missles:90,
                bShip:50,
                lander:95,
                cruiser:95,
                sub:95,
                pipe:55
            },
            movable: app.settings.movable.boat,
            transportaion: 'boat',
            health: 10,
            ammo: 10,
            fuel: 99,
            weapon1: {},
            weapon2: {},
            fpt: 1
        },
        name: 'B-Ship',
        cost: 28000
    }
};

/* --------------------------------------------------------------------------------------*\
    
    app.buildings is a list of each building and the inits they are capable of producing

\* --------------------------------------------------------------------------------------*/

app.buildings = {
    base:{
        infantry:app.units.infantry,
        mech:app.units.mech,
        recon:app.units.recon,
        apc:app.units.apc,
        antiAir:app.units.antiAir,
        tank:app.units.tank,
        midTank:app.units.midTank,
        artillery:app.units.artillery,
        missles:app.units.missles,
        rockets:app.units.infantry,
        neoTank:app.units.neoTank
    },
    airport: {
        tCopter:app.units.tCopter,
        bCopter:app.units.bCopter,
        fighter:app.units.fighter,
        bomber:app.units.bomber
    },
    seaport: {
        lander:app.units.lander,
        cruiser:app.units.cruiser,
        submerine:app.units.submerine,
        bShip:app.units.bShip
    }
};

/* --------------------------------------------------------------------------------------------------------*\
	app.init sets up a working canvas instance to the specified canvas dom element id, it is passed the id
	of a canvas element that exists in the dom and takes care of initialization of that canvas element
\*---------------------------------------------------------------------------------------------------------*/

app.backgroundCanvas = app.init('background');
app.terrainCanvas = app.init('landforms');
app.buildingCanvas = app.init('buildings');
app.effectsCanvas = app.init('effects');
app.unitCanvas = app.init('units');
app.weatherCanvas = app.init('weather');
app.cursorCanvas = app.init('cursor');

/* ----------------------------------------------------------------------------------------------------------*\
	The draw functions are passed into the setAnimations method of an initialized game canvas. 
	In the initialization they are passed the 'draw' variable, which is a repo of objects/drawings.
	The repo can be set with the 'setAnimationRepo' method of app.init, the default repo is app.objects
	setting a new repo for a canvas will overwrite the app.objects repo with its replacement for that canvas ( not all canvases will be effected if you are using multiple canvases ).
	The methods of draw, used to access the repo are as follows:
	coordinate: can take specific coordinates, or you can specify a coordinate object containing an array
	or multiple arrays of objects with x and y coordinate properties and a type the specifies what to
	draw at those coordinates. for example "draw.coordinate('map', 'unit');" will look at app.map.unit where 
	app.map.unit is an array of object coordinates with a type property. Within the coordinates, while looping, 
	the coordinate method will look at the coordinate objects type property, find a drawing in the specified or
	default repo by the same name, and draw the matching image at the specified coordinates. this allows multiple
	coordinates to be specified for a specific type of drawing, unit, terrain, whatever and also allows them to 
	be added, removed or updated dynamically by adding or removing objects to the arrays.
	background: background will simply fill the entire background with a specified drawing from the repo
	cache: can be chained in the draw command and specifies that you want the objects being drawn to be cached 
	and drawn as a whole image, rather then drawn repeatedly for each coordinate, can improve performance when
	objects that dont need to change their appearance must be moved around allot ( scrolling for example will be
	faster with cached terrain elements )
\*-----------------------------------------------------------------------------------------------------------*/

app.drawEffects = function (draw) {
    draw.coordinate('effect', 'highlight'); // highlighting of movement range
    draw.coordinate('effect', 'path'); // highlighting current path
};

app.drawWeather = function (draw) {
    // weather stuff animated here
};

app.drawBuildings = function (draw) {
    draw.coordinate('map', 'building');
};

app.drawUnits = function (draw) {
    draw.coordinate('map', 'unit');
};

app.drawCursor = function (draw) {
    if (!app.settings.hideCursor && app.usersTurn) draw.coordinate('map', 'cursor', [app.settings.cursor]);
    if (app.settings.target) draw.coordinate('map', 'target', [app.settings.target]);
};

app.drawBackground = function (draw) {
    draw.background('background');
};

app.drawTerrain = function (draw) {
    draw.cache().coordinate('map', 'terrain');
};

/* --------------------------------------------------------------------------------------------------------*\
	The animate functions insert the draw methods into the specified canvas for rendering and then make a 
	call to the canvas to render those drawings with the render method. Calling the render method of an
	initialized canvas object will render the animations once. If a loop is wanted ( for changing animations 
	for example ), you may pass the parent function into the render function to be called recursively.
\*---------------------------------------------------------------------------------------------------------*/

app.animateBuildings = function () {
    app.buildingCanvas.setAnimations(app.drawBuildings).render();
};

app.animateUnit = function () {
    app.unitCanvas.setAnimations(app.drawUnits).render();
};

app.animateBackground = function () {
    app.backgroundCanvas.setAnimations(app.drawBackground).render();
};

app.animateTerrain = function () {
    app.terrainCanvas.setAnimations(app.drawTerrain).render();
};

app.animateCursor = function () {
    app.cursorCanvas.setAnimations(app.drawCursor).render();
};

app.animateEffects = function () {
    app.effectsCanvas.setAnimations(app.drawEffects).render();
};

/* --------------------------------------------------------------------------------------------------------*\
  
    app.gameSetup controls the setting up and selection of games / game modes 

\*---------------------------------------------------------------------------------------------------------*/

app.gameSetup = function (){

    // select game mode
    if(app.user) var game = app.display.select('modeItemIndex', 'selectModeScreen', app.effect.scrollSetupMenu, 5);

    // remove key presses on each iteration
    if ( app.keys.length > 0 ) app.keys.splice(0,app.keys.length);

    // if a game has been started 
    if (game) {

        // start game adds players, player info, settings, game type, mode, maps etc to be used in game
        app.start(game);

        // start game loop
        app.gameLoop();

    // if the game hasnt been started then keep looping the setup menu
    }else{
        window.requestAnimationFrame(app.gameSetup);
    }
};

/* --------------------------------------------------------------------------------------------------------*\
	app.gameLoop consolidates all the game logic and runs it in a loop, coordinating animation calls and 
	running the game
\*---------------------------------------------------------------------------------------------------------*/

app.gameLoop = function () {
    app.move.cursor(); // controls cursor and screen movement
    app.display.hud() // display terrain info
        .coStatus() // display co status hud
        .options() // listen for options activation
        .listen();  // listen for active huds and activate selection ability for their lists
    app.select.move(); // controls selection and interaction with map elements
    app.build.units(); // controls building of units
    app.select.exit(); // controls the ability to escape display menus
    window.requestAnimationFrame(app.gameLoop);
    if ( app.keys.length > 0 ) app.keys.splice(0,app.keys.length);
};

/* --------------------------------------------------------------------------------------------------------*\
	app.draw provides a set of methods for interacting with, scaling, caching, coordinating  
	and displaying the drawings/animations provided in the app.animationRepo
\*---------------------------------------------------------------------------------------------------------*/

app.draw = function (canvas, dimensions, base) {
    
    var w, h, width, height;
    var temp = {}; // holds temporary persistant variables that can be passed between functions ( similar to static variables / functions )

    // base is the amount of pixles in each grid square, used to scale canvas elements if needed
    base = base === null || base === undefined ? 64 : base;

    // set/get width and height dimensions for the game map
    if (dimensions === null || dimensions === undefined) {
        w = 64;
        h = 64;
    } else {
        width = dimensions.width;
        height = dimensions.height;
        w = width / 15;
        h = height / 10;
    }

    var animationObjects = app.animationRepo(width, height);

    // creates a small canvas
    var smallCanvas = function () {
        var smallCanvas = document.createElement('canvas');
        smallCanvas.width = w * 2;
        smallCanvas.height = h * 2;
        return smallCanvas;
    };

    // caches drawings so they can be recalled without redrawing ( performance boost in certain situations )
    var cacheDrawing = function (name) {

        // create a canvas
        var canvas = smallCanvas();

        // get context	
        var cacheCanvas = canvas.getContext(app.ctx);

        // set the position of the image to the center of the cached canvas							
        var position = setPosition((w / 2), (h / 2));


        // draw image to cache to canvas
        animationObjects[name](cacheCanvas, position);

        // cache the canvas with drawing on it ( drawings cached by their class name )
        app.cache[name] = canvas;

    };

    // calculates the base for scaling
    var calcBase = function (d) {
        return d / base;
    };

    // scales items by calculating their base size multplied by 
    var scale = function (type, value) {
        var multiple = type === 'w' ? calcBase(w) : calcBase(h);
        return value === null || value === undefined ? multiple : multiple * value;
    };

    // creates a friendlier interface for drawing and automatically scales drawings etc for screen size
    var setPosition = function (x, yAxis) {

        var y = yAxis + h;

        return {
            // u = right, will move right the amonut of pixles specified
            r: function (number) {
                return x + scale('w', number);
            },
            // u = left, will move left the amonut of pixles specified
            l: function (number) {
                return x - scale('w', number);
            },
            // u = down, will move down the amonut of pixles specified
            d: function (number) {
                return y + scale('h', number);
            },
            // u = up, will move up the amonut of pixles specified
            u: function (number) {
                return y - scale('h', number);
            },
            // x is the x axis
            x: x,
            // y is the y axis
            y: y,
            // width
            w: w,
            // height
            h: h,
            // random number generator, used for grass background texture
            random: function (min, max) {
                return (Math.random() * (max - min)) + min;
            }
        };
    };

    // offset of small canvas drawing ( since the drawing is larger then single grid square it needs to be centered )
    var smallX = w / 2;
    var smallY = h / 2;

    return {

        // cache all images for performant display ( one drawing to rule them all )
        cache: function () {
            this.cached = true;
            return this;
        },

        // place drawings where they belong on board based on coorinates
        coordinate: function (objectClass, object, coordinet) {

            var s = {}; // holder for scroll coordinates
            var name; // holder for the name of an object to be drawn
            var scroll = app.settings.cursor.scroll; // scroll positoion ( map relative to display area )
            var wid = (w * 16); // display range
            var len = (h * 11);

            // get the coordinates for objects to be drawn
            coordinates = coordinet === undefined ? app[objectClass][object] : coordinet;

            // for each coordinates
            for (var c = 0; c < coordinates.length; c += 1) {

                // var s modifys the coordinates of the drawn objects to allow scrolling behavior
                // subtract the amount that the cursor has moved beyond the screen width from the 
                // coordinates x and y axis, making them appear to move in the opposite directon
                s.x = (coordinates[c].x * w) - (scroll.x * w);
                s.y = (coordinates[c].y * h) - (scroll.y * h);

                // only display coordinates that are withing the visable screen
                if (s.x >= 0 && s.y >= 0 && s.x <= wid && s.y <= len) {

                    // get the name of the object to be drawn on the screen
                    name = objectClass === 'map' && coordinet === undefined ? coordinates[c].type : object;

                    // if it is specified to be cached
                    if (this.cached) {

                        // check if it has already been cached and cache the drawing if it has not yet been cached
                        if (app.cache[name] === undefined) cacheDrawing(name);

                        // draw the cached image to the canvas at the coordinates minus 
                        // its offset to make sure its centered in the correct position
                        canvas.drawImage(app.cache[name], s.x - smallX, s.y - smallY);

                    } else {

                        // if it is not cached then draw the image normally at its specified coordinates
                        animationObjects[name](canvas, setPosition(s.x, s.y));
                    }
                }
            }
        },

        // fills background
        background: function (object) {
            for (var x = 0; x < app.map[object].x; x += 1) {
                for (var y = 0; y < app.map[object].y; y += 1) {
                    animationObjects[app.map[object].type](canvas, setPosition(x * w, y * h));
                }
            }
        },

        hudCanvas: function (object, objectClass) {

            // draw a backgrond behind terrain and building elements
            if (objectClass !== 'unit') animationObjects.plain(canvas, setPosition(smallX, smallY));

            if (app.cache[object]) { // use cached drawing if available
                canvas.drawImage(app.cache[object], 0, 0);
            } else {
                animationObjects[object](canvas, setPosition(smallX, smallY));
            }
        }
    };
};

/* --------------------------------------------------------------------------------------------------------*\
	app.animationRepo is the default object repo the 'm' parameter is a method passed from 
	app.draw that scales the coordinates of the drawings to fit any grid square size, as 
	well as providing some functionality like random(), which generates random numbers within the specified 
	range of numbers. 
	'm' does not have to be used
	default is a base of 64 ( 64 X 64 pixles ), the base is set as a perameter of initializing the 
	app.draw();
\*---------------------------------------------------------------------------------------------------------*/

app.animationRepo = function (width, height) {
    return {
        cursor: function (canv, m) {
            // size of cursor corners
            var size = 15;
            canv.strokeStyle = "black";
            canv.fillStyle = "#fff536";
            canv.beginPath();
            // bottom left
            canv.moveTo(m.l(3), m.u(size));
            canv.lineTo(m.l(3), m.d(3));
            canv.lineTo(m.r(size), m.d(3));
            canv.lineTo(m.l(3), m.u(size));
            // bottem right
            canv.moveTo(m.r(67), m.u(size));
            canv.lineTo(m.r(67), m.d(3));
            canv.lineTo(m.r(64 - size), m.d(3));
            canv.lineTo(m.r(67), m.u(size));
            // top right
            canv.moveTo(m.r(67), m.u(64 - size));
            canv.lineTo(m.r(67), m.u(67));
            canv.lineTo(m.r(64 - size), m.u(67));
            canv.lineTo(m.r(67), m.u(64 - size));
            // bottem left
            canv.moveTo(m.l(3), m.u(64 - size));
            canv.lineTo(m.l(3), m.u(67));
            canv.lineTo(m.r(size), m.u(67));
            canv.lineTo(m.l(3), m.u(64 - size));
            canv.fill();
            canv.stroke();
            return canv;
        },
        highlight: function (canv, m) {
            canv.fillStyle = "rgba(255,255,255,0.3)";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            return canv;
        },
        target: function (canv, m) {
            canv.fillStyle = "rgba(0,255,0,0.3)";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            return canv;
        },
        path: function (canv, m) {
            canv.fillStyle = "rgba(255,0,0,0.5)";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            return canv;
        },
        base: function (canv, m) {
            canv.fillStyle = "rgba(0,0,200,0.9)";
            canv.beginPath();
            canv.lineTo(m.r(m.w - 5), m.y - 5);
            canv.lineTo(m.r(m.w - 5), m.u(m.h + 5));
            canv.lineTo(m.x - 5, m.u(m.h + 5));
            canv.lineTo(m.x - 5, m.y - 5);
            canv.fill();
            return canv;
        },
        hq: function (canv, m) {
            canv.fillStyle = "rgba(80,0,20,0.9)";
            canv.beginPath();
            canv.lineTo(m.r(m.w - 5), m.y - 5);
            canv.lineTo(m.r(m.w - 5), m.u(m.h + 5));
            canv.lineTo(m.x - 5, m.u(m.h + 5));
            canv.lineTo(m.x - 5, m.y - 5);
            canv.fill();
            return canv;
        },
        // dimensions 
        plain: function (canv, m) {
            canv.fillStyle = "#d6f71b";
            //canv.strokeStyle = "black";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            //canv.stroke();
            canv.strokeStyle = "#f2ff00";
            canv.beginPath();
            for (var rand = 0; rand < width; rand += 1) {
                var randomHeight = m.random(m.y, m.u(m.h));
                var randomWidth = m.random(m.x, m.r(m.w));
                canv.moveTo(randomWidth, randomHeight);
                canv.lineTo(randomWidth + 4, randomHeight);
            }
            canv.stroke();
            //canv.strokeStyle = "black";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            //canv.stroke();
            return canv;
        },
        tallMountain: function (canv, m) {
            canv.strokeStyle = "#41471d";
            canv.fillStyle = "#ff8800";
            canv.beginPath();
            canv.moveTo(m.x, m.u(20));
            canv.lineTo(m.x, m.u(30));
            canv.lineTo(m.r(5), m.u(45));
            canv.quadraticCurveTo(m.r(15), m.u(50), m.r(15), m.u(50));
            canv.moveTo(m.r(10), m.u(35));
            canv.lineTo(m.r(20), m.u(67));
            canv.quadraticCurveTo(m.r(25), m.u(78), m.r(52), m.u(67));
            canv.lineTo(m.r(62), m.u(34));
            canv.quadraticCurveTo(m.r(68), m.u(20), m.r(38), m.y);
            canv.quadraticCurveTo(m.r(22), m.y, m.x, m.u(20));
            canv.fill();
            canv.stroke();
            return canv;
        },
        shortMountain: function (canv, m) {
            canv.strokeStyle = "#41471d";
            canv.fillStyle = "#ff8800";
            canv.beginPath();
            canv.moveTo(x, m.u(10));
            canv.lineTo(m.r(20), m.u(m.h));
            canv.lineTo(m.r(40), m.u(m.h));
            canv.lineTo(m.r(m.w), m.u(10));
            canv.quadraticCurveTo(m.r(31), m.d(9), m.r(5), m.u(10));
            canv.quadraticCurveTo(m.r(20));
            canv.fill();
            canv.stroke();
            return canv;
        },
        tree: function (canv, m) {
            canv.strokeStyle = "black";
            canv.fillStyle = "rgb(41,148,35)";
            canv.beginPath();
            //bottom
            canv.moveTo(m.r(21), m.u(15));
            canv.quadraticCurveTo(m.r(42), m.d(1), m.r(60), m.u(15));
            canv.quadraticCurveTo(m.r(74), m.u(25), m.r(59), m.u(33));
            canv.moveTo(m.r(21), m.u(15));
            canv.quadraticCurveTo(m.r(16), m.u(20), m.r(29), m.u(30));
            //middle
            canv.moveTo(m.r(27), m.u(30));
            canv.quadraticCurveTo(m.r(42), m.u(20), m.r(60), m.u(34));
            canv.quadraticCurveTo(m.r(58), m.u(34), m.r(50), m.u(43));
            //canv.quadraticCurveTo(m.r(58),m.u(38), m.r(50), m.u(43));
            canv.moveTo(m.r(27), m.u(30));
            canv.quadraticCurveTo(m.r(34), m.u(34), m.r(37), m.u(40));
            //top
            canv.moveTo(m.r(35), m.u(40));
            canv.quadraticCurveTo(m.r(44), m.u(35), m.r(51), m.u(41));
            canv.quadraticCurveTo(m.r(52), m.u(43), m.r(42), m.u(50));
            canv.moveTo(m.r(35), m.u(40));
            canv.quadraticCurveTo(m.r(40), m.u(42), m.r(42), m.u(50));
            canv.fill();
            canv.stroke();
            return canv;
        },
        infantry: function (canv, m) {
            canv.fillStyle = "blue";
            canv.beginPath();
            canv.arc(m.r(32), m.u(32), 10, 0, 2 * Math.PI);
            canv.fill();
            return canv;
        },
        apc: function (canv, m) {
            canv.fillStyle = "orange";
            canv.beginPath();
            canv.arc(m.r(32), m.u(32), 10, 0, 2 * Math.PI);
            canv.fill();
            return canv;
        }
    };
};