(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    Background.js controls the weather

\* --------------------------------------------------------------------------------------*/

app.calcualte = require('../game/calculate.js');
Terrain = require('../objects/terrain.js');

module.exports = {
	pos:{x:0, y:0},
	rand: false,
	cat:'random',
	background: new Terrain('plain', {x:0, y:0}),
	category: function () { return this.cat; },
	type: function () { return this.background.type(); },
	defense: function () { return this.background.defense(); },
	name: function () { return this.background.name(); },
	alias: function (name) {
		// var alias = {
		// 	clear:'plain',
		// 	rain:'plain',
		// 	snow:'snow'
		// } [name];
		return name === 'snow' ? 'snow' : 'plain'; 
	},
	set: function (type) {
		console.log(type);

		this.cat = type;

		if (type === 'random') {
			this.rand = true;
			return this.change();
		}

		if (!app.game.started())
			this.rand = false;

		if (type === 'rain') {

			// app.effects.rain();
			return this.background = new Terrain('plain', this.pos);
		}
		return this.background = new Terrain(this.alias(type) || type, this.pos); 
	},
	random: function () { return this.rand; },
	weighted: function (chance) { 
		var calculated = app.calculate.random(chance);
		console.log('uncomment this when weather graphics are set up and ready');
		// if(calculated < 4)
		// 	return 'snow';
		// else if(calculated < 6)
		// 	return 'rain';
		return 'plain';
	},
	change: function () {
		if(!app.game.started() && app.user.first() || app.user.turn()) {
			var type = this.weighted(20);
			if(app.game.started() && app.user.turn())
				socket.emit('background', type);
			if(type === 'rain') {
				//app.effects.rain();
				return background = new Terrain('plain', this.pos);
			}
			return this.background = new Terrain(this.alias(type), this.pos);
		}
	}
};
},{"../game/calculate.js":22,"../objects/terrain.js":75}],2:[function(require,module,exports){
app.maps = require ("../controller/maps.js");
app.effect = require("../game/effects.js");
app.click = require("../input/click.js");
app.touch = require("../input/touch.js");
app.type = require("../effects/typing.js");

module.exports = {

	active: function () { return this.a; },
	activate: function () { this.a = true; },
	deactivate: function () {this.a = false;},
	save: function (player) {
		this.sender = player;
		player.confirm();
		this.display(player.name().uc_first() + " wants to save the game and continue later, is that ok? "); 
	},
	evaluate: function () {
		var response = this.response;
		if (response) {

			if (app.key.pressed(["left","right"]))
				Select.horizontal(response.deHighlight()).highlight();

			if (app.key.pressed(["enter","esc"])) {
				var answer = app.key.pressed(app.key.esc()) ? false : (response.id() === "yes");
				app.input.remove();
				this.a = false;
				socket.emit("confirmationResponse", {
					answer: answer, 
					to: this.sender.id()
				});
				if (!answer) app.players.unconfirm();
			}
		}
	},
	display: function (message, inactive) {
		var scope = this;
		var text = app.footer.display(), description = app.input.descriptions();
		app.game.screen().appendChild(text.parentNode);
		app.input.activate();
		app.type.letters(description, message, function (element) {
			var yes = document.createElement("span"); 
			var no = document.createElement("span");
			yes.innerHTML = " Yes ";
			no.innerHTML = " No ";
			yes.setAttribute("id","yes");
			no.setAttribute("id","no");
			app.touch(yes).element();
			app.click(no).element();
			description.appendChild(yes);
			description.appendChild(no);
			scope.response = new UList(description).setElements([yes, no]).highlight();
			if (!inactive) app.confirm.activate();
		});
	},
	player: function (answer, player) {
		var i, message, players = app.players.other();

		if (answer) {
			player.confirm();
			message = player.name().uc_first() + " agrees to continue later. ";
		} else return this.no(player);

		var waiting = players.filter(function (p) {return !p.confirmed();});

		app.input.message(message);

		return waiting.length ? this.waiting(waiting, message) : this.yes();                                   
	},
	yes: function () { 
		alert("Save the game!!: "+app.input.value()); 
		app.save.recieved();
		app.game.end(true);
	},
	no: function (player) { 
		app.input.message(player.name().uc_first() + " wants to finish the game.");
		app.players.unconfirm(); 
		app.save.recieved();
	},
	waiting: function (players) { app.input.message("Waiting for a response from " + app.players.names(players)); }
};
},{"../controller/maps.js":5,"../effects/typing.js":19,"../game/effects.js":24,"../input/click.js":27,"../input/touch.js":29}],3:[function(require,module,exports){
app = require('../settings/app.js');
app.map = require('../controller/map.js');
app.options = require('../menu/options/optionsMenu.js');
app.calculate = require('../game/calculate.js');
app.effect = require('../game/effects.js');
app.animate = require('../game/animate.js');
app.key = require('../input/keyboard.js');
app.game = require('../game/game.js');
app.feature = require('../objects/featureHud.js');

module.exports = function () {

    var editing, selected, deleting, moved, active, enter, hidden, position = {x:7, y:5};

    var allowed = function (range) {
        if (!range) range = app.range.get();
        for (var pos, o = 0; o < range.length; o += 1)
            if ((pos = range[o].position()).x == position.x && pos.y == position.y)
                return true;
        return false;
    };
    
    var canMove = function (axis, comparison, operation) {
        var target, range, move = position[axis] + operation;
        if (comparison <= 0 ? move >= 0 : move < comparison){
            position[axis] += operation;
            if (selected && allowed()) {
                selected.movementRange(app.calculate.distance(selected.position(), position))
                app.path.clear().find(selected, position);
                app.animate('effects');
            }
            return position;
        }
        return false;
    };

    // check which side of the screen the cursor is on
    var checkSide = function (axis) {
        var dimensions = app.screen.dimensions()[axis]; // screen dimensions
        var screenPosition = app.screen.position()[axis]; // position of the screen
        if (position[axis] > screenPosition + (dimensions / 2))
            return true;
        return false;
    };

    return {
        editing: function () { editing = true; },
        clear: function () {selected = false, hidden = false, moved = false;},
        hide: function () { 
            hidden = true; 
            app.animate('cursor');
        },
        show: function () { 
            hidden = false; 
            app.animate('cursor');
        },
        active: function () {return active; },
        hidden: function () { return hidden; },

        // returns cursor location ( left or right side of screen )
        side: function (axis) {
            if (checkSide(axis)) return axis === 'x' ? 'right' : 'bottom';
            return axis === 'x' ? 'left' : 'top';
        },
        setSelected: function (s) { selected = s; },
        hovered: function () { return app.map.occupantsOf(position); },
        setPosition: function (p) { 
            if(!isNaN(p.x + p.y)) position = {x:p.x, y:p.y}; 
            else throw new Error('Position must have an x and a y axis that are both numeric', 'cursor');
        },
        position: function () { return {x:position.x, y:position.y}; },
        moved: function () { return moved; },
        deselect: function () { selected = false; },
        selected: function () { return selected; },
        select: function (element) {

            if (hidden || deleting) return false;

            // set selection
            if (element) return selected = element;

            // if its the users turn and theyve pressed enter
            if ((app.key.pressed(app.key.enter()) || app.key.pressed(app.key.range()) || app.key.keyUp(app.key.range())) && app.user.turn() && !app.target.active()) {

                var a, hovered = app.map.top(position);

                if (!active && app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter())) {

                    // if something was selected
                    if (selected && allowed() && (hovered.type() !== 'unit' || selected.canCombine(hovered) || hovered === selected)){

                        // if selection is finished then continue
                        if(selected.execute(position))

                            // deselect
                            return selected = false;

                    // if there is nothing selected
                    } else if (!selected && !app.options.active() && app.user.owns(hovered)){
                        
                        // save the selected element and select it
                        if ((selected = hovered).select()) {

                            app.hud.hide();
                        
                        } else selected = false;
                    }

                } else if (!selected && (hovered.type() === 'unit' || app.key.keyUp(app.key.range()))) {
                    if (!active) active = hovered;
                    if (hovered === active && active.showAttackRange) {
                        active = active.showAttackRange();
                    } else {
                        active = active.displayingRange = false;
                        app.attackRange.clear();
                        app.effect.refresh(); 
                    }
                }
            }
            // handle attack range display
            return this;
        },
        displayPosition: function () { return true; },
        copy: function () {
            if (editing && app.key.pressed(app.key.copy()) && !app.build.active())
                app.feature.set((selected = app.map.top(position))); 
        },
        build: function () { 
            if (app.key.pressed(app.key.enter()) && !app.build.active() && app.map.build(selected, position))
                app.animate(['unit', 'building', 'terrain']);
        },
        selectMode: function () { deleting = false; },
        deleteMode: function () { deleting = true; },
        deleting: function () { return deleting; },
        deleteUnit: function () { 
            if (app.key.pressed(app.key.enter())) {
                app.key.undo(app.key.enter());
                var hovered = app.map.top(position);
                if (hovered.type() === 'unit') {
                    app.map.removeUnit(hovered);
                    socket.emit('delete', hovered);
                }
            }
        },
        move: function (emitted) {

            moved = false;

            if ((!selected || selected.type() !== 'building' ||  app.editor.active()) && !app.options.active() && !hidden && app.user.turn() || emitted) {

                var d = app.map.dimensions(), pressed;

                if (app.key.pressed(app.key.up()) && canMove('y', 0, -1)) 
                    pressed = app.key.up();

                if (app.key.pressed(app.key.down()) && canMove('y', d.y, 1)) 
                    pressed = app.key.down();

                // player holding left
                if (app.key.pressed(app.key.left()) && canMove('x', 0, -1)) 
                    pressed = app.key.left();

                // Player holding right
                if (app.key.pressed(app.key.right()) && canMove('x', d.x, 1))
                    pressed = app.key.right();

                if(pressed){
                    if (editing) app.feature.set(selected);
                    if (app.user.turn()) socket.emit('cursorMove', pressed);
                    moved = true;
                    app.screen.scroll();
                    app.animate('cursor');
                };
            }
            return this;
        }
    };
}();
},{"../controller/map.js":4,"../game/animate.js":20,"../game/calculate.js":22,"../game/effects.js":24,"../game/game.js":25,"../input/keyboard.js":28,"../menu/options/optionsMenu.js":47,"../objects/featureHud.js":61,"../settings/app.js":79}],4:[function(require,module,exports){
app = require('../settings/app.js');
app.settings = require('../settings/game.js');
app.players = require('../controller/players.js');
app.units = require('../definitions/units.js');
app.animate = require('../game/animate.js');

Validator = require('../tools/validator.js');
Matrix = require('../tools/matrix.js');
Terrain = require('../objects/terrain.js');
Building = require('../objects/building.js');
Unit = require('../objects/unit.js');
Position = require('../objects/position.js');

module.exports = function () {

    var error, focused, longestLength, map = {},
    matrix, buildings = [], terrain = [], units = [],
    color = app.settings.playerColor, allowedUnits, allowedBuildings;
    // var validate = new Validator('map');

    var restricted = {
        sea: ['sea', 'reef', 'shoal'],
        reef: this.sea,
        shoal: this.sea,
        road:['road'],
        pipe:['pipe'],
        bridge: ['bridge'],
        river:['river']
    };

    var occupants = function (position) {

        var on = {}, building, unit, t, length = app.calculate.longestLength([terrain, buildings, units]);

        // look through arrays and check if they are at the current or passed grid point
        for (var i = 0; i < length; i += 1) {
            
            building = buildings[i], unit = units[i], t = terrain[i];
            
            // if an object is found at the same grid point return it 
            if (unit && unit.on(position)) on.unit = unit;
            if (building && building.on(position)) on.building = building;
            if (t && t.on(position)) on.terrain = t;
        }

        if (!on.terrain) on.terrain = new Terrain('plain', new Position(position.x, position.y));
        return on;
    };

    var detectIndex = function (element) {
        var elements;
        switch (element.type()) {
            case 'unit': elements = units;
                break;
            case 'building': elements = buildings;
                break;
            default: elements = terrain;
        }
        return getIndex(element, elements);
    };

    var getIndex = function (element, elements) {
        var id = element.id !== undefined;
        if (element) for (var i = 0; i < elements.length; i += 1)
            if (((compare = elements[i]) && id && compare.id === element.id) || !id && compare.on(element.position()))
                return i;
        return false;
    };

    var refresh = function (hide) { app.animate('unit', hide); };

    var neighbors = function (position) {

        var neighbors = [];
        var positions = position.neighbors();

        for (var neighbor, i = 0; i < 4; i += 1) {
            neighbor = matrix.position(positions[i]);
            if (neighbor) neighbors.push(neighbor);
        }
        return neighbors;
    };

    var addUnit = function (unit) { 
        units.push(matrix.insert(unit));
        refresh();
    };

    var deleteElement = function (element) {

        if (element.type() == 'unit') {
            allowedUnits += 1;
            app.map.removeUnit(element);
        
        } else if (element.type() == 'building') {
            allowedBuildings += 1;
            buildings.splice(detectIndex(element), 1, matrix.remove(element));
        
        } else if (isSea(element))
            terrain.splice(detectIndex(element), 1, matrix.insert(adjustOrientation(new Terrain('sea', element.position()))));

        else matrix.remove(position);
    };

    var facing = function (element) {

        var allowed, position = element.position();
        var neighbors = position.neighbors();
        var elem, i, open = {};

        if (!(allowed = restricted[element.name().toLowerCase()])) 
            return '';

        for (i = 0; i < neighbors.length; i += 1) {
            elem = app.map.top(neighbors[i]);
            if (allowed.hasValue(elem.name().toLowerCase()))
                open[neighbors[i].orientation] = true;
        }

        if (open.north && open.south && open.west && open.east)
            return '';

        if(open.north){
            if (open.south && !open.east && !open.west) return 'verticle';
            if (open.west) return open.east ? 'north' : 'northWest';
            else if (open.east) return 'northEast';
            else return 'closedNorth';
        } else if(open.east) {
            if (!open.south) return open.west ? 'horazontal' : 'closedEast';
            return 'southEast';
        } else if (open.south) return open.west ? 'southWest' : 'closedSouth';
        else if (open.west) return 'closedWest'
        else return 'single';
    };
    
    var adjustOrientation = function (element) {
        element.d = facing(element) + element.name();
        return element;
    };

    var adjustSurroundings = function (element) {
        var position = element.position();
        var surroundings = position.surrounding();
        for (var neighbor, name, i = 0; i < surroundings.length; i += 1){
            neighbor = matrix.position(surroundings[i]);
            if((name = neighbor.name().toLowerCase()) === 'shoal' || element.name === 'reef' && !isSea(neighbor))
                deleteElement(neighbor, 'sea');
            else if((adjusted = adjustOrientation(neighbor))){
                terrain.splice(detectIndex(neighbor), 1, adjusted);
                if(matrix.get(neighbor).type() !== 'unit')
                    matrix.insert(adjusted);
            }
        }
    };

    var isSea = function (element) { return restricted.sea.hasValue(element.name().toLowerCase()); };
    var isBeach = function (element) {
        if (isSea(element))
            var neighbors = element.position().neighbors();
            for (var i = 0; i < neighbors.length; i += 1)
                if (!isSea(neighbors[i]))
                    return true;
        return false;
    };

    var buildUnit = function (u, p, type, existing) {
        var unit = new Unit(u.player(), new Position(p.x, p.y), u.name().toLowerCase());
        if (existing.unit && unit.canBuildOn(existing.unit.occupies())){
            allowedUnits -= 1;
            return units.splice(detectIndex(existing.unit), 1, matrix.insert(unit));
        } else if (existing.building && unit.canBuildOn(existing.building) || existing.terrain && unit.canBuildOn(existing.terrain)) {
            allowedUnits -= 1;
            return addUnit(unit);
        } 
        return false;
    };

    var indexOfExistingHq = function (hq) {
        for (var i = 0; i < buildings.length; i += 1)
            if(buildings[i].name().toLowerCase() === 'hq' && hq.owns(buildings[i]))
                return i;
        return false;
    };

    var buildBuilding = function (b, p, type, existing) {

        var hq, t, building = new Building(b.name().toLowerCase(), new Position(p.x, p.y), buildings.length, b.player());

        if (building.name().toLowerCase() === 'hq' && (hq = indexOfExistingHq(building)) !== false){
            matrix.remove(buildings[hq]);
            buildings.splice(hq, 1);
        }

        if (existing.building)
            buildings.splice(detectIndex(existing.building), 1, building);
        else buildings.push(building);

        if (existing.terrain.type() !== 'plain') {
            terrain.splice(detectIndex(existing.terrain), 1);
            var i, n = neighbors(new Position(p.x,p.y));
            for (i = 0; i < n.length; i += 1)
                terrain.splice(detectIndex(n[i]), 1, adjustOrientation(n[i]));
        }

        if (!existing.unit)
            matrix.insert(building);

        allowedBuildings -= 1;
        return building;
    };

    var buildTerrain = function (e, p, type, existing) {

        if(type === 'river' && isSea(existing.terrain) || type === 'shoal' && !isBeach(existing.terrain))
            return false;

        var element = adjustOrientation(new Terrain(e.draw(), new Position(p.x, p.y)));
        element.index = terrain.length;
        adjustSurroundings(element);
    
        if(existing.terrain.type() !== 'plain')
            terrain.splice(detectIndex(existing.terrain), 1, element);
        else terrain.push(element);
        
        if (existing.building)
            buildings.splice(detectIndex(existing.building), 1);
        if (existing.unit && !existing.unit.canBuildOn(element)){
            units.splice(detectIndex(existing.unit), 1);
            return matrix.insert(element);
        } else if (!existing.unit) 
            return matrix.insert(element);
        return element;
    };

    return {
        getNeighbors: neighbors,
        detectIndex: detectIndex,
        getIndex: getIndex,
        occupantsOf: occupants,
        addUnit: addUnit,
        id: function () { return map.id; },
        name: function () { return map.name; },
        players: function () { return map.players; },
        getUnit: function (unit) { return units[getIndex(unit, units)]; },
        category: function () { return map.category; },
        dimensions: function () { return map.dimensions; },
        background: function () { return background; },
        setBackground: function (type) { background = new Terrain(type); },
        buildings: function () { return buildings; },
        terrain: function () { return terrain; },
        insert: function (element) { return matrix.insert(element); },
        units: function () { return units; },
        top: function (position, replace) { 
            return matrix.position(position, replace); 
        },
        get: function () { return map; },
        set: function (selectedMap) { map = selectedMap; },
        initialize: function (editor) {

            var dim = map.dimensions, product = (dim.x * dim.y);

            matrix = new Matrix(dim);

            allowedBuildings = Math.ceil(product/10) - 1;
            allowedUnits = Math.ceil(product/12.5);

            terrain =  map.terrain.map(function (t) {
                return matrix.insert(new Terrain(t.type, t.position));
            });
            buildings = map.buildings.map(function (b, index) {
                return matrix.insert(
                    new Building(
                        b.type,
                        b.position,
                        index,
                        (editor ? b.player : app.players.number(b.player))
                    )
                );
            });
            units = map.units.map(function (u) {
                return matrix.insert(
                    new Unit(
                        (editor ? u.player : app.players.number(u.player)), 
                        u.position, 
                        app.unit[u.type]
                    )
                );
            });
        },
        moveUnit: function (unit, target) {
            var e, current = units[getIndex(unit, units)];

            if (current) matrix.remove(current);
            else current = unit;

            current.setPosition(target);

            if(!(e = matrix.position(target)) || e.type() !== 'unit')
                matrix.insert(current);

            refresh();
            return current;
        },
        removeUnit: function (unit){
            var i = getIndex(unit, units);
            if(i !== undefined) unit = units.splice(i, 1)[0];
            if((e = matrix.get(unit)) && e.type() === 'unit' && e.id === unit.id)
                matrix.remove(unit);
            refresh();
            return unit;
        },
        attackUnit: function (unit, damage) {
            units[getIndex(unit, units)].takeDamage(unit.health() - damage);
            matrix.get(unit).takeDamage(unit.health() - damage);
        },
        changeOwner: function (building, player) {
            building.setPlayer(player);
            building.restore();
            var b = matrix.get(building)
            b = b.type() === 'unit' ? b.occupies() : b;
            if(b.type() === 'building')   
                b.setPlayer(player).restore();
            else throw new Error('Attempted capture on a non building map element');
            refresh();
        },
        takeHQ: function (hq) {
            var building, index = hq.index();
            buildings.splice(index, 1, (building = new Building('city', hq.position(), index, hq.player())));
            Matrix.insert(building);
        },
        close: function(element) { 
            element.closed = true;
            return matrix.insert(element); 
        },
        printMatrix:function () {matrix.log();},
        clean: function (elements) { 
            if (elements) for (var element, i = 0; i < elements.length; i += 1) {
                element = matrix.get(elements[i]);
                element.p = undefined;
                element.g = undefined;
                element.f = undefined;
                element.closed = false;
                matrix.insert(element);
            }
            matrix.clean();
            return elements;
        },
        focus: function () {
            if (app.key.keyUp(app.key.map()) && app.key.undoKeyUp(app.key.map())){
                app.hud.show();
                app.coStatus.show();
                app.cursor.show();
                refresh();
                focused = false;
            }else if(app.key.pressed(app.key.map()) && app.key.undo(app.key.map()) && !focused) {
                app.hud.hide();
                app.coStatus.hide();
                app.cursor.hide();
                refresh(true);
                focused = true;
            }
            refresh();
        },
        focused: function () { return focused; },
        refresh: function () {app.animate(['unit','building']);},
        build: function (element, p) {
            var position = new Position(p.x, p.y);
            var type = element.type();
            var existing = occupants(position);
            switch (type) {
                case 'unit': return buildUnit(element, position, type, existing);
                case 'building': return buildBuilding(element, position, type, existing);
                default: return buildTerrain(element, position, type, existing);
            }
        },
        surplus: function () { return { building: allowedBuildings, unit: allowedUnits }; },
        displaySurplus: function (){},
        displayPlayers: function (){},
        raw: function (player) {
            return {
                player: player,
                buildings: buildings.map(function (building) {return building.properties();}),
                units: units.map(function (unit) {return unit.properties();}),
                background: background
            };
        }
    };
}();
},{"../controller/players.js":7,"../definitions/units.js":13,"../game/animate.js":20,"../objects/building.js":57,"../objects/position.js":70,"../objects/terrain.js":75,"../objects/unit.js":77,"../settings/app.js":79,"../settings/game.js":81,"../tools/matrix.js":89,"../tools/validator.js":93}],5:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    Maps.js controls the saving and retrieving of maps

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.settings = require('../settings/game.js');
app.request = require('../tools/request.js');
app.game = require('../game/game.js');

Validator = require('../tools/validator.js');
Map = require('../objects/map.js')

module.exports = function () {

	var error, maps, keys, change, index, type = 'map', category;
	var validate = new Validator('maps'), categories = ['two'];

	var types = {
		map:{
			url:'maps/type',
			items:[],
			elements:{
	            section: 'mapSelectScreen',
	            div:'selectMapScreen',
	            li:'mapSelectionIndex',
	            type:'map'
	        }
		},
		game:{
			url:'games/open',
			items:[],
			elements: {
	            section: 'gameSelectScreen',
	            div:'selectGameScreen',
	            li:'mapSelectionIndex',
	            type:'game',
	            index:'Index',
	            attribute:'class',
	            url:'games/open',
	            properties: app.settings.categories
	        }
        }
	},

	byCategory = function (cat, callback) {
		if (cat && cat !== category) {
			maps = [], keys = [], category = cat;
	        app.request.get(category, types[type].url, function (response) {
	            if (response && !response.error) {
	            	maps = types[type].items = response;
	            	keys = Object.keys(response);
	            	if (callback) callback (maps);
	            }
	           	change = true;
	        });
	    }
       	return this;
    },

    format = function (map) { 
    	if(map) 
	    	return map.map ? map :
	    	new Map(
	    		map.id,
	    		map.name,
	    		map.players,
	    		map.dimensions,
	    		map.terrain,
	    		map.buildings,
	    		map.units
	    	);
	    else return {};
    },

    byIndex = function (ind) {
		index = ind;
		var m = sub(format(maps[keys[ind]]));
		return m.map ? m.map : m;
	},
    
    sub = function (map) { return maps.length ? map : {}; };

    var elementExists = function (id, element, parent){
        var exists = document.getElementById(id);
        if(exists){
            parent.replaceChild(element, exists);
        }else{
            parent.appendChild(element);
        }
    };

    var buildingElements = {section:'buildingsDisplay', div:'numberOfBuildings'}

    byCategory(categories[0]);

	return {
		byIndex:byIndex,
		type: function (t) {
			if (type !== t) {
				type = t;
				category = false;
				byCategory('two');
			}
			return this;
		},
		empty: function () { return !maps.length; },
		category: function () { return category; },
		setCategory:function (category) {return byCategory(category);},
		all: function (){ return maps; },
    	byId: function (id) {
	        for (map in maps)
	            if(maps[map].id == id)
	            	return format(maps[map]);
	        return false;
    	},
    	first: function () { return sub(maps[keys[0]]); },
    	add:function(room){
            if (category === room.category) {
            	var games = types.game.items;
            	games[room.name] = room;
            	keys = Object.keys(games);
            	return change = true;
            }
            return false
        },
        remove: function(room){
        	var games = types.game.items;
	        if (category === room.category && games[room.name]) {
	            delete games[room.name];
	            keys = Object.keys(games);
	            change = true;
	            return room;
	        }
	        return false;
        },
        updated: function () { 
        	if (change) {
        		change = false;
        		return true; 
        	}
        },
        random: function () {
        	byCategory('two' || categories[app.calculate.random(categories.length - 1)], function (maps) {
        		app.map.set([app.calculate.random(maps.length - 1)]);
        	});
        },
        index: function () {return index;},
        info: function () { return app.calculate.numberOfBuildings(byIndex(index || 0));},
        clear: function () {maps = [], category = undefined, index = undefined;},
        screen: function () { return types[type].elements; },
        save: function (map, name) {

        	 if((error = validate.defined (app.user.email(), 'email') || (error = validate.map(map))))
        	 	throw error;

            app.request.post({
			    creator: app.user.email(),
			    name: name || map.name,
			    players: map.players,
			    category: map.category,
			    dimensions: map.dimensions,
			    terrain: map.terrain,
			    buildings: map.buildings,
			    background: map.background,
			    units: map.units
            }, 'maps/save', function (response) {
				console.log(response);
            	change = true;
            });
        }
        //getbyid: function (id) { app.request.get(id, 'maps/select', function (response) { app.map.set(response); }); },
	};
}();
},{"../game/game.js":25,"../objects/map.js":65,"../settings/app.js":79,"../settings/game.js":81,"../tools/request.js":90,"../tools/validator.js":93}],6:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\

    holds functions for the selection of game modes / logout etc.. <--- can be redone better

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.maps = require('../controller/maps.js');
app.user = require('../objects/user.js');
app.settings = require('../settings/game.js');
app.key = require('../input/keyboard.js');
app.testMap = require('../objects/testMap.js');
app.editor = require('../game/mapEditor.js');
app.join = require('../menu/join.js');
Settings = require('../menu/settings.js');
Teams = require('../menu/teams.js');
Modes = require('../menu/modes.js');

module.exports = function () {

    var sent, boot, active, game = {};
    var exitSetupScreen = function () {
        var ss = document.getElementById('setupScreen');
        if (ss) ss.parentNode.removeChild(ss);                
    };
    
    return {
        boot: function () {boot = true},
        mode: function () {return Modes.select();},
        newgame: function () {

            // handle map selection
            if (!app.game.map()) {
                if (app.join.back()) return 'back';
                else app.game.setMap(app.join.map());
            }

            // handle settings selection
            if (app.game.map() && !app.game.settings()) {
                if (Settings.back()) app.game.removeMap().removeSettings();
                else app.game.setSettings(Settings.withArrows().select());
            }

            // handle co position and selection as well as joining the game
            if (app.game.map() && app.game.settings() && !app.game.players()) {
                if (Teams.back()) app.game.removeSettings();
                else app.game.setPlayers(Teams.withArrows().select());
            }

            if (app.game.map() && app.game.settings() && app.game.players()) {
                socket.emit('start', true);
                return true;
            }
        },
        continuegame:function () {alert('continue an old game is under construction. try new game or join new');},
        newjoin:function () {

            // handle game selection
            if (!app.game.map()) {
                if (app.join.back()) return 'back';
                else app.game.setMap(app.join.game());
            }

            if (app.game.map() && !app.game.started()) {
                if (Teams.back()) app.game.removeMap().removePlayers();
                else app.game.setPlayers(Teams.withArrows().select());
            }

            if (app.game.map() && app.game.started()) { // going to have to change to make up for first player start
                if (app.user.player() === app.players.first())
                    socket.emit ('start', true);
                return true;
            }
        },
        continuejoin: function () {alert('continue join is under construction, try new game or join new');},
        COdesign: function () {alert('design a co is under construction. try new game or join new');},
        mapdesign: function () {
            if (!game.map) {
                game.map = app.join.map();
                if (game.map) {
                    if (game.map === 'back') {
                        delete game.map;
                        return 'back';
                    }
                    app.players.add(app.user.raw());
                    app.cursor.editing();
                    return 'editor';
                }
            }
        },
        store: function () { alert('go to the game store is under construction. try new game or join new'); },
        joined: function () {return joined;},
        active: function () {return active;},
        activate: function () {active = true;},
        deactivate: function() {active = false;}
    };
}();
},{"../controller/maps.js":5,"../game/mapEditor.js":26,"../input/keyboard.js":28,"../menu/join.js":43,"../menu/modes.js":45,"../menu/settings.js":50,"../menu/teams.js":51,"../objects/testMap.js":76,"../objects/user.js":78,"../settings/app.js":79,"../settings/game.js":81}],7:[function(require,module,exports){
app = require('../settings/app.js');
app.map = require('../controller/map.js');
app.dom = require('../tools/dom.js');
app.key = require('../input/keyboard.js');
Player = require('../objects/player.js');
AiPlayer = require('../objects/aiPlayer.js');
Teams = require('../menu/teams.js');

module.exports = function () {

	var current, players = [], defeated = [], elements = [], ready,

    exists = function (player) {
        var id = player._current ? player._current.id : typeof (player.id) === 'function' ? player.id() : player.id;
        return players.findIndex(function (player) {return player.id() === id;});
    },

    addPlayer = function (player, number) {
        // check if player is already in and replace if they are
        if (players.length <= app.map.players()) {

            if (!player.isComputer) player = new Player(player);

            var number, index = exists(player);

            if (!isNaN(index)) {
                 players.splice(index, 1, player);
                 number = players[index].number();
            } else players.push(player);

            player.setNumber(number || (number = players.length));

            var element = Teams.playerElement(number);
            var value = element && !player.co ? element.co().value() : player.co;
            if (value) player.setCo(value);

            return true;
        }
        return false;
    },

    shiftPlayers = function (index) {
        var playerNumber = app.user.number();
        players.slice(index).forEach(function(player, index){
            var number = index + 1;
            player.setNumber(number);
            Teams.playerElement(number).co().changeCurrent(player.co.name.toLowerCase());
        });
        if (index < playerNumber) Teams.arrows.setPosition(Teams.playerElement(app.user.number()).co());
    },

    replacePlayer = function (player) {
        var index = exists(player);
        if (!isNaN(index)) {
            socket.emit('boot', players[index]);
            players[index] = new AiPlayer(index + 1);
        }
    },

    allReady = function () {
        var length = app.map.players();
        for(i = 0; i < length; i += 1)
            if (!players[i] || !players[i].ready()) 
                return false;
        return true;
    };

	return {
        replace: replacePlayer,
		changeProperty: function (p) { 
            var player = players[exists(p.player)];
            var property = p.property;
            var value = p.value;
            var element = Teams.playerElement(player.number());
            if (element && element[property]) 
                element[property]().changeCurrent(value);
            player.setProperty(property, value);
        },
        setElements: function (e) {elements = e;},
        addElement: function (e) {elements.push(e);},
        element: function (number) {return elements[number - 1]},
        empty: function () { return !players.length; },
        first: function () { return players[0]; },
        last: function () { return players[players.length - 1]; },
       	next: function () { return current === this.last() ? this.first() : players[current.number()]; },
        other: function () { return players.filter(function (player) {return player.id() !== app.user.id();});},
        all: function () { return players.concat(defeated); },
        length: function () { return players.length; },
        add: function (player) {
        	if (player.length) player.forEach(function (p, i) {addPlayer(p, i + 1);});
        	else addPlayer(player);
        	return current = players[0];
        },

        // check if all players are present and ready
		ready: function () { return ready; },
        checkReady:function(){ ready = allReady(); },
        get: function (object) {
            var id = typeof(object.id) === 'function' ? object.id() : object.id;
        	return this.all().find(function (player) {return player && id == player.id();});
        },
        reset: function () { players = []; return this;},    
        current: function () { return current; },
        setCurrent: function (player) { current = player; },
        defeated: function () { return defeated; },
        defeat: function (player) {
            defeated.concat(players.splice(player.index(), 1));
            if(app.players.length() <= 1) return app.game.end();
            alert('player '+player.number()+' defeated');
        },
        indexOf: function (object) {
            for (var i = 0; i < players.length; i += 1)
                if(players[i].id() === object.id())
                    return i;
            return false;
        },
        number: function (number) {
            if (app.game.started()) return players.find(function (player){return player.number() == number;});
            return (player = players[number - 1]) ? player : false;
        },
        names: function (players) {
            return players.reduce(function (prev, player, i, players) {
                var p = typeof(prev) === "string" ? prev : '', len = players.length;
                var transition = (i + 1 < len ? (i + 2 < len ? ', ' : ' and ') : '');
                return p + player.name() + transition;
            });
        },
        unconfirm: function () {players.forEach(function(element){element.unconfirm();});},
        remove: function (player) {

            var index, removed;
            if (app.game.started() && !player.isComputer) replacePlayer(player);
            else if (!isNaN((index = exists(player)))) {

                if((removed = players.splice(index, 1)[0]).isComputer && app.user.first())
                    socket.emit('removeAiPlayer', removed);
                
                if (players.length >= index + 1)
                    shiftPlayers(index);
            }
        },
        initialize: function () {
            players.forEach(function (player) {
                if (typeof(player.co) === "string")
                    player.setProperty("co", player.co);
            });
        }
    };
}();
},{"../controller/map.js":4,"../input/keyboard.js":28,"../menu/teams.js":51,"../objects/aiPlayer.js":52,"../objects/player.js":69,"../settings/app.js":79,"../tools/dom.js":85}],8:[function(require,module,exports){
app = require('../settings/app.js');
app.settings = require('../settings/game.js');
app.animate = require('../game/animate.js');
app.map = require('../controller/map.js');
app.cursor = require('../controller/cursor.js');

module.exports = function () {

	var screenDimensions, dimensions, position = { x:0, y:0 }, axis = ['x','y'];

	var scale = function (dimension) { return (dimension / 64) - 1; };

	// screenRefresh the postions on the screen of all the units/terrain/buildings/etc
    var screenRefresh = function () { app.animate(['terrain', 'cursor', 'building', 'unit', 'effects']); };

    var move = function (distance, view, limit, sign, axis) {

        setTimeout(function () { // set delay time
            if (distance > -1 && view * sign + sign < limit){ 
                view += sign; // <--- keep track of screen edge as it moves
                position[axis] += sign; // <---- move screen
                screenRefresh(); // <-- animate screen movement
                move (distance - 1, view, limit, sign, axis); //<--- call self and decriment the distance to target
            }
        }, app.settings.scrollSpeed); // <--- delay time
    };

	return {
		setDimensions: function (dim) { 
			screenDimensions = dim;
			dimensions = { x: scale(dim.width), y: scale(dim.height) }; 
		},
		width: function () { return screenDimensions.width; },
		dimensions: function () { return dimensions; },
		position: function () { return position; },
		top: function () { return position.y; },
		bottom: function (){ return position.y + dimensions.y; },
		left: function () { return position.x; },
		right: function () { return position.x + dimensions.x; },


		// deactivate all menus/selections and display screen in its initial state
		reset: function () {
            ['actionHud', 'damageDisplay', 'buildUnitScreen', 'unitInfoScreen', 'optionsMenu']
                .forEach(function (screen) { app.dom.remove(screen); });

            app.coStatus.show();
            app.hud.show();
            app.options.deactivate();
            app.cursor.deselect();
            app.path.clear();
            app.range.clear();
            app.cursor.show();
            app.animate(['cursor', 'unit','effects']);
            return this;
        },

		// creates scrolling effect allowing movement and map dimensions beyond screen dimensions
    	scroll: function () {
	        var mapDimensions = app.map.dimensions();
	        var a, cursor = app.cursor.position();

	        for (var p, i = 0; i < 2; i += 1){
	        	a = axis[i];

		        if(cursor[a] >= 0 && cursor[a] < (p = position[a]) + 2 && p > 0) {
		        	position[a] -= 1;
		        }

		        if(cursor[a] < mapDimensions[a] && cursor[a] > (p = position[a] + dimensions[a]) - 2 && p < mapDimensions[a] - 1) 
		        	position[a] += 1;
		    }
	        screenRefresh();
	    },

	    // move screen to target position
        to: function (coordinates) {

       		app.cursor.setPosition(coordinates);

	        var mapDimensions = app.map.dimensions();
	        var a, target, limit, distance, view, sign,
	        beginning, end, middle;

			for (var i = 0; i < 2; i += 1) {

				a = axis[i], target = coordinates[a];

		        // beginning of screen view
		        beginning = position[a];

		        // end / edge of screen view
		        end = position[a] + dimensions[a];

		        // middle of screen view
		        middle = end - Math.ceil(dimensions[a] / 2);

		        // if the hq is located to the right or below the center of the screen then move there
		        if(target > middle){
		            sign = 1;
		            distance = target - middle;
		            limit = mapDimensions[a];
		            view = end;
		        }else{
		            sign = -1;
		            distance = middle - target;
		            limit = -1;
		            view = beginning;
		        }

		        // create the effect of moving the screen rather then immediately jumping to the hq
		        move (distance, view, limit, sign, a);
		    }
	    }
    };
}();
},{"../controller/cursor.js":3,"../controller/map.js":4,"../game/animate.js":20,"../settings/app.js":79,"../settings/game.js":81}],9:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    a list of each building and the inits they are capable of producing

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.units = require('../definitions/units.js');

module.exports = {
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
        rockets:app.units.rockets,
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
},{"../definitions/units.js":13,"../settings/app.js":79}],10:[function(require,module,exports){
/* ---------------------------------------------------------------------- *\
    
    Obsticles.js holds the each possible object for the map 

\* ---------------------------------------------------------------------- */

var obsticle = require('../objects/obsticle.js');

module.exports = {
    mountain: new obsticle('mountain', 2),
    wood: new obsticle('wood', 3),
    building: new obsticle('building', 2),
    plain: new obsticle('plain', 1),
    snow: new obsticle('snow', 1),
    unit: new obsticle('unit', 0)
};
},{"../objects/obsticle.js":68}],11:[function(require,module,exports){
/* ---------------------------------------------------------------------- *\
    
    Properties.js holds the properties of each map object

\* ---------------------------------------------------------------------- */

app.property = require('../objects/property.js');
app.obsticles = require('../definitions/obsticles.js');
Validator = require('../tools/validator.js');

module.exports = function () {
	var error, validate = new Validator('properties');
	if((error = validate.hasElements(app.obsticles, ['wood','building','plain','mountain', 'unit'])))
	   throw error;

    this.tallMountain = new app.property('Mountain', app.obsticles.mountain);
    this.tree = new app.property('Woods', app.obsticles.wood);
    this.hq = new app.property('HQ', app.obsticles.building);
    this.base = new app.property('Base', app.obsticles.building);
    this.plain = new app.property('Plains', app.obsticles.plain);
    this.unit = new app.property('Unit', app.obsticles.unit);
    this.snow = new app.property('Snow', app.obsticles.snow);
};
},{"../definitions/obsticles.js":10,"../objects/property.js":71,"../tools/validator.js":93}],12:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    Score.js calculates the game score

\* --------------------------------------------------------------------------------------*/

ScoreElement = require('../objects/scoreElement.js');
Score = function (turn) {

	this.parameters = [
		'moneyMade', 
		'moneySpent', 
		'mileage', 
		'damageRecieved', 
		'damageDone', 
		'buildingsCaptured',
		'buildingsLost',
		'buildingsHeld',
		'unitsHeld',
		'defeated',
		'conquered'
	];

	this.moneyMade = new ScoreElement('moneyMade', 2);
	this.moneySpent = new ScoreElement('moneySpent', -2);

	this.mileage = new ScoreElement('mileage', -1);

	this.damageRecieved = new ScoreElement('damageRecieved', -3); 
	this.damageDone = new ScoreElement('damageDone', 3);

	this.unitsLost = new ScoreElement('unitsLost', -4);
	this.unitsDestroyed = new ScoreElement('unitsDestroyed', 5);
	this.unitsHeld = new ScoreElement('unitsHeld', 3);

	this.buildingsCaptured = new ScoreElement('buildingsCaptured', 5);
	this.buildingsHeld = new ScoreElement('buildingsHeld', 6);
	this.buildingsLost = new ScoreElement('buildingsLost', -7);

	this.defeated = new ScoreElement('defeated', -70);
	this.conquered = new ScoreElement('conquered', 50);
	this.turns = [];

};

Score.prototype.income = function (money) { this.moneyMade.amount += (money / 1000); };
Score.prototype.expenses = function (money) { this.moneySpent.amount += (money / 1000); };
Score.prototype.fuel = function (fuel) { this.mileage.amount += (fuel / 10); };

Score.prototype.buildings = function (owned) { this.buildingsHeld.amount = owned; };
Score.prototype.capture = function () { this.buildingsCaptured.amount += 1; };
Score.prototype.lostBuilding = function () { this.buildingsLost.amount += 1; };

Score.prototype.damageTaken = function (damage) { this.damageRecieved.amount += (damage / 10); };
Score.prototype.damageDealt = function (damage) { this.damageDone.amount += (damage / 10); };
Score.prototype.units = function (owned) { this.unitsHeld.amount = owned; };
Score.prototype.lostUnit = function () { this.unitsLost.amount += 1; };
Score.prototype.destroyedUnit = function () { this.unitsDestroyed.amount += 1; };

Score.prototype.defeat = function () { this.defeated.amount += 1; };
Score.prototype.conquer = function () { this.conquered.amount += 1; };

Score.prototype.amount = function (parameter) {return this[parameter].amount; };
Score.prototype.worth = function (parameter) {return this[parameter].worth; };
Score.prototype.turn = function () { return this.turns.length; };
Score.prototype.allTurns = function () { return this.turns };

Score.prototype.update = function(turn) {
	var parameters = this.parameters;
	
	for(var i = 0; i < parameters.length; i += 1)
		this[parameters[i]].amount += turn.amount(parameters[i]);

	this.turns.push(turn);
};

Score.prototype.calculate = function () {
	var parameter, parameters = this.parameters;
	for(var i = 0, total = 0; i < parameters.length; i += 1){
		parameter = this[parameters[i]];
		total += parameter.amount * parameter.worth;
	}
	return Math.ceil(total);
};

module.exports = Score;
},{"../objects/scoreElement.js":72}],13:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    app.units is a repo for the units that may be created on the map and their stats
    
\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.settings = require('../settings/game.js');

module.exports = {
    infantry: {
        properties: {
            type: 'infantry',
            name: 'Infantry',
            movement: 3,
            vision: 2,
            range: {
                low: 1,
                high: 1
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
            movementCosts: {
                mountain:2,
                wood:1,
                plain:1,
                building:1
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
                low: 1,
                high: 1
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
                low: 1,
                high: 1
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
                low: 1,
                high: 1
            }, // steal supplies!
            maxLoad:1,
            load:['infantry', 'mech'],
            loaded:[],
            canAttack:[],
            movable: app.settings.movable.wheels,
            movementCosts: {
                mountain:7,
                wood:2,
                plain:1,
                building:1
            },
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
                low: 1,
                high: 1
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
                low: 1,
                high: 1
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
                low: 1,
                high: 1
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
                low: 2,
                high: 3
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
                low: 3,
                high: 5
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
                low: 3,
                high: 5
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
                low: 1,
                high: 1
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
                low: 1,
                high: 1
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
                low: 1,
                high: 1
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
                low: 1,
                high: 1
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
                low: 1,
                high: 1
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
                low: 1,
                high: 1
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
                low: 1,
                high: 1
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
                low: 1,
                high: 1
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
                low: 2,
                high: 6
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
},{"../settings/app.js":79,"../settings/game.js":81}],14:[function(require,module,exports){
module.exports = function (x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
};
},{}],15:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    Fader.js creates an object that controls color fading

\* --------------------------------------------------------------------------------------*/

Fader = function (element, color, speed) {
	this.setElement(element);
	if (color) this.setColor(color);
	this.setSpeed(speed || 10);
	this.setIncriment(app.settings.colorSwellIncriment);
	this.setTime(new Date());
};
Fader.prototype.element = function () {return this.e;};
Fader.prototype.colors = app.settings.colors;
Fader.prototype.setElement = function (element) {
	this.e = element;
	return this;
};
Fader.prototype.setDefault = function (color) {this.d = color;};
Fader.prototype.setColor = function (color) {
	this.setDefault(color);
	this.color = new Hsl(color);
	return this;
};
Fader.prototype.setSpeed = function (speed) {this.s = speed;};
Fader.prototype.setTime = function (time) {this.t = time;};
Fader.prototype.time = function () {return this.t;};
Fader.prototype.setLightness = function (lightness) {this.color.lightness = lightness;};
Fader.prototype.element = function () {return this.e;};
Fader.prototype.speed = function () {return this.s;};
Fader.prototype.fading = function () {return this.f;};
Fader.prototype.setIncriment = function (incriment) { this.i = incriment; };
Fader.prototype.incriment = function () {return this.i;};
Fader.prototype.stop = function () {
	this.f = false;
	clearTimeout(this.fada);
	this.clear();
	return this;
};
Fader.prototype.clear = function () {this.callback ? this.callback(null, this.element()) : this.setBorderColor(null);};
Fader.prototype.toWhite = function () {this.setBorderColor(new Hsl(this.colors.white).format());};
Fader.prototype.toSolid = function () {this.setBorderColor(this.setColor(this.defaultColor()).color.format());};
Fader.prototype.defaultColor = function () {return this.d; };
Fader.prototype.lightness = function () {return this.color.lightness;};
Fader.prototype.increase = function () {this.setLightness(this.lightness() + this.incriment());};
Fader.prototype.decrease = function () {this.setLightness(this.lightness() - this.incriment());};
Fader.prototype.start = function (callback) {
	this.f = true;
	this.fade(callback);
	return this;
};
Fader.prototype.changeElement = function (element) {return this.stop().setElement(element).start();};
Fader.prototype.previous = function () {return this.p;};
Fader.prototype.setPrevious = function (previous) {this.p = previous;};
Fader.prototype.setBorderColor = function (color) {this.element().style.borderColor = color;};
Fader.prototype.fade = function (callback) {
	this.callback = callback;
	var scope = this;
	this.fada = setTimeout(function () {
        var prev = scope.previous();
		var lightness = scope.lightness();
        var color = scope.color;
        var inc = scope.incriment();
        scope.setPrevious(lightness);
        callback ? callback(color.format(), scope.element()) : scope.setBorderColor(color.format());
        if (lightness + inc <= 100 + inc && prev < lightness || lightness - inc < 50) 
        	scope.increase();
        else if (lightness - inc >= scope.defaultColor().l && prev > lightness || lightness + inc > 50) 
        	scope.decrease();
		return scope.fading() ? scope.fade(callback) : scope.clear();
	}, scope.speed());
};
module.exports = Fader;
},{}],16:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    Path.js controls pathfinding

\* --------------------------------------------------------------------------------------*/

Position = require('../objects/position.js');
Heap = require('../tools/binaryHeap.js');

var Path = function () {this._coordinates = [];};

Path.prototype.size = function () { return this._coordinates.length; };
Path.prototype.clear = function () { this._coordinates = []; return this; };
Path.prototype.set = function (p) { return (this._coordinates = this._coordinates.concat(p)); };
Path.prototype.get = function () { return this._coordinates; };
Path.prototype.getNeighbors = function (position, check) {

    var x = position.x, y = position.y,
    neighbors = [],
    positions = [
        new Position(x - 1, y),
        new Position(x + 1, y),
        new Position(x, y - 1),
        new Position(x, y + 1)
    ];

    for (var n, i = 0; i < 4; i += 1){

        neighbor = app.map.top(positions[i]);

        if(neighbor && !neighbor.closed)
            neighbors.push(neighbor);
    }

    return neighbors;
};

Path.prototype.distance = function (position, target, origin) {
    var dx1 = position.x - target.x;
    var dy1 = position.y - target.y;
    var dx2 = origin.x - target.x;
    var dy2 = origin.y - target.y;
    var cross = Math.abs((dx1 * dy2) - (dx2 * dy1));
    var rand = Math.floor(Math.random()+1)/(1000);
    return ((Math.abs(dx1) + Math.abs(dy1)) + (cross * rand));
};

Path.prototype.reachable = function (unit, clean, movement) {

    var reachable = [unit], open = new Heap('f'), allowed = movement || unit.movement(), 
    neighbor, neighbors, current, cost;
    open.push(unit);
    app.map.close(unit);

    while (open.size()) {

        current = open.pop();

        this.getNeighbors(current.position(), unit).forEach(function (neighbor) {

            cost = (current.f || 0) + unit.moveCost(neighbor);

            if (cost <= allowed) {
                neighbor.f = cost;
                app.map.close(neighbor);
                reachable.push(neighbor);
                open.push(neighbor);
            } 
        });
    }
    return clean ? app.map.clean(reachable) : reachable;
};

Path.prototype.find = function (unit, target) {

    var allowed = unit.movement(), clean = [unit], cost, neighbor, i, neighbors, position, current,
    open = new Heap('f'), scope = this; 
    app.map.close(unit);
    open.push(unit);
 
    while (open.size()) {

        current = open.pop();
        position = current.position();

        // if the targetination has been reached, return the array of values
        if (target.x === position.x && target.y === position.y) {
            var path = [current];
            while (current.p) path.unshift((current = current.p));
            app.map.clean(clean);
            return this.set(path);
        }

        this.getNeighbors(position).forEach(function (neighbor) {
            cost = (current.g || 0) + unit.moveCost(neighbor); 
            if (cost <= allowed && (!neighbor.g || neighbor.g >= current.g)) {
                neighbor.g = cost;
                neighbor.f = cost + scope.distance(neighbor.position(), target, unit.position());
                neighbor.p = current; //<--- keep reference to parent
                app.map.close(neighbor);
                clean.push(neighbor);
                open.push(neighbor);
            }
        });
    }
    app.map.clean(clean);
    return false;
};

Path.prototype.show = function (effect) { app.animate('effects'); };

module.exports = Path;
},{"../objects/position.js":70,"../tools/binaryHeap.js":82}],17:[function(require,module,exports){
/* ------------------------------------------------------------------------------------------------------*\
   
   ScrollText.js handles scrolling of text accross the screen, requires the id of the containing element, which must be 
   three elements, one a span, inside something else, inside something else. it also requires a message 
   to be displayed
   
\* ------------------------------------------------------------------------------------------------------*/

module.exports = function () {

    var position;

    var scrollText = function(container, message, footer, text, scroll){

        // if this is our first time through initialize all variables
        if(!text){
            text = document.getElementById(container);
            if(!text) return false;
            text.innerHTML = message;
            if(!position) position = -text.offsetWidth;
            scroll = text.parentNode;
            footer = scroll.parentNode;
            if(!scroll || !footer) throw new Error('something up with the textual scroll, no parents.. needs parents');
        }
        
        // if the element is no longer visable then stop
        if(!text.offsetParent){ 
            position = false; 
            return false 
        }

        // if the text has been changed then stop
        if(text.innerHTML !== message) return false;
        
        // compare the postion of the text to its containor
        if(position !== undefined){

            // if we are less then the container width then move right
            if(position <= footer.offsetWidth ){
                scroll.style.left = position + 'px';
                position += 1;
            }else{

                // otherwise reset the position to the left
                position = -text.offsetWidth * 4;
            }
        }
        setTimeout(function(){ scrollText(container, message, footer, text, scroll);}, 10);
    };
    return scrollText;
}();
},{}],18:[function(require,module,exports){
app.settings = require('../settings/game.js');
Origin = require('../effects/elements/origin.js');
Sweller = function (element, min, max, speed) {
    this.setElement(element);
    this.setMin(min);
    this.setMax(max);
    this.setIncriment(app.settings.swellIncriment);
    this.setSpeed(speed || 2);
};

Sweller.prototype.setMin = function (min) {this.min = min;};
Sweller.prototype.setMax = function (max) {this.max = max;};
Sweller.prototype.swell = function (callback) {
    var scope = this;
    var size = this.size();
    var inc = this.incriment();
    var prev = this.previous();

    if (this.swelling()) {
        if (size + inc <= this.max && prev < size || size - inc < this.min)
            this.setPrevious(size).increase();

        else if(size - inc >= this.min && prev > size || size + inc > this.min)
            this.setPrevious(size).decrease();

        callback ? callback(this.element(), this.size(), this.position()) : this.resize();
        this.sweller = setTimeout(function() {scope.swell(callback);}, 15);
    } else this.clear();
};
Sweller.prototype.swelling = function () {return this.a;};
Sweller.prototype.start = function (callback) {
    this.a = true;
    this.init();
    this.swell(callback);
    return this;
};
Sweller.prototype.stop = function () {
    this.a = false;
    this.clear();
    return this;
};
Sweller.prototype.clear = function () {
    if (!this.origin) 
        throw new Error('origin has not been set');
    clearTimeout(this.sweller);
    this.setLeft(this.origin.x);
    this.setTop(this.origin.y);
    this.setSize(this.origin.size);
    this.resize();
};
Sweller.prototype.centerElement = function (center) {
    this.setLeft(this.left() + center);
    this.setTop(this.top() + center);
};
Sweller.prototype.setLeft = function (position) {this.l = position;};
Sweller.prototype.left = function () {return this.l;};
Sweller.prototype.setTop = function (position) {this.t = position; return this;};
Sweller.prototype.top = function () {return this.t;};
Sweller.prototype.center = function () {return this.incriment() / 2;};
Sweller.prototype.incriment = function () {return this.i;};
Sweller.prototype.setIncriment = function (incriment) {this.i = incriment;};
Sweller.prototype.setSize = function (size) {this.s = size; return this;};
Sweller.prototype.resize = function () {
    var size = this.size();
    this.element().style.width = size + 'px';
    this.element().style.height = size + 'px';
    this.element().style.top = this.top() + 'px';
    this.element().style.left = this.left() + 'px';
    return this;
};
Sweller.prototype.size = function () {return this.s;};
Sweller.prototype.incSize = function (incriment) {this.setSize(this.size() + incriment);};
Sweller.prototype.increase = function () {
    this.incSize(this.incriment());
    this.centerElement(-this.center());
    return this;
};
Sweller.prototype.decrease = function () {
    this.incSize(-this.incriment());
    this.centerElement(this.center());
    return this;
};
Sweller.prototype.position = function () {return {x:this.left(), y:this.top()};};
Sweller.prototype.setPrevious = function (p) {this.p = p; return this;};
Sweller.prototype.previous = function () {return this.p;};
Sweller.prototype.setElement = function (element) {
    this.e = element;
    return this;
};
Sweller.prototype.init = function () {
    var element = this.element();
    var size = element.offsetWidth;
    var left = Number(element.style.left.replace('px','')); 
    var top = Number(element.style.top.replace('px',''));
    this.setSize(size);
    this.setLeft(left);
    this.setTop(top);
    this.origin = new Origin(left, top, 80);
};
Sweller.prototype.setSpeed = function (speed) {this.s = speed;};
Sweller.prototype.speed = function () {return this.s; };
Sweller.prototype.element = function () {return this.e;};
module.exports = Sweller;
},{"../effects/elements/origin.js":14,"../settings/game.js":81}],19:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    Typing.js controls typing effect in game menus

\* --------------------------------------------------------------------------------------*/

 module.exports = {
    defaults: function () { return this.speed = app.settings.typingSpeed * 10; },
    speed: app.settings.typingSpeed * 10,
    isPrev: function (sentance) { return this.text === sentance; },
    letters: function (element, sentance, followup) {
        if(!this.isPrev(sentance)) {
            this.text = sentance;
            element.innerHTML = '';
            return this.type(element, sentance, 0, followup);
        }
        return false;
    },
    type: function (element, sentance, index, followup) {
        var scope = this;
        this.typer = setTimeout(function () {
            if (sentance[index] && scope.isPrev(sentance)) { 
                element.innerHTML += sentance[index];
                index += 1;
                scope.type(element, sentance, index, followup);
            } else {
                if (followup) followup(element);
                if (scope.isPrev(sentance)) 
                    scope.reset();
                return false;
            }
        }, this.speed);
    },
    reset: function () { 
        clearTimeout(this.typer);
        delete this.text; 
    },
    setSpeed: function (speed) { this.speed = speed * 10; }
};
},{}],20:[function(require,module,exports){
/* ----------------------------------------------------------------------------------------------------------*\

    The animate functions insert the draw methods into the specified canvas for rendering and then make a 
    call to the canvas to render those drawings with the render method. Calling the render method of an
    initialized canvas object will render the animations once. If a loop is wanted ( for changing animations 
    for example ), you may pass the parent function into the render function to be called recursively.

\*-----------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');

module.exports = function (objectName, hide) {
    window.requestAnimationFrame(function(){
        if(typeof objectName === 'string')
            app[objectName + 'Canvas'].setAnimations(app['draw' + objectName.uc_first()]).render(hide);
        else for(var i = 0; i < objectName.length; i += 1) 
            app[objectName[i] + 'Canvas'].setAnimations(app['draw' + objectName[i].uc_first()]).render(hide);
    });
};
},{"../settings/app.js":79}],21:[function(require,module,exports){

// ------------------------------------------ settings -----------------------------------------------------------------

app = require('../settings/app.js'); // app holds all elements of the application 
app.settings = require('../settings/game.js'); // app.settings holds application settings

// ------------------------------------------- tools --------------------------------------------------------------------

app.chat = require('../tools/chat.js'); // handle chat interactions
app.init = require('../tools/init.js'); // app.init creates a new canvas instance
app.request = require('../tools/request.js'); //handles AJAJ calls where needed
app.dom = require('../tools/dom.js'); // app.dom is a list of functions used to assist manipulating the dom
app.increment = require('../tools/increment.js');

// ------------------------------------------- input --------------------------------------------------------------------

app.touch = require('../input/touch.js'); // handle touch screen operations
app.key = require('../input/keyboard.js'); // handles keyboard input

// -------------------------------------------- menu --------------------------------------------------------------------

app.login = require('../menu/login.js'); // login control
app.modes = require('../menu/modes.js'); // app.modes holds functions for the selection of game modes / logout etc..
app.options = require('../menu/options/optionsMenu.js'); // app.options handles the in game options selection, end turn, save etc.
app.scroll = require('../menu/scroll.js'); // app.game.settings consolidates holds settings for the game

// ----------------------------------------- definitions ----------------------------------------------------------------

app.units = require('../definitions/units.js'); // app.units is a repo for the units that may be created on the map and their stats
app.buildings = require('../definitions/buildings.js'); // holds building blueprints
app.obsticles = require('../definitions/obsticles.js'); // holds obsticles
app.properties = require('../definitions/properties.js'); // holds properties

// ------------------------------------------- game ---------------------------------------------------------------------

app.animate = require('../game/animate.js'); // app.animate triggers game animations
app.draw = require('../game/draw.js'); // app.draw controls drawing of animations
app.game = require('../game/game.js'); //controls the setting up and selection of games / game modes 
app.effect = require('../game/effects.js'); // app.effect is holds the coordinates for effects
app.calculate = require('../game/calculate.js'); //app.calculate handles calculations like pathfinding etc

// ------------------------------------------ objects -------------------------------------------------------------------

app.animations = require('../objects/animations.js'); // app.animations is a collection of animations used in the game
app.screens = require('../objects/screens.js'); // menu screen setups
app.co = require('../objects/co.js'); // app.co holds all the co's, their skills and implimentation
app.target = require('../objects/target.js');
app.property = require('../objects/property.js');
app.obsticle = require('../objects/obsticle.js');
app.hud = require('../objects/hud.js');
app.user = require('../objects/user.js');

// ---------------------------------------- controllers -----------------------------------------------------------------

app.players = require('../controller/players.js');
app.map = require('../controller/map.js');
app.maps = require('../controller/maps.js');
app.cursor = require('../controller/cursor.js');
app.screen = require('../controller/screen.js');

module.exports = app;
},{"../controller/cursor.js":3,"../controller/map.js":4,"../controller/maps.js":5,"../controller/players.js":7,"../controller/screen.js":8,"../definitions/buildings.js":9,"../definitions/obsticles.js":10,"../definitions/properties.js":11,"../definitions/units.js":13,"../game/animate.js":20,"../game/calculate.js":22,"../game/draw.js":23,"../game/effects.js":24,"../game/game.js":25,"../input/keyboard.js":28,"../input/touch.js":29,"../menu/login.js":44,"../menu/modes.js":45,"../menu/options/optionsMenu.js":47,"../menu/scroll.js":49,"../objects/animations.js":53,"../objects/co.js":59,"../objects/hud.js":63,"../objects/obsticle.js":68,"../objects/property.js":71,"../objects/screens.js":73,"../objects/target.js":74,"../objects/user.js":78,"../settings/app.js":79,"../settings/game.js":81,"../tools/chat.js":83,"../tools/dom.js":85,"../tools/increment.js":87,"../tools/init.js":88,"../tools/request.js":90}],22:[function(require,module,exports){
/* ----------------------------------------------------------------------------------------------------------*\
    
    Calculate.js handles necessary game calculations 

\* ----------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.settings = require('../settings/game.js');
app.map = require('../controller/map.js');
app.screen = require('../controller/screen.js');

module.exports = function () {

    var abs = Math.abs;
    var floor = Math.floor;
    var random = Math.random;
    var round = Math.round;

    var rand = function(){return floor((random() * 9) + 1)};

    return {

        arrayDifferance: function (array1, array2) {
            var array = [];
            for (var push, h = 0; h < array1.length; h += 1){
                push = true;
                for(var l = 0; l < array2.length; l += 1)
                    if(array1[h] === array2[l])
                        push = false;
                if(push) array.push(array1[h]);
            }
            return array;
        },

        distance: function (a, b) { return abs(a.x - b.x) + abs(a.y - b.y); },

        numberOfBuildings: function(map) {

            // get selected maps building list
            var type, all = map.buildings, buildings = {};

            if (!all) return false;

            // add one for each building type found  to the building display list
            for (var n = 0; n < all.length; n += 1) {
                type = all[n].type;
                if (type !== 'hq') {
                    if (isNaN(buildings[type])) buildings[type] = 1;
                    else buildings[type] += 1; 
                }
            }
            return buildings;
        },

        longestLength: function (arrays) {
            var i, longest = arrays[0], length = arrays.length;
            if(length > 1)
                for (i = 1; i < length; i += 1)
                    if(arrays[i].length > longest.length)
                        longest = arrays[i];
            return longest.length;
        },

        damage:  function (attacked, attacker) {

            var r = rand();
            var baseDamage = attacker.baseDamage()[attacked.name().toLowerCase()];
            var coAttack = attacker.player().co.attack(attacker);
            var coDefense = attacked.player().co.defense(attacked);
            var terrainDefense = attacked.occupies().defense() || 1;

            // return the health of the attacker, multiplied by
            return round((attacker.showHealth()/10)

                // absolute value of the amount of damage, multiplied by the co attack and a random number
                * abs(baseDamage * coAttack/100 + r)

                // absolute valye of the defense of co, plus the terrain defense bonus, 
                // plus the health of the unit, subtracted from 200, all divided by one hundred
                * abs((200-(coDefense + terrainDefense * attacked.showHealth()))/100));
        },
        
        random: function(range) { return Math.floor(Math.random() * range); }
    };
}();
},{"../controller/map.js":4,"../controller/screen.js":8,"../settings/app.js":79,"../settings/game.js":81}],23:[function(require,module,exports){
/* --------------------------------------------------------------------------------------------------------*\

    app.draw provides a set of methods for interacting with, scaling, caching, coordinating  
    and displaying the drawings/animations provided in the app.animations

\*---------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.animations = require('../objects/animations.js');
app.settings = require('../settings/game.js');
app.screen = require('../controller/screen.js');
app.map = require('../controller/map.js');
app.background = require('../controller/background.js');
app.effect = require('../game/effects.js');

module.exports = function (canvas, dimensions, base) {
    
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

    var animationObjects = app.animations(width, height);

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
        hide: function () { animationObjects.hide(); },
        // place drawings where they belong on board based on coorinates
        coordinate: function (objectClass, object, coordinet) {

            var s = {}; // holder for scroll coordinates
            var name; // holder for the name of an object to be drawn
            var position = app.screen.position(); // scroll positoion ( map relative to display area )
            var wid = (w * 16); // display range
            var len = (h * 11);

            // get the coordinates for objects to be drawn
            var coordinate, coordinates = !coordinet ? app[objectClass][object]() : coordinet;

            // for each coordinates
            for (var i = 0; i < coordinates.length; i += 1) {

                coordinate = coordinates[i].position ? coordinates[i].position() : coordinates[i];

                // var s modifys the coordinates of the drawn objects to allow scrolling behavior
                // subtract the amount that the cursor has moved beyond the screen width from the 
                // coordinates x and y axis, making them appear to move in the opposite directon
                s.x = (coordinate.x * w) - (position.x * w);
                s.y = (coordinate.y * h) - (position.y * h);

                // only display coordinates that are withing the visable screen
                if (s.x >= 0 && s.y >= 0 && s.x <= wid && s.y <= len) {

                    // get the name of the object to be drawn on the screen
                    name = objectClass === 'map' && coordinet === undefined ? coordinates[i].draw() : object;

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
        background: function () {
            var dimensions = app.map.dimensions();
            var type = app.background.type();
            for (var x = 0; x < dimensions.x; x += 1)
                for (var y = 0; y < dimensions.y; y += 1)
                    animationObjects[type](canvas, setPosition(x * w, y * h))
        },

        hudCanvas: function (object, objectClass) {

            // draw a background behind terrain and building elements
            if (objectClass !== 'unit') animationObjects.plain(canvas, setPosition(smallX, smallY));

            if (app.cache[object]) // use cached drawing if available
                canvas.drawImage(app.cache[object], 0, 0);
            else if(animationObjects[object])
                animationObjects[object](canvas, setPosition(smallX, smallY));
        }
    };
};
},{"../controller/background.js":1,"../controller/map.js":4,"../controller/screen.js":8,"../game/effects.js":24,"../objects/animations.js":53,"../settings/app.js":79,"../settings/game.js":81}],24:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\

    Effect.js holds the coordinates for effects

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
Path = require('../effects/path.js');
app.confirm = require('../controller/confirmation.js');
app.path = new Path();
app.range = new Path();
app.attackRange = new Path();

module.exports = function () {

    var highlight = app.range;
    var path = app.path;
    var attackRange = app.attackRange;

    return {

        refresh: function () {app.animate('effects');},

        undo: {
            path: function () {path.clear();},
            highlight: function () {highlight.clear();},
            attackRange:function(){attackRange.clear();}
        },

        highlight: function () { return highlight.get(); },
        path: function () { return path.get(); },
        attackRange: function () {return attackRange.get(); },

        setHighlight: function (range) {highlight.set(range);},
        setPath: function (path) {path.set(path);},
        setAttackRange: function (range) {attackRange.set(range);}
    };
}();
},{"../controller/confirmation.js":2,"../effects/path.js":16,"../settings/app.js":79}],25:[function(require,module,exports){
/* ------------------------------------------------------------------------------------------------------*\
   
    Game.js controls the setting up and selection of games / game modes 
   
\* ------------------------------------------------------------------------------------------------------*/

StatusHud = require('../objects/coStatusHud.js');
Score = require('../definitions/score.js');
Counter = require('../tools/counter.js');
Exit = require('../menu/options/exit.js');
Hud = require('../objects/hud.js');

app = require('../settings/app.js');
app.menu = require('../controller/menu.js');
app.animate = require('../game/animate.js');
app.effect = require('../game/effects.js');
app.key = require('../input/keyboard.js');
app.target = require('../objects/target.js');
app.user = require('../objects/user.js');
app.players = require('../controller/players.js');
app.cursor = require('../controller/cursor.js');
app.background = require('../controller/background.js');
app.options = require('../menu/options/optionsMenu.js');
app.confirm = require('../controller/confirmation.js');
app.exit = new Exit();

app.coStatus = new StatusHud();

module.exports = function () {

    var game, mode, name, joined, selected, actions, end = false, started = false, settings, 
    players, map, menus = ['optionsMenu', 'options', 'intel', 'save', 'exit', 'yield'];

    // used for accessing the correct building array via what type of transportation the unit uses
    var ports = { 
        air: 'airport', 
        foot: 'base', 
        wheels: 'base', 
        boat: 'seaport' 
    };

    var tick = new Counter(1000);

    var removeScreen = function () {
        var screen = document.getElementById('setupScreen');
        screen.parentNode.removeChild(screen);
    };

    return {
        tick:tick.reached,
        joined: function () {return joined;},
        started: function () {return started;},
        settings: function () {return settings;},
        map: function () {return map;},
        removeMap: function () {
            map = undefined;
            return this;
        },
        removeSettings: function () {
            settings = undefined;
            return this;
        },
        removePlayers: function () {
            players = undefined;
            return this;
        },
        players: function () {return players;},
        load: function (room) { 
            app.background.set(room.map.background);
            settings = room.settings;
            app.players.add(room.players);
            players = app.players.all();
        },
        name: function () { return name; },
        category: function () {return map.category;},
        room: function () {return {name:name, category:map.category};},
        screen: function () { return gameScreen; },
        clear: function () { name = undefined; },
        setSettings: function (s) {settings = s;},
        setPlayers: function (p) {players = p;},
        setMap: function (m) {return map = m;},
        logout: function () {
            // handle logout
            alert('logout!!');
        },
        create: function (n) {
            var room = {};
            room.map = app.map.get();
            room.name = name = n;
            room.settings = settings;
            room.max = app.map.players();
            room.category = app.map.category();
            socket.emit('newRoom', room);
        },
        setup: function (setupScreen){

            // select game mode
            if(app.user.id() && !mode) 
                mode = app.menu.mode();

            // if a game has been set 
            if (game) {               
                removeScreen();
                return game === 'editor' && app.editor.start() || started ? true : app.game.reset();

            // set up the game based on what mode is being selected
            } else if (mode) mode === 'logout' ? app.game.logout() : game = app.menu[mode]();

            // loop
            window.requestAnimationFrame(app.game.setup);
            if(app.key.pressed()) app.key.undo();        
        },
        reset: function () {
            game = mode = false;
            app.screens.modeMenu();
            this.setup();
        },
        start: function (game) {

            if (app.players.length() !== app.map.players()) 
                return false;

            // set up game map
            app.map.initialize();

            // make sure players are ready
            app.players.initialize();

            // get the first player
            var player = app.players.first();
            var hq = player.hq().position();

            // set inital gold amount
            player.setGold(player.income());
            player.score.income(player.income());

            // setup game huds
            app.hud = new Hud(app.map.occupantsOf(hq));

            // start game mechanics
            app.game.loop();

            // move the screen to the current players headquarters
            app.screen.to(hq);

            // begin game animations
            app.animate(['background', 'terrain', 'building', 'unit', 'cursor']);
            
            // mark the game as started
            return started = true;
        },

        /* --------------------------------------------------------------------------------------------------------*\
            
            app.game.loop consolidates all the game logic and runs it in a loop, coordinating animation calls and 
            running the game

        \* ---------------------------------------------------------------------------------------------------------*/

        update: function () { return app.game.started() ? app.game.loop() : app.game.setup(); },
        loop: function () {

            var confirmation, menu, options = app.options.active();

            // incriment frame counter
            tick.incriment();

            if ((confirmation = app.confirm.active())) 
                app.confirm.evaluate();
            
            if (app.cursor.deleting()) app.cursor.deleteUnit();

            // if target is active, enabel target selection
            if (app.target.active()) app.target.chose(app.cursor.selected());

            // move cursor
            if (!options && !confirmation) app.cursor.move();

            // handle selection of objects
            if ((selected = app.cursor.selected()) && selected.evaluate(app.cursor.position()))
                app.screen.reset();

            // display co status hud
            else if (!options) {
                app.coStatus.display(app.players.current(), app.cursor.side('x'));
                app.map.focus();
            }

            if (options) {
                app.options.select();
                if (menu = app.options.subMenu())
                    app.options[menu]();
            }

            // controls cursor selection
            if (!options && !confirmation) 
                app.cursor.select();

            // control map info hud
            if (!app.cursor.selected()) {
                if (app.user.turn()) {
                    if (app.hud.hidden() && !app.map.focused() && !app.input.active())
                        app.hud.show();
                    if (app.cursor.moved()) 
                        app.hud.setElements(app.cursor.hovered());
                } else if (!app.hud.hidden())
                    app.hud.hide();
            }

            // exit menus when esc key is pressed
            if (app.key.pressed(app.key.esc())) {
                if (app.cursor.deleting()) { 
                    app.cursor.selectMode();
                } else if(!app.options.active() && !selected && !confirmation) {
                    app.options.display();
                    app.coStatus.hide();
                } else if (!app.options.subMenu()) {
                    app.screen.reset();
                }
            }

            app.key.undo();
            app.key.undoKeyUp();
            tick.reset(); // reset counter if necessary
            if (end) return true;
            else window.requestAnimationFrame(app.game.loop);
        },
        end: function (saved) { 
            if (!saved) alert('player ' + app.players.first().number() + ' wins!  with a score of ' + app.players.first().score.calculate() + '!');
            else alert('ending game');
            end = true; 
        }
    };
}();
},{"../controller/background.js":1,"../controller/confirmation.js":2,"../controller/cursor.js":3,"../controller/menu.js":6,"../controller/players.js":7,"../definitions/score.js":12,"../game/animate.js":20,"../game/effects.js":24,"../input/keyboard.js":28,"../menu/options/exit.js":46,"../menu/options/optionsMenu.js":47,"../objects/coStatusHud.js":60,"../objects/hud.js":63,"../objects/target.js":74,"../objects/user.js":78,"../settings/app.js":79,"../tools/counter.js":84}],26:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    MapEditor.js controls map creation

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.settings = require('../settings/game.js');
app.players = require('../controller/players.js');
app.units = require('../definitions/units.js');
app.animate = require('../game/animate.js');
app.options = require('../menu/options/optionsMenu.js');

Validator = require('../tools/validator.js');
Matrix = require('../tools/matrix.js');
Terrain = require('../objects/terrain.js');
Building = require('../objects/building.js');
Unit = require('../objects/unit.js');
Position = require('../objects/position.js');
Counter = require('../tools/counter.js');
Build = require('../objects/build.js');
Feature = require('../objects/featureHud.js');

module.exports = function () {

	var started = false, end = false, tick = new Counter(1000);

	return {

		active: function () { return started; },
		start: function () {

            // set up game map
            app.map.initialize(true);

            // get map dimensions
            var dim = app.map.dimensions();
            var position = new Position(dim.x / 2, dim.y / 2);

            app.cursor.setSelected(new Building('hq', position, app.map.buildings().length, 1));
            app.feature = new Feature(app.cursor.selected());
            app.build = new Build();

            // move the screen to the current players headquarters
            app.screen.to(position);

            // begin game animations
            app.animate(['background', 'terrain', 'building', 'unit', 'cursor']);

             // start map editor
            app.editor.loop();
            
            // mark the game as started
            return started = true;
        },

        end: function () {  end = true;  },

        /* --------------------------------------------------------------------------------------------------------*\
            
            app.game.loop consolidates all the game logic and runs it in a loop, coordinating animation calls and 
            running the game

        \* ---------------------------------------------------------------------------------------------------------*/

        loop: function () {

            // incriment frame counter
            tick.incriment();

            // move cursor
            app.cursor.move();
            app.cursor.copy();
            app.cursor.build();

            if (!app.build.active()) {
            	app.cursor.displayPosition();
            	if(app.feature.hidden())
            		app.feature.show();
            };

            // exit menus when esc key is pressed
            if(app.key.pressed(app.key.esc()))
                if(!app.options.active())
                    app.options.display();
                else app.screen.reset();

            app.key.undo();
            app.key.undoKeyUp();

            tick.reset();

            if (end) {
             	started = false;
             	return true;
            } else window.requestAnimationFrame(app.editor.loop);
        }
	};
}();
},{"../controller/players.js":7,"../definitions/units.js":13,"../game/animate.js":20,"../menu/options/optionsMenu.js":47,"../objects/build.js":56,"../objects/building.js":57,"../objects/featureHud.js":61,"../objects/position.js":70,"../objects/terrain.js":75,"../objects/unit.js":77,"../settings/app.js":79,"../settings/game.js":81,"../tools/counter.js":84,"../tools/matrix.js":89,"../tools/validator.js":93}],27:[function(require,module,exports){
app = require('../settings/app.js');
app.key = require('../input/keyboard.js');
app.scroll = require('../menu/scroll.js');
app.user = require('../objects/user.js');
app.menu = require('../controller/menu.js');

module.exports = function (element) {

	var timer = new Date();
	var x, y, down = false;

	var doubleClick = function () {
		var now = new Date();
		var tappedTwice = now - timer < 300 ? true : false;
		timer = now;
		return tappedTwice;
	};

	var input = function (input) { return input ? input : element; };

	return {
		scroll: function (elem) {

			var e = input(elem);

			e.addEventListener('mousedown', function () { down = true; });
		    e.addEventListener('mouseup', function(){ down = false; });
		    e.addEventListener('mouseleave', function (element) {
		    	if (down) {
			        //  get the position of the mouse
			        var position = parseFloat(element.clientY) - 70;

			        // if the position is above the top, move the element up, 
			        // otherwise move it down if it is below the bottom
			        if (position < e.offsetTop) app.scroll.wheel(1, new Date());
			        else app.scroll.wheel(-1, new Date());
			        //app.game.update();
			        down = false;
		    	}
		    });

		    return this;
		},
		swipe: function (elem) {

			var e = input(elem);

			// scroll via touch
			e.addEventListener('mousedown', function () { down = true; });
		    e.addEventListener('mouseup', function(element){

		    	if (down) {

			    	var width = e.offsetWidth / 3;

			    	var offset = width / 3;

			        // get the left boundry of the element
			        var left = e.offsetLeft + offset + 10;

			        // get the bottom boundry
			        var right = e.offsetLeft + width - offset;

			        //  get the position of the element
			        var position = parseFloat(element.clientX) - 200;

			        // if the position is above the top, move the element up, 
			        // otherwise move it down if it is below the bottom
			        if (position < left){
			            app.scroll.swipe(-1, new Date());
			        }else if (position > right){
			            app.scroll.swipe(1, new Date());
			        }
			        down = false;
			        //app.game.update();
		    	}
		    });
		    return this;
		},
		swipeScreen: function (elem) {

			var e = input(elem), start;

			// get the start location of the finger press
			e.addEventListener('mousedown', function(element){
				start = element.clientX;
				down = true;
			});

			// scroll via touch
		    e.addEventListener('mouseup', function(element){

		    	if (down) {
	 		        //  get the position of the end of element
			        var end = element.clientX;

			        // make the length needed to swipe the width of the page divided by three and a half
			        var swipeLength = e.offsetWidth / 3.5;

			        // go back if swiping right
			        if (start < end && end - start > swipeLength){
			        	app.key.press(app.key.esc());

			        // go forward if swiping left
			        } else if (start > end && start - end > swipeLength) {
			        	app.key.press(app.key.enter());
			        }
			    }
			    start = undefined;
			    down = false;
		    });

		    return this;
		},
		// may need to change to eliminate less useful select method
		mapOrGame: function (elem){

			var e = input(elem);

			e.addEventListener('click', function(){
				var label = 'SelectionIndex';
				var clicked = e.id.indexOf(label) > -1 ? e: e.parentNode;
				var type = clicked.id.indexOf('map') ? 'map' : 'game';
	        	var index = clicked.attributes[type + label].value;
	        	// app.display.setIndex(index);
	        	//app.game.update();
	        });

			return this;
		},
		modeOptions: function (elem) {

			var e = input(elem);

			e.addEventListener('click', function(){

	        	// get the index
	        	var index = e.attributes.modeOptionIndex.value;

	        	// if the mode options are already under selection, then change the index
	        	if(app.modes.active()){
					// app.display.setIndex(index);
					//app.game.update();

				// otherwise simulate selecting them with the key right push
				// and set the default index to the selected option
	        	}else{
	        		// app.display.setOptionIndex(index);
		        	app.key.press(app.key.right());
	        	}
	        });
	        return this;
		},
		changeMode: function (elem) {
			input (elem).addEventListener('click', function () {if (app.modes.active()) app.key.press(app.key.left());});
			return this;
		},
		doubleClick: function (elem) {
			input (elem).addEventListener('click', function() {if (doubleClick()) return app.key.press(app.key.enter());});
			return this;
		},
		element: function (elem) {
			var e = input(elem);

			e.addEventListener('click', function (){
				var name = e.parentNode.id == 'settings' ? e.id : e.parentNode.id;
				var setting = name.replace('Settings','').replace('Container','');
				// app.display.setIndex(setting);
				//app.game.update();
			});
			return this;
		},
		esc: function (elem) {
			input(elem).addEventListener('click', function() {if(app.user.player().ready()) return app.key.press(app.key.esc());});
			return this;
		}
	};
};
},{"../controller/menu.js":6,"../input/keyboard.js":28,"../menu/scroll.js":49,"../objects/user.js":78,"../settings/app.js":79}],28:[function(require,module,exports){
app.options = require('../menu/options/optionsMenu.js');
app.game = require('../game/game.js');

module.exports = function () {

    var pressed = [], up = [],

    keys = {
        esc: 27,
        enter: 13,
        copy: 67,
        up: 38,
        down: 40,
        left: 37,
        right: 39,
        range: 82,
        map: 77,
        info: 73
    },

    key = function (k) { return isNaN(k) ? keys[k] : k; },
    undo = function (array) { return array.splice(0, array.length); };
    press = function (k) { 
        //app.game.update();
        return pressing(k) ? true : pressed.push(key(k));
    },
    pressing = function (k) { return k ? pressed.indexOf(key(k)) > -1 : pressed.length; };

    window.addEventListener("keydown", function (e) {
        if(!app.game.started() || app.user.turn() || e.keyCode === app.key.esc() || app.options.active() || app.confirm.active())
            press(e.keyCode);
    }, false);

    window.addEventListener("keyup", function (e) { 
        up.push(e.keyCode);
        undo(pressed);
        //app.game.update();
    }, false);

    return {
        press:press,
        pressed:function (k) {
            if (k && k.isArray()) {
                var i = k.length;
                while (i--)
                    if (pressing([k[i]]))
                        return true;
            } else return pressing(k);
        },
        keyUp: function (k) { return k ? up.indexOf(key(k)) > -1 : up.length; },
        undo: function (k) { return k ? pressed.splice(pressed.indexOf(key(k)), 1) : undo(pressed); },
        undoKeyUp: function (k) {return k ? up.splice(up.indexOf(key(k)), 1) : undo(up); },
        set: function (key, newKey) { keys[key] = newKey; },
        esc: function(){ return keys.esc; },
        enter: function(){ return keys.enter; },
        up: function(){ return keys.up; },
        down: function(){ return keys.down; },
        left: function(){ return keys.left; },
        right: function(){ return keys.right; },
        range: function(){ return keys.range; },
        map: function(){ return keys.map; },
        info: function(){ return keys.info; },
        copy: function(){ return keys.copy; }
    }
}();
},{"../game/game.js":25,"../menu/options/optionsMenu.js":47}],29:[function(require,module,exports){
app = require('../settings/app.js');
app.key = require('../input/keyboard.js');
app.scroll = require('../menu/scroll.js');
app.user = require('../objects/user.js');
app.menu = require('../controller/menu.js');

module.exports = function (element) {

	var timer = new Date();

	var doubleTap = function () {
		var now = new Date();
		var tappedTwice = now - timer < 300 ? true : false;
		timer = now;
		return tappedTwice;
	};

	var input = function (input) { return input ? input : element; };

	return {
		scroll: function (elem) {


			var e = input(elem);

			// scroll via touch
		    e.addEventListener('touchmove', function(touch){

		        // get the top  boundry of the element
		        var top = e.offsetTop - 50;

		        // get the bottom boundry
		        var bottom = top + e.offsetHeight + 50;

		        //  get the position of the touch
		        var position = parseFloat(touch.changedTouches[0].pageY ) - 50;

		        // if the position is above the top, move the element up, 
		        // otherwise move it down if it is below the bottom
		        if (position < top){
		            app.scroll.wheel(1, new Date());
		        }else if (position > bottom){
		            app.scroll.wheel(-1, new Date());
		        }
		        //app.game.update();
		    });
		    return this;
		},
		swipe: function (elem) {

			var e = input(elem);

			// scroll via touch
		    e.addEventListener('touchmove', function(touch){

		    	touch.preventDefault();

		    	var width = e.offsetWidth / 3;

		    	var offset = width / 3;

		        // get the left boundry of the element
		        var left = e.offsetLeft + offset;

		        // get the bottom boundry
		        var right = e.offsetLeft + width - offset;

		        //  get the position of the touch
		        var position = parseFloat(touch.changedTouches[0].pageX );

		        // if the position is above the top, move the element up, 
		        // otherwise move it down if it is below the bottom
		        if (position < left){
		            app.scroll.swipe(-1, new Date());
		        }else if (position > right){
		            app.scroll.swipe(1, new Date());
		        }
		        //app.game.update();
		    });
		    return this;
		},
		swipeScreen: function (elem) {

			var e = input(elem), start;

			// get the start location of the finger press
			e.addEventListener('touchstart', function(touch){
				touch.preventDefault();
				start = touch.changedTouches[0].pageX;
			});

			// scroll via touch
		    e.addEventListener('touchend', function(touch){
		    	touch.preventDefault();

		        //  get the position of the end of touch
		        var end = touch.changedTouches[0].pageX;

		        // make the length needed to swipe the width of the page divided by three and a half
		        var swipeLength = e.offsetWidth / 3.5;

		        // go back if swiping right
		        if (start < end && end - start > swipeLength){
		        	app.key.press(app.key.esc());

		        // go forward if swiping left
		        }else if (start > end && start - end > swipeLength){
		        	app.key.press(app.key.enter());
		        }
		        start = undefined;
		    });

		    return this;
		},
		// may need to change to eliminate less useful select method
		mapOrGame: function (elem){
			var e = input(elem);
			e.addEventListener('touchstart', function(touch){
				var label = 'SelectionIndex';
				var target = touch.target;
				var touched = target.id.indexOf(label) > -1 ? target: target.parentNode;
				var type = touched.id.indexOf('map') ? 'map' : 'game';
	        	var index = touched.attributes[type + label].value;
	        	// // app.display.setIndex(index);
	        });
			return this;
		},
		modeOptions: function (elem) {

			var e = input(elem);

			e.addEventListener('touchstart', function() {

	        	// get the index
	        	var index = Array.prototype.indexOf.call(e.parentNode.childNodes, e);

	        	// if the mode options are already under selection, then change the index
	        	if (app.menu.active()) {
	        		 // app.display.setIndex(index);
	        		 //app.game.update();

				// otherwise simulate selecting them with the key right push
				// and set the default index to the selected option
	        	} else { 
	        		// app.display.setOptionIndex(index);
		        	app.key.press(app.key.right());
	        	}
	        });

	        return this;
		},
		changeMode: function (elem) {
			input(elem).addEventListener('touchstart', function () {if(app.menu.active()) app.key.press(app.key.left());});
			return this;
		},
		doubleTap: function (elem) {
			input(elem).addEventListener('touchstart', function() { if (doubleTap()) app.key.press(app.key.enter());});
			return this;
		},
		element: function (elem) {
			input(elem).addEventListener('touchstart', function (touch) {
				var touched = touch.target;
				var name = touched.parentNode.id == 'settings' ? touched.id : touched.parentNode.id;
				var setting = name.replace('Settings','').replace('Container','');
				// app.display.setIndex(setting);
				//app.game.update();
			});
			return this;
		},
		esc: function (elem) {
			input(elem).addEventListener('touchstart', function() {if(app.user.player().ready()) app.key.press(app.key.esc());});
			return this;
		}
	};
};
},{"../controller/menu.js":6,"../input/keyboard.js":28,"../menu/scroll.js":49,"../objects/user.js":78,"../settings/app.js":79}],30:[function(require,module,exports){
/* ---------------------------------------------------------------------------------------------------------*\   
    app
\* ---------------------------------------------------------------------------------------------------------*/

app = require("./game/app.js");

/* ---------------------------------------------------------------------------------------------------------*\   
    add useful methods to prototypes
\* ---------------------------------------------------------------------------------------------------------*/

// add first letter capitalization funcitonality
Object.prototype.isArray = function () { return this.constructor === Array };
String.prototype.uc_first = function () { return this.charAt(0).toUpperCase() + this.slice(1); };
Array.prototype.hasValue = function (value) { return this.indexOf(value) > -1; };
Array.prototype.map = function (callback) {
    var mapped = [], i = this.length;
    while (i--) mapped[i] = callback(this[i], i, this);
    return mapped;
};
Array.prototype.filter = function (callback) {
    var filtered = [], len = this.length;
    for (var i = 0; i < len; i += 1) 
        if (callback(this[i], i, this)) 
            filtered.push(this[i]);
    return filtered;
};
Array.prototype.reduce = function (callback, initial) {
    var current, prev = initial || this[0];
    for (var i = initial ? 1 : 0, length = this.length; i < length; ++i)
        prev = callback(prev, this[i], i, this);
    return prev;
};
Array.prototype.findIndex = function (callback) {
    var i = this.length;
    while (i--) if (callback(this[i], i, this)) return i;
};
Array.prototype.find = function (callback) { return this[this.findIndex(callback)];};

/* --------------------------------------------------------------------------------------*\ 
    load dummy variables if/for testing locally 
\* --------------------------------------------------------------------------------------*/

gameMap = require('./objects/map.js');

if (app.testing){

    app.games.push({
        category: gameMap.category,
        max: gameMap.players,
        mapId: gameMap.id,
        settings: {
            funds: 1000,
            fog:'off',
            weather:'random',
            turn:'off',
            capt:'off',
            power: 'on',
            visuals: 'off'
        },
        name:'testing'
    });
}

/* ---------------------------------------------------------------------------------------------------------*\
    event listeners
\* ---------------------------------------------------------------------------------------------------------*/

window.addEventListener("wheel", function(e){app.scroll.wheel(e.deltaY, new Date());});

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
app.screen.setDimensions(app.cursorCanvas.dimensions());

/* ----------------------------------------------------------------------------------------------------------*\
    animation instructions
\*-----------------------------------------------------------------------------------------------------------*/

app.drawTerrain = function (draw) { draw.cache().coordinate('map', 'terrain'); };
app.drawBuilding = function (draw) { draw.coordinate('map', 'buildings'); };
app.drawBackground = function (draw) {draw.background('background'); };
app.drawUnit = function (draw) { draw.coordinate('map', 'units'); };
app.drawWeather = function (draw) {};
app.drawEffects = function (draw) {
    draw.coordinate('effect', 'highlight'); // highlighting of movement range
    draw.coordinate('effect', 'path'); // highlighting current path
    draw.coordinate('effect', 'attackRange'); // highlight attack range
};
app.drawCursor = function (draw) {
    if (!app.cursor.hidden() && app.user.turn())
        draw.coordinate('map', 'cursor', [app.cursor.position()]);
    if (app.target.active()) 
        draw.coordinate('map', app.target.cursor(), [app.target.position()]);
};
},{"./game/app.js":21,"./objects/map.js":65}],31:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    CoElement.js defines the element that holds co selection information

\* --------------------------------------------------------------------------------------*/

Element = require('../../menu/elements/element.js');
CoElement = function (number, init) {
	this.setType('co');
	this.setNumber(number);
	this.setColor(app.settings.playerColor[number]);
	var list = Object.keys(app.co);
	var allowed = {index:true, hide:true};
	for (var name, i = 0, len = list.length; i < len; i += 1) {
        var name = list[i], co = app.co[name];
        this.addProperty(name, { name:co.name, image:co.image });
        allowed[name] = name;
    }
    this.setElement(app.dom.createList(allowed, this.id(), list));
    this.setClass('coList');
    this.setCurrent(init);
    this.setDescription('Chose a CO.');
    this.setBorder(this.element().clientLeft);
    this.fader = new Fader(this.element(), this.color.get());
	app.touch(this.element()).element().scroll().doubleTap().esc();
	app.click(this.element()).element().scroll().doubleClick().esc();
};
CoElement.prototype = Object.create(Element);
CoElement.prototype.constructor = CoElement;
CoElement.prototype.getStyle = function (parameter) {
    return Number(this.element().parentNode.style[parameter].replace('px',''));
};
module.exports = CoElement;
},{"../../menu/elements/element.js":32}],32:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    Element.js defines a generic menu element with methods common to all game menus

\* --------------------------------------------------------------------------------------*/

UList = require('../../menu/elements/ul.js');
Element = Object.create(UList.prototype);
Element.p = {};
Element.isComputer = function () {return this.value() === 'cp';};
Element.addProperty = function (index, value){ this.p[index] = value; };
Element.properties = function () {return this.p;};
Element.property = function (index) {return this.p[index];};
Element.setDescription = function (description) {this.d = description;};
Element.description = function () {return this.descriptions() ? this.d[this.indexOf(this.current())] : this.d;};
Element.descriptions = function () {return !(typeof(this.d) === "string");};
Element.element = function () { return this.e; };
Element.setType = function (type) {this.t = type; return this;};
Element.setHeight = function (height) {this.element().style.height = height + 'px';};
Element.setTop = function (top) {this.element().style.top = top + 'px';};
Element.setWidth = function (width) { return this.e.style.width = width + 'px'; };
Element.setColor = function (color) { this.color = new Hsl(color); };
Element.type = function(){ return this.t; };
Element.index = function () { return this.number() - 1; };
Element.add = function (element) { this.element().appendChild(element);};
Element.id = function () {return 'player' + this.number() + this.type();};
Element.setNumber = function (number) {this.n = number;};
Element.number = function () {return this.n};
Element.getStyle = function (parameter) {return Number(this.element().style[parameter].replace('px',''));};
Element.position = function () {return {x:this.left(), y:this.top()};};
Element.dimensions = function () {return {x:this.width(), y:this.height()};};
Element.top = function () {return this.getStyle('top');};
Element.left = function () {return this.getStyle('left');};
Element.height = function () {return this.getStyle('height') || this.element().offsetHeight;};
Element.width = function () {return this.getStyle('width') || this.element().offsetWidth;};
Element.setBorder = function (border) {this.b = border; return this};
Element.border = function () {return this.b; };
module.exports = Element;
},{"../../menu/elements/ul.js":42}],33:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    List.js creates an interface for iterating over a list of dom elements

\* --------------------------------------------------------------------------------------*/

List = function (elements, init) {
    this.setElements(elements || []);
    this.setCurrent(init);
};
List.prototype.setIndex = function (index) {
    this.i = index && index > 0 ? index : 0;
    return this;
};
List.prototype.setCurrent = function (property) {return this.setIndex(isNaN(property) ? this.indexOf(property) : (property || 0));};
List.prototype.reset = function () {return this.setIndex(0);},
List.prototype.index = function () { return this.i; },
List.prototype.wrap = function (number) {
    var elements = this.limited || this.elements(), length = elements.length;
    return !number ? 0 : number >= length ? number - length : number < 0 ? length + number : number;
};
List.prototype.move = function (index) { return this.setIndex(this.wrap(index)); };
List.prototype.next = function () { return this.move(this.i + 1); };
List.prototype.prev = function () { return this.move(this.i - 1); };
List.prototype.indexOf = function (property) { return this.find(function (element, index) { if (property === element) return index; }); };
List.prototype.add = function (element) {this.elements().push(element);};
List.prototype.find = function (callback) {
    var elements = this.limited || this.elements();
    for (var i = 0, len = elements.length; i < len; i += 1)
        if (callback(elements[i], i))
            return i;
};
List.prototype.elements = function () { return this.li; };
List.prototype.setElements = function (elements) {this.li = elements; return this;};
List.prototype.current = function () {
    var limit = this.limited, index = this.i;
    return limit ? limit[index < limit.length ? index : 0] : this.getElement(index);
};
List.prototype.getElement = function (index) {
    return this.elements()[index];
};
List.prototype.limit = function (callback) {
    var elements = this.elements(), current = this.current();
    this.limited = elements.filter(callback);
    this.setIndex(this.limited.indexOf(current));
    return this;
};
module.exports = List;
},{}],34:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    ModeElement.js defines the element used for option selection on the mode menu

\* --------------------------------------------------------------------------------------*/

ModeElement = function (c, id) {
    this.createElement().setClass(c).setId(id);
   	this.setName(c);
};
ModeElement.prototype.setName = function (name) { this.c = name };
ModeElement.prototype.setClass = function (c) { 
    this.element().setAttribute('class', c);
    return this;
};
ModeElement.prototype.element = function () {return this.e;};
ModeElement.prototype.setIndex = function (index) { this.element().setAttribute(this.name()+'Index', index); };
ModeElement.prototype.setId = function (id) { this.element().setAttribute('id',id); };
ModeElement.prototype.setHeight = function (height) { this.element().style.height = height; };
ModeElement.prototype.setColor = function (color) { this.element().style.color = color; };
ModeElement.prototype.createElement = function () {
	this.e = document.createElement('li');
	return this;
};
ModeElement.prototype.add = function (element) {
	this.element().appendChild(element);
	return this;
};
ModeElement.prototype.clearHeight = function () {this.current().style.height = '';};
module.exports = ModeElement;
},{}],35:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    ModesElement.js defines the element that is used in game mode selection

\* --------------------------------------------------------------------------------------*/

UList = require('../../menu/elements/ul.js');
TextElement = require('../../menu/elements/textElement.js');
ModeElement = require('../../menu/elements/modeElement.js');
Hsl = require('../../tools/hsl.js');
OptionElement = require('../../menu/elements/optionElement.js');

ModesElement = function (element, index) {

    var background, text, outline, li, id = element.id;
    this.setOutline((outline = this.createOutline('block')));
    this.setBackground((background = this.createBackground('modeBackground')));
    this.setText(new TextElement(id));
    this.setElement((li = new ModeElement('modeItem', id)));
    this.setIndex(index);
    var text = this.text.element();
    this.setColor(new Hsl(app.settings.colors[id]));
    li.add(background).add(outline).add(text).setColor(this.color.format());

    app.touch(text).changeMode().doubleTap();
    app.touch(background).changeMode().doubleTap();
    app.touch(li.element()).scroll();

    app.click(text).changeMode().doubleClick();
    app.click(background).changeMode().doubleClick();
    app.click(li.element()).scroll();

    if (element.options) {
        var options = (new OptionElement('modeOptions')).hide();
        for (var i = 0, len = element.options.length; i < length; i += 1) {
            options.add((option = this.createOption(element.options[i], element.id, i)));
            app.touch(option).modeOptions().doubleTap();
            app.click(option).modeOptions().doubleClick();
        }
        li.add(options.element());
        this.options = options;
    }
};
ModesElement.prototype.background = function () {return this.b;};
ModesElement.prototype.element = function () {return this.e.element();};
ModesElement.prototype.object = function () {return this.e;};
ModesElement.prototype.setBackground = function (background) {this.b = background;};
ModesElement.prototype.setText = function (text) {this.text = text;};
ModesElement.prototype.setElement = function (element) {this.e = element;};
ModesElement.prototype.setOptions = function (options) {this.options = options;};
ModesElement.prototype.setPosition = function (position) {
    this.element().setAttribute('pos', position);
    this.p = position;
};
ModesElement.prototype.position = function () {return this.p;};
ModesElement.prototype.setOutline = function (outline) { this.o = outline; };
ModesElement.prototype.outline = function () {return this.o;};
ModesElement.prototype.setColor = function (color) {
    this.outline().style.backgroundColor = color.format();
    this.color = color;
    this.text.setColor(color);
};
ModesElement.prototype.createBackground = function (c) {
    var background = document.createElement('div');
    background.setAttribute('class', c);
    return background;
};
ModesElement.prototype.createOutline = function (c) {
    var outline = document.createElement('div');
    outline.setAttribute('class', c);
    return outline;
};
ModesElement.prototype.createOption = function (option, id, index) {
    var element = document.createElement('li');
    element.setAttribute('class', 'modeOption');
    element.setAttribute('modeOptionIndex', index + 1);
    element.setAttribute('id', option + id);
    element.innerHTML = option;
    return element;
};
ModesElement.prototype.id = function () {return this.element().id;};
ModesElement.prototype.outlineDisplay = function (type) {this.outline().style.display = type;};
ModesElement.prototype.hideOutline = function () {this.outlineDisplay('none');};
ModesElement.prototype.showOutline = function () {this.outlineDisplay(null);};
ModesElement.prototype.setIndex = function (index) {this.i = index;};
ModesElement.prototype.index = function (){return this.i;};
ModesElement.prototype.select = function () {
    if (this.options) this.options.show();
    this.text.select();
    this.hideOutline();
    return this;
};
ModesElement.prototype.deselect = function () {
    if (this.options) this.options.hide();
    this.text.deselect();
    this.showOutline();
    return this;
};
module.exports = ModesElement;
},{"../../menu/elements/modeElement.js":34,"../../menu/elements/optionElement.js":36,"../../menu/elements/textElement.js":41,"../../menu/elements/ul.js":42,"../../tools/hsl.js":86}],36:[function(require,module,exports){
UList = require('../../menu/elements/ul.js');
OptionElement = function (c) {
    this.setElement(document.createElement('ul'));
    this.setIndex(0);
    this.setClass(c);
};
OptionElement.prototype = Object.create(UList.prototype);
OptionElement.prototype.constructor = OptionElement;
OptionElement.prototype.setOpacity = function (opacity) {
    this.element().style.opacity = opacity;
    return this;
};
OptionElement.prototype.show = function () {return this.setOpacity(1);};
OptionElement.prototype.hide = function () {return this.setOpacity(0);};
OptionElement.prototype.active = function () {return this.a;};
OptionElement.prototype.activate = function () {this.a = true;};
OptionElement.prototype.deactivate = function () {
	this.setIndex(0)
	this.a = false;
};
module.exports = OptionElement;
},{"../../menu/elements/ul.js":42}],37:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    PlayerElement.js creates an element and interface for interacting with co selection

\* --------------------------------------------------------------------------------------*/

Element = require('../../menu/elements/element.js');
PlayerElement = function (number, size, height) {
	var screen = document.getElementById('setupScreen');
	var width = screen.offsetWidth;
	var sections = width / app.map.players();
    this.setNumber(number);
    this.setElement(document.createElement('section'));
    this.setId('player' + number);
    this.setClass('players');
    this.setWidth(size);
    this.setHeight(size);
    this.setLeft(((sections * this.index()) + ((sections - size) / 2)));
    this.setTop(height);
};
PlayerElement.prototype = Object.create(Element);
PlayerElement.prototype.list = function () {return this.element().childNodes;};
PlayerElement.prototype.setMode = function  (mode) {this.m = mode}; 
PlayerElement.prototype.mode = function () { return this.m; };
PlayerElement.prototype.setCo = function (co) {this.c = co;};
PlayerElement.prototype.co = function () {return this.c;};
PlayerElement.prototype.setTeam = function (team) {this.t = team;};
PlayerElement.prototype.team = function () {return this.t;};
PlayerElement.prototype.fade = function () {return this.co().fader.start(); };
PlayerElement.prototype.fading = function () { return this.co().fader.fading(); };
PlayerElement.prototype.stopFading = function () {return this.co().fader.stop();};
PlayerElement.prototype.bottom = function () {return this.top() + this.height() + 10; };
PlayerElement.prototype.toSolid = function () {return this.co().fader.stop().toSolid();};
PlayerElement.prototype.toWhite = function () {return this.co().fader.stop().toWhite();};
PlayerElement.prototype.show = function () {
    this.co().show();
    this.mode().show();
};
PlayerElement.prototype.constructor = PlayerElement;
module.exports = PlayerElement;
},{"../../menu/elements/element.js":32}],38:[function(require,module,exports){
Element = require('../../menu/elements/element.js');
PlayerNumber = function (number, size, init) {
	var fontSize = size / 4, properties = {
        index: true,
        hide: true,
    };
    this.name = number+'p';
    properties[this.name] = this.name;
    if (number !== 1 || app.game.started()) 
    	properties.Cp = 'Cp';
    var props = [this.name, 'Cp'];
	this.setNumber(number);
    this.setType('mode');
	this.setElement(app.dom.createList(properties, this.id(), props));
	this.setClass('playerMode');
	this.sizeFont(fontSize);
	this.setLeft(size - (fontSize / 2));
	this.setIndex(init ? props.indexOf(init.uc_first()) : 0);
	this.setDescription('Chose Player or Computer.');
	app.touch(this.element()).element().scroll();
	app.click(this.element()).element().scroll();
};
PlayerNumber.prototype = Object.create(Element);
PlayerNumber.prototype.constructor = PlayerNumber;
PlayerNumber.prototype.getStyle = function (parameter) {
	var parent = Number(this.element().parentNode.style[parameter].replace('px',''));
	var element = Number(this.element().style[parameter].replace('px',''));
	return parameter === 'top' || parameter === 'left' ? parent + element : element;
};
module.exports = PlayerNumber;
},{"../../menu/elements/element.js":32}],39:[function(require,module,exports){
Element = require('../../menu/elements/element.js');
SettingElement = function (property, parameters) {
    var def, list = app.dom.createList(this.rule(property), property + 'Settings', this.allowed);
    this.setType(property);
    this.createOutline(list);
    this.createBackground();
    this.setElements(list.childNodes);
    this.setHeading(property);
    (def = this.settings[property].def) ? this.setDefault(def) : this.setIndex(0);
    app.touch(this.background()).element().scroll(list);
    app.click(this.background()).element().scroll(list);
    this.show();
};
SettingElement.prototype = Object.create(Element);
SettingElement.prototype.constructor = SettingElement;
SettingElement.prototype.setDefault = function (def) {
    this.setIndex(this.find (function (element) {return element.className === def.toLowerCase();}));
};
SettingElement.prototype.createBackground = function () {
    var background = document.createElement('div');
    background.setAttribute('id', this.type() + 'Background');
    background.setAttribute('class', 'rules');
    return this.b = background;
};
SettingElement.prototype.createOutline = function (list) {
    var outline = document.createElement('div');
    outline.setAttribute('id', this.type() + 'Container');
    outline.setAttribute('class', 'stable');
    outline.appendChild(this.createHeading());
    outline.appendChild(list);
    return this.setElement(outline);
};
SettingElement.prototype.createHeading = function () { 
    this.heading = document.createElement('h1'); 
    return this.heading;
};
SettingElement.prototype.setHeading = function (text) { return this.heading.innerHTML = text; };
SettingElement.prototype.indexOf = function (property) {
    var elements = this.elements();
    for (var i = 0, len = elements.length; i < len; i += 1)
        if (property === elements[i])
            return i;
};
SettingElement.prototype.setHeight = function (top) {
    this.h = top;
    this.background().style.top = top + 'px';
    this.outline().style.top = top + 'px';
};
SettingElement.prototype.setLeft = function (left) {
    this.l = left;
    this.background().style.left = left + 'px';
    this.outline().style.left = left + 'px';
};
SettingElement.prototype.setPosition = function (left, top) {
    this.setHeight(top);
    this.setLeft(left);
};
SettingElement.prototype.allowed = ['on', 'off', 'num', 'clear', 'rain', 'snow', 'random', 'a', 'b', 'c'];
SettingElement.prototype.addNumbers = function (object, inc, min, max) {
    for (var n = min; n <= max; n += inc)
        object[n] = n;
    return object;
};
SettingElement.prototype.outline = function () {return this.e;}; 
SettingElement.prototype.background = function () {return this.b;}
SettingElement.prototype.rule = function (property) {
    var rule = this.settings[property];
    rule.hide = true;
    rule.index = true;
    if (rule.description) this.setDescription(rule.description);
    return rule.inc ? this.addNumbers(rule, rule.inc, rule.min, rule.max): rule;
};
SettingElement.prototype.rules = app.settings.settingsDisplayElement;
SettingElement.prototype.settings = {
    fog:{
        description:'Set ON to limit vision with fog of war.',
        on:'ON',
        off:'OFF'
    },
    weather:{
        description:'RANDOM causes climate to change.',
        clear:'Clear',
        rain:'Rain',
        snow:'Snow',
        random:'Random'
    },
    funds:{
        description:'Set funds recieved per allied base.',
        inc:500,
        min:1000,
        max:9500
    },
    turn:{
        description:'Set number of days to battle.',
        off:'OFF',
        def:'OFF',
        inc:1,
        min:5,
        max:99
    },
    capt:{
        description:'Set number of properties needed to win.',
        off:'OFF',
        def:'OFF',
        inc:1,
        min:7,
        max:45
    },
    power:{
        description:'Select ON to enamble CO powers.',
        on:'ON',
        off:'OFF'
    },
    visuals:{
        description:[
            'No animation.',
            'Battle and capture animation.',
            'Battle animation only.',
            'Battle animation for players only.'
        ],
        off:'OFF',
        a:'Type A',
        b:'Type B',
        c:'Type C'
    }
};
module.exports = SettingElement;
},{"../../menu/elements/element.js":32}],40:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    TeamElement.js defines the element that is used in team selection

\* --------------------------------------------------------------------------------------*/

Element = require('../../menu/elements/element.js');
TeamElement = function (number, size) {

    this.teams = ['a','b','c','d', 'e', 'f', 'g', 'h'].slice(0, app.map.players());
    var properties = {
        ind: true,
        hide: true
    };
    for (var t, i = 0; i < this.teams.length; i += 1)
        properties[(t = this.teams[i])] = t.toUpperCase() + 'Team';

    this.setNumber(number);
    this.setType('team');
    this.setElement(app.dom.createList(properties, this.id(), this.teams));
    this.setClass('team');
    this.setTop(size * 4); // may be setTop
    this.setWidth(size);
    this.setCurrent(number - 1);
    this.setDescription('Set alliances by selecting the same team.');
    app.touch(this.element()).element().scroll().doubleTap();
    app.click(this.element()).element().scroll().doubleClick();        
};
TeamElement.prototype = Object.create(Element);
TeamElement.prototype.getStyle = function (parameter) {
    var parent = Number(this.element().parentNode.style[parameter].replace('px',''));
    var element = Number(this.element().style[parameter].replace('px',''));
    if (parameter === 'top') return parent + element + 10;
    else return parameter === 'left' ? parent + element : element;
}
TeamElement.prototype.constructor = TeamElement;
module.exports = TeamElement;
},{"../../menu/elements/element.js":32}],41:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    TextElement.js controls the text element on the mode screen

\* --------------------------------------------------------------------------------------*/

TextElement = function (text) {
	this.createBackground('textBackground').setText(text);
	this.createElement('text').add(this.background());
};
TextElement.prototype.createBackground = function (c) {
	var span = document.createElement('span');
    span.setAttribute('class', c);
    this.setBackground(span);
    return this;
};
TextElement.prototype.setBackground = function (background) {this.b = background;};
TextElement.prototype.background = function () {return this.b;};
TextElement.prototype.setText = function(text) {
    this.t = text;
    this.background().innerHTML = text;
};
TextElement.prototype.text = function () {return this.t;};
TextElement.prototype.length = function () {return this.t.length;};
TextElement.prototype.width = function () {return this.element().clientWidth;};
TextElement.prototype.backgroundWidth = function () {return this.background().offsetWidth;};
TextElement.prototype.setElement = function (element) {this.e = element;};
TextElement.prototype.setColor = function (color) {
    this.element().style.borderColor = typeof(color) === "string" ? color : color.format();
    this.color = color;
};
TextElement.prototype.setClass = function (c) {this.element().setAttribute('class',c);};
TextElement.prototype.add = function (element){this.element().appendChild(element);};
TextElement.prototype.createElement = function (c) {
	var text = document.createElement('h1');
    this.setElement(text);
    this.setClass(c);
    return this;
};
TextElement.prototype.element = function () {return this.e;};
TextElement.prototype.setSpacing = function (spacing) {this.element().style.letterSpacing = spacing ? spacing + 'px' : null;};
TextElement.prototype.setBackgroundColor = function (color) {this.background().style.backgroundColor = color;};
TextElement.prototype.hideBackground = function () {this.setBackgroundColor('transparent');};
TextElement.prototype.showBackground = function () {this.setBackgroundColor(null);};
TextElement.prototype.setTransform = function (transform) {this.background().style.transform = transform;};
TextElement.prototype.select = function () {

    var letters = this.length();
    var parentWidth = this.width();
    var bgWidth = this.backgroundWidth();

    // devide the text width by the width of the parent element and divide it by 4 to split between letter spacing and stretching
    var diff = (bgWidth / parentWidth ) / 4;
    
    // find the amount of spacing between letters to fill the parent
    var spacing = (diff * bgWidth) / letters;
    
    this.setTransform(diff + 1); // find the amount of stretch to fill the parent
    this.setSpacing(spacing);
    this.hideBackground();
};
TextElement.prototype.deselect = function () {
    this.setTransform(null);
    this.setSpacing(null);
    this.setBackgroundColor('white');
};
module.exports = TextElement;
},{}],42:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    Ul.js creates an interface for iterating over ul list items
    
\* --------------------------------------------------------------------------------------*/

List = require('../../menu/elements/list.js');
Ul = function (ul, init) {
    this.setElement(ul = ul || document.createElement('ul'));
    this.setCurrent(init);
};
Ul.prototype = Object.create(List.prototype);
Ul.prototype.changeCurrent = function (value) {return this.hide().setCurrent(value).show();};
Ul.prototype.element = function () { return this.e; };
Ul.prototype.setElement = function (element) {
    this.e = element;
    this.setElements(element.childNodes);
    return this;
};
Ul.prototype.hideAll = function () {
    var elements = this.elements(), i = elements.length;
    while (i--) elements[i].style.display = 'none';
    return this;
};
Ul.prototype.move = function (index) { return this.setIndex(this.scroll(this.wrap(index))); };
Ul.prototype.setMin = function (min) {this.listTop = min; return this;};
Ul.prototype.setMax = function (max) {this.listBottom = (this.max = max); return this;};
Ul.prototype.setScroll = function (min, max) {
    this.setMin(min).setMax(max).scroll(this.index()); 
    return this;
};
Ul.prototype.scroll = function (target) {

    var max = this.max; 

    if (max) {

        var move = false;

        if (target > this.listBottom) {

            move = true;
            this.listBottom = target;
            this.listTop = target - max;

        } else if (target < this.listTop) {

            move = true;
            this.listBottom = target + max;
            this.listTop = target;
        }

        if (move) { 
            var top = this.listTop;
            var bottom = this.listBottom;
            var scope = this;

            this.elements().forEach(function (e,i) {
                scope.display(i < top || i > bottom ? "none" : "block", e);
            });
        }
    }
    return target;
};
Ul.prototype.display = function (display, element) {
    (element ? element : this.current())
        .style.display = display || null;
    return this;
};
Ul.prototype.indexOf = function (property) {
	var scope = this;
    return this.find(function (element, index) {
        return property && property.toString() === element.className;
    });
};
Ul.prototype.setLeft = function (left) {this.element().style.left = left + 'px';};
Ul.prototype.setBackgroundColor = function (color) {if (this.current()) this.current().style.backgroundColor = color || null;};
Ul.prototype.highlight = function () {this.setBackgroundColor('tan'); return this;};
Ul.prototype.deHighlight = function () {this.setBackgroundColor(null); return this;};
Ul.prototype.show = function (property, display) {
    if (property) this.hide().setCurrent(property);
    this.display(display || 'block');
    return this;
};
Ul.prototype.hide = function () {return this.display('none');};
Ul.prototype.value = function () {return this.current().innerHTML.toLowerCase(); };
Ul.prototype.setId = function (id) {this.element().setAttribute('id', id);};
Ul.prototype.id = function (element) {return element ? element.id : this.current() ? this.current().id : false; };
Ul.prototype.class = function (element) {return element ? element.className : this.current().className;};
Ul.prototype.setClass = function (c) { this.element().setAttribute('class', c); };
Ul.prototype.sizeFont = function (s) { this.element() }; 
Ul.prototype.add = function (element) { this.element().appendChild(element); };
Ul.prototype.prepHorizontal = function () {
    for  (var index = 0, ind = this.index(), i = ind - 1; i < ind + 1; i +=1)
        this.getElement(this.wrap(i)).setAttribute('pos', ['left','center','right'][index++]);
};
Ul.prototype.constructor = Ul;
module.exports = Ul;
},{"../../menu/elements/list.js":33}],43:[function(require,module,exports){
Menu = require('../objects/menu.js');
BuildingsDisplay = require('../objects/buildingsDisplay.js');
Ulist = require('../menu/elements/ul.js');
app.select = require('../tools/selection.js');

Join = Object.create(Menu);
Join.map = function () { 
    this.h = true;
    return this.chose('map'); 
};
Join.game = function () { 
    this.h = false;
    return this.chose('game'); 
};
Join.host = function () { return this.h; };
Join.update = function (type) {
    var elements = app.dom.createMenu(app.maps.all(), ['name'], this.element);
    var replace = document.getElementById(this.element.section);
    replace.parentNode.replaceChild(elements, replace);
    this.buildings.set(app.maps.info());
    this.maps.setElement(elements.firstChild);
    this.maps.highlight();
};
Join.chose = function (type) {
    var map;
    if (!this.active()) this.init(type);
    if (app.key.pressed(['left','right']) && app.key.undo()) this.selectCategory();
    if (app.maps.updated()) this.update(type);
    if (app.key.pressed(['up','down']) && app.key.undo()) {
        // needs testing
        var haha = app.select.verticle(this.maps.deHighlight()).highlight().current();
        console.log(haha);
        this.buildings.set(haha);
    }
    if (app.key.pressed(app.key.enter()) && (map = app.maps.byId(this.maps.id())) || app.key.pressed(app.key.esc())) {
        app.key.undo();
        this.remove();
        return map ? this.setup(map) : this.goBack();
    }
};
Join.selectCategory = function () {
    var categories = this.categories.hide();
    app.select.horizontal(categories).show().prepHorizontal();
    app.maps.setCategory(categories.id());
    this.buildings.set(this.maps.current());
};
Join.add = function (map) {
    app.game.name(map.name);
    map.players.push(app.user.raw());
    app.players.add(map.players);
    socket.emit('join', map);
};
Join.setup = function (map) {
    app.map.set(map.map ? map.map : map);
    if (!this.host()) this.add(map);
    return map;
};
Join.init = function (type) {
    this.activate();
    this.element = app.maps.type(type).screen();
    this.display(type);
};
Join.display = function (type) {

    var screen = this.createScreen('setupScreen');
    this.createTitle('Select*'+type);

    var categories, maps = app.dom.createMenu(app.maps.all(), ['name'], this.element, function (list) {
        var element = list.childNodes[0];
        app.touch(element).mapOrGame().doubleTap();
        app.click(element).mapOrGame().doubleClick();
    });

    this.category = categories = app.dom.createMenu(app.settings.categories, '*', {
        section: 'categorySelectScreen',
        div:'selectCategoryScreen'
    });
    
    this.maps = (new UList(maps.firstChild)).highlight();
    this.buildings = new BuildingsDisplay();
    this.categories = (new UList(categories.firstChild)).hideAll().show();

    // handle touch events for swiping through categories
    app.touch(categories).swipe();
    app.click(categories).swipe();

    // add elements to the screen
    screen.appendChild(this.buildings.element());
    screen.appendChild(maps);
    screen.appendChild(categories);
    
    app.maps.setCategory(this.categories.id());

    //return the modified screen element
    return screen;
};
Join.remove = function () {
    this.deactivate();
    var select = document.getElementById(this.element.section);
    var buildings = document.getElementById('buildingsDisplay');
    var categories = document.getElementById('categorySelectScreen');
    var screen = this.screen();
    screen.removeChild(select);
    screen.removeChild(buildings);
    screen.removeChild(categories);
    app.key.undo();
    app.maps.clear();
};
module.exports = Join;
},{"../menu/elements/ul.js":42,"../objects/buildingsDisplay.js":58,"../objects/menu.js":67,"../tools/selection.js":91}],44:[function(require,module,exports){
socket = require('../tools/sockets.js');
app.game = require('../game/game.js');
app.screens = require('../objects/screens.js');
app.user = require('../objects/user.js');
app.input = require('../objects/input.js');
Menu = require('../objects/menu.js');

Login = Object.create(Menu);
Login.testAPI = function () {
	var scope = this;
	FB.api('/me', function(response) { 
		return scope.loginToSetup(response, 'facebook');
	});
};

// allow login through fb ---- fb sdk
// This is called with the results from from FB.getLoginStatus().
Login.statusChangeCallback = function (response) {
    if (response.status === 'connected') return this.testAPI();
    else {
    	this.loginScreen.style.display = null;
    	if (response.status === 'not_authorized') document.getElementById('status').innerHTML = 'Log in to play JS-WARS!';
   		else document.getElementById('status').innerHTML = 'Please log in';
    }
};

// format is where the login is coming from, allowing different actions for different login sources
Login.loginToSetup = function (user, format) {
    if(user && user.id) {
       	app.user = new app.user(user);
        socket.emit('addUser', user);
        if(!app.testing) this.loginScreen.parentNode.removeChild(this.loginScreen);
        app.game.setup();
        return true;
    }
};

Login.setup = function () {

    // create login screen
    var loginScreen = this.createScreen('login');

    // login form
    loginForm = document.createElement('section');
    loginForm.setAttribute('id', 'loginForm');
    var form = app.input.form('loginText', loginForm,'Guest name input.');
    loginForm.appendChild(form);

    // create button for fb login
    var fbButton = document.createElement('button');
    fbButton.setAttribute('scope', 'public_profile, email');
    fbButton.setAttribute('onClick', 'app.login.send();');
    fbButton.setAttribute('onLogin', 'app.login.verify();');
    fbButton.setAttribute('id', 'fbButton');

    // create a holder for the login status
    var fbStatus = document.createElement('div');
    fbStatus.setAttribute('id', 'status');

    loginForm.appendChild(fbButton);

    loginScreen.appendChild(loginForm);
    loginScreen.appendChild(fbStatus);

    return loginScreen;
};

Login.send = function () {
    // if login is successful go to game setup, otherwise the user has declined
    var paramsLocation=window.location.toString().indexOf('?');
    var params="";
    if (paramsLocation>=0)
    params=window.location.toString().slice(paramsLocation);
    top.location = 'https://graph.facebook.com/oauth/authorize?client_id=1481194978837888&scope=public_profile&email&redirect_uri=http://localhost/'+params;
};
Login.verify = function () {
	var scope = this;
	FB.getLoginStatus(function(response) {
		scope.statusChangeCallback(response);
	});
};
Login.display = function () {

    if(!app.testing) {
    	var scope = this;
    	window.fbAsyncInit = function() {
            FB.init({
                appId     : '1481194978837888',
                oauth     : true,
                cookie    : true,  // enable cookies to allow the server to access 
                xfbml     : true,  // parse social plugins on this page
                version   : 'v2.3' // use version 2.2
            });
            FB.getLoginStatus(function(response) {scope.statusChangeCallback(response);});
        };

        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        this.loginScreen = this.setup();
        document.body.appendChild(this.loginScreen, app.dom.insertLocation);

        // hide the login screen, only show if someone has logged in
        this.loginScreen.style.display = 'none';

    } else {
        this.loginToSetup({
            email: "testUser@test.com",
            first_name: "Testy",
            gender: "male",
            id: "10152784238931286",
            last_name: "McTesterson",
            link: "https://www.facebook.com/app_scoped_user_id/10156284235761286/",
            locale: "en_US",
            name: "Testy McTesterson"
        });
    }
};
module.exports = Login;
},{"../game/game.js":25,"../objects/input.js":64,"../objects/menu.js":67,"../objects/screens.js":73,"../objects/user.js":78,"../tools/sockets.js":92}],45:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    Modes.js controls game mode selection 

\* --------------------------------------------------------------------------------------*/

ModesElement = require('../menu/elements/modesElement.js');
ScrollText = require('../effects/scrollText.js');
Menu = require('../objects/menu.js');
List = require('../menu/elements/list.js');
Ulist = require('../menu/elements/ul.js');
Fader = require('../effects/fade.js');

Modes = Object.create(Menu);
Modes.positions = ['twoAbove','oneAbove','selected','oneBelow','twoBelow'];
Modes.messages = {
    logout:'select to log out of the game',
    game:'Create or continue a saved game',
    newgame:'Set up a new game',
    continuegame:'Resume a saved game',
    join:'Join a new or saved game',
    newjoin:'Find and join a new game',
    continuejoin:'Re-Join a saved game started at an earlier time',
    COdesign:'Customize the look of your CO',
    mapdesign:'Create your own custom maps',
    design:'Design maps or edit CO appearance',
    store:'Purchase maps, CO\'s, and other game goods' 
};
Modes.setList = function (elements) {this.l = elements;};
Modes.list = function () {return this.l;};
Modes.setElement =function (element) {this.e = element;};
Modes.element = function () {return this.e; };
Modes.setHeight = function (height) {this.h = height;};
Modes.height = function () {return this.h;};
Modes.properties = function () { return app.settings.selectModeMenu; };
Modes.message = function (id) {return this.messages[id];};
Modes.insert = function (screen) {document.body.insertBefore(screen, app.dom.insertLocation);};
Modes.remove = function () {
    app.dom.removeChildren(this.screen(), 'title');
    app.footer.remove();
    this.deactivate();
    this.fader.stop();
    return this;
};
Modes.init = function () {
    this.activate();
    this.display();
};
Modes.select = function () {
    if (!this.active()) this.init();
    var options = this.options();
    return options && options.active() ? this.selectOption() : this.selectMode();
};
Modes.options = function () {return this.mode().options;};
Modes.mode = function () {return this.list().current();};
Modes.option = function () {return this.options().current();};
Modes.setMode = function (name) { this.mode = name; };
Modes.selectMode = function () {

    if (app.key.pressed(['up','down'])) {
        this.mode().deselect();
        this.fader.changeElement(
            app.select.verticle(this.list()).current().select().background()
        ).setColor(this.mode().color.get());
        app.footer.scroll(this.message(this.mode().id()));
        this.rotate();
    }

    var options = this.options();

    if (!options && app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter()))
        return this.remove().mode().id();

    if (options && app.key.pressed(app.key.right()) && app.key.undo(app.key.right())) {
        options.activate();
        this.fader.changeElement(this.option());
        app.footer.scroll(this.message(this.option().id));
    }
};
Modes.selectOption = function () {
    if (app.key.pressed(['up','down'])) {
        this.fader.changeElement(
            app.select.verticle(this.options()).current());
        app.footer.scroll(this.message(this.option().id));
    }

    if (app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter()))
        return this.remove().option().id;
    
    if (app.key.pressed(app.key.left()) && app.key.undo(app.key.left())) {
        this.fader.changeElement(this.mode().background());
        app.footer.scroll(this.message(this.mode().id()));
        this.options().deactivate();
    }
};

// rotation stuff
Modes.getPosition = function (index) { return this.positions[this.list().wrap(index)] || 'hidden'; };
Modes.getElement = function (index) { 
    var list = this.list();
    return list.elements()[list.wrap(index)];
};
Modes.setPosition = function (element, index) {this.getElement(element).setPosition(this.getPosition(index));};
Modes.rotate = function () {
    for (var index = 0, ind = this.mode().index(), i = ind - 2; i <= ind + 2; i += 1)
        this.setPosition(i, index++);
};

// initialize screen
Modes.display = function () { 

    this.setHeight(app.settings.selectedModeHeight);
    var screen = this.createScreen('setupScreen');
    var properties = this.properties(), items = [];
    this.createTitle('Select*Mode');

    // create list of selectable modes
    var menu = document.createElement('ul');
    menu.setAttribute('id', 'selectModeMenu');

    // create footer for game info and chat
    var footer = app.footer.scrolling();

    for (var i = 0, len = properties.length; i < len; i += 1) {
        var item = new ModesElement(properties[i], i);
        menu.appendChild(item.element());
        items.push(item);
    }

    // add select menu to select mode screen
    screen.appendChild(menu);
    screen.appendChild(footer);
    this.setList(new List(items));
    this.setElement(new UList(menu));
    var mode = this.mode();
    this.rotate(this.list().indexOf(mode));
    this.insert(screen);
    this.fader = (new Fader(mode.select().background(), mode.color.get())).start();
    app.footer.scroll(this.message(this.mode().id()));
    return screen;
};
module.exports = Modes;
},{"../effects/fade.js":15,"../effects/scrollText.js":17,"../menu/elements/list.js":33,"../menu/elements/modesElement.js":35,"../menu/elements/ul.js":42,"../objects/menu.js":67}],46:[function(require,module,exports){
//Select = require("../");
Exit = function (callback) {
	this.leave = callback || function () {
		this.game.end(); 
		this.a = false;
		socket.emit("exit", app.user.player());
		return this;
	};
};

Exit.prototype.prompt = function (message) { 
    app.hud.hide();
    app.coStatus.hide();
    app.cursor.hide();
	this.a = true;
	app.confirm.display(message, true);
	return this; 
};

Exit.prototype.evaluate = function () {

	var response = app.confirm.response;

	if (response) {

		if (app.key.pressed(["left","right"]))
			Select.horizontal(response.deHighlight()).highlight();

		if (app.key.pressed(['enter', 'esc'])) {

			this.deactivate();
			app.confirm.deactivate();
			app.input.remove();

			if (app.key.pressed(app.key.enter()) && response.id() === "yes")
				this.leave();

			delete app.confirm.response;
			delete this.selected;
			return true;
		}
	}
};

Exit.prototype.active = function () { return this.a };
Exit.prototype.deactivate = function () {this.a = false;};

module.exports = Exit;
},{}],47:[function(require,module,exports){
/* ----------------------------------------------------------------------------------------------------------*\
    
    app.options handles the in game options selection, end turn, save etc.
    
\* ----------------------------------------------------------------------------------------------------------*/

app = require("../../settings/app.js");
app.game = require("../../game/game.js");
app.settings = require("../../settings/game.js");
app.players = require("../../controller/players.js");
app.save = require("./save.js");
socket = require("../../tools/sockets.js");

Exit = require("./exit.js");
UList = require("../elements/ul.js");
Settings = require("../settings.js");
app.key = require("../../input/keyboard.js");

Options = Object.create(UList.prototype);
Options.subMenus = ["rules", "exit", "yield", "save", "status", "unit"];
Options.ruleMenus = [Settings, Teams];
Options.ri = 0;

/* ------=======------ helpers -------=====------ *\
\* -----------------------------------------------*/

Options.hidden = function () {return this.hid;};
Options.deactivate = function () {this.a = false;};
Options.active = function () {return this.a; };
Options.activate = function () {this.a = true;};
Options.screen = function () { return this.s; };
Options.setScreen = function (s) {this.s = s;};
Options.setMode = function (mode) {this.m = mode; return this;};
Options.mode = function () {return this.m;};
Options.screen = function () { return document.getElementById("optionsMenu"); };
Options.leaveGame = function (callback) {
    if (!this.leave) {
        this.leave = new Exit(callback).prompt("Are you sure you want to "+this.mode()+"? ");
        this.hide();
    } else if (this.leave.evaluate()) {
        this.leave = false;
        app.screen.reset();
        this.remove();
    }
};
Options.remove = function () {
    this.setMode(false);
    this.show();
    var menu = this.screen();
    if (menu) menu.parentNode.removeChild(menu);
};
Options.init = function (properties, allowed, elements) {
    this.activate();
    this.parent = app.dom.createMenu(properties, allowed, elements);
    this.selected = this.setElement(this.parent.firstChild).setIndex(0).highlight().id();
    return this;
};
Options.select = function() { 
    if (!this.hidden()) {
        if (app.key.pressed(["up", "down"])) 
            this.selected = Select.verticle(this.deHighlight()).highlight().id();

        if (app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter()))
            this[this.setMode(this.selected).mode()]();
    }
};
Options.subMenu = function () {
    var mode = this.mode();
    return this.subMenus.find(function (option) { return mode === option; });
};
Options.hide = function () { 
    this.parent.style.display = "none"; 
    this.hid = true; 
    return this;
};
Options.show = function () { 
    this.parent.style.display = null; 
    this.hid = false; 
    return this;
};

/* ------=======------ main menus -------=====------ *\
\* --------------------------------------------------*/

Options.display = function () {
    this.init(
        app.settings.optionsMenu, 
        app.settings.optionsMenuDisplay, 
        { section: "optionsMenu", div: "optionSelect" }
    );
    return this;
};


Options.co = function () { app.screen.reset(); };
Options.save = function () { 
    if (!app.save.active()) {
        this.hide();
        app.save.display();
    } else if (app.save.evaluate()) {
        app.save.deactivate();
        this.remove();
        app.screen.reset();
    }
};
Options.end = function () {
    var player = app.players.current();
    player.endTurn();
    if (app.user.player() === player) {
        app.screen.reset();
        app.animate(["cursor"]);
        socket.emit("endTurn", player.id());
    }
    return this;
};

/* ------=======------ option menus -------=====------ *\
\* ----------------------------------------------------*/

Options.options = function () { 
    this.init(
        {
            del: { name: "Delete" },
            yield: { name: "Yield" },
            music: { name: "Music" },
            visual: { name: "Visual"},
            exit: { name: "Leave" }
        },
        ["del", "yield", "music", "visual", "exit", "name"],
        { section: "optionsMenu", div: "optionSelect" }
    ); 
};
Options.del = function () {
    this.remove();
    app.screen.reset();
    app.hud.show();
    app.coStatus.show();
    app.cursor.deleteMode(); 
};
Options.yield = function () {
    this.leaveGame(function () {
        app.game.end();
        var player = app.user.player();
        socket.emit("defeat", {defeated:player, conqueror:player, capturing:false});
    })
};
Options.music = function () {        
    this.remove();
    alert("no music yet");
};
Options.visual = function () {
    this.remove();
    alert("no visuals yet");
    var description = {
        noVisual: "No visuals.",
        A: "View battle and capture animations.",
        B: "Only view battle animations.",
        C: "Only view player battle animations."
    }
};
Options.exit = function () { this.leaveGame(); };


/* ------=======------ intel menus -------=====------ *\
\* ---------------------------------------------------*/

Options.intel = function () {
    this.init(
        {
            rules: { name: "Rules" },
            status: { name: "Status" },
            unit: { name: "Unit" }
        },
        ["rules", "status", "unit", "name"],
        { section: "optionsMenu", div: "optionSelect" }
    );
};
Options.status = function () {
    // map name at top
    // graph showing units, units lost, bases, income and funds for each player
    // neutral base count at bottom
},
Options.unit = function () {
    // graph showing hp, fuel and ammo for each unit, orders them by currently hovered over parameter (hp, fuel, ammo)
    // use select button to toggle lowest or highest at the top
},

Options.ruleIndex = function () {return this.ri + 1 < this.ruleMenus.length ? (this.ri += 1) : (this.ri = 0);};
Options.rules = function () {
    if ((app.key.pressed(app.key.enter()) || !this.hidden())) {

        if (!this.hidden()) this.hide();
        else this.currentMenu.remove();
        (this.currentMenu = this.ruleMenus[this.ruleIndex()]).select();

    } else if (app.key.pressed(app.key.esc())) {

        this.currentMenu.remove();
        var ii = document.getElementById("setupScreen");
        ii.parentNode.removeChild(ii);
        this.show().setMode("intel").intel();

    }
};
module.exports = Options;
},{"../../controller/players.js":7,"../../game/game.js":25,"../../input/keyboard.js":28,"../../settings/app.js":79,"../../settings/game.js":81,"../../tools/sockets.js":92,"../elements/ul.js":42,"../settings.js":50,"./exit.js":46,"./save.js":48}],48:[function(require,module,exports){
// save
app.key = require('../../input/keyboard.js');
app.cursor = require('../../controller/cursor.js');
app.input = require('../../objects/input.js');
app.confirm = require('../../controller/confirmation.js');

module.exports = {
    display: function () {  
        app.hud.hide();
        app.coStatus.hide();
        app.cursor.hide();
        app.input.name(app.game.screen(), 'Enter name for save game.');
        this.a = true;
    },
    evaluate: function () {
    	if (!this.sent() && app.key.pressed(app.key.enter()) && app.input.entry()) {
            this.s = true;
            socket.emit('confirmSave', app.user.player());
            app.input.removeInput();
            app.confirm.waiting(app.players.other());
    	} else if ((this.r && app.key.pressed(app.key.enter())) || app.key.pressed(app.key.esc())) {
            this.remove();
            return true;
        }
    },
    recieved: function () {this.r = true;},
    active: function () { return this.a; },
    sent: function () { return this.s; },
    remove: function () {
        app.input.remove();
        app.screen.reset();
        this.a = false;
        this.s = false;
        this.r = false;
    },
    deactivate: function () {this.a = false;}
};
},{"../../controller/confirmation.js":2,"../../controller/cursor.js":3,"../../input/keyboard.js":28,"../../objects/input.js":64}],49:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    handles scrolling of menu elements etc..
    
\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.key = require('../input/keyboard.js');

module.exports = function () {

    var undo = app.key.undo, 
    direction, then = new Date(),

    scroll = function (neg, pos) {
        if (app.key.pressed(neg) || neg == direction) {
            direction = false;
            app.key.undo(app.key[neg]());
            return -1;
        } else if (app.key.pressed(pos) || pos == direction) {
            direction = false;
            app.key.undo(app.key[pos]());
            return 1;
        }
        return 0;
    };

    return {
        horizontal: function () {
            this.scroll = scroll('left','right');
            return this;
        },
        verticle: function() {
            this.scroll = scroll('up','down');
            return this;
        },
        infinite: function (index, min, max) {
            var point = index + this.scroll;
            var def = this.scroll < 0 ? max : min;
            return point > max || point < min ? def : point;
        },
        finite: function (index, min, max) {
            if(this.scroll !== undefined){
                var point = index + this.scroll;
                if (point <= max && point >= min) 
                    return point;
            }
            return false;
        },
        wheel: function (dir, now) {
            if(now - then > 200){
                direction = dir < 0 ? 'up' : 'down'; 
                then = now;
            }
        },
        swipe: function (dir, now) {
            if(now - then > 200){
                direction = dir < 0 ? 'left' : 'right'; 
                then = now;
            }
        }
    };
}();
},{"../input/keyboard.js":28,"../settings/app.js":79}],50:[function(require,module,exports){
Menu = require('../objects/menu.js');
Arrows = require('../objects/arrows.js');
Teams = require('../menu/teams.js');
Select = require('../tools/selection.js');
SettingElement = require('../menu/elements/settingElement.js');
DefaultSettings = require('../settings/default.js');
Sweller = require('../effects/swell.js');

Settings = Object.create(Menu);
Settings.parameters = new DefaultSettings();
Settings.swelling = false;
Settings.properties = [];
Settings.elements = [];
Settings.rules = {

    // optional parameter defines what display type will be displayed when revealing an element
    display:'inline-block',

    // type defines what page will be loaded
    type:'rules',

    // name of the element that is parent to the list
    element:'Settings',

    // name of the index, comes after the property name: property + index
    index:'SettingsIndex',

    // holds the name of the tag being retrieved as a value from the selected element
    attribute:'class',

    // holds the name of the element used for chat and description etc, displayed text
    text:'descriptions',

    // holds the object that defines all that will be scrolled through
    properties: app.settings.settingsDisplayElement
};
Settings.init = function () {
    var scope = this;
    this.now = new Date();
    this.element = this.display();
    this.activate();
    if (this.arrows) app.input.back() ? 
        this.fall(function () {scope.sweller.start();}) : 
        this.rise(function () {scope.sweller.start();});
    else this.sweller.start();
    Select.setHorizontal(this.elements);
};
Settings.selected = function () { return this.elements.current(); };
Settings.select = function (selected) {

    if (!this.active()) this.init();

    if (!app.input.active() || app.input.back()) {

        if (app.key.pressed(['left','right'])){
            selected = Select.setHorizontal(Select.horizontal(this.elements)).getHorizontal();
            this.sweller.stop().setElement(selected.background()).start();
            if (this.arrows) this.arrows.setPosition(selected);
        }

        if(app.key.pressed(['up','down']) && !app.game.started()) 
            selected = Select.setVerticle(Select.verticle(Select.getHorizontal().hide()))
                .getHorizontal().show();
        
        if (selected && !app.game.started()) this.set(selected.type(), selected.value());
    }
    
    if (!app.game.started()) {
        if(app.key.pressed(app.key.enter()) || app.input.active()) 
            return this.input();
        else return this.exit(this, function (scope) { 
            scope.m = false;
            scope.goBack();
            scope.remove();
        });
    }
};

Settings.set = function (setting, value) { return this.parameters[setting] = value; };
Settings.input = function () {

    if (!app.input.active() || app.input.back()) {
        app.input.undoBack();
        app.input.name(this.screen());
        if (this.arrows) this.arrows.hide();
        app.key.undo();
    }
    
    if (app.key.pressed(app.key.enter())) {
        var weather, name = app.input.value(), scope = this;
        if (name) {
            app.players.add(app.user.raw());
            app.game.setSettings(this.parameters);
            app.game.create(name);

            if ((weather = this.parameters.weather)) {
                app.background.set(weather);
                socket.emit('background', weather);
            }
            this.remove();
            this.rise(function(){scope.element.parentNode.removeChild(scope.element);}, 5);
            return this.parameters;
        }
    } else if(app.key.pressed(app.key.esc())) {
        app.key.undo(app.key.esc());
        app.input.clear();
        this.arrows.show();
    }
};

Settings.remove = function () {
    app.footer.remove();
    if (this.arrows)
        this.arrows.remove();
    this.deactivate();
    this.swelling = false;
    delete this.elements;
    Select.clear();
    if (app.key.pressed(app.key.esc()))
        this.screen().removeChild(this.element);
    app.key.undo();
};

Settings.display = function () {
    
    var screen = this.createScreen('setupScreen');
    var keys = Object.keys(app.settings.settingsDisplayElement);
    var offScreen = Number(app.offScreen);
    var elements = [];
    this.createTitle('rules');

    var element = document.createElement('section');
    element.setAttribute('id', 'settings');

    var width = screen.offsetWidth;
    var height = screen.offsetHeight;
    var left = width * .05;
    var middle = height * .5;
    var top = this.arrows ? (app.input.back() ? middle - offScreen : middle + offScreen) : middle;

    var footer = app.footer.display(screen, this.rules);
    var nameInput = app.input.form('name', footer, 'Enter name here.');

    footer.appendChild(nameInput);
    screen.appendChild(footer.parentNode);

    for (var setting, i = 0, len = keys.length; i < len; i += 1) {

        setting = new SettingElement(keys[i], this.parameters);
        setting.setPosition(left, top);

        left += .13 * width;
        top -= .06 * height;

        element.appendChild(setting.outline());
        element.appendChild(setting.background());
        elements.push(setting);
    }
    this.parameters = app.game.settings() || new DefaultSettings();
    this.sweller = new Sweller(elements[0].background(), 50, 100);
    this.elements = new List(elements);
    screen.appendChild(element);
    if (this.arrows) this.arrows.insert(element).setSpace(40)
        .setPosition(this.elements.current()).fade();
    return element;
};
module.exports = Settings;
},{"../effects/swell.js":18,"../menu/elements/settingElement.js":39,"../menu/teams.js":51,"../objects/arrows.js":55,"../objects/menu.js":67,"../settings/default.js":80,"../tools/selection.js":91}],51:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    Teams.js controls co and team selection

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
socket = require('../tools/sockets.js');
app.key = require('../input/keyboard.js');
app.maps = require('../controller/maps.js'); 
app.screens = require('../objects/screens.js');
app.dom = require('../tools/dom.js');
app.background = require("../controller/background.js");
app.footer = require('../objects/footer.js');
app.arrows = require('../objects/arrows');

Menu = require ('../objects/menu.js');
Settings = require('../menu/settings.js');
Select = require('../tools/selection.js');
PlayerNumber = require('../menu/elements/playerNumber.js');
CoElement = require('../menu/elements/coElement.js');
PlayerElement = require('../menu/elements/playerElement.js');
TeamElement = require('../menu/elements/teamElement.js');
AiPlayer = require('../objects/aiPlayer.js');

Teams = Object.create(Menu);
Teams.speed = 1.5;
Teams.players = [];
Teams.aiNumber = 0;
Teams.select = function () {
    if (!this.active()) this.init();
    this.coBorderColor();
    if (this.selectingCo()) this.choseCo();
    else if (this.selectingTeam()) this.choseTeam();
    else return this.playerReady();
};
Teams.view = function () {
    if (!this.active()) this.init();
    this.coBorderColor();
    if (app.key.pressed(app.key.esc())) 
        return this.remove();
};
Teams.init = function () {
    var scope = this;
    this.display();
    this.activate();
    app.players.all().map(function (player, index) {
        var element = scope.playerElement(index + 1);
        player.setProperty('mode', element.mode().value());
        player.setProperty('co', element.co().value());
    });
    if (this.arrows) this.rise();
    app.game.started() ? this.toTeam() : this.toCo();
};
Teams.selectableTeams = function (team) {
    var number = app.user.number();
    var teamNumber = team.number();
    return number === teamNumber || 
        number === 1 && Teams.playerElement && 
            Teams.playerElement(teamNumber).mode().isComputer();
};
Teams.selectable = function (element, index, elements) {
    var mode = elements[index + 1], player = app.user.number(), number = element.number();
    return element.type() === 'co' ? player === number || player === 1 && mode.isComputer() : player === 1;
};
Teams.top = function () { return Number(this.screen().style.top.replace('px','')); };
Teams.selectingCo = function () { return this.mode === 'co';};
Teams.selectingTeam = function () { return this.mode === 'team';};
Teams.ready = function () { return this.mode === 'ready';};
Teams.booted = function () { return this.bt; };
Teams.boot = function () {
    this.goBack();
    this.remove();
};
Teams.remove = function () {

    this.deactivate();

    if (this.arrows) {
        this.arrows.remove();
        delete this.arrows;
    }

    delete this.mode;
    delete this.playerElements;

    var name, screen = this.screen(), 
    teams = this.element;

    if (!app.game.joined()) 
        this.fall(function(){screen.removeChild(teams);});
    else screen.removeChild(teams);

    app.input.goBack();
    app.footer.remove();

    if (app.players.length() < 2) {
        app.maps.remove(app.map.name());
        socket.emit('removeRoom', {
            category:app.map.category(), 
            name: app.game.name()
        });
        app.game.clear();
    }
    if (!app.game.started()) 
        app.players.reset();
};
Teams.toCo = function (from) {
    if (app.game.joined()) {
        this.moveElements('up', this.element);
        socket.emit('getPlayerStates', {
            category: app.map.category(), 
            name: app.game.name()
        });
    }
    if (this.mode) this.playersHeight('30%');
    if (this.arrows) this.arrows.setSpace(10).setPosition(this.elements.current()).show();
    Select.setHorizontal(this.elements);
    this.setMode('co');
    this.sel = true;
    return this;
};
Teams.fromCo = function () {
    app.key.undo();
    this.setMode(this.selectTeams() ? 'team' :'ready');
    return this;
};
Teams.toTeam = function () {
    this.playersHeight('20%');
    this.teamsHeight(this.playerElement(1).bottom() / 1.5);
    this.showTeams();
    if (this.arrows) this.arrows.setSpace(0).setPosition(this.teams.current()).show();
    Select.setHorizontal(this.teams.limit(this.selectableTeams));
    this.setMode('team');
    return this;
};
Teams.fromTeam = function () {
    this.hideTeams();
    return this;
};
Teams.toReady = function () {
    var top, player = app.user.player();
    player.isReady(true);
    this.setMode('ready');
    socket.emit('ready', player);
    this.playersHeight('20%');
    if (this.arrows) this.arrows.setSpace(10).setPosition(this.elements.current()).hide();
    this.button = app.screens.startButton('setupScreen');
    app.chat.display();
    return this;
};
Teams.fromReady = function () {
    var player = app.user.player();
    player.isReady(false);
    socket.emit('ready', player);
    if (this.arrows) this.arrows.hide();
    app.chat.remove();
    app.key.undo();
    this.button.remove();
    return this;
};
Teams.setMode = function (mode) {this.mode = mode;};
Teams.selectTeams = function () { return app.map.players() > 2 || app.game.started(); };
Teams.choseCo = function () {

    var player, element, wasComputer, scope = this;

    if (app.key.pressed(['left','right'])) {
        element = Select.setHorizontal(Select.horizontal(this.elements.limit(this.selectable))).getHorizontal();
        this.selected = element.type();
        if (this.arrows) this.arrows.setPosition(element);
    }

    if (app.key.pressed(['up','down'])) {
        wasComputer = Select.getHorizontal().isComputer();
        element = Select.setVerticle(Select.verticle(Select.getHorizontal().hide())).getVerticle().show();

        if (element.isComputer()) {
            if(!wasComputer) this.addAiPlayer(element.number());
        } else if (wasComputer) this.removeAiPlayer(element.number());
    }
    
    if (element && (player = app.players.number(element.number())))
        player.setProperty(element.type(), element.value());

    if (app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter()))
        this.selectTeams() ? this.fromCo().toTeam() : this.fromCo().toReady();
    else if (app.key.pressed(app.key.esc())) return this.exit(this, function (scope) {
        scope.goBack();
        scope.remove();
    });
};
Teams.choseTeam = function () {
    if (!app.game.started()) {
        if (app.key.pressed(['left', 'right'])) {
            var team = Select.setHorizontal(Select.horizontal(this.teams).limit(this.selectableTeams)).getHorizontal();
            if (this.arrows) this.arrows.setPosition(team);
        }
        if (app.key.pressed(['up','down'])) var team = Select.verticle(Select.getHorizontal().hide()).show();
            
        if (team) app.players.number(team.number()).setProperty(team.type(), team.value());

        if (app.key.pressed(app.key.esc()) || app.key.pressed(app.key.enter()) || this.booted()) {
            if(app.key.pressed(app.key.enter()))
                return this.fromTeam().toReady();
            this.fromTeam().toCo();
            app.key.undo();
        }
    }
};
Teams.playerReady = function (from) {
    app.players.ready() && app.user.first() ? this.button.show() : this.button.hide();

    if (app.game.started()) {
        this.remove();
        return app.players.all();
    }

    if (app.key.pressed(app.key.enter())) 
        app.chat.post(app.chat.send(app.chat.input()));

    if (app.key.pressed(app.key.esc()))
        this.selectTeams() ? this.fromReady().toTeam() : this.fromReady().toCo();
};
Teams.coBorderColor = function () {

    // move through the spaces and check the status of the players, change their border color
    // to indicate whether they are ready to go or not
    for (var number = 1, len = app.map.players(); number <= len; number += 1) {

        // get the player element
        var element = this.playerElement(number);

        // get player
        var player = app.players.number(number);

        // check the mode, if it is cp then it should display a solid border color
        var mode = element.mode();
        
        // if the  space is not occupied then make the background white
        if (!player && !mode.isComputer()) element.toWhite();
        
        // if the player is ready or set to computer then make the border color solid
        else if (mode.isComputer() || player.ready()) element.toSolid();
            
        // if the player is not ready yet, but present then fade the color in and out
        else if (player && !element.fading()) element.fade();
    }
};
Teams.playerElement = function (number) {if (this.playerElements) return this.playerElements.getElement(number - 1);};
Teams.teamElement = function (number) {return this.teams.getElement(number - 1);};
Teams.playersHeight = function (height, len) {
    var height = this.screenHeight() * this.percentage(height);
    for (var n = 1, len = app.map.players(); n <= len; n += 1)
        this.playerElement(n).setTop(height);
};
Teams.teamsHeight = function (height) {
    for (var n = 1, len = app.map.players(); n <= len; n += 1)
        this.teamElement(n).setTop(height);
};
Teams.showTeams = function () { 
    for (var n = 1, len = app.map.players(); n <= len; n += 1)
        this.teamElement(n).show();
};
Teams.hideTeams = function () {
    for (var n = 1, len = app.map.players(); n <= len; n += 1)
        this.teamElement(n).hide();
};
Teams.addAiPlayer = function (number) {
    var player = app.players.number(number), n = (this.aiNumber += 1);
    player = player ? app.players.replace(player, n) : app.players.add(new AiPlayer(n));
};
Teams.removeAiPlayer = function (number) {
    app.players.remove(app.players.number(number));
    this.selected = Select.setHorizontal(this.elements.limit(this.selectable)).getHorizontal().type();
};
Teams.display = function () {

    var screen = this.createScreen('setupScreen');
    var elements = [], teams = [], players = [], size = 200;

    var element = document.createElement('article');
    element.setAttribute('id','teams');

    var footer = app.footer.display(screen).parentNode
    screen.appendChild(footer);
    this.createTitle('Teams');

    var chatScreen = document.getElementById('descriptionOrChatScreen');
    var chat = app.input.form('chat', chatScreen, 'type here to chat with other players');
    chatScreen.appendChild(chat);

    var height = (screen.offsetHeight * .3) + (this.arrows ? app.offScreen : 0), started = app.game.started();

    for (var co, player, playerElement, mode, number = 1, nop = app.map.players(); number <= nop; number += 1) {

        playerElement = new PlayerElement(number, size, height);
        player = app.players.number(number);

        elements.push((co = new CoElement(number, player ? player.co : number - 1)).setBorder(5));
        elements.push((mode = new PlayerNumber(number, size, player ? player.mode : 0)).setBorder(5));

        this.players[co.id()] = co.properties();
        this.players[mode.id()] = mode.properties();

        if (!started && player) {
            player.setNumber(number);
            player.setProperty(co.type(), co.value());
            player.setProperty(mode.type(), mode.value());
        }
        playerElement.setMode(mode);
        playerElement.setCo(co);

        playerElement.add(mode.element());
        playerElement.add(co.element());

        if (this.selectTeams()) {
            var team = new TeamElement(number, size);
            if (!started && player) player.setProperty(team.type(), team.value());
            playerElement.add(team.element());
            teams.push(team);
        }
        element.appendChild(playerElement.element());
        players.push(playerElement);
        playerElement.show();
    }
    this.playerElements = new List(players);

    this.elements = new List(elements).limit(this.selectable);
    if (this.selectTeams()) this.teams = new List(teams).limit(this.selectableTeams);
    if (this.arrows) this.arrows.setSize(30).setSpace(10).insert(element).setPosition(this.elements.current()).fade();
    
    this.selected = this.elements.current().type();
    Select.setHorizontal(this.elements);
    screen.appendChild(element);
    return this.element = element;
};
module.exports = Teams;
},{"../controller/background.js":1,"../controller/maps.js":5,"../input/keyboard.js":28,"../menu/elements/coElement.js":31,"../menu/elements/playerElement.js":37,"../menu/elements/playerNumber.js":38,"../menu/elements/teamElement.js":40,"../menu/settings.js":50,"../objects/aiPlayer.js":52,"../objects/arrows":55,"../objects/footer.js":62,"../objects/menu.js":67,"../objects/screens.js":73,"../settings/app.js":79,"../tools/dom.js":85,"../tools/selection.js":91,"../tools/sockets.js":92}],52:[function(require,module,exports){
Player = require('../objects/player.js');
Score = require('../definitions/score.js');
AiPlayer = function (number) {
	this._current = {
        id: 'AI#'+number,
        gold: 0,
        special: 0,
        ready: true,
        number:number
    };
	this.name = function () { return 'HAL #'+ this.number();};
    this.fullName = function () { return 'Mr. Robot'; };
    this.lastName = function () { return 'Robot'; };
    this.id = function () { return this._current.id; };
    this.score = new Score(true);
    this.co = null;
    this.mode = 'cp';
    this.isComputer = true;
    if (app.user.first()) socket.emit('addAiPlayer', this);
};
AiPlayer.prototype = Object.create(Player.prototype);
AiPlayer.prototype.constructor = AiPlayer;
AiPlayer.prototype.setNumber = function (number) {this._current.number = number;};
module.exports = AiPlayer;
},{"../definitions/score.js":12,"../objects/player.js":69}],53:[function(require,module,exports){
/* --------------------------------------------------------------------------------------------------------*\

    default object animation repo, the 'm' parameter is a method passed from 
    app.draw that scales the coordinates of the drawings to fit any grid square size, as 
    well as providing some functionality like random(), which generates random numbers within the specified 
    range of numbers. 
    'm' does not have to be used
    default is a base of 64 ( 64 X 64 pixles ), the base is set as a perameter of initializing the 
    app.draw();

\*---------------------------------------------------------------------------------------------------------*/

module.exports = function (width, height) {
    var transparent = false;
    return {
        
        hide: function () {transparent = 0.1;},
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

        attackRange: function (canv, m) {
            canv.fillStyle = "rgba(240,5,0,0.4)";
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

        pointer: function (canv, m) {
            canv.fillStyle = "rgba(255,143,30,0.3)";
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
            canv.globalAlpha = transparent || 1;
            canv.fillStyle = "blue";
            canv.beginPath();
            canv.arc(m.r(32), m.u(32), 10, 0, 2 * Math.PI);
            canv.fill();
            return canv;
        },

        apc: function (canv, m) {
            canv.globalAlpha = transparent || 1;
            canv.fillStyle = "orange";
            canv.beginPath();
            canv.arc(m.r(32), m.u(32), 10, 0, 2 * Math.PI);
            canv.fill();
            return canv;
        }
    };
};
},{}],54:[function(require,module,exports){
Arrow = function (d) {
    this.direction = d;
    this.arrowBackground = document.createElement('div');
    this.arrowBackground.setAttribute('id', d + 'ArrowBackground');
    this.arrowBackground.setAttribute('class', d + 'Arrow');

    this.arrowOutline = document.createElement('div');
    this.arrowOutline.setAttribute('id', d +'ArrowOutline');
    this.arrowOutline.setAttribute('class', d + 'Arrow');
    this.arrowOutline.appendChild(this.arrowBackground);

    var existing = document.getElementById(this.arrowOutline.id);
    if (existing) existing.parentNode.replaceChild(this.arrowOutline, existing);
};
Arrow.prototype.width = function () {return this.w;};
Arrow.prototype.setWidth = function (width) {this.w = width;};
Arrow.prototype.side = {
    up:'Bottom',
    down:'Top',
    left:'Right',
    right:'Left'
};
Arrow.prototype.setColor = function (color) {this.background().style['border'+this.side[this.direction]+'Color'] = color;};
Arrow.prototype.outline = function () { return this.arrowOutline; };
Arrow.prototype.background = function () { return this.arrowBackground; };
Arrow.prototype.height = function (height) { this.outline().style.top = height + 'px'; };
Arrow.prototype.setLeft = function (left) { this.outline().style.left = left + 'px';};
Arrow.prototype.setTop = function (top) {this.outline().style.top = top + 'px';};
Arrow.prototype.setPosition = function (x, y) { 
    this.setLeft(x); 
    this.setTop(y); 
};
Arrow.prototype.remove = function () {
    var outline = this.outline();
    outline.parentNode.removeChild(outline);
};
Arrow.prototype.setSize = function (size) {
    var border = size / 4, arrow = this.outline(), background = this.background(), type = this.direction;
    this.setWidth(size);
    background.style.left = border - size + 'px'; 
    if(type === 'up'){
        arrow.style.borderLeftWidth = size + 'px';
        arrow.style.borderRightWidth = size + 'px';
        arrow.style.borderTopWidth = size + 'px';
        background.style.borderLeftWidth = size - border + 'px';
        background.style.borderRightWidth = size - border + 'px';
        background.style.borderTopWidth = size - border + 'px';
    }else if(type === 'down'){
        arrow.style.borderLeftWidth = size + 'px';
        arrow.style.borderRightWidth = size + 'px';
        arrow.style.borderBottomWidth = size + 'px';
        background.style.borderLeftWidth = size - border + 'px';
        background.style.borderRightWidth = size - border + 'px';
        background.style.borderBottomWidth = size - 2 + 'px';
    }else if(type === 'left'){
        arrow.style.borderLeftWidth = size + 'px';
        arrow.style.borderBottomWidth = size + 'px';
        arrow.style.borderTopWidth = size + 'px';
        background.style.borderLeftWidth = size - border + 'px';
        background.style.borderBottomWidth = size - border + 'px';
        background.style.borderTopWidth = size - border + 'px';
    }else if(type === 'right'){
        arrow.style.borderBottomWidth = size + 'px';
        arrow.style.borderRightWidth = size + 'px';
        arrow.style.borderTopWidth = size + 'px';
        background.style.borderBottomWidth = size - border + 'px';
        background.style.borderRightWidth = size - border + 'px';
        background.style.borderTopWidth = size - border + 'px';
    }
    return this;
};
},{}],55:[function(require,module,exports){
arrow = require('../objects/arrow.js');
Fader = require('../effects/fade.js');

Arrows = function (screen, space, over, under) {
	this.setDown(new Arrow('down'));
	this.setUp(new Arrow('up'));
    this.fader = new Fader(this.list(), this.color);
    this.over = over || 0;
    this.under = under || 0;
    this.space = space || 0;
	this.setScreen(screen);
};
Arrows.prototype.setSeperation = function (seperation) {
    this.seperation = seperation;
    return this;
};
Arrows.prototype.setDown = function (arrow) {this.d = arrow;};
Arrows.prototype.setUp = function (arrow) {this.u = arrow};
Arrows.prototype.list = function () {return [this.up(), this.down()];};
Arrows.prototype.setScreen = function (screen) { this.s = screen;};
Arrows.prototype.color = app.settings.colors.white;
Arrows.prototype.hide = function () {this.display('none');};
Arrows.prototype.show = function () {this.display(null);};
Arrows.prototype.display = function (display) {
    this.list().map(function(arrow){arrow.outline().style.display = display;});
};
Arrows.prototype.remove = function () {
    if (this.fader.fading()) this.fader.stop();
    this.list().map(function(arrow){arrow.remove();});
};
Arrows.prototype.setSize = function (size) {
    this.setWidth(size);
    this.list().map(function (arrow){arrow.setSize(size);});
    return this;
};
Arrows.prototype.setSpace = function (space) {this.space = space; return this;};
Arrows.prototype.setOver = function (over) {this.over = over; return this;};
Arrows.prototype.setUnder = function (under) {this.under = under; return this;};
Arrows.prototype.setWidth = function (width) {this.w = width; return this;};
Arrows.prototype.width = function () {return this.w || 30;};
Arrows.prototype.setPosition = function(element) {

    var b, border = element.border && !isNaN((b = element.border())) ? b : 0;

    var position = element.position();
    var dimension = element.dimensions();
    var arrow = this.width() / 2;
    var top = position.y - arrow - border;
    var left = position.x;
    var width = dimension.x - (border * 2);
    var bottom = top + dimension.y + arrow + (border * 3);
    var center = (width / 2) - arrow;

    this.up().setPosition(left + center, top - this.space - this.over);
    this.down().setPosition(left + center, bottom + this.space + this.under);

    return this;
};
Arrows.prototype.fade = function (speed, swell) {
    this.fader.start(function (color, arrows) {
        for (var i = 0, len = arrows.length; i < len; i += 1)
            arrows[i].setColor(color);
    });
};
Arrows.prototype.insert = function (element) {
    this.setScreen(element);
    element.appendChild(this.u.outline());
    element.appendChild(this.d.outline()); 
    return this;
};
Arrows.prototype.screen = function () { return this.s;};
Arrows.prototype.up = function () { return this.u; };
Arrows.prototype.down = function () { return this.d; };

module.exports = Arrows;
},{"../effects/fade.js":15,"../objects/arrow.js":54}],56:[function(require,module,exports){
Building = require('../objects/building.js');
//ListElement = require('../tools/dom/listElement.js');

Build = function () {
	this.element = document.createElement('section');
	this.element.setAttribute('id', 'buildSelectionScreen');
	// this.element.appendChild(this.mapElements);
	// this.element.appendChild(this.units);
	this.selecting = false;
	this.player = 1;
	this.selected = 'HQ';
};

Build.prototype.active = function () { return this.selecting; };
Build.prototype.set = function (element) { this.selected = element.name(); };
Build.prototype.select = function () { 
	if (app.key.pressed(app.key.enter() && app.key.undo(app.key.enter()))){
		this.down();
		this.selecting = false;
		//this.selected = this.selection[]
	}
};

//Building.prototype.mapElements = new ListElement('buildings', ['hq','base']);
//Building.prototype.units = new ListElement('buildings', ['infantry','apc']);

module.exports = Build;
},{"../objects/building.js":57}],57:[function(require,module,exports){
app = require("../settings/app.js");
app.map = require("../controller/map.js");

Terrain = require("../objects/terrain.js");
Unit = require("../objects/unit.js");
Position = require("../objects/position.js");

Building = function (type, position, index, player) {
    
    this.healing = {
        hq:["foot", "wheels"],
        city:this.hq,
        base:this.hq,
        seaport:["boat"],
        airport:["flight"]
    } [type];

    this.def = type.toLowerCase() === "hq" ? 4 : 3;

	Terrain.call(this, type, position);
    this.pos = new Position (position.x, position.y);
	this.units = function () { return app.buildings[type]; };
	this.canBuild = function (object) { return Object.keys(this.units()).indexOf(type) > -1; };
    this.canHeal = function (object) { return this.healing.indexOf(object.transportation()) > -1; };
    this.health = function () { return this._current.health; };
    this.defense = function () { return this.def; };
    this._current = {
        name: type,
    	player: player,
    	position: position,
    	health: 20,
    	index: index
    };
};
Building.prototype.properties = function () { 
    var current = this._current;
    return {
        name: current.name,
        player: current.player.number(),
        position: current.position,
        health: current.health,
        index: current.index
    }; 
};
Building.prototype.name = function (){ return this._current.name; };
Building.prototype.defaults = { health: function () { return 20; } };
Building.prototype.on = function (object) {
    var objectPosition = object.position ? object.position() : object;
    var position = this.position();
    return position.x === objectPosition.x && position.y === objectPosition.y;
};
Building.prototype.type = function () { return "building";};
Building.prototype.build = function (type) {

    var player = this.player(), p = this.position();
    var unit = new Unit(player, new Position(p.x, p.y), this.units()[type])

    // create and add the new unit to the map
    if(player.canPurchase(unit.cost())){
        player.purchase(unit.cost());          
        app.map.addUnit(unit);
        if (app.user.turn()) socket.emit("addUnit", unit);
        app.hud.setElements(app.cursor.hovered());
        return this;
    }
    return false;
};
Building.prototype.position = function () {return new Position(this.pos.x, this.pos.y);};
Building.prototype.occupied = function () { return app.map.top(this.position()).type() === "unit"; };
Building.prototype.changeOwner = function(player) { app.map.changeOwner(this, player); };
Building.prototype.setPlayer = function (player) {
    this._current.player = player;
    return this;
};
Building.prototype.player = function (){ return this._current.player; };
Building.prototype.color = function () { return this.player() ? this.player().color() : "default"; };
Building.prototype.capture = function (capture) {
    return this.health() - capture > 0 ? (this._current.health -= capture) : false; 
};
Building.prototype.restore = function () { this._current.health = this.defaults.health(); };
Building.prototype.class = function () { return "building"; };
Building.prototype.index = function () { return this._current.index; };
Building.prototype.get = function (unit) { return app.map.buildings()[this._current.index]; };

// check if the unit is owned by the same player as the passed in object
Building.prototype.owns = function (object) { 
    return object.player && object.player() === this.player(); 
}
Building.prototype.select = function () {
    this.unitScreen = new UList(app.dom.createMenu(app.buildings[this.name().toLowerCase()], ["name", "cost"], {
        section: "buildUnitScreen",
        div: "selectUnitScreen"
    }).firstChild).setScroll(0, 6).highlight();
    return this.selected = this.unitScreen.id();
};
Building.prototype.evaluate = function () {
    if(!app.cursor.hidden) app.cursor.hide();

    if (app.key.pressed(["up","down"]))
        this.selected = Select.verticle(this.unitScreen.deHighlight()).highlight().id();

    if (app.key.pressed(app.key.enter())) {
        app.hud.show();
        return this.build(this.selected);
    }
};
Building.prototype.execute = function () {
    app.hud.setElements(app.cursor.hovered());
    app.screen.reset(); 
    return true;
};
module.exports = Building;
},{"../controller/map.js":4,"../objects/position.js":70,"../objects/terrain.js":75,"../objects/unit.js":77,"../settings/app.js":79}],58:[function(require,module,exports){
BuildingDisplay = function () {
	var property = function (id) { return document.getElementById(id).firstChild; };
	this.e = app.dom.createMenu({
	        city:{ numberOf:0, type:'city' },
	        base:{ numberOf:0, type:'base' },
	        airport:{ numberOf:0, type:'airport' },
	        seaport:{ numberOf:0, type:'seaport' },
	    }, 
	    ['numberOf', 'canvas'], 
	    {section:'buildingsDisplay', div:'numberOfBuildings'}, 
        app.dom.addCanvas
    );
	this.city = property('city');
	this.base = property('base');
	this.airport = property('airport');
	this.seaport = property('seaport');
};

BuildingDisplay.prototype.element = function () { return this.e; };
BuildingDisplay.prototype.cities = function (number) { this.city.innerHtml = number; };
BuildingDisplay.prototype.bases = function (number) { this.base.innerHTML = number; };
BuildingDisplay.prototype.airPorts = function (number) { this.airport.innerHtml = number; };
BuildingDisplay.prototype.seaPorts = function (number) { this.seaport.innerHtml = number; };
BuildingDisplay.prototype.set = function (numberOf) {
	if (numberOf.city) this.cities(numberOf.city);
	if (numberOf.base) this.bases(numberOf.base);
	if (numberOf.seaport) this.seaPorts(numberOf.seaport);
	if (numberOf.airport) this.airPorts(numberOf.airport);
};

module.exports = BuildingDisplay;
},{}],59:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    holds all co's, their skills and implimentation

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');

module.exports = function () {

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

            var image = 'red';
            var special = 100;
            var powerActive = false;
            var superPowerActive = false;
            var damage = 100;

            return {
                image: image,
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
            var image = 'blue';
            var damage = 100;
            var special = 120;
            var powerActive = false;
            var superPowerActive = false;  

            return {
                image:image,
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

            var image = 'green';
            var damage = 100;
            var special = 120;
            var powerActive = false;
            var superPowerActive = false;  
            var capSpecial = 150;
            var penalty = 90;

            return {
                image:image,
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
},{"../settings/app.js":79}],60:[function(require,module,exports){
app.dom = require('../tools/dom.js');

StatusHud = function () {
	this._context = undefined;
    this._previous = undefined;
    this._gold = undefined;
};

StatusHud.prototype.visibility = function (visibility) {return document.getElementById('coStatusHud').style.display = visibility;}
StatusHud.prototype.show = function () {
    this.visibility('');
    this._previous = undefined;
};
StatusHud.prototype.hide = function () {this.visibility('none');};
StatusHud.prototype.power = function () { return this._context; };
StatusHud.prototype.display = function (player, location) {
    
    if (location !== this._previous || this._gold !== player.gold()) {

        this._previous = location;

        var coHud = document.getElementById('coStatusHud');

        // create container section, for the whole hud
        var hud = document.createElement('section');
        hud.setAttribute('id', 'coStatusHud');

        if (location === 'left') 
            hud.style.left = '864px';

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
        playerGold.innerHTML = this._gold = app.user.turn() ? player.gold() : '?';
        gold.appendChild(playerGold);

        // put it all together and insert it into the dom
        hud.appendChild(gold);
        hud.appendChild(power);

        if (coHud) {
            coHud.parentNode.replaceChild(hud, coHud);
        } else {
            document.body.insertBefore(hud, app.dom.insertLocation);
        }
        // return the context for animation of the power bar
        return this.context = context;
    }
    return false;
};

module.exports = StatusHud;
},{"../tools/dom.js":85}],61:[function(require,module,exports){
Feature = function (selected) {
    this.element = document.createElement('div');
    this.element.setAttribute('id', 'hud');
    this.element.style.backgroundColor = 'yellow';
    if (selected) this.set(selected);
};

Feature.prototype.clear = function () { while (this.element.firstChild) this.element.removeChild(this.element.firstChild); };
Feature.prototype.hidden = function () { return this.element.style.display === 'none';};
Feature.prototype.show = function () {
    this.element.style.display = null;
    this.setElement(app.cursor.selected());
};

Feature.prototype.hide = function () { this.element.style.display = 'none';};
Feature.prototype.size = function (canvas) {
    var screenWidth = app.screen.width();
    var width = app.settings.hudWidth + 20;
    var left = app.settings.hudLeft + 150 - width;
    if (app.cursor.side('x') === 'right')
        left = screenWidth - (screenWidth - width) + 100;
    this.element.style.height = (app.settings.hudHeight + 20).toString() + 'px';
    this.element.style.left = left.toString() + 'px';
    this.element.style.width = width.toString() + 'px';
    canvas.setAttribute('class', 'hudCanvas');
    canvas.style.left = ((120 * (this.number - 1)) - 4).toString() + 'px';
};

Feature.prototype.addElement = function (element, type, attributes) {
    var c = app.dom.createCanvas('hud', element, {width:128, height:128});
    var canvas = app.dom.createElement('li', false, 'canvas');
    canvas.appendChild(c.canvas);

    var exists, list = app.dom.createList(element, element.type(), attributes ? attributes : app.settings.hoverInfo);
    list.appendChild(canvas);
    this.size(canvas);
    app.draw(c.context).hudCanvas(element.draw(), element.class());
    this.element.appendChild(list);
    return list;
};

Feature.prototype.set = function (element) {

    this.clear();

    var exists, e, show = ['name', 'canvas'];

    // display unit and any unit being transported by that unit
    if ((e = element.type()) === 'unit') 
        this.addElement(e, 'unit', show);
    else if (e === 'building') this.addElement(element, 'building', show);
    else this.addElement (element, 'terrain', show);

    if ((exists = document.getElementById('hud'))) 
        exists.parentNode.replaceChild(this.element, exists);
    else document.body.insertBefore(this.element, document.getElementById("before"));
};

module.exports = Feature;
},{}],62:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    Footer.js controls the creation and coordination of footer elements

\* --------------------------------------------------------------------------------------*/

module.exports = {
    display: function () {

        var footer = app.dom.createMenu([], [], {section:'descriptionOrChatScreen', div:'descriptionOrChat'});
        this.setElement(footer);
        var textField = footer.children[0];

        var chat = document.createElement('ul');
        var description = document.createElement('h1');

        chat.setAttribute('id','chat');
        description.setAttribute('id','descriptions');

        textField.appendChild(chat);
        textField.appendChild(description);

        return textField;
    },
    setElement: function (element) {this.e = element;},
    element: function () { return this.e; }, // could cause problems
    remove: function () { 
        var element = this.element();
        if (element) element.parentNode.removeChild(element); 
    },
    scrolling: function () {
        var footer = document.createElement('footer');
        var info = document.createElement('p');
        var footSpan = document.createElement('span');
        footSpan.setAttribute('id','footerText');
        info.appendChild(footSpan);
        info.setAttribute('id', 'scrollingInfo');
        footer.setAttribute('id','footer');
        footer.appendChild(info);
        this.setElement(footer);
        this.setScrollBar(info);
        this.setSpan(footSpan);
        return footer;
    },
    hide: function () { this.element().display = 'none'; },
    show: function () { this.element().display = null; },
    setScrollBar: function (bar) {this.s = bar;},
    scrollBar: function () {return this.s;},
    setText: function (text) {
        this.t = text;
        this.scrollBar().innerHTML = text;
    },
    setSpan: function (span) {this.sp = span;},
    span: function () {return this.sp;},
    text: function () {return this.t;},
    width: function () {return this.element().offsetWidth;},
    textWidth: function () {return this.span().offsetWidth;},
    incriment: function () {return this.scrollBar().offsetWidth; },
    increase: function () {this.move(1);},
    decrease: function () {this.move(-1);},
    move: function (move) {this.setPosition(this.position() + move);},
    setPosition: function (position) {
        this.setLeft(position);
        this.p = position;
    },
    position: function () {return this.p;},
    reset:function () {this.setPosition(-(this.incriment() * 4));},
    setLeft: function (left) {this.scrollBar().style.left = left + 'px';},
    increase: function () {return this.setPosition(this.position() + 1);},
    scroll: function(message) {
        var scope = this, position = this.position();
        if (message) {
            if (this.scroller) clearTimeout(this.scroller);
            if (!position) this.setPosition(-this.incriment());
            this.setText(message);
        }
        this.position() <= this.width() ? this.increase() : this.reset();
        this.scroller = setTimeout(function(){ scope.scroll(); }, 8);
    }
};
},{}],63:[function(require,module,exports){
Hud = function (elements) {
    this.element = document.createElement('div');
    this.element.setAttribute('id', 'hud');
    if (elements) this.setElements(elements);
};

Hud.prototype.clear = function () { while (this.element.firstChild) this.element.removeChild(this.element.firstChild); };
Hud.prototype.hidden = function () { return this.element.style.display === 'none';};
Hud.prototype.show = function () {
    this.element.style.display = null;
    this.setElements(app.cursor.hovered());
};
Hud.prototype.hide = function () { this.element.style.display = 'none'; };
Hud.prototype.resize = function (canvas) {
    var screenWidth = app.screen.width();
    var width = app.settings.hudWidth * this.number;
    var left = app.settings.hudLeft + 120 - width;
    if (app.cursor.side('x') === 'right' && app.cursor.side('y') === 'bottom')
        left = screenWidth - (screenWidth - app.settings.hudWidth) + 150;
    this.element.style.height = app.settings.hudHeight.toString() + 'px';
    this.element.style.left = left.toString() + 'px';
    this.element.style.width = width.toString() + 'px';
    canvas.setAttribute('class', 'hudCanvas');
    canvas.style.left = ((120 * (this.number - 1)) - 4).toString() + 'px';
};

Hud.prototype.addElement = function (element, type, attributes) {

    var c = app.dom.createCanvas('hud', element, {width:128, height:128});
    var canvas = app.dom.createElement('li', false, 'canvas');
    canvas.appendChild(c.canvas);

    var exists, list = app.dom.createList(element, element.type(), attributes ? attributes : app.settings.hoverInfo);
    list.appendChild(canvas);
    this.resize(canvas);
    app.draw(c.context).hudCanvas(element.draw(), element.class());
    this.element.appendChild(list);

    if(type === 'unit') 
        this.number += 1;
    return list;
};


Hud.prototype.setElements = function (elements) {

    this.clear();
    this.number = 1;

    var i, e, element, exists, loaded, unit, building, passanger;

    // display unit and any unit being transported by that unit
    if ((unit = elements.unit)) {
        if ((loaded = unit.loaded())){
            for (i = 0; i < loaded.length; i += 1)
                this.addElement(loaded[i], 'unit', ['canvas'])
                    .setAttribute('loaded', true);
        }
        this.addElement(unit, 'unit', ['ammo', 'showHealth', 'name', 'fuel', 'canvas']);
    }

    if (elements.building) this.addElement(elements.building, 'building');
    else this.addElement (elements.terrain, 'terrain');

    if ((exists = document.getElementById('hud'))) 
        exists.parentNode.replaceChild(this.element, exists);
    else document.body.insertBefore(this.element, document.getElementById("before"));
};

module.exports = Hud;
},{}],64:[function(require,module,exports){
/* ------------------------------------------------------------------------------- *\

    Input handles user input (Generally displayed via the footer element)

\* ------------------------------------------------------------------------------- */

app.type = require('../effects/typing.js');
module.exports = {
    
    // takes the name of the form, the element it is being inserted into and 
    // a placeholder/words to be displayed in the form box before entry
	form: function (name, element, placeHolder) {
        
        var input = document.createElement('p');
        input.setAttribute('class', 'inputForm');
        input.setAttribute('id', name + 'Form');

        var text = document.createElement('input');
        text.setAttribute('id', name + 'Input');
        text.setAttribute('class','textInput');
        text.setAttribute('autocomplete','off');
        text.setAttribute('type','text');

        if (placeHolder) text.setAttribute('placeholder', placeHolder);

        text.style.width = element.offsetWidth;
        input.appendChild(text);
        return input;
    },

    // returns user input if it is found and adequate
    entry: function () {
        var name = this.value();

        // inform the user that no input was detected
        if (!name) app.type.letters (this.description, 'A name must be entered for the game.');

        // inform the user that input must be over three charachtors long
        else if (name.length < 3) app.type.letters (this.description, 'Name must be at least three letters long.');
        
        // return the input value
        else if (name) {
            this.val = name;
            return name;
        }
        return false;
    },

    // create display screen for name input
    name: function (parent, text) {

        this.a = true;
        var existing = document.getElementById('descriptionOrChatScreen');
        var textField = this.text = app.footer.display();
        var tfp = textField.parentNode;
        this.parent = tfp;

        if (existing) parent.replaceChild(tfp, existing);
        else parent.appendChild(tfp);

        this.description = document.getElementById('descriptions');
        this.description.style.paddingTop = '2%';
        this.description.style.paddingBottom = '1.5%';
        this.description.parentNode.style.overflow = 'hidden';

        this.addInput();
        app.type.letters(this.description, text || 'Enter name for game.');

        return tfp;
    },

    // remove the screen and deactivate input
    remove: function () {
        this.a = false;
        app.confirm.deactivate();
        app.type.reset();
        delete this.val;
        app.footer.remove();
        app.screen.reset();
    },
    active: function () { return this.a; },

    // remove input form from footer
    clear: function () { 
        if (this.a) {
            this.description.style.paddingTop = null;
            this.description.style.paddingBottom = null;
            this.nameInput.style.display = null;
            this.nameInput.style.height = null;
            this.a = false;
        }
    },
    removeInput: function () { 
        this.text.removeChild(this.nameInput); 
        //this.description.style.display = 'inline-block';
        //this.text.style.display = 'inline-block';
    },
    addInput: function () {
        this.text.appendChild(this.form('name', this.text, 'Enter name here.'));
        this.nameInput = document.getElementById('nameForm');
        this.nameInput.style.display = 'block';
        this.nameInput.style.height = '30%';
        // this.description.style.display = null;
        document.getElementById('nameInput').focus();
    },
    value: function () { return this.val || document.getElementById('nameInput').value; },
    goBack: function () {
        this.a = true;
        this.b = true;
    },
    a:false,
    back: function () { return this.b; },
    undoBack: function () { this.b = false; },
    activate: function () { this.a = true; },
    descriptions: function () { return document.getElementById('descriptions'); },
    message: function (message) { return app.type.letters(this.descriptions(), message); }
};
},{"../effects/typing.js":19}],65:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    creates map object

\* --------------------------------------------------------------------------------------*/

Validator = require('../tools/validator.js');

module.exports = function (id, name, players, dimensions, terrain, buildings, units) {

    var error, validate = new Validator('map');
    var category = units.length ? 'preDeployed' : {
        2:'two', 3:'three', 4:'four', 5:'five', 6:'six', 7:'seven', 8:'eight'
    } [players];

    this.id = id;
    this.name = name;
    this.players = players;
    this.category = category;
    this.dimensions = dimensions;
    this.terrain = terrain;
    this.buildings = buildings;
    this.units = units;
    if((error = validate.map(this)))
        throw error;
};
},{"../tools/validator.js":93}],66:[function(require,module,exports){
// map elements

module.exports = function (type, x, y, player) {
	this.type = type;
	this.position = {x:x, y:y};
	this.player = player;
};
},{}],67:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    Menu.js is a generic object that contains methods common to all menus

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.effect = require('../game/effects.js');

module.exports = {
    // for co border color
    color: app.settings.colors,
    playerElement: [],
    playerColor: app.settings.playerColor,
    time: new Date(),
    withArrows: function () { 
        if (!this.arrows) this.arrows = new Arrows(); 
        return this;
    },
    active: function () { return this.a; },
    activate: function () { this.a = true; },
    deactivate: function () { this.a = false; },
    goBack: function () { this.bck = true; },
    back: function () {
        if (this.bck) {
            this.bck = false;
            return true;
        }
        return false;
    },
    exit: function (value, callback, exit) {
        if (app.key.pressed(app.key.enter()) || app.key.pressed(app.key.esc()) || this.boot) {
            if (callback) callback(value);
            if(app.key.pressed(app.key.esc()) || this.boot){
                app.key.undo();
                if(this.boot) this.boot = false;
                return exit ? exit : 'back';
            }
            app.key.undo();
        }
        return false;
    },
    moveElements: function (direction, callback, speed, index) {

        var elements = this.element.childNodes;
        var length = elements.length;
        var scope = this;
        var delay = speed || 5;
        var timeout = delay * 100;
        this.m = true;

        if(!index) index = 0;
        if (length > index) {
            var offScreen = Number(app.offScreen);
            setTimeout(function() { 
                var elem = elements[index];
                elem.style.transition = 'top .' + delay + 's ease';
                setTimeout(function(){elem.style.transition = null}, timeout);
                var position = Number(elem.style.top.replace('px',''));
                if (position) {
                    if (direction === 'up') target = position - offScreen;
                    else if (direction === 'down') target = position + offScreen;
                    else return false;
                    elem.style.top = target + 'px';
                }
                scope.moveElements(direction, callback, speed, index + 1);
            }, 30);
        } else { 
            this.m = false;
            if (callback) setTimeout(callback, 80);
        }
    },
    moving: function () {return this.m; },
    screen: function () {return this._s;},
    setScreen: function (s) {this._s = s;},
    createTitle: function (title) {
        var element = document.createElement('h1');
        element.setAttribute('id', 'title');
        element.innerHTML = title;
        this.screen().appendChild(element);
        return element;
    },
    percentage: function (height) {return Number(height.replace('%','')) / 100;},
    screenHeight: function () {return this.screen().offsetHeight;},
    removeScreen: function () {document.body.removeChild(this.screen());},
    createScreen: function (name) {
        var existing = document.getElementById(name);
        var screen = document.createElement('article');
        screen.setAttribute('id', name);
        existing ? document.body.replaceChild(screen, existing) : document.body.appendChild(screen);
        this.setScreen(screen);
        app.touch(screen).swipeScreen();
        app.click(screen).swipeScreen();
        return screen;
    },
    resetDefaults: function (type) {

        var element, previous, name, child, children, 
        childrenLength, length = app.players.length();

        for (var c, n = 1; n <= length; n += 1) {

            element = document.getElementById('player' + n + type);
            previous = app.players.number(n).property(type.toLowerCase());

            if ((name = previous.name ? previous.name : previous)) {

                children = element.childNodes;
                childrenLength = children.length;

                for (c = 0; c < childrenLength; c += 1)
                    if ((child = children[c]).getAttribute('class').toLowerCase() === name.toLowerCase())
                        child.setAttribute('default',true);
                    else if (child.getAttribute('default'))
                        child.removeAttribute('default');
            }
        }
    },
    changeTitle: function (name) {this.screen().firstChild.innerHTML = name;},
    rise: function (callback, speed) {this.moveElements('up', callback, speed);},
    fall: function (callback, speed) { this.moveElements('down', callback, speed);}
};
},{"../game/effects.js":24,"../settings/app.js":79}],68:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    Obsticle.js is a generic object with methods common to all map obsticles

\* --------------------------------------------------------------------------------------*/

module.exports = function (type, defense) {
    this.type = function () { return type };
    this.defense = function () { return defense };
};
},{}],69:[function(require,module,exports){
// create a new player object
app = require('../settings/app.js');
app.game = require('../game/game.js')
app.co = require('../objects/co.js');
app.map = require('../controller/map.js');
app.players = require('../controller/players.js');
app.screen = require('../controller/screen.js');
Score = require('../definitions/score.js');

var Player = function (user) {
    this.name = function () { return user.first_name; };
    this.fullName = function () { return user.name; };
    this.lastName = function () { return user.last_name; };
    this.id = function () { return user.id; };
    this.score = new Score(true);
    this.co = user.co || null;
    this._current = {
        id: user.id,
        gold: 0,
        special: 0,
        ready: user.ready || false,
        number:user.number
    };
};
Player.prototype.setCo = function (co) {this.co = co;};
Player.prototype.setProperty = function (property, value) {
    this[property] = (property === 'co') ? app.co[value](this) : value;
    if (app.user.number() === this.number())
        socket.emit('setUserProperties', {property: property, value: value, player:this});
};
Player.prototype.property = function (property) {return this[property];};
Player.prototype.color = function () { return this.number(); }; // <-------------- figure out color system at some point
Player.prototype.number = function () { return this._current.number; };
Player.prototype.index = function () { return app.players.indexOf(this); };
Player.prototype.setNumber = function (number) { this._current.number = number; return this; };
Player.prototype.endTurn = function () {

    // update score
    if((current = app.players.current()) === app.user.player())
        app.user.score.update(current.score);

    app.map.clean();

    // get the next player
    var player = app.players.next();

    // reset this turns score
    player.score = new Score(true);

    // end power if it is active
    player.co.endPower();

    // refresh the movement points of the previous (still current) players units
    player.recover();

    // move the screen to the next players headquarters
    app.screen.to(player.hq().position());

    // add this turns income
    player.collectIncome();

    // assign the next player as the current player
    app.players.setCurrent(player);

    // if the player is ai then send the games current state 
    if (player.isCompuer) socket.emit('aiTurn', {map:app.map.get(), player:player});
};

Player.prototype.recover = function () {

    // check for units that belong to the current player
    app.map.units().forEach(function (unit) {unit.recover();});

    app.map.buildings().forEach(function (building) {
        var unit = building.occupied();
        if (!unit || building.owns(unit))
            building.restore();
    });
    return true;
};

Player.prototype.isReady = function (state) { 
    this._current.ready = state; 
    app.players.checkReady();
};

Player.prototype.ready = function () { return this._current.ready; };
Player.prototype.income = function () {

    var scope = this, funds = app.game.settings().funds;
    var income = app.map.buildings().reduce(function (money, building) {
        return (isNaN(money) ? 0 : money)  + (scope.owns(building) ? funds : 0);
    });

    // add income to score
    this.score.income(income);

    return income;
};

Player.prototype.collectIncome = function () {
    var gold = this.setGold(this.gold() + this.income());
    if (gold) this.score.income(gold);
    return gold;
};

Player.prototype.defeat = function (player, capturing) {

    if (app.user.owns(this)) { socket.emit('defeat', {defeated: player, conqueror: this, capturing: capturing});};
    this.score.conquer();
    player.score.defeat();
    app.players.defeat(player);

    var buildings = app.map.buildings();

    // assign all the buildings belonging to the owner of the captured hq to the capturing player
    for(var b = 0; b < buildings.length; b += 1)
        if (player.owns((building = buildings[b]))) {
            player.lostBuilding();
            this.score.capture();
            if(building.name().toLowerCase() === 'hq')
                app.map.takeHQ(building);
            building.changeOwner(capturing ? this : capturing);
        }

    app.animate('building');
};

Player.prototype.get = function () { return app.players.get(this); };
Player.prototype.turn = function () { return this === app.players.current(); };
Player.prototype.first = function () { return this === app.players.first(); };
Player.prototype.special = function () { return this._current.special; };
Player.prototype.gold = function () { return this._current.gold; };
Player.prototype.canPurchase = function (cost) { return this.gold() - cost >= 0; };
Player.prototype.purchase = function (cost) {
    this.score.expenses(cost);
    return this.setGold(this.gold() - cost);
};
Player.prototype.setGold = function (gold) { return gold >= 0 ? (this._current.gold = gold) + 1 : false; };
Player.prototype.owns = function (object) { return object.player && this.get() === object.player(); };
Player.prototype.units = function () {
    var units = app.map.units();
    for (var i = 0; i < units.length; i += 1)
        if(this.owns(units[i]))
            return true;
    return false;
};

Player.prototype.confirm = function () { this._current.confirmation = true; };
Player.prototype.confirmed = function () { return this._current.confirmation; };
Player.prototype.unconfirm = function () { delete this._current.confirmation; };
Player.prototype.hq = function () {

    // list off all buildings on map
    var b = 0, buildings = app.map.buildings();

    while ((building = buildings[b++]))
        if (building.name().toLowerCase() === 'hq' && this.owns(building))
            return building;
};
module.exports = Player;
},{"../controller/map.js":4,"../controller/players.js":7,"../controller/screen.js":8,"../definitions/score.js":12,"../game/game.js":25,"../objects/co.js":59,"../settings/app.js":79}],70:[function(require,module,exports){
Position = function (x, y, relativePosition) {
	this.x = x;
	this.y = y;
	this.orientation = relativePosition;
};

Position.prototype.inMap = function (positions) {
    var dim = app.map.dimensions(); 
    return this.x >= 0 && this.y >= 0 && this.x < dim.x && this.y < dim.y;
};

Position.prototype.neighbors = function () {
    var x = this.x, y = this.y;
    var result = [];
    var positions = [
        new Position(x - 1, y, 'west'),
        new Position(x, y - 1, 'south'),
        new Position(x + 1, y, 'east'),
        new Position(x, y + 1, 'north')
    ];
	return this.filter(positions);
};

Position.prototype.corners = function () {
    var x = this.x, y = this.y;
    var positions = [
        new Position(x - 1, y - 1, 'northWest'),
        new Position(x + 1, y - 1, 'southEast'),
        new Position(x + 1, y + 1, 'northEast'),
        new Position(x - 1, y + 1, 'southWest')
    ];
    return this.filter(positions);
};

Position.prototype.filter = function (positions) {
	var result = [];
	for (var i = 0; i < positions.length; i += 1) 
		if (positions[i].inMap())
			result.push(positions[i]);
	return result;
};

Position.prototype.surrounding = function () {
	return this.neighbors().concat(this.corners());
};

Position.prototype.log = function () {
	console.log('{ x: '+this.x+ ', y: '+this.y+' }');
};

module.exports = Position;
},{}],71:[function(require,module,exports){
app = require('../settings/app.js');
Validator = require('../tools/validator.js');

module.exports = function (name, obsticle) {

	var error, validate = new Validator('property');

	if((error = validate.defined(name, 'name') || validate.hasElements(obsticle, ['type', 'defense'])))
	 	throw error;

	this.type = obsticle.type;
	this.defense = obsticle.defense;
    this.name = function () { return name };
};
},{"../settings/app.js":79,"../tools/validator.js":93}],72:[function(require,module,exports){
ScoreElement = function (name, worth) {
	this.name = name;
	this.worth = worth;
	this.amount = 0;
};

module.exports = ScoreElement;
},{}],73:[function(require,module,exports){
app = require('../settings/app.js');
app.game = require('../game/game.js');
app.dom = require('../tools/dom.js');
app.touch = require('../input/touch.js');
app.click = require('../input/click.js');

module.exports = {

	startButton: function (id) {

        var screen = document.getElementById(id);
        button = document.createElement('div');
        button.setAttribute('class', 'button');
        button.setAttribute('id', 'startButton');
        button.style.display = 'none';
        button.addEventListener("click", function(event){
            event.preventDefault();
            app.game.start();
        });
        screen.appendChild(button);

        return {
            show: function () {button.style.display = '';},
            hide: function () {button.style.display = 'none';},
            remove: function (){screen.removeChild(button);}
        };
    },

	// display damage percentage
    damage: function (percentage){

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
            document.body.insertBefore(damageDisp, app.dom.insertLocation);
        }
    }
};
},{"../game/game.js":25,"../input/click.js":27,"../input/touch.js":29,"../settings/app.js":79,"../tools/dom.js":85}],74:[function(require,module,exports){
module.exports = function() {

	var position, action, target, setElement, damage, active, newTarget = true, index = 0, 
	keys = ['left', 'right', 'up', 'down'], cursors = {attack:'target', drop:'pointer'};
	var refresh = function () {app.animate(['cursor']);};
	
	return {
		deactivate: function () { 
			active = false; 
			app.animate(['cursor']);
		},
		set: function (element) { setElement = element; },
		activate: function (a) { 
			if(!a) throw new Error ('no action input for target');
			action = a;
			active = true; 
		},
		active: function () { return active; },
		position: function () { return position; },
		cursor: function () { return cursors[action]; },
		chose: function (element) {

			if(app.key.pressed(app.key.esc()) && app.key.undo(app.key.esc())) {
				newTarget = true;
	        	active = false;
	        	action = false;				
	        	element.displayActions();
				return refresh();
			}

	        var i, k, pressed, length = element.targets().length;

	        // move to  and from targets units
	        if (length > 1)
	        	for (i = 0; i < length; i += 1)
	            	if ((k = keys[i]) && app.key.pressed(k) && app.key.undo(k) && (pressed = true)) 
	               		index += k === 'left' || k === 'down' ? -1 : 1;

	        if (pressed || newTarget) {

	        	newTarget = false;
	        	index = index < 0 ? length - 1 : index = index >= length ? 0 : index;
	            target = element.targets(index);
		        var pos = target.position();

	            if (action === 'attack') {

		            damage = element.target(index);

		            // calcualte damage percentage for each targets unit
		            app.screens.damage(Math.round(damage));
	        	}
	            // create target for rendering at specified coordinates
	            position = {x:pos.x, y:pos.y};
	            refresh();
	        }

	        // if the target has been selected return it
	        if (app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter())){
	        	element[action](target, damage, true);
	        	newTarget = true;
	        	active = false;
	        	action = false;
	        	return target;
	        }
	        return false;
	    }
	};
}();
},{}],75:[function(require,module,exports){
/* ---------------------------------------------------------------------- *\
    
    Terrain.js holds the terrain object, defining specific map terrain

\* ---------------------------------------------------------------------- */

app = require('../settings/app.js');
app.properties = require('../definitions/properties.js');
Position = require('../objects/position.js');
Validator = require('../tools/validator.js');

Terrain = function (type, position) {

	var error, properties = new app.properties();
    var validate = new Validator('terrain');
    var property = properties[type];
    
     if((error = validate.defined('type', type) || validate.isCoordinate(position) || validate.hasElements(property, ['name', 'type', 'defense'])))
		 throw error;

    this.n = property.name();
	this.t = property.type();
    this.d = property.type();
    this.pos = new Position(position.x, position.y);
	this.defense = property.defense;
    this.name = function () { return this.n; };
	this.draw = function () { return type; };
    this.position = function () { return new Position(this.pos.x, this.pos.y); };
};

Terrain.prototype.type = function () { return this.t; };
Terrain.prototype.draw = function () { return this.d; };
Terrain.prototype.class = function () { return 'terrain'; };
Terrain.prototype.on = function (object) {
    var objectPosition = object.position ? object.position() : object;
    var position = this.position();
    return position.x === objectPosition.x && position.y === objectPosition.y;
};

module.exports = Terrain;

},{"../definitions/properties.js":11,"../objects/position.js":70,"../settings/app.js":79,"../tools/validator.js":93}],76:[function(require,module,exports){
module.exports = function () {

	var element = require('../objects/mapElement.js'),
	map = require('../objects/map.js');
	terrain = [
		new element('tallMountain', 5, 6),
		new element('tallMountain', 8, 9),
		new element('tallMountain', 3, 15),
		new element('tallMountain', 4, 20),
		new element('tallMountain', 10, 4),
		new element('tallMountain', 8, 12),
		new element('tallMountain', 5, 12),
		new element('tallMountain', 1, 15),
		new element('tallMountain', 3, 9),
		new element('tallMountain', 4, 6),
		new element('tallMountain', 4, 16),
		new element('tree', 2, 16),
		new element('tree', 1, 18),
		new element('tree', 3, 6),
		new element('tree', 3, 5),
		new element('tree', 15, 12),
		new element('tree', 10, 10),
		new element('tree', 11, 15),
		new element('tree', 20, 3),
		new element('tree', 19, 5)
	],
	buildings = [
		new element('hq', 0, 9, 1),
		new element('hq', 20, 9, 2),
		new element('base', 4, 9, 1),
		new element('base', 16, 9, 2)
	];
	return new map(null, 'test map #1', 2, {x:20, y:20}, terrain, buildings, []);
}
},{"../objects/map.js":65,"../objects/mapElement.js":66}],77:[function(require,module,exports){
app = require('../settings/app.js');
app.settings = require('../settings/game.js');
app.game = require('../game/game.js');
app.effect = require('../game/effects.js');
app.animate = require('../game/animate.js');
app.user = require('../objects/user.js');
app.map = require('../controller/map.js');
app.players = require('../controller/players.js');

Validator = require('../tools/validator.js');
Position = require('../objects/position.js');
Building = require('../objects/building.js');

Defaults = function (properties) {
    this.properties = {
        ammo:properties.ammo,
        fuel:properties.fuel,
        movement:properties.movement,
        vision:properties.vision,
    };
};

Defaults.prototype.ammo = function () { return this.properties.ammo; };
Defaults.prototype.fuel = function () { return this.properties.fuel; };
Defaults.prototype.movement = function () { return this.properties.movement; };
Defaults.prototype.vision = function () { return this.properties.vision; };
Defaults.prototype.health = function() { return 100; };

Unit = function (player, position, info) {

    this.validate = new Validator('unit'); 

    if(!player) throw new Error('No player defined for unit');

    var validProperties = [ 'transportaion' ];

    if(info.properties.canAttack.length)
        validProperties.unshift('baseDamage', 'damageType');

    if((error = this.validate.hasElements(info.properties, validProperties)))
        throw error;

    Building.call(this, 'unit', new Position(position.x, position.y), app.players.length(), player);
    this.id = app.increment.id();
    this.properties = info.properties;
    this.properties.cost = info.cost;
    this.user = player;

    this.player = function () { return this.user;};

    this.position = function () { 
        var pos = this._current.position;
        return new Position(pos.x, pos.y);
    };

    this.setPosition = function (p) { this._current.position = new Position(p.x, p.y); };
    this.type = function () { return 'unit'; };
    this.name = function () { return this.properties.name; };
    this.draw = function () { return this.name().toLowerCase(); };
    this.maxLoad = function () { return this.properties.maxLoad; };
    this.canLoad = function () { return this.properties.load };
    this.rangeLimits = function() { return this.properties.range; };
    this.damageType = function () { return this.properties.damageType; };
    this.baseDamage = function () { return this.properties.baseDamage; };
    this.movable = function () {return this.properties.movable;}; 
    this.transportaion = function(){return  this.properties.transportaion;};
    this.movementCost = function(obsticle){return this.properties.movementCosts[obsticle]; };
    this.canAttack =  function(unit){ return !this.canLoad() && this.properties.canAttack.indexOf(unit.transportaion()) > -1;};
    this.turn = function(){ return app.players.current().owns(this); };
    this.weapon1 = function () {return this.properties.weapon1 };
    this.weapon2 = function () { return this.properties.weapon2 };
    this.cost = function () { return this.properties.cost };
    this.defaults = new Defaults(this.properties);
    this._current.name = this.properties.name;
    this._current.actions = {wait:true};
    this._current.targets = [];
    this._current.damage = [];
    this._current.health = this.defaults.health();
    this._current.ammo = this.defaults.ammo();
    this._current.fuel = this.defaults.fuel();
    this._current.movement = 0;
    this._current.vision = this.defaults.vision();
    this._current.selectable = false;
    this._current.position = new Position(position.x, position.y);
    if(this.canLoad())
        this._current.loaded = [];
    this.moves = [];
    this.mov = 0;
    this.health = function () { return this._current.health; };
    this.showHealth = function () { return Math.ceil(this._current.health / 10)};
    this.ammo = function () { return this._current.ammo };
    this.fuel = function () { return this._current.fuel };
};

Unit.prototype.movement = function () { return this._current.movement; };
Unit.prototype.vision = function (){ return this._current.vision; };
Unit.prototype.moveCost = function (obsticle) {
    if(obsticle.type() === 'unit')
        if(this.owns(obsticle))
            obsticle = obsticle.occupies();
        else return this.movement();
    return this.movementCost(obsticle.type()); 
};

Unit.prototype.canBuildOn = function (landing) { return this.movementCost(landing) < this.movement(); };
Unit.prototype.refuel = function () { this._current.fuel = this.defaults.fuel();};
Unit.prototype.reload = function () { this._current.ammo = this.defaults.ammo();};
Unit.prototype.inc = 0;
Unit.prototype.incriment = function () {
    this.inc += 1;
    return {inc: this.inc}['inc'];
};

Unit.prototype.recover = function () {
    this._current.actions = {wait:true};
    this._current.movement = this.defaults.movement();
    this._current.attacked = false;
    this._current.captured = false;
    this._current.targets = [];
    this._current.damage = [];
    this.mov = 0;
    this._current.selectable = true;
    this.repair();
};

Unit.prototype.class = function () { return 'unit'; };
Unit.prototype.range = function (allowed) {

    var position = this.position(),
    dim = app.map.dimensions(),
    range = (allowed * 2),
    half = Math.ceil(range / 2),
    right = position.x + allowed,
    left = position.x - allowed,
    array = [], abs = Math.abs;

    // get the diamond pattern of squares
    for(var i, y, t, b, obsticle, x = left, inc = 0; x <= right, inc <= range; x += 1, inc += 1) {

        i = inc > half ? range - inc : inc;
        t = (t = position.y - i) > 0 ? t : 0; // top
        b = (b = position.y + i) < dim.y ? b : dim.y - 1; // bottom

        // add all reachable squares to array
        if(x >= 0 && x <= dim.x)
            for (y = t; y <= b; y += 1)
                array.push(app.map.top(new Position(x,y)));
    }
    return array;
};

Unit.prototype.ranged = function () { return this.rangeLimits().high > 1; };
Unit.prototype.movementRange = function (distance) {
    var allowed = distance !== undefined ? Math.min(distance, this.movement()) : this.movement();
    var i, reachable, range = this.range(allowed), array = [];

    for(var i = 0; i < range.length; i += 1)
        if(this.on(range[i]))
            range.unshift(range.splice(i,1)[0]);

    reachable = (distance !== undefined) ? range : app.path.reachable(this, true);

    for (i = 0; i < reachable.length; i += 1)
        if(reachable[i].type() !== 'unit' || this.owns(reachable[i]))
            array.push(reachable[i]);

    return array;
};

Unit.prototype.showAttackRange = function () {

    if(app.key.keyUp(app.key.range()) && app.key.undoKeyUp(app.key.range())) {

        this.displayingRange = false;
        app.attackRange.clear();
        app.effect.refresh();
        return false;

    } else if (!this.displayingRange && app.key.pressed(app.key.range()) && app.key.undo(app.key.range())) {
        
        if (this.ranged()) app.path.set(this.attackRange());
        else {

            var range = app.attackRange.reachable(this, false, this.defaults.movement());
            var neighbor, neighbors, length = range.length;

            for (var j, i = 0; i < length; i += 1) {
                neighbors = app.map.getNeighbors(range[i].position());
                for(j = 0; j < neighbors.length; j += 1){
                    neighbor = neighbors[j];
                    if (!neighbor.closed && app.map.close(neighbor))
                        range.push(neighbor);
                }
            }
            app.map.clean(range);
            app.attackRange.set(range);
        }
        this.displayingRange = true;
    }
    app.effect.refresh();
    return this;
};

Unit.prototype.attackRange = function () {

    var array = [];
    var range = this.rangeLimits();
    var high = this.range(range.high);
    var low = this.range(range.low - 1);

    for (var push, h = 0; h < high.length; h += 1){

        push = true;

        for(var l = 0; l < low.length; l += 1)
            if(high[h].on(low[l]))
                push = false;

        if(push) array.push(high[h]);
    }

    return array;
};

Unit.prototype.attackable = function (position) {

    // get list of units
    var range = this.attackRange();
    var array = [];

    for (var element, i = 0; i < range.length; i += 1){
        element = range[i];
        if(element.type() === 'unit' && !this.owns(element) && this.canAttack(element))
            array.push(element);
    }

    // if their are any units in the attackable array, then return it, otherwise return false
    return array.length ? array : false;
};

Unit.prototype.inRange = function (unit, range) {
    for(var i = 0; i < range.length; i += 1)
        if(unit.on(range[i]))
            return true;
    return false;
};

Unit.prototype.inAttackRange = function (unit){ return this.inRange(unit, this.attackRange()); };
Unit.prototype.inMovementRange = function (unit) { return this.inRange(unit, this.movementRange()); };

// ------------------------------ abilities -------------------------------------------------------

Unit.prototype.canCombine = function (unit) {

    // if the unit being landed on belongs to the current player, is the same type of unit but is not the same unit
    if(unit && unit.player().turn() && unit.index() !== this.index()){

        // if is the same unit then unit units
        if (unit.name() === this.name() && unit.health() < unit.defaults.health())
            return true;

        // if the unit is a transport and the unit being moved into can be loaded into that transport, then show the option to load into the transport
        else if(unit.canTransport(this) && (!unit.loaded() || unit.loaded().length < unit.maxLoad()))
            return true;
    }
    return false;
};

Unit.prototype.canTransport = function (unit) { return this.canLoad() ? this.canLoad().hasValue(unit.name().toLowerCase()) : false;};
Unit.prototype.canMove = function (position) {
    var i, range = this.movementRange();
    for (i = 0; i < range.length; i += 1)
        if (( r = range[i]).x === position.x && range.y === position.y)
            return true;
    return false;
};

// -------------------------------- self ---------------------------------------------------------


Unit.prototype.get = function() { return app.map.getUnit(this); };
Unit.prototype.index = function () { return app.map.getIndex(this, app.map.units()); };

// ------------------------------ recovery --------------------------------------------------------------

Unit.prototype.heal = function (health) { this._current.health += health || 1; };
Unit.prototype.needsRepair = function () {
    for(var rep, i = 0; i < 3; i += 1)
        if(this._current[(rep = ['health', 'fuel', 'ammo'][i])] < this.defaults[rep]())
            return true;
    return false;
};

Unit.prototype.repair = function () {
    var square = this.occupies();
    if(this.needsRepair() && this.validate.building(square) && square.canHeal(this) && this.player().get().purchase(this.cost() / 10)){
        if(this.health() < this.defaults.health()) this._current.health += 1;
        this.reload();
        this.refuel();
    }
};

// --------------------------------location --------------------------------------------------------

Unit.prototype.position = function () { 
    var pos = this._current.position;
    return new Position(pos.x, pos.y);
};

Unit.prototype.setPosition = function (p) { return this._current.position = this.pos = new Position(p.x, p.y); };
Unit.prototype.distanceFrom = function (target) {
    var position = this.position();
    return Math.abs((position.x - target.x) + (position.y - target.y)); 
};

// ---------------------------- work out inheritance -----------------------------------------

Unit.prototype.on = function (object) {
    var objectPosition = object.position ? object.position() : object;
    var position = this.position();
    return position.x === objectPosition.x && position.y === objectPosition.y;
};

Unit.prototype.owns = function (object) { return object.player && object.player().id() === this.player().id(); };
Unit.prototype.compare = function (unit) { 
    return {
        vision: this.vision() - unit.vision(),
        danger: unit.inAttackRange(this) ? 1 : 0,
        range: this.inAttackRange(unit) ? 1 : 0,
        fuel: this.fuel - unit.fuel(),
        ammo: this.ammo() - unit.ammo(),
        health: this.health() - unit.health()
    };
};

// ---------------------------------- actions ----------------------------------------------------------

Unit.prototype.wait = function () {
    this.deselect();
    app.dom.remove('actionHud');
};

Unit.prototype.canCapture = function (position) {

    // get the building that the unit is on
    var building = this.occupies(position || this.position());

    // if the selected unit can capture buildings then continue
    if (this.properties.capture && this.validate.building(building) && !this.owns(building) && this.on(building)) 
        return building;
    return false;
};

Unit.prototype.capture = function (building) { 

    if(this.canCapture(building.position())){

        var player = this.player();
        var capture = player.co.capture ? player.co.capture(this.showHealth()) : this.showHealth();

        // if the building has not been captured all the way
        if (building.health() - capture > 0) {

            // subtract the amount of capture dealt by the unit from the buildings capture level
            building.capture(capture);

        // if the building is done being captured and is not a headquarters
        } else if (building.name().toLowerCase() !== 'hq') {

            // assign the building to the capturing player
            player.score.capture();
            building.changeOwner(player);
            building.restore();

        } else player.defeat(building.player(), true);

        this.deselect();
        this.captured = true;
        if(app.user.turn()) socket.emit('captured', {unit:this, building:building});
    }
};

Unit.prototype.targets = function (index) { 
    if (this.loaded() && !this._current.targets.length) {
        var i, neighbors = app.map.getNeighbors(this.position());
        for (i = 0; i < neighbors.length; i += 1)
            if ((neighbor = neighbors[i]).type() !== 'unit' || neighbor.canLoad())
                this._current.targets.push(neighbor);
    }
    return index === undefined ? this._current.targets : this._current.targets[index]; 
};

Unit.prototype.target = function (index) { return this._current.damage[index] !== undefined ? this._current.damage[index] : (this._current.damage[index] = app.calculate.damage(this.targets(index), this));};

Unit.prototype.selectable = function () { return this._current.selectable; };
Unit.prototype.select = function () {

    if(!this.selectable())
        return false;

    // set the range highlight to the calculated range
    app.effect.setHighlight(this.movementRange());

    // animate changes
    app.animate('effects');

    return true;
};

Unit.prototype.previous = function () {return this.moves[this.moves.length - 1]; };
Unit.prototype.attack = function(unit, damage, attacking){

    if (damage === undefined) 
        damage = app.calculate.damage(unit, this);

    var attacker = this.player();
    var attacked = unit.player();

    if (unit.health() - damage > 0){
        unit.takeDamage(damage);
        attacker.score.damageDealt(damage);
        attacked.score.damageTaken(damage);
    } else {
        attacker.score.destroyedUnit();
        attacked.score.lostUnit();
        app.map.removeUnit(unit);
        if (!attacked.units())
            attacker.defeat(attacked);
    }

    if(app.user.owns(this) && !this.attacked()){
        app.cursor.show();
        this.deselect();    
        app.dom.remove('damageDisplay');
        socket.emit('attack', { attacker:this, attacked:unit, damage:damage });
    }
    this.refresh();
    if (attacking) this._current.attacked = true;
    return this._current.selectable = false;
};

Unit.prototype.takeDamage = function (damage) { return this._current.health - damage > 0 ? this._current.health -= damage : app.map.removeUnit(this); };
Unit.prototype.attacked = function () { return this._current.attacked; };

Unit.prototype.moved = function (position) {
    var i, move = 0; path = app.path.get();
    for (i = 1; i < path.length; i += 1){
        move += this.moveCost(path[i]);
        if (path[i].on(position))
            return move;
    }
    return move;
};

Unit.prototype.move = function (position, moved) {
    
    var pos = this.position();

    // subtract movement
    this._current.movement -= (this.mov = moved);
    this._current.targets = [];

    // mark how much fuel has been used
    this.player().score.fuel(moved);
    this._current.fuel -= moved;

    // save move
    if (moved > 0) {
        this.moves.push(new Position(pos.x, pos.y));
    } else this.moves.pop();

    // change selected units position to the specified location
    app.map.moveUnit(this, new Position(position.x, position.y));

    if(app.user.turn()) socket.emit('moveUnit', {id:this.id, position: position, moved: moved});

    this.refresh();
};

Unit.prototype.properties = function () {return this._current;};
Unit.prototype.action = function () { return this._current.action; };
Unit.prototype.setAction = function (action) { this._current.action = action; };
Unit.prototype.actions = function (position) {

    var canAttack, canCapture, unit, 
    actions = this._current.actions, 
    position = position || this.position();

    // may cause problems over time
    if(position === this.previous())
        return actions;

    if((canAttack = this.attackable(position))) 
        actions.attack = canAttack;

    if((canCapture = this.canCapture(position))) 
        actions.capture = canCapture;

    if ((unit = app.map.occupantsOf(position).unit) && this.canCombine(unit))
        if(unit.name() === this.name())
            actions.join = unit;
        else actions.load = unit;

    if (this.loaded()) actions.drop = this._current.loaded;

    // if there are any actions that can be taken then return them
    return actions;
};
Unit.prototype.displayActions = function (position) {

    var actions = {}, options = this.actions(position);

    Object.keys(options).forEach(function (action) {
        if (action === "drop" && options.drop.isArray())
            options.drop.forEach(function (unit, index) {
                actions[index] = { name: action };
            });
        else actions[action] = { name: action };
    });

    app.coStatus.hide();

    this.allActions = new UList(app.dom.createMenu(
        actions, 
        app.settings.actionsDisplay, 
        {section: 'actionHud', div: 'actions'}
    ).firstChild).highlight();

    return this.selected = this.allActions.id();
};
Unit.prototype.refresh = function () {app.animate('unit');};

Unit.prototype.evaluate = function (position) {

    if(app.cursor.hidden() && !app.target.active()){
        
        if (app.key.pressed(app.key.esc())) {

            this.moveBack();
            this.escape();
            this.deselect();

        } else if ((actions = this.actions(position)) && this.selected) {

            if (app.key.pressed(["up","down"]))
                this.selected = Select.verticle(this.allActions.deHighlight()).highlight().id();

            var action = this.selected;

            if (app.key.pressed(app.key.enter())) {
                if (action === 'attack') {
                    this.setTargets(actions.attack);
                    app.target.activate(action);
                } else if (action === 'drop') {
                    app.target.activate((this.unloading = actions[action]));
                } else {
                    this[action](actions[action]);
                    app.cursor.show()
                }
                this.escape();
            }
        }
    }
};
Unit.prototype.setTargets = function (targets) {this._current.targets = targets;};
Unit.prototype.moveBack = function () { if (this.mov) this.move(this.previous(), -this.mov); };
Unit.prototype.execute = function (p) {

    // and remove the range and path highlights
    this.move(new Position(p.x, p.y), this.moved(p));

    // display path to cursor
    app.path.clear();
    app.range.clear();

    // if there are actions that can be taken then display the necessary options
    if (!this.displayActions(p)) app.screen.reset();

    app.cursor.hide();
};

Unit.prototype.join = function (unit) {

    var max, property, properties = app.settings.combinableProperties;

    // emit units to be combined to other players games for syncronization
    if (app.user.turn()) socket.emit('joinUnits', {unit:unit, selected:this});

    // combine properties of the selected unit with the target unit
    for (var property, u = 0; u < properties.length; u += 1){
        property = properties[u];
        max = unit.defaults[property]();
        if( unit[property]() + this[property]() < max )
            unit._current[property] += this[property]();
        else  unit._current[property] = max;
    }

    // remove selected unit  
    app.map.removeUnit(this);
    this.deselect();
    return unit;
};

Unit.prototype.loaded = function () { return this._current.loaded && this._current.loaded.length ? this._current.loaded : false; };
Unit.prototype.getIndexOfLoaded = function (unit) {
    var loaded = this._current.loaded;
    for (var i = 0; i < loaded.length; i += 1)
        if(loaded[i].id === unit.id)
            return i;
    return false;
};

Unit.prototype.load = function (unit) {
    unit._current.loaded.push(app.map.removeUnit(this));
    if (app.user.turn()){
        socket.emit('loadUnit', { transport: unit.id, passanger: this.id });
        this.deselect();
    }
    return unit;
};

Unit.prototype.drop = function (u, i) { 
    var p = u.pos;
    var index = i !== undefined ? i : this.unloading;
    var unit = this._current.loaded.splice(index, 1)[0];
    unit.setPosition(new Position(p.x, p.y));
    app.map.addUnit(unit);
    if(app.user.turn()){
        socket.emit('unload', {id:this.id, pos:p, index:index});
        this.deselect();
    }
};

Unit.prototype.deselect = function () {
    app.screen.reset();
    app.hud.show();
    app.cursor.show();
    app.coStatus.show();
    app.target.deactivate();
    app.hud.setElements(app.cursor.hovered());
};

Unit.prototype.escape = function () {
    app.key.undo();
    app.coStatus.show();
    // app.options.deactivate();    
    app.dom.remove('actionHud');
};

Unit.prototype.occupies = function () {
    var square = app.map.occupantsOf(this.position());
    return square.building !== undefined ? square.building : square.terrain;
};

module.exports = Unit;
},{"../controller/map.js":4,"../controller/players.js":7,"../game/animate.js":20,"../game/effects.js":24,"../game/game.js":25,"../objects/building.js":57,"../objects/position.js":70,"../objects/user.js":78,"../settings/app.js":79,"../settings/game.js":81,"../tools/validator.js":93}],78:[function(require,module,exports){
Score = require('../definitions/score.js');

module.exports = function (info) {
	this.name = function () { return info.name; };
	this.first_name = function () { return info.first_name; };
	this.last_name = function () { return info.last_name; };
	this.email = function () { return info.email; };
	this.id = function () { return info.id; };
	this.gender = function () { return info.gender; };
	this.link = function () { return info.link; };
	this.location = function () { return info.locale; };
	this.turn = function () { return this.player().turn(); };
	this.player = function () { return app.players.get(this); };
	this.first = function () { return !(player = this.player()) || player === app.players.first(); };
	this.owns = function (object) { return this.player().owns(object); };
	this.number = function () { return this.player().number(); };
	this.raw = function () { return info };
	this.score = new Score();
};
},{"../definitions/score.js":12}],79:[function(require,module,exports){
/* ---------------------------------------------------------------------------------------------------------*\
    
    App.js is a container and holds variables for all elements of the application 

\* ---------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');

module.exports = {

    testing: false,
    games:[],

    // return an hsl string from either manual settings or object containing hsl values
    hsl:function(h,s,l) {
        var format = function (hue, saturation, lightness) {
            return 'hsl('+hue+','+saturation+'%,'+lightness+'%)';
        }
        if (!s && s !== 0) return format(h.h, h.s, h.l);
        return format(h,s,l);
    },

    // holds number of pixles to move elements on or off screen
    offScreen: 800,

    // holds temporary shared variables, usually info on game state changes that need to be accessed globally
    temp:{},

    // holds previously selected elements for resetting to defaults
    prev:{},

    // holds default shared variables, usually info on game state changes that need to be accessed globally
    def: {
        category:0,
        menuOptionsActive:false,
        selectActive: false,
        cursorMoved: true,
        saturation:0,
        scrollTime: 0,
        lightness:50
    },

    // holds cache for drawings <-- move to draw?
    cache: {},

    // set custom animation repo if desired
    setAnimationRepo: function (repo) {
        this.animationRepo = repo;
        return this;
    }
};
},{"../settings/app.js":79}],80:[function(require,module,exports){
/* ------------------------------------------------------------------------------- *\

    Default values for game settings

\* ------------------------------------------------------------------------------- */

module.exports = function () {
    this.funds = 1000;
    this.fog = 'off';
    this.weather = 'random';
    this.turn = 'off';
    this.capt = 'off';
    this.power = 'on';
    this.visuals = 'off';
};
},{}],81:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    settings consolidates all the customizable options and rules for the game into
    an object for easy and dynamic manipulation
    
\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');

app.settings = {

    // speed at which color swell.. fading in and out, will cycle (lower is faster)
    colorSwellIncriment:1.5,
    colorSwellSpeed:2,

    // general swell speed
    swellIncriment:3,
    swellSpeed:1,

    //typing speed
    typingSpeed:2.5,

    // colors of menus etc...
    colors: {
        design:{h:216,s:100,l:50},
        store:{h:72, s:100, l:50},
        game:{h:0, s:100, l:50},
        join:{h:144, s:100, l:50},
        logout:{h:288, s:100, l:50},
        white:{h:360,s:0,l:100},
        yellow:{h:72, s:100, l:50},
        green:{h:144, s:100, l:50},
        red:{h:0, s:100, l:50},
        blue:{h:216,s:100,l:50}
    },
    playerColor: {
        1:{h:0, s:100, l:50}, 
        2:{h:216,s:100,l:50}, 
        3:{h:72, s:100, l:50}, 
        4:{h:144, s:100, l:50}
    },

    // speed at which the screen will move to next hq at the changinf of turns
    scrollSpeed: 50,

    // types to look through when determining terrains effect on unit movement
    obsticleTypes: ['unit', 'terrain'],

    // list of the effects each obsticle has on each unit type
    obsticleStats: {

        infantry: {
            mountain:2,
            wood:1,
            plain:1,
            unit:1000
        },

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

    selectedModeHeight: 75,

    selectModeMenu:[{
            id:'game',
            display:'Game',
            type:'setup',
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
            options:['map', 'CO']

        },{
            id:'store',
            display:'Store',
            type:'store',
        },{
            id:'logout',
            display:'Logout',
            type:'exit',
        }
    ],

    categories:{
        two:{
            type:'1 on 1'
        },
        three: {
            type:'3 Player'
        },
        four:{
            type:'4 Player'
        },
        five:{
            type:'5 Player'
        },
        six:{
            type:'6 Player'
        },
        seven:{
            type:'7 Player'
        },
        eight:{
            type:'8 Player'
        },
        preDeployed:{
            type:'Pre-Deployed'
        }
    },

    capture: 20,

    combinableProperties:['fuel','health','ammo'],

    // terrain each unit is allowed to walk on
    movable: {
        foot: ['plain', 'river', 'mountain', 'wood', 'road', 'building'],
        wheels: ['plain', 'wood', 'road', 'building'],
        flight: ['plain', 'river', 'mountain', 'wood', 'road', 'water', 'building'],
        boat: ['water', 'building']
    },

    optionsMenu: {
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

    playersDisplayElement: {
        
    },

    settingsDisplayElement: {
        fog:{
            description:'Set ON to limit vision with fog of war.',
            on:'ON',
            off:'OFF'
        },
        weather:{
            description:'RANDOM causes climate to change.',
            clear:'Clear',
            rain:'Rain',
            snow:'Snow',
            random:'Random'
        },
        funds:{
            description:'Set funds recieved per allied base.',
            inc:500,
            min:1000,
            max:9500
        },
        turn:{
            description:'Set number of days to battle.',
            off:'OFF',
            inc:1,
            min:5,
            max:99
        },
        capt:{
            description:'Set number of properties needed to win.',
            off:'OFF',
            inc:1,
            min:7,
            max:45
        },
        power:{
            description:'Select ON to enamble CO powers.',
            on:'ON',
            off:'OFF'
        },
        visuals:{
            description:{
                off:'No animation.',
                a:'Battle and capture animation.',
                b:'Battle animation only.',
                c:'Battle animation for players only.'
            },
            off:'OFF',
            a:'Type A',
            b:'Type B',
            c:'Type C'
        }
    },

    // dimensions of diplay hud
    hudWidth: 120,
    hudHeight: 200,
    hudLeft: 1050,

    // spacing / positioning of mode menu selection elements
    modeMenuSpacing:20,

    // which attributes of objects ( unit, buildings etc ) will be displayed in hud
    hoverInfo: ['ammo', 'showHealth', 'health', 'name', 'fuel', 'defense', 'canvas'],

    // which actions can be displayed
    actionsDisplay: ['attack', 'capture', 'wait', 'load', 'drop', 'join', 'name'],

    // unit info attributes for display
    unitInfoDisplay: ['movement', 'vision', 'fuel', 'weapon1', 'weapon2', 'property', 'value'],

    // options attributes for displ
    optionsMenuDisplay: ['options', 'unit', 'intel', 'save', 'end', 'name'],

    // map elements that cannot be selected
    notSelectable: ['terrain', 'hq', 'city'],

    // categories of maps
    mapCatagories: ['preDeployed', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'],

    // cursor settings
    cursor: {
        x: 6,
        y: 4,
        speed: 50,
        scroll: {
            x: 0,
            y: 0
        }
    }
};

module.exports = app.settings;
},{"../settings/app.js":79}],82:[function(require,module,exports){
/* ------------------------------------------------------------------------------------------------------*\
    
    takes a string as an optional argument, this string is used as the name of a property 
    in a potential object to be compared when assessing its value in relation to the 
    other heap elements

\* ------------------------------------------------------------------------------------------------------*/

Heap = function (property) { 
    // create the heap
    this.heap = []; 
    this.property = property;

};
// make a max heap instead of a min heap;
Heap.prototype.setToMax = function () {this.max = true; return this;};

// swaps the parent index with the child, returns child's new index (parent index)
// subtract one from each input to compensate for the array starting at 0 rather then 1
Heap.prototype.swap = function (index, parentIndex) {
    this.heap[index - 1] = this.heap.splice(parentIndex - 1, 1, this.heap[index - 1])[0]; 
    return parentIndex;
};

// get the value at the input index, compensate for whether there is a property being accessed or not
Heap.prototype.value = function (index) { return this.property ? this.heap[index - 1][this.property] : this.heap[index - 1];};

// calculate the parent index
Heap.prototype.parent = function (index) {return Math.floor(index/2)};

// calculate the indexes of the left and right
Heap.prototype.left = function (i) {return i * 2;};
Heap.prototype.right = function (i) {return this.left(i) + 1;};

// compare the values at the two supplied indexes, return the result of whether input l is greater then input r
Heap.prototype.lt = function(l,r) {return this.value(l) < this.value(r);};
Heap.prototype.gt = function(l,r) {return this.value(l) > this.value(r);};
Heap.prototype.inequality = function (l,r) {return this.max ? this.gt(l,r) : this.lt(l,r);};

// if we are at the start of the array or the current nodes value is greater then its parent then return the current 
// index (compensate for 0), otherwise swap the parent and child then repeat from the childs new position
Heap.prototype.bubble = function (index) {
    while (index >= 2 && !this.inequality (this.parent(index), index))
        index = this.swap(index, this.parent(index));
    return index - 1;
};

Heap.prototype.sort = function (index) {

    var l, r, length = this.heap.length;

    while (length > (l = this.left(index)))
        index = this.swap(index, length > (r = this.right(index)) && this.inequality(r,l) ? r : l)

    this.swap(index, length); 
    this.bubble(index);

    return this.heap.pop();
};

// add a value to the heap
Heap.prototype.push = function (value) {
    this.heap.push(value); 
    return this.bubble(this.heap.length);
},

// remove and return the top item from the heap
Heap.prototype.pop = function () {return this.sort(1);},

// return the first value of the heap (lowest)
Heap.prototype.min = function () {return this.heap.slice(0,1)[0];},

// return the amount of elements in the heap (array)
Heap.prototype.size = function () {return this.heap.length;}

module.exports = Heap;
},{}],83:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\

    handle user to user chat

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.user = require('../objects/user.js');

module.exports = {
    // add message for display, input is message object containing a user name and id, or just a message
    post: function (mo) {

        // construct message with user name or if there is no user name just use the message
        var message = mo.user ? mo.user + ': ' + mo.message : mo.message;

        // if the message is a string then append it to the chat element
        if(this.chat && typeof (message) === 'string') {
            var chatMessage = document.createElement('li'); // create a list element to contain the message
            chatMessage.setAttribute('class', 'message'); // set attribute for styling
            chatMessage.innerHTML = message; // set text to message
            this.chat.appendChild(chatMessage); // append the li element to the chat element
            return message; // return the appended message
        }
        return false;
    },

    // send message, input is an object/element containing textual user input accessed by ".value"
    send: function (element) {

        var player = app.user.player();
        var text = this.input(); // user text input
        var name = player.name(); // get user name of user sending message

        if (name && text){ // make sure there is user input and a user name
            var message = { message:text, user:name }; // create message object containing user name and input text
            socket.emit('gameReadyChat', message); // transmit message to chat room
            element.value = ''; // reset the input box to empty for future input
            return message; // return the input message
        }
        return false;
    },

    input: function () { return this.chatInput.value; },
    display: function () {
        var bb = 5;
        this.chatScreen = document.getElementById('descriptionOrChatScreen');
        this.chatScreen.style.height = this.chatScreen.offsetHeight * 1.8 + 'px';
        this.chatBox = document.getElementById('descriptionOrChat');
        this.chat = document.getElementById('chat');
        this.chatBox.style.height = '77%';
        this.chatBox.style.borderBottomWidth = bb + 'px';
        this.chatInput = document.getElementById('chatInput');
        document.getElementById('descriptions').innerHTML = '';
        this.chatForm = document.getElementById('chatForm');
        this.chatForm.style.display = 'block';
        this.chatForm.style.height = '15%';
        this.chatForm.style.borderBottomWidth = bb + 'px';
        this.chat.style.display = 'block';
        this.chatInput.focus();
    },

    remove: function () {
        this.chatScreen.style.height = '20%';
        var doc = this.chatBox;
        doc.style.height = '83%';
        doc.style.borderBottomWidth = '12px';
        this.chat.style.display = 'none';
        var form = this.chatForm;
        form.style.height = '0px';
        form.style.display = 'none';
    }
};
},{"../objects/user.js":78,"../settings/app.js":79}],84:[function(require,module,exports){
Counter = function (limit) {
	this.limit = limit;
	this.frames = 0;
}

Counter.prototype.incriment = function () { this.frames += 1; };
Counter.prototype.reached = function (limit) { return this.frames > (limit ? limit : this.limit); };
Counter.prototype.reset = function () { if (this.reached()) this.frames = 0; };

module.exports = Counter;
},{}],85:[function(require,module,exports){
/* ------------------------------------------------------------------------------------------------------*\
    
    list of functions used to assist manipulating the dom

\* ------------------------------------------------------------------------------------------------------*/

module.exports = {

    insertLocation: document.getElementById('before'),

    remove: function (element) {
        var remove = document.getElementById(element);
        if (remove) remove.parentNode.removeChild(remove);
        return this;
    },

    // create a canvas to display the hovered map element in the hud
    createCanvas: function (id, object, dimensions) {

        var type = typeof object.type === 'function' ? object.type() : object.type;
        var clas = typeof object.class === 'function' ? object.class() : object.class;
        var canvas = document.createElement('canvas'); // create canvas
        var context = canvas.getContext(app.ctx); // get context

        // set width, height and id attributes
        canvas.setAttribute('width', dimensions.width);
        canvas.setAttribute('height', dimensions.height);
        canvas.setAttribute('id', type || id + 'Canvas');

        // return canvas info for further use
        return {
            canvas: canvas,
            context: context,
            type: type,
            class: clas
        };
    },

    createCanvasLi: function (id, object, dimensions) {
        var li = this.createElement('li', false, 'canvas');
        li.appendChild(this.createCanvas(id, object, dimensions || {width:128, height:128}).canvas);
        return li;
    },

    createElement: function (tag, id, clas) {
        var element = document.createElement(tag);
        if (clas) element.setAttribute('class', clas);
        if (id) element.setAttribute('id', id);
        return element;
    },

    createList: function (object, id, displayedAttributes) {

        // get a list of property names
        var properties = Object.keys (object);
        var ul = this.createElement ('ul', id);

        if (object.id) ul.setAttribute('itemNumber', object.id);

        // go through each property and create a list element for it, then add it to the ul;
        for (var ind = 0, i = 0; i < properties.length; i += 1) {

            // properties
            var props = properties[i];

            // only use properties specified in the displayed attributes array
            if (displayedAttributes === '*' || displayedAttributes.hasValue(props) || displayedAttributes.hasValue('num') && !isNaN(props)) {

                ind += 1;

                var property = typeof object[props] === 'function' ? object[props]() : object[props];
       
                if (property === undefined) continue;

                // create list element and give it a class defining its value
                var li = this.createElement('li', false, props);

                if (object.index) li.setAttribute( id + 'Index', ind);
                if (object.hide) li.style.display = 'none';

                // if the list is an object, then create another list with that object and append it to the li element
                if (typeof (property) === 'object') li.appendChild(this.createList(property, props, displayedAttributes));

                // if the list element is text, add it to the innerHTML of the li element
                else li.innerHTML = property;

                // append the li to the ul
                ul.appendChild(li);
            }
        }
        return ul;
    },

    getDisplayedValue: function (id) {
        var element = document.getElementById(id);
        var children = element.childNodes;
        var len = children.length;
        for(c = 0; c < len; c += 1){
            var child = children[c];
            if(child.style.display !== 'none') 
                return child.getAttribute('class');
        }
    },
    
    // remove all children of dom element
    removeAllChildren: function (element, keep){
        while(element.firstChild) {
            var clear = element.firstChild;
            if (clear.id !== keep) {
                element.removeChild(clear);
            }else{
                var keeper = element.firstChild;
                element.removeChild(clear);
            }
        }
        if (keeper) element.appendChild(keeper);
    },

    // remove children of dom element
    removeChildren: function (element, keep){
        var remove = element.children;
        for (var c = 0; c < remove.length; c += 1) {
            var clear = remove[c];
            if (clear.id !== keep) {
                element.removeChild(clear);
            }
        }
    },
    
    // find each element by their tag name, get the element that matches the currently selected index and return it
    findElementByTag: function (tag, element, index) {

        var length = element.length;
        for (var e = 0; e < length; e += 1) {
            // element returns a string, so must cast the index to string for comparison
            // if the element tag value ( index ) is equal to the currently selected index then return it
            if (element[e].getAttribute(tag) === index.toString()) {
                return element[e];
            }
        }
    },

    getImmediateChildrenByTagName: function(element, type){
        var elements = [];
        if(element){
            var children = element.childNodes;
            var name = type.toUpperCase();
            var len = children.length;
            for(var i = 0; i < len; i += 1) {
                var child = children[i];
                if(child.nodeType === 1 && child.tagName === name) elements.push(child);
            }
        }
        return elements;
    },

    show: function (show, list, display){
        if(!display) var display = '';
        if(show){
            show.style.display = display;
            show.setAttribute('default', true );
            return show.getAttribute('class');
        }else{
            list[0].style.display = display;
            list[0].setAttribute('default', true);
            return list[0].getAttribute('class');
        }
    },

    hide: function (name) {
        var element = document.getElementById(name);
        element.hidden.style.visibility = 'hidden';
    },

    changeDefault: function (change, element) {
        
        var nodes = element.childNodes;

        for (var i = 0; i < nodes.length; i += 1){

            if (nodes[i].getAttribute('default')){
                nodes[i].style.display = 'none';
                nodes[i].removeAttribute('default');
            }

            if (nodes[i].getAttribute('class') === change)
                this.show(nodes[i]);
        }   
    },

    getDefault: function (element) {
        if (element){
            var i = 0, children = element.childNodes;
            if (children)
                while ((child = children[i++]))
                    if(child.getAttribute('default'))
                        return child.getAttribute('class');
        }
        return false;
    },
    length: function (children, min) {
        var i = min;
        while (children[i]) i += 1;
        return i + 1;
    },
    createMenu: function (properties, allowedProperties, elements, callback) {
    
        var inner = elements.div;
        var outer = elements.section;

        // build the outside screen container or use the existing element
        var display = document.getElementById(outer) || document.createElement('section');
        display.setAttribute('id', outer);

        // build inner select screen or use existing one
        var exists = document.getElementById(inner);
        var innerScreen = document.createElement('div');
        innerScreen.setAttribute('id', inner);

        // get each unit type for looping over
        var keys = Object.keys(properties);
        var len = keys.length;

        for (var u = 0; u < len; u += 1) {

            var key = keys[u];
            var props = properties[key];

            // create list for each unit with its cost
            var list = this.createList(props, key, allowedProperties);
            if (props.id || props.id === 0) list.setAttribute('id', props.id);
            if (inner) list.setAttribute('class', inner + 'Item');
            if (callback) callback(list, props);

            // add list to the select screen
            innerScreen.appendChild(list);
        }

        // add select screen to build screen container
        if (exists) exists.parentNode.replaceChild(innerScreen, exists);
        else document.body.insertBefore(display, this.insertLocation);

        display.appendChild(innerScreen);
        return display;
    }
};
},{}],86:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    Hsl.js creates an object for interaction with hsl color values

\* --------------------------------------------------------------------------------------*/

Hsl = function (h, s, l) {
	this.hue = !s ? h.h : h;
	this.saturation = s || h.s;
	this.lightness = l || h.l;
};
Hsl.prototype.get = function () {return {h:this.hue, s:this.saturation, l:this.lightness};};
Hsl.prototype.format = function () {return 'hsl('+this.hue+','+this.saturation+'%,'+this.lightness+'%)';};
module.exports = Hsl;
},{}],87:[function(require,module,exports){
module.exports = function () { var id = 0; return { id: function () {id += 1; return id;}};}();
},{}],88:[function(require,module,exports){
/* ------------------------------------------------------------------------------------------------------------*\
    
    app.init creates a new canvas instance, taking the name of the target canvas id and optionally the context
    as a second perameter, it defaults to a 2d context. init also provides methods for rendering, setting 
    animations and returning the screen dimensions

\* ------------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.draw = require('../game/draw.js');

module.exports = function (element, context) {

	// get canvas element
    var canvas = document.getElementById(element);

    // check if browser supports canvas
    if (canvas.getContext) {

        // if the context is not set, default to 2d
        app.ctx = !context ? '2d' : context;

        // get the canvas context and put canvas in screen
        var animate = canvas.getContext(app.ctx);

        // get width and height
        var sty = window.getComputedStyle(canvas);
        var padding = parseFloat(sty.paddingLeft) + parseFloat(sty.paddingRight);
        var screenWidth = canvas.clientWidth - padding;
        var screenHeight = canvas.clientHeight - padding;

        // animate.clearRect( element.positionX, element.positionY, element.width, element.height );
        var screenClear = function () { animate.clearRect(0, 0, screenWidth, screenHeight); };

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
            render: function (hide, gridSquareSize) { // pass a function to loop if you want it to loop, otherwise it will render only once, or on demand
                // throw error if there are no animations
                if (!this.animations) throw new Error('No animations were specified');

                screenClear();

                var drawings = app.draw(animate, {
                    width: screenWidth,
                    height: screenHeight
                }, gridSquareSize);

                if (hide) drawings.hide();
                this.animations(drawings);
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
},{"../game/draw.js":23,"../settings/app.js":79}],89:[function(require,module,exports){
Terrain = require('../objects/terrain.js');

Matrix = function(dimensions){
	this.dimensions = dimensions;
	this.matrix = [];
	this.dummies = [];
	for (var i = 0; i <= dimensions.x; i += 1)
		this.matrix.push([]);
};

Matrix.prototype.insert = function (element) {
	var p = element.position();
    return this.matrix[p.x][p.y] = element;
};

Matrix.prototype.remove = function (element) {
	var existing = this.get(element);
	if(existing.type() !== 'building') {
		if (element.type() === 'unit') {
			if(existing === element)
				this.insert(element.occupies());
		} else this.insert(new Terrain('plain', element.position()));
	}
	return element;
};

Matrix.prototype.position = function (p, init) {
	var e, d = this.dimensions;
	if (p.x <= d.x && p.x >= 0 && p.y <= d.y && p.y >= 0){
		if(!this.matrix[p.x][p.y] && !init) {
			this.dummies.push(p);
			this.insert(new Terrain('plain', p));
		}
		return this.matrix[p.x][p.y];
	}
	return false;
};

Matrix.prototype.clean = function () {
	for (var p, e, i = 0; i < this.dummies.length; i += 1){
		var p = this.dummies[i];
		if((e = this.matrix[p.x][p.y]) && e.type() !== "unit" && e.type !== "building")
			this.matrix[p.x][p.y] = undefined;
	}
	this.dummies = [];
};

Matrix.prototype.close = function (p) { this.matrix[p.x][p.y].closed = true; };
Matrix.prototype.get = function (element) {return this.position(element.position());};
Matrix.prototype.log = function () {
	console.log(' ');
	console.log('------- matrix --------');
	console.log(' ');
	for (var arr, x = 0; x < this.matrix.length; x += 1)
		for (var y = 0; y < this.matrix[x].length; y += 1)
			if(this.matrix[x][y]) console.log(this.matrix[x][y]);
	console.log('--------- end ---------');
	console.log(' ');
};
module.exports = Matrix;
},{"../objects/terrain.js":75}],90:[function(require,module,exports){
/* ---------------------------------------------------------------------------------------------------------*\
    
    handle AJAJ calls
    
\* ---------------------------------------------------------------------------------------------------------*/

module.exports = function () {

    var ajaj = function (input, action, callback, url) {

      console.log(url);

        if ( !url ) throw new Error('No address specified for back end services');

        try{
            // Opera 8.0+, Firefox, Chrome, Safari
            var request = new XMLHttpRequest();
        } catch (e){
            // Internet Explorer Browsers
            try{
               var request = new ActiveXObject("Msxml2.XMLHTTP");
            }catch (e) {
               try{
                  var request = new ActiveXObject("Microsoft.XMLHTTP");
               }catch (e){
                  // Something went wrong
                  alert("Your browser broke!");
                  return false;
               }
            }
        }

        request.onreadystatechange = function(){
            if (request.readyState == 4 && request.status == 200)
                return callback ? callback(JSON.parse(request.responseText)):
                    JSON.parse(request.responseText);
        };

        try {
            var ts = new Date().getTime();
            request.open(action, url+'?ts='+ts, true);
            request.setRequestHeader("Content-type","application/json;charset=UTF-8");
            request.send(JSON.stringify(input));
        } catch (e) {
            console.log(e);
            return false;
        }
    }
    return {
        post:function (input, url, callback){
            return ajaj(input, 'POST', callback, url);
        },
        get:function (input, url, callback) {
            return ajaj(input, 'GET', callback, url + '/' + input);
        }
    };
}();
},{}],91:[function(require,module,exports){
module.exports = {
    describe: function (selected) {
        if (selected.description && selected.description()) 
            app.input.message(selected.description());
    },
    getHorizontal: function () { return this.hElement; },
    getVerticle: function () { return this.vElement; },
    verticle: function (elements) { return this.move(elements, ["up", "down"]); },
    horizontal: function (elements) { return this.move(elements, ["left","right"]);},
    move: function (elements, keys) { return app.key.pressed(keys[1]) ? elements.next() : elements.prev(); },
    setHorizontal: function (e) {
        var selected = e.current();
        this.describe(selected);
        this.hElement = selected;
        return this;
    },
    setVerticle: function (e) {
        if (e.descriptions()) this.describe(e);
        this.vElement = e;
        return this;   
    },
    touch: function (touched, elements) { 
        var index = elements.indexOf(touched);
        if (isNaN(index)) return false;
        elements.current().hide();
        this.setHorizontal(elements.setIndex(index).show("inline-block"));
    },
    clear: function () {
        delete this.vElement;
        delete this.hElement;
    }
};
},{}],92:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\

    handle socket connections

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.game = require('../game/game.js');
app.chat = require('../tools/chat.js');
app.menu = require('../controller/menu.js');
app.options = require('../menu/options/optionsMenu.js');
app.key = require('../input/keyboard.js');
app.maps = require('../controller/maps.js');
app.map = require('../controller/map.js');
app.players = require('../controller/players.js');
app.cursor = require('../controller/cursor.js');
app.background = require('../controller/background.js');
app.units = require('../definitions/units.js');
app.confirm = require('../controller/confirmation.js');

Validator = require('../tools/validator.js');
Player = require('../objects/player.js');
Unit = require('../objects/unit.js');
Teams = require('../menu/teams.js');

var validate = new Validator('sockets');
var socket = io.connect("http://127.0.0.1:8080") || io.connect("http://jswars-jswars.rhcloud.com:8000");

// all in game commands
socket.on('confirmSave', function (player) {app.confirm.save(app.players.get(player));});
socket.on('confirmationResponse', function (response) {app.confirm.player(response.answer, app.players.get(response.sender));});

socket.on('cursorMove', function (move) {
    app.key.press(move);
    app.cursor.move(true);
});

socket.on('background', function (type) { app.background.set(type); });

socket.on('endTurn', function (id) {    
    if(validate.turn(id))
        app.options.end();
});

socket.on('addUnit', function (unit) {
    var u = unit._current;
    var player = app.players.get(u.player._current);
    var unit = new Unit(player, u.position, app.units[u.name.toLowerCase()]);
    if(validate.build(unit))
        if(player.canPurchase(unit.cost())) {
            player.purchase(unit.cost());          
            app.map.addUnit(unit);
        }
});

socket.on('attack', function (action) {
    if(validate.attack(action)) {
        var attacker = app.map.getUnit(action.attacker), 
        attacked = app.map.getUnit(action.attacked);
        attacker.attack(attacked, action.damage);
        if(app.user.owns(attacked) && !attacked.attacked())
            attacked.attack(attacker);
    }
});

socket.on('joinUnits', function (action) {
    if(validate.combine(action)) {
        var unit = app.map.getUnit(action.unit);
        var selected = app.map.getUnit(action.selected);
        selected.join(unit);
    }
});

socket.on('moveUnit', function (move) {
    var unit = app.map.getUnit(move);
    var target = move.position;
    if(validate.move(unit, target))
        unit.move(target, move.moved);
});

socket.on('loadUnit', function (load) {
    var passanger = app.map.getUnit({id:load.passanger});
    var transport = app.map.getUnit({id:load.transport});
    if(validate.load(transport, passanger))
        passanger.load(transport);
});

socket.on('delete', function (unit) { app.map.removeUnit(unit); });
socket.on('unload', function (transport) { 
    var unit = app.map.getUnit(transport);
    unit.drop(transport, transport.index); 
});
socket.on('defeat', function (battle) {
    var player = app.players.get(battle.conqueror._current);
    var defeated = app.players.get(battle.defeated._current);
    player.defeat(defeated, battle.capturing);
});

// all setup and menu commands
socket.on('setMap', function (map) {app.game.setMap(map)});
socket.on('start', function (game) {app.game.start();});
socket.on('userAdded', function (message) {app.chat.post(message);});
socket.on('gameReadyMessage', function (message) {app.chat.post(message);});
socket.on('propertyChange', function (properties) {app.players.changeProperty(properties);});
socket.on('readyStateChange', function (player) {
    app.players.get(new Player(player)).isReady(player.ready);
    app.players.checkReady();
});
socket.on('addPlayer', function (player) {app.players.add(player);});
socket.on('addRoom',function (room) { app.maps.add(room); });
socket.on('removeRoom', function  (room) { app.maps.remove(room); });

socket.on('disc', function (user) {
    app.chat.post({message:'has been disconnected.', user:user.name.uc_first()});
    app.players.remove(user);
});

socket.on('userLeft', function (user) {
    app.chat.post({message: 'has left the game.', user: user.name.uc_first()});
    app.players.remove(user);
});

socket.on('userRemoved', function  (user) {
    app.chat.post({message:'has been removed from the game.', user:user.name.uc_first()});
    app.players.remove(user);
});

socket.on('userJoined', function (user) {
    app.players.add(user);
    if(!user.cp) app.chat.post({message:'has joined the game.', user:user.name.uc_first()});
});

socket.on('joinedGame', function (joined) {app.game.load(joined);});
socket.on('back', function () { Teams.boot(); });

socket.on('updatePlayerStates', function (players) {app.players.add(players);});

module.exports = socket;
},{"../controller/background.js":1,"../controller/confirmation.js":2,"../controller/cursor.js":3,"../controller/map.js":4,"../controller/maps.js":5,"../controller/menu.js":6,"../controller/players.js":7,"../definitions/units.js":13,"../game/game.js":25,"../input/keyboard.js":28,"../menu/options/optionsMenu.js":47,"../menu/teams.js":51,"../objects/player.js":69,"../objects/unit.js":77,"../settings/app.js":79,"../tools/chat.js":83,"../tools/validator.js":93}],93:[function(require,module,exports){
/* --------------------------------------------------------------------------- *\
    
    Validator.js is a tool to verify the correctness of data within the game

\* --------------------------------------------------------------------------- */

app = require('../settings/app.js');
app.players = require('../controller/players.js');
Building = require('../objects/building.js');

Validator = function (fileName) {this.fileName = fileName;};
Validator.prototype.defined = function (element, name) {
	if(!element) return new Error(name.uc_first() + ' undefined.', this.fileName);
};

Validator.prototype.hasElements = function (elements, needed) {
	var i = 0, n, length = needed.length;
	if(!elements) return new Error('missing input', this.fileName);
	while (i < length){
		property = needed[i++];
		if (!elements[property])
			return new Error ('Missing property: ' + property + '.', this.fileName);
	}
	return false;
};

Validator.prototype.isCoordinate = function (coordinate) {
	if(!coordinate) throw new Error('No coordinate found');
	var x = coordinate.x, y = coordinate.y;
    if (isNaN(x) || isNaN(y) || x < 0 || y < 0)
    	return new Error('Invalid coordinate: x:'+ x +', y:'+ y, this.fileName);
};

Validator.prototype.inRange = function (array, dimensions) {
	this.isCoordinate(dimensions);
    var e, i, l = array.length;
    for (i = 0, e = array[i]; i < l; i += 1)
        if (e.x > dimensions.x || e.y > dimensions.y || e.y < 0 || e.x < 0)
            return new Error('Element at index: '+ i +' is outside the specified dimensions.', this.fileName);
};

Validator.prototype.multiplePlayers = function (array) {
	for(var i = 1; i < array.length; i += 1)
		if(array[i] && array[i].player() !== array[0].player())
			return new Error('More then one player requred in game', this.fileName);
};

Validator.prototype.building = function (object) {
	return object instanceof Building;
};

Validator.prototype.map = function (map) {

	this.defined(map, 'map')
	this.isCoordinate(map.dimensions);

	for(element in map)
		if(element !== 'id')
			this.defined(map[element], 'map '+ element);

	this.inRange(map.terrain, map.dimensions);
	this.inRange(map.buildings, map.dimensions);
	this.inRange(map.units, map.dimensions);

	if(typeof map.name !== 'string')
		return new Error('Map name must be a string', this.fileName);

	if(typeof map.category !== 'string' || app.settings.mapCatagories.indexOf(map.category) < 0)
		return new Error('Map category name must be a string from the map catagory list', this.fileName);

	if(!map.buildings.length || map.buildings.length < 2)
		return new Error('There must be at least two buildings in a map', this.fileName);

	if(isNaN(map.players) || map.players < 2 || map.players > 8)
        return new Error('number of players must be numarical between 2 and 8, was set to: '+map.players+' players', this.fileName);
};

// ---------------------------------------------- socket communication ---------------------------------------

Validator.prototype.position = function (proposed) {
	var aPos = object.get().position();
	var pPos = proposed.position();
	return aPos.x === pPos.x && aPos.y === pPos.y;
};

Validator.prototype.health = function (proposed) {
	return proposed.get().health() === proposed.health();
};

Validator.prototype.damage = function (proposed) {
	return true;
};

Validator.prototype.capture = function (action) {
	var unit = action.unit.get(),
	building = action.building.get(),
	player = app.players.current();
	return player.owns(unit) 
		&& !player.owns(building) 
			&& unit.canCapture(building)
				&& this.position(action.unit)
					&& this.health(action.unit)
						&& this.position(action.building)
							&& this.health(action.building);
};

Validator.prototype.move = function (move) {
	return true;
};

Validator.prototype.attack = function (object) {
	return true;
};

Validator.prototype.combine = function (object) {
	return true;
};

Validator.prototype.load = function (transport, passanger) {
	return passanger.owns(passanger) && passanger.owns(transport) && transport.canTransport(passanger) && passanger.inMovementRange(transport);
};

Validator.prototype.build = function (unit) {
	return unit.player().turn()
		&& unit.player().gold() >= unit.cost();
};

Validator.prototype.turn = function (player) {
	return app.players.get(player).turn();
};

console.log(Validator);

module.exports = Validator;
},{"../controller/players.js":7,"../objects/building.js":57,"../settings/app.js":79}]},{},[30]);
