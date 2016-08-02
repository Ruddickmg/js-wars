(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"../game/calculate.js":15,"../objects/terrain.js":42}],2:[function(require,module,exports){
app = require('../settings/app.js');
app.map = require('../controller/map.js');
app.options = require('../menu/options.js');
app.calculate = require('../game/calculate.js');
app.effect = require('../game/effects.js');
app.undo = require('../tools/undo.js');
app.animate = require('../game/animate.js');
app.key = require('../tools/keyboard.js');
//app.user = require('../objects/user.js');
app.game = require('../game/game.js');
app.display = require('../tools/display.js');
app.feature = require('../objects/featureHud.js');

module.exports = function () {

    var editing, selected, moved, active, enter, hidden = false, position = {x:7, y:5}, key = app.key;

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
            if(selected && allowed()){
                app.undo.effect('path');
                selected.movementRange(app.calculate.distance(selected.position(), position))
                app.path.find(selected, position);
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
            if (checkSide(axis))
                return axis === 'x' ? 'right' : 'bottom';
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

            // set selection
            if (element) return selected = element;

            // if its the users turn and theyve pressed enter
            if ((key.pressed(key.enter()) || key.pressed(key.range()) || key.keyUp(key.range())) && app.user.turn() && !app.target.active()) {

                var a, hovered = app.map.top(position);

                if (!active && key.pressed(key.enter()) && key.undo(key.enter())) {

                    // if something was selected
                    if (selected && allowed() && (hovered.type() !== 'unit' || selected.canCombine(hovered) || hovered === selected)){

                        // if selection is finished then continue
                        if(selected.execute(position))

                            // deselect
                            return selected = false;

                    // if there is nothing selected
                    } else if (!selected && !app.options.active() && app.user.owns(hovered)){
                        
                        selected = hovered;

                        // save the selected element and then select it
                        if(selected.select())

                            app.hud.hide();
                        
                        else selected = false;
                    }

                } else if (!selected && (hovered.type() === 'unit' || key.keyUp(key.range()))) {
                    if (!active) active = hovered;
                    if (hovered === active)
                        active = active.showAttackRange();
                    else {
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
            if (editing && key.pressed(key.copy()) && !app.build.active())
                app.feature.set((selected = app.map.top(position))); 
        },
        build: function () { 
            if (key.pressed(key.enter()) && !app.build.active() && app.map.build(selected, position))
                app.animate(['unit', 'building', 'terrain']);
        },
        move: function (emitted) {

            moved = false;

            if ((!selected || selected.type() !== 'building' ||  app.editor.active()) && !app.options.active() && !hidden && app.user.turn() || emitted) {

                var d = app.map.dimensions(), pressed;

                if (key.pressed(key.up()) && canMove('y', 0, -1)) 
                    pressed = key.up();

                if (key.pressed(key.down()) && canMove('y', d.y, 1)) 
                    pressed = key.down();

                // player holding left
                if (key.pressed(key.left()) && canMove('x', 0, -1)) 
                    pressed = key.left();

                // Player holding right
                if (key.pressed(key.right()) && canMove('x', d.x, 1))
                    pressed = key.right();

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
},{"../controller/map.js":3,"../game/animate.js":13,"../game/calculate.js":15,"../game/effects.js":17,"../game/game.js":18,"../menu/options.js":24,"../objects/featureHud.js":31,"../settings/app.js":46,"../tools/display.js":52,"../tools/keyboard.js":56,"../tools/undo.js":62}],3:[function(require,module,exports){
yapp = require('../settings/app.js');
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
    color = app.settings.playerColor, allowedUnits, allowedBuildings,
    validate = new Validator('map');

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
            
            // if an object is found at the same grid pint return it 
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
        } else if (existing.building && unit.canBuildOn(existing.building) || existing.terrain && unit.canBuildOn(existing.terrain)){
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
        top: function (position, replace) { return matrix.position(position, replace); },
        get: function () { return map; },
        set: function (selectedMap) { map = selectedMap; },
        initialize: function (editor) {

            var terr = map.terrain,
            building = map.buildings,
            unit = map.units, 
            dim = map.dimensions,
            product = dim.x * dim.y,
            i, t, b, u, e, element, pos;

            matrix = new Matrix(dim);

            allowedBuildings = Math.ceil(product/10) - 1;
            allowedUnits = Math.ceil(product/12.5);

            for (var t, i = 0; i < terr.length; i += 1)
                terrain.push(matrix.insert(new Terrain(terr[i].type, terr[i].position)));

            for (var b, j = 0; j < building.length; j += 1) 
                buildings.push(matrix.insert(new Building(building[j].type, building[j].position, j, editor ? building[j].player : app.players.number(building[j].player))));
 
            for (var u, k = 0; k < unit.length; k += 1)
                units.push(matrix.insert(new Unit(editor ? unit[k].player : app.players.number(unit[k].player), unit[k].position, app.unit[unit[k].type])));
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
        
        displaySurplus: function () {

        },
        displayPlayers: function (){

        }
    };
}();
},{"../controller/players.js":5,"../definitions/units.js":11,"../game/animate.js":13,"../objects/building.js":28,"../objects/position.js":37,"../objects/terrain.js":42,"../objects/unit.js":44,"../settings/app.js":46,"../settings/game.js":48,"../tools/matrix.js":57,"../tools/validator.js":63}],4:[function(require,module,exports){
app = require('../settings/app.js');
app.settings = require('../settings/game.js');
app.request = require('../tools/request.js');
app.game = require('../game/game.js');

Validator = require('../tools/validator.js');
Map = require('../objects/map.js')

module.exports = function () {

	var error, maps, keys, change, index, type = 'map', category,
	validate = new Validator('maps'), categories = ['two'];

	types = {
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
			url:'games',
			items:[],
			elements: {
	            section: 'gameSelectScreen',
	            div:'selectGameScreen',
	            li:'mapSelectionIndex',
	            type:'game',
	            index:'Index',
	            attribute:'class',
	            url:'games',
	            properties: app.settings.categories
	        }
        }
	},

	byCategory = function (cat) {
		if(cat && cat !== category){
			maps = [], keys = [], category = cat;
	        app.request.get(category, types[type].url, function (response) {

	            if (response && !response.error){
	            	maps = types[type].items = response;
	            	keys = Object.keys(response);
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
	    else
	    	return {};
    },
    
    sub = function (map) { return maps.length ? map : {}; };

    byCategory(categories[0]);

	return {
		type: function (t) {
			if(type !== t){
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
    	byIndex: function (ind) {
    		index = ind;
    		var m = sub(format(maps[keys[ind]]));
    		return m.map ? m.map : m;
    	},
    	first: function () {
    		return sub(maps[keys[0]]);
    	},
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
	        if(category === room.category && games[room.name]){
	        	socket.emit('removeRoom', room);
	            delete games[room.name];
	            keys = Object.keys(games);
	            change = true;
	            return room;
	        }
	        return false;
        },
        updated: function () { 
        	if(change){
        		change = false;
        		return true; 
        	}
        },
        random: function () {
        	console.log('---- random!!! ====');
        	byCategory(categories[app.calculate.random(categories.length - 1)]);
        	console.log(maps);
        	console.log('random map index: ' + app.calculate.random(maps.length - 1));
        	return maps[app.calculate.random(maps.length - 1)];
        },
        index: function () {return index;},
        clear: function () {maps = [], category = undefined, index = undefined;},
        screen: function () { return types[type].elements; },
        save: function (map) {

        	if((error = validate.defined (app.user.email(), 'email') || (error = validate.map(map))))
        		throw error;

            app.request.post({
			    creator: app.user.email(),
			    name: map.name,
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
	}
}();
},{"../game/game.js":18,"../objects/map.js":33,"../settings/app.js":46,"../settings/game.js":48,"../tools/request.js":58,"../tools/validator.js":63}],5:[function(require,module,exports){
app = require('../settings/app.js');
app.map = require('../controller/map.js');
app.dom = require('../tools/dom.js');
app.menu = require('../menu/menu.js');
app.keys = require('../tools/keyboard.js');
Player = require('../objects/player.js');

module.exports = function () {

	var current, players = [], defeated = [],
	
	setProperties = function (property, value, index) {
        var setting = property.substring(7).toLowerCase();
        var index = index !== undefined ? index : property.getNumber() - 1;
        if (players[index]) players[index][setting] = setting === 'co' ? app.co[value](players[index]) : value;
        if (app.user.player() && app.user.number() === index + 1)
            socket.emit('setUserProperties', {property:setting, value: value, index:index});
    },

    exists = function (player) {
        for (var id, i = 0; i < players.length; i += 1){
            id = isNaN(player.id) ? player.id() : player.id;
            if (players[i].id() === id)
                return i;
        }
        return false;
    },

    addPlayer = function (player, number) {

        // check if player is already in and replace if they are
        if(player && players.length <= app.map.players()){

            // get the attributes of the co from game and add them to player object
            var id = 'player'+ (number || player.number) +'co';  // <--- why doesnt the player.number property work???!!!
            var element = document.getElementById(id);
            var index = exists(player), value = app.dom.getDefault(element);
            
            if(!value && player.co)
                value = player.co;

            player.number = index === false ? players.length + 1 : players[index].number();
            player = new Player(player);

            if (index !== false) players.splice(index, 1, player);
            else players.push(player);

            if (value) setProperties(id, value);
            return true;
        }
        return false;
    },

    shiftPlayers = function (index) {

        // get currently selected co
        var selected = app.dom.getDefault(document.getElementById('player'+ app.user.player().number() +'co'));

        // move each player after the removed player down one
        for (i = index; i < players.length; i += 1)
            players[i].setNumber(i + 1);

        // generate id for new player location
        var co = 'player'+app.user.player().number()+'co';

        // move arrows to correct position
        app.keys.press(app.keys.left());
        app.menu.arrowsTo(co);

        // change co to match players original selection
        setProperties(co, selected);
        app.dom.changeDefault(selected, document.getElementById(co));
        
    };

	return {

		setProperty:setProperties,
		changeProperty: function(p){
            var children = document.getElementById('player' + (p.index + 1) + p.property).childNodes;
            var length = children.length;

            for(var i = 0; i < length; i += 1){
                var equal = children[i].getAttribute('class') === p.value;
                children[i].style.display = equal ? 'block' : 'none';
            }
            setProperties(p.property, p.value, p.index);
        },
        empty: function () { return !players.length; },
        first: function () { return players[0]; },
        last: function () { return players[players.length - 1]; },
       	next: function () { return current === this.last() ? this.first() : players[current.number()]; },
        all: function () { return players.concat(defeated); },
        length: function () { return players.length; },
        add: function (player) {
        	if(player.length)
        		for(var i = 0; i < player.length; i+=1)
        			addPlayer(player[i], i + 1);
        	else addPlayer(player);
        	return current = players[0];
        },

        // check if all players are present and ready
		ready: function () {
            var length = app.map.players();
            for(i = 0; i < length; i += 1)
            	if (!players[i] || !players[i].ready()) 
                    return false;
            return true;
        },

        get: function (object) {
        	var i, all = players.concat(defeated);
        	for(i = 0; i < all.length; i += 1)
        		if(all[i] && object.id() == all[i].id())
        			return all[i];
        	return false;
        },

        reset: function () { return players.splice(0, players.length); },    
        current: function () { return current; },
        setCurrent: function (player) { current = player; },
        defeated: function () { return defeated; },
        defeat: function (player) {
            defeated.concat(players.splice(player.index(), 1));
            if(app.players.length() <= 1)
                return app.game.end();
            alert('player '+player.number()+' defeated');
        },

        indexOf: function (object) {
            for (var i = 0; i < players.length; i += 1)
                if(players[i].id() === object.id())
                    return i;
            return false;
        },

        number: function (number) {
            for (var i = 0; i < players.length; i += 1)
                if(players[i].number() == number)
                    return players[i];
            return false;
        },

        remove: function(player, cp){

            // make this more complex to handle redistribution of players
            var i, index = exists(player);

            if (index !== false) {

                // if there is a specified computer replacement or the game has started
                if (cp || app.game.started())

                    // then replace the player with the ai or undefined
                    players.splice(index, 1, cp)

                else {

                    // remove player
                    players.splice(index, 1);

                    // adjust players to make up for the disconnected player
                    if (players.length >= index) 
                        shiftPlayers(index);
                }
            }
        }
    };
}();
},{"../controller/map.js":3,"../menu/menu.js":22,"../objects/player.js":36,"../settings/app.js":46,"../tools/dom.js":53,"../tools/keyboard.js":56}],6:[function(require,module,exports){
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
},{"../controller/cursor.js":2,"../controller/map.js":3,"../game/animate.js":13,"../settings/app.js":46,"../settings/game.js":48}],7:[function(require,module,exports){
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
},{"../definitions/units.js":11,"../settings/app.js":46}],8:[function(require,module,exports){
var obsticle = require('../objects/obsticle.js');

module.exports = {
    mountain: new obsticle('mountain', 2),
    wood: new obsticle('wood', 3),
    building: new obsticle('building', 2),
    plain: new obsticle('plain', 1),
    snow: new obsticle('snow', 1),
    unit: new obsticle('unit', 0)
};
},{"../objects/obsticle.js":35}],9:[function(require,module,exports){
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
},{"../definitions/obsticles.js":8,"../objects/property.js":38,"../tools/validator.js":63}],10:[function(require,module,exports){
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
},{"../objects/scoreElement.js":39}],11:[function(require,module,exports){
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
},{"../settings/app.js":46,"../settings/game.js":48}],12:[function(require,module,exports){
Position = require('../objects/position.js');
Heap = require('../tools/binaryHeap.js');

var Path = function () {this._coordinates = [];};

Path.prototype.size = function () { return this._coordinates.length; };
Path.prototype.clear = function () { return this._coordinates = []; };
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

        neighbors = this.getNeighbors(current.position(), unit);

        for (var i = 0; i < neighbors.length; i += 1) {

            neighbor = neighbors[i];

            cost = (current.f || 0) + unit.moveCost(neighbor);

            // if the currentrent square is in the open array and a better position then update it
            if (cost <= allowed) {
                neighbor.f = cost;
                app.map.close(neighbor);
                reachable.push(neighbor);
                open.push(neighbor);
            } 
        }
    }
    return clean ? app.map.clean(reachable) : reachable;
};

Path.prototype.find = function (unit, target) {

    var allowed = unit.movement(), clean = [unit], cost, neighbor, i, neighbors, position, current,
    open = new Heap('f'); 
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

        neighbors = this.getNeighbors(position);

        for (i = 0; i < neighbors.length; i += 1) {

            neighbor = neighbors[i]; // current neighboring square

            cost = (current.g || 0) + unit.moveCost(neighbor);

            // if the currentrent square is in the open array and a better position then update it
            if (cost <= allowed && (!neighbor.g || neighbor.g >= current.g)) {
                neighbor.g = cost; // distance from start to neighboring square
                neighbor.f = cost + this.distance(neighbor.position(), target, unit.position()); // distance from start to neighboring square added to the distance from neighboring square to target
                neighbor.p = current; //<--- keep reference to parent
                app.map.close(neighbor);
                clean.push(neighbor);
                open.push(neighbor);
            }
        }
    }
    app.map.clean(clean);
    return false;
};

Path.prototype.show = function (effect) { app.animate('effects'); };

module.exports = Path;
},{"../objects/position.js":37,"../tools/binaryHeap.js":49}],13:[function(require,module,exports){
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
},{"../settings/app.js":46}],14:[function(require,module,exports){

// ------------------------------------------ settings -----------------------------------------------------------------

app = require('../settings/app.js'); // app holds all elements of the application 
app.settings = require('../settings/game.js'); // app.settings holds application settings

// ------------------------------------------- tools --------------------------------------------------------------------

app.init = require('../tools/init.js'); // app.init creates a new canvas instance
app.touch = require('../tools/touch.js'); // handle touch screen operations
app.chat = require('../tools/chat.js'); // handle chat interactions
app.key = require('../tools/keyboard.js'); // handles keyboard input
app.request = require('../tools/request.js'); //handles AJAJ calls where needed
app.dom = require('../tools/dom.js'); // app.dom is a list of functions used to assist manipulating the dom
app.undo = require('../tools/undo.js'); // app.undo handles the cleanup of elements that are no longer needed
app.increment = require('../tools/increment.js');


// -------------------------------------------- menu --------------------------------------------------------------------

app.login = require('../menu/login.js'); // login control
app.menu = require('../menu/menu.js'); // game setup menu
app.modes = require('../menu/modes.js'); // app.modes holds functions for the selection of game modes / logout etc..
app.options = require('../menu/options.js'); // app.options handles the in game options selection, end turn, save etc.
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
app.display = require('../tools/display.js'); // app.display handles all the display screens and the users interaction with them

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
},{"../controller/cursor.js":2,"../controller/map.js":3,"../controller/maps.js":4,"../controller/players.js":5,"../controller/screen.js":6,"../definitions/buildings.js":7,"../definitions/obsticles.js":8,"../definitions/properties.js":9,"../definitions/units.js":11,"../game/animate.js":13,"../game/calculate.js":15,"../game/draw.js":16,"../game/effects.js":17,"../game/game.js":18,"../menu/login.js":21,"../menu/menu.js":22,"../menu/modes.js":23,"../menu/options.js":24,"../menu/scroll.js":25,"../objects/animations.js":26,"../objects/co.js":29,"../objects/hud.js":32,"../objects/obsticle.js":35,"../objects/property.js":38,"../objects/screens.js":40,"../objects/target.js":41,"../objects/user.js":45,"../settings/app.js":46,"../settings/game.js":48,"../tools/chat.js":50,"../tools/display.js":52,"../tools/dom.js":53,"../tools/increment.js":54,"../tools/init.js":55,"../tools/keyboard.js":56,"../tools/request.js":58,"../tools/touch.js":61,"../tools/undo.js":62}],15:[function(require,module,exports){
/* ----------------------------------------------------------------------------------------------------------*\
    
    handles calculations like pathfinding and the definition of movement range

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

        numberOfBuildings: function(map){

            // clear out previous numbers
            var display = app.settings.buildingDisplayElement;
            var types = Object.keys(display);
            var len = types.length;
            for(var t = 0; t < len; t += 1)
                app.settings.buildingDisplayElement[types[t]].numberOf = 0;

            // get selected maps building list
            var buildings = map.buildings;
            var type, n, num = buildings.length;

            // add one for each building type found  to the building display list
            for (n = 0; n < num; n += 1){
                type = buildings[n].type;
                if(type !== 'hq') app.settings.buildingDisplayElement[type].numberOf += 1; 
            }

            return app.settings.buildingDisplayElement;
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
},{"../controller/map.js":3,"../controller/screen.js":6,"../settings/app.js":46,"../settings/game.js":48}],16:[function(require,module,exports){
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
},{"../controller/background.js":1,"../controller/map.js":3,"../controller/screen.js":6,"../game/effects.js":17,"../objects/animations.js":26,"../settings/app.js":46,"../settings/game.js":48}],17:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\

    app.effect is holds the coordinates for effects

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.touch = require('../tools/touch.js');
Path = require('../effects/path.js');
app.path = new Path();
app.range = new Path();
app.attackRange = new Path();

module.exports = function () {

    var key, undo, block, 
    prev = {}, temp = {}, 
    positions = ['oneAbove','twoAbove','oneBelow','twoBelow'];

    var highlight = app.range;
    var path = app.path;
    var attackRange = app.attackRange;
    var refresh = function () {app.animate('effects');};
    var findElementsByClass = function (element, className){
        for (var i = 0, elements = []; i < element.childNodes.length; i += 1)
            if (element.childNodes[i].className === className)
                elements.push(element.childNodes[i]);
        return elements;
    };

    var fade = function (element, id) {
        app.temp.swell = element;
        app.temp.swellingColor = app.settings.colors[id];
    };

    var stopFading = function (){delete app.temp.swell;};

    var highlightListItem = function (selectedElement, tag, index, previous, elements) {

        // apply highlighting 
        selectedElement.style.backgroundColor = 'tan';

        // display info on the currently hovered over element
        if (id === 'selectUnitScreen') unitInfo(selected, selectedElement.id); /// selected unnacounted for

        // if there is then remove its highlighting
        if (previous) previous.style.backgroundColor = '';
        return true;
    };

    var type = function (element, sentance, index) {
        setTimeout(function () {

            if (sentance[index] && app.temp.typing === sentance) { 
                element.innerHTML += sentance[index];
                index += 1;
                type(element, sentance, index);
            }else{
                return false;
            }
        }, app.settings.typingSpeed * 10);
    };

    return {

        highlightListItem:highlightListItem,
        fade:fade,
        stopFading:stopFading,
        refresh:refresh,

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
        setAttackRange: function (range) {attackRange.set(range);},
        clear: function () {temp = {};prev = {};},
        arrow: function (type, x, y, size) {

            var arrow = document.getElementById(type + 'ArrowOutline');
            var background = document.getElementById(type + 'ArrowBackground');
            var top = arrow.style.top = y + 'px';
            var left = arrow.style.left = x + 'px';

            if(size){
                var border = size / 4;
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
                    background.style.borderBottomWidth = size -2 + 'px';
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
            }

            return {
                outline: arrow,
                background: background
            };
        },

        horizontalScroll:function (parent) {

            var previous = prev.category;

            if(previous !== undefined) previous.style.display = 'none';

            var categories = parent.children;
            var len = categories.length - 1;

            var category = app.def.category = app.scroll.horizontal().infinite(app.def.category, 0 , len);

            // get the elements to the left and right of the selected category and position them as such
            var neg = category - 1;
            var pos = category + 1;
            var left = categories[ neg < 0 ? len : neg ];
            var right = categories[ pos < len ? pos : 0 ];

            // get the category for display
            var show = categories[category];

            // display selected
            show.style.display = '';
            show.setAttribute('pos', 'center');

            //position left and right
            left.setAttribute('pos', 'left');
            right.setAttribute('pos', 'right');

            if(previous === undefined || show.id !== previous.id){
                prev.category = show;
                return show.id;
            }
            return false;
        },

        setupMenuMovement:function (selectedElement, tag, index, previous, elements){

            // if the item being hovered over has changed, remove the effects of being hovered over
            if(previous){
                stopFading();
                var background = findElementsByClass(previous, 'modeBackground')[0] || false;
                if(background){
                    background.style.height = '';
                    background.style.borderColor = '';
                }else{
                    previous.style.height = '';
                    previous.style.borderColor = '';
                }
                if(!app.modes.active()){
                    if(prev.textBackground){
                        var tbg = prev.textBackground;
                        tbg.style.transform = '';
                        tbg.style.backgroundColor = 'white';
                    }
                    if(prev.text) prev.text.style.letterSpacing = '';
                    block = findElementsByClass(previous, 'block')[0] || false;
                    if(block) block.style.display = '';
                    var prevOptions = findElementsByClass(previous, 'modeOptions')[0] || false;
                    if(prevOptions) prevOptions.style.opacity = 0;
                }
            }

            app.display.through();

            if(!app.modes.active()){

                var elements = findElementsByClass(selectedElement.parentNode, 'modeItem');
                var menu = findElementsByClass(selectedElement, 'modeOptions')[0] || false;
                var length = elements.length;

                // calculate the positions of the surrounding elements by index
                var pos = {oneAbove: index - 1 < 1 ? length : index - 1};
                pos.twoAbove = pos.oneAbove - 1 < 1 ? length : pos.oneAbove - 1; 
                pos.oneBelow = index + 1 > length ? 1 : index + 1; 
                pos.twoBelow = pos.oneBelow + 1 > length ? 1 : pos.oneBelow + 1;

                // assign position values for each positon
                for( var p = 0; p < positions.length; p += 1){
                    var position = positions[p];
                    var posIndex = pos[position];
                    var element = app.dom.findElementByTag(tag, elements, posIndex);
                    element.setAttribute('pos', position);
                }

                selectedElement.setAttribute('pos', 'selected');
                app.touch(selectedElement).scroll();

                // get the h1 text element of the selected mode and its background span
                var text = findElementsByClass(selectedElement, 'text')[0] || false;
                var background = selectedElement.getElementsByTagName('span')[0] || false;

                if(text && background){
                    // save the background and text for resetting on new selection
                    prev.textBackground = background;
                    prev.text = text;

                    //  get the length of the id (same as inner html);
                    var letters = selectedElement.id.length;

                    // get the width of the text and the width of its parent
                    var parentWidth = selectedElement.clientWidth;
                    var bgWidth = background.offsetWidth;

                    // devide the text width by the width of the parent element and divide it by 4 to split between letter spacing and stretching
                    var diff = (bgWidth / parentWidth ) / 4;
                    var transform = diff + 1; // find the amount of stretch to fill the parent
                    var spacing = (diff * bgWidth) / letters; // find the amount of spacing between letters to fill the parent

                    // set spacing
                    text.style.letterSpacing = spacing + 'px';

                    // stretch letters
                    //background.style.transform = 'scale('+transform+',1)';

                    // remove background
                    background.style.backgroundColor = 'transparent';
                };
                
                // hide the background bar
                block = findElementsByClass(selectedElement, 'block')[0] || false;
                if (block) block.style.display = 'none';
            }

            if(selectedElement.getAttribute('class') === 'modeOption'){
                id = selectedElement.parentNode.parentNode.id;
            }else{
                id = selectedElement.id;
            }

            // get border of background div            
            var border = findElementsByClass(selectedElement, 'modeBackground')[0] || false;
            var element = selectedElement;
            
            // fade the selected element from color to white
            if (border) element = border;

            fade(element, id || 'game');

            // toggle sub menu selections
            if (menu || app.modes.active()){
                app.display.menuItemOptions(menu);
                if(menu){
                    app.def.menuOptionsActive = true;
                    return false; // tells select that it is not selectable since it has further options
                }else if(!app.modes.active()){
                    app.def.menuOptionsActive = false;
                }
            }
            return true;
        },

        swell: {
            color: function (now, element, color, inc, callback, id) { 

                if(app.temp.swell || element){

                    // note that color swell is active
                    if(!app.temp.colorSwellActive) app.temp.colorSwellActive = true;

                    if(id && !app.prev[id]) app.prev[id] = {};
                    var time = app.prev[id] ? app.prev[id].swellTime : app.prev.swellTime;

                    if(!time || now - time > app.settings.colorSwellSpeed){
                        
                        var inc = inc ? inc : app.settings.colorSwellIncriment;
                        var element = element ? element : app.temp.swell;
                        var prev = app.prev[id] ? app.prev[id].lightness : app.prev.lightness;

                        if(id){
                            if(!app.temp[id]) app.temp[id] = {lightness:app.def.lightness};
                            app.prev[id].swellTime = now;
                        }else{
                            app.prev.swellTime = now;
                            if(!app.temp.lightness) app.temp.lightness = app.def.lightness;
                        }

                        var lightness = app.temp[id] ? app.temp[id].lightness : app.temp.lightness;
                        var color = color ? color : app.temp.swellingColor;

                        if(callback) {
                            callback(app.hsl(color.h, color.s, lightness), element);
                        }else{
                            element.style.borderColor = app.hsl(color.h, color.s, lightness);
                        }

                        if( lightness + inc <= 100 + inc && prev < lightness || lightness - inc < 50){
                            if(app.temp[id] && app.prev[id]){
                                app.temp[id].lightness += inc;
                                app.prev[id].lightness = lightness;
                            }else{
                                app.temp.lightness += inc;
                                app.prev.lightness = lightness;
                            }
                        }else if(lightness - inc >= color.l && prev > lightness || lightness + inc > 50){ 
                            if(app.temp[id] && app.prev[id]){
                                app.temp[id].lightness -= inc;
                                app.prev[id].lightness = lightness;
                            }else{
                                app.temp.lightness -= inc;
                                app.prev.lightness = lightness;
                            }
                        };
                    }
                // if there is no app.temp.swell, but colorswell is active then delete every
                }else if(app.temp.colorSwellActive){
                    //delete app.temp.lightness;
                    delete app.temp.colorSwellActive;
                    delete app.temp.swellingColor;
                }
            },
            size: function (element, min, max) {

                if(app.prev.swellElement && app.prev.swellElement.id !== element.id){

                    app.prev.swellElement.style.width = '';
                    app.prev.swellElement.style.height = '';
                    app.prev.swellElement.style.left = app.prev.left + 'px';
                    app.prev.swellElement.style.top = app.prev.top + 'px';

                    delete app.prev.left;
                    delete app.prev.top;
                    delete app.temp.size;
                    delete app.temp.left;
                    delete app.temp.top;
                }

                if(!app.settings.swellIncriment && inc) app.settings.swellIncriment = inc;
                if(!app.settings.swellSpeed && swellSpeed) app.settings.swellSpeed = swellSpeed;
                if(!app.temp.size) app.temp.size = element.offsetWidth;
                if(!app.temp.left) app.temp.left = app.prev.left = Number(element.style.left.replace('px',''));
                if(!app.temp.top) app.temp.top = app.prev.top = Number(element.style.top.replace('px',''));
 
                var size = app.temp.size;
                var now = new Date();
                var time = app.prev.sizeSwellTime;
                var inc = app.settings.swellIncriment;
                var swellSpeed = app.settings.swellSpeed;
                var prev = app.prev.size;

                if(!time || now - time > swellSpeed){

                    app.prev.sizeSwellTime = now;

                    app.prev.swellElement = element;

                    var center = inc / 2;

                    if( size + inc <= max && prev < size || size - inc < min){
                        app.temp.size += inc;
                        app.temp.left -= center;
                        app.temp.top -= center;
                        app.prev.size = size;
                    }else if(size - inc >= min && prev > size || size + inc > min){ 
                        app.temp.size -= inc;
                        app.temp.left += center;
                        app.temp.top += center;
                        app.prev.size = size;
                    };

                    var newSize = app.temp.size + 'px';
                    var newLeft = app.temp.left + 'px';
                    var newTop = app.temp.top + 'px';

                    element.style.width = newSize;
                    element.style.height = newSize;
                    element.style.left = newLeft;
                    element.style.top = newTop;
                };
            }
        },

        typeLetters: function (element, sentance) {
            var prevDesc = app.prev.description;
            if(!prevDesc || prevDesc !== sentance){
                app.prev.description = sentance;
                element.innerHTML = '';
                app.temp.typing = sentance;
                return type(element, sentance, 0);
            }
            return false;
        }
    };
}();
},{"../effects/path.js":12,"../settings/app.js":46,"../tools/touch.js":61}],18:[function(require,module,exports){
/* ------------------------------------------------------------------------------------------------------*\
   
    controls the setting up and selection of games / game modes 
   
\* ------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.animate = require('../game/animate.js')
app.effect = require('../game/effects.js');
app.display = require('../tools/display.js');
app.undo = require('../tools/undo.js');
app.key = require('../tools/keyboard.js');
app.target = require('../objects/target.js');
app.hud = require('../objects/hud.js');
app.user = require('../objects/user.js');
app.players = require('../controller/players.js');
app.cursor = require('../controller/cursor.js');
app.background = require('../controller/background.js');

StatusHud = require('../objects/coStatusHud.js');
Score = require('../definitions/score.js');
Counter = require('../tools/counter.js');

app.coStatus = new StatusHud();

module.exports = function () {

    var name, selected, actions, end = false, started = false, settings = require('../settings/default.js');

    // used for accessing the correct building array via what type of transportation the unit uses
    var ports = { air: 'airport', foot: 'base', wheels: 'base', boat: 'seaport' };

    var tick = new Counter(1000);

    return {
        tick:tick.reached,
        started: function () {return started;},
        settings: function () {return settings;},
        load: function (room) { settings = room.settings; },
        name: function (n) {
            if (n) name = n;
            return name;
        },
        
        clear: function () { name = undefined; },

        set: function (setting, value) {
            settings[setting] = value;
            return settings[setting];
        },

        start: function (game) {

            if (app.players.length() !== app.map.players()) 
                return false;

            // set up game map
            app.map.initialize();

            // get the first player
            var player = app.players.first();
            var hq = player.hq().position();

            // set inital gold amount
            player.setGold(player.income());
            player.score.income(player.income());

            // setup game huds
            app.hud = new app.hud(app.map.occupantsOf(hq));

            // start game mechanics
            app.game.loop();

            // clear selection indices
            app.display.reset();

            // move the screen to the current players headquarters
            app.screen.to(hq);

            // begin game animations
            app.animate(['background', 'terrain', 'building', 'unit', 'cursor']);
            
            // mark the game as started
            return started = true;
        },

        end: function () { 
            alert('player ' + app.players.first().number() + ' wins!  with a score of ' + app.players.first().score.calculate() + '!');
            end = true; 
        },

        /* --------------------------------------------------------------------------------------------------------*\
            
            app.game.loop consolidates all the game logic and runs it in a loop, coordinating animation calls and 
            running the game

        \* ---------------------------------------------------------------------------------------------------------*/

        loop: function () {

            var h;

            // incriment frame counter
            tick.incriment();

            // move cursor
            app.cursor.move();

            // if target is active, enabel target selection
            if(app.target.active()) 
                app.target.chose(app.cursor.selected());

            // listen for options activation and selection
            if(app.options.active() && app.options.evaluate())
                app.undo.all(); 

            // handle selection of objects
            if((selected = app.cursor.selected()) && selected.evaluate(app.cursor.position()))
                app.undo.all();

            // display co status hud
            else if (!app.options.active()){
                app.coStatus.display(app.players.current(), app.cursor.side('x'));
                app.map.focus();
            }

            // controls cursor and screen movement/selection
            if(!app.options.active())
                app.cursor.select();

            // control map info hud
            if(!app.cursor.selected()){
                if(app.user.turn()) {
                    if (app.hud.hidden() && !app.map.focused()) 
                        app.hud.show();
                    if (app.cursor.moved()) 
                        app.hud.setElements(app.cursor.hovered());
                }else if(!app.hud.hidden())
                    app.hud.hide();
            }

            //app.effect.swell.color(); // listen for fading colors in and out on selection

            // exit menus when esc key is pressed
            if(app.key.pressed(app.key.esc()))
                if(!app.options.active() && !selected){
                    app.options.display();
                    app.coStatus.hide();
                } else app.undo.all();

            // undo any lingering key presses <---- not really necessary
            app.key.undo();
            app.key.undoKeyUp();
            tick.reset(); // reset counter if necessary
            if (end) return true;
            else window.requestAnimationFrame(app.game.loop);
        }
    };
}();
},{"../controller/background.js":1,"../controller/cursor.js":2,"../controller/players.js":5,"../definitions/score.js":10,"../game/animate.js":13,"../game/effects.js":17,"../objects/coStatusHud.js":30,"../objects/hud.js":32,"../objects/target.js":41,"../objects/user.js":45,"../settings/app.js":46,"../settings/default.js":47,"../tools/counter.js":51,"../tools/display.js":52,"../tools/keyboard.js":56,"../tools/undo.js":62}],19:[function(require,module,exports){
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
                else app.undo.all();

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
},{"../controller/players.js":5,"../definitions/units.js":11,"../game/animate.js":13,"../objects/build.js":27,"../objects/building.js":28,"../objects/featureHud.js":31,"../objects/position.js":37,"../objects/terrain.js":42,"../objects/unit.js":44,"../settings/app.js":46,"../settings/game.js":48,"../tools/counter.js":51,"../tools/matrix.js":57,"../tools/validator.js":63}],20:[function(require,module,exports){
/* ---------------------------------------------------------------------------------------------------------*\   
    app
\* ---------------------------------------------------------------------------------------------------------*/

app = require("./game/app.js");

/* ---------------------------------------------------------------------------------------------------------*\   
    add useful methods to prototypes
\* ---------------------------------------------------------------------------------------------------------*/

// add first letter capitalization funcitonality
String.prototype.uc_first = function () { return this.charAt(0).toUpperCase() + this.slice(1); };
String.prototype.getNumber = function () { return this.substring(6,7); };
Array.prototype.hasValue = function (value) { return this.indexOf(value) > -1; };

// remove one arrays values from another
Array.prototype.offsetArray = function (offsetArray) {
    for (var z = 0; z < offsetArray.length; z += 1)
        for (var n = 0; n < this.length; n += 1)
            if (this[n].x === offsetArray[z].x && this[n].y === offsetArray[z].y)
                this.splice(n, 1);
    return this;
};

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
app.drawWeather = function (draw) {}; // weather stuff animated here

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
},{"./game/app.js":14,"./objects/map.js":33}],21:[function(require,module,exports){
socket = require('../tools/sockets.js');
app.screens = require('../objects/screens.js');
app.display = require('../tools/display.js');
app.menu = require('../menu/menu.js');
app.user = require('../objects/user.js');

module.exports = function () {

	var loginScreen;

	// Here we run a very simple test of the Graph API after login is
	// successful.  See statusChangeCallback() for when this call is made.
	var testAPI = function () {FB.api('/me', function(response) { return loginToSetup(response, 'facebook');});};

	// allow login through fb ---- fb sdk
	// This is called with the results from from FB.getLoginStatus().
	var statusChangeCallback = function (response) {

	    // if connected then return response
	    if (response.status === 'connected') {
	        return testAPI();
	    } else {
	    	loginScreen.style.display = null;
	    	if (response.status === 'not_authorized') {
	    		document.getElementById('status').innerHTML = 'Log in to play JS-WARS!';
	   		} else {
	        	document.getElementById('status').innerHTML = 'Please log in';
	        }
	    }
	};

	// format is where the login is coming from, allowing different actions for different login sources
	var loginToSetup = function (user, format){

	    if(user && user.id) {

	       	app.user = new app.user(user);

	        socket.emit('addUser', user);

	        if(!app.testing) loginScreen.parentNode.removeChild(loginScreen);
	        
	        // display the game selection menu
	        app.screens.modeMenu();

	        app.menu.setup();
	        
	        return true;
	    }
	};

	return function () {

	    if(!app.testing) {

	    	window.fbAsyncInit = function() {

	            FB.init({
	                appId     : '1481194978837888',
	                oauth     : true,
	                cookie    : true,  // enable cookies to allow the server to access 
	                xfbml     : true,  // parse social plugins on this page
	                version   : 'v2.3' // use version 2.2
	            });

	            FB.getLoginStatus(function(response) {
	                statusChangeCallback(response);
	            });
	        };

	        // // Load the SDK asynchronously
	        (function(d, s, id) {

	            var js, fjs = d.getElementsByTagName(s)[0];

	            if (d.getElementById(id)) return;
	            js = d.createElement(s); js.id = id;
	            js.src = "//connect.facebook.net/en_US/sdk.js";
	            fjs.parentNode.insertBefore(js, fjs);
	        }(document, 'script', 'facebook-jssdk'));

	        loginScreen = app.screens.login();
	        document.body.insertBefore(loginScreen, app.domInsertLocation);

	        // hide the login screen, only show if someone has logged in
	        loginScreen.style.display = 'none';

	    }else{
	        loginToSetup({
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
}();
},{"../menu/menu.js":22,"../objects/screens.js":40,"../objects/user.js":45,"../tools/display.js":52,"../tools/sockets.js":60}],22:[function(require,module,exports){
app = require('../settings/app.js');
socket = require('../tools/sockets.js');
app.key = require('../tools/keyboard.js');
app.maps = require('../controller/maps.js'); 
app.screens = require('../objects/screens.js');
app.background = require("../controller/background.js");

module.exports = function () {

    var temp = {}, prev = {}, now = new Date(), mode, game, nameInput, setupScreenElement, roomChange, speed = 1.5, boot = false, gameName = false,
    color = app.settings.colors, playerColor = app.settings.playerColor, ready = false;

    // holds parameters necessary for selection and manipulation of displayed settings elements
    var settingsElements = {

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
        properties:app.settings.settingsDisplayElement
    }

    // holds parameters necessary for selection and manipulation of displayed teams elements
    var playerElements = {

        // type defines what page will be loaded
        type:'teams',

        // name of the element that is parent to the list
        element:'',

        // name of the index, comes after the property name: property + index
        index:'Index',

        // holds the name of the tag being retrieved as a value from the selected element
        attribute:'class',

        // holds the name of the element used for chat and description etc, displayed text
        text:'descriptions',
    };

    var teamElements = {

        display:'',

        // name of the element that is parent to the list
        element:'',

        // name of the index, comes after the property name: property + index
        index:'Index',

        // holds the name of the tag being retrieved as a value from the selected element
        attribute:'class',

        // holds the name of the element used for chat and description etc, displayed text
        text:'descriptions',

        properties:{}
    };

    var exit = function (value, callback, exit) {
        if (app.key.pressed(app.key.enter()) || app.key.pressed(app.key.esc()) || boot){
            if(callback) callback();
            if(app.key.pressed(app.key.esc()) || boot){
                app.key.undo();
                if(boot) boot = false;
                return exit ? exit : 'back';
            }
            app.key.undo();
            return value;
        }
        return false;
    };

    var swell = function (color, element) {

        var direction = function (id) {
            var dir = {
                up:'Bottom',
                down:'Top',
                left:'Left',
                right:'Right'
            };
            return 'border' + dir[id] + 'Color';
        };

        var id, i, len = element.length;

        if(len){
            for(i = 0; i < len; i += 1){
                id = element[i].id.replace('ArrowBackground','');
                element[i].style[direction(id)] = color;
            }
        }else{
            id = element.id.replace('ArrowBackground','');
            element.style[direction(id)] = color;
        }
    };

    var moveElements = function (direction, element, callback, neg, index) {

        if(!callback) callback = false;
        var elements = element.childNodes;
        var length = elements.length;
        var delay = 5;
        var timeout = delay * 100;

        if(!index && index !== 0){
            if(neg === true){
                index = length - 1;
            }else{
                index = 0;
            }
        }

        if(neg === true || neg === -1){
            neg = -1;
        }else{
            neg = 1;
        }

        if(neg === 1 && length > index || neg === -1 && index >= 0){
            var offScreen = Number(app.offScreen);
            setTimeout(function(){ 
                var elem = elements[index];
                elem.style.transition = 'top .'+delay+'s ease';
                setTimeout(function(){elem.style.transition = null}, timeout);
                var position = Number(elem.style.top.replace('px',''));
                if(position){
                    if(direction === 'up'){
                        var target = position - offScreen;
                    }else if(direction === 'down'){
                        var target = position + offScreen;
                    }else{
                        return false;
                    }
                    elem.style.top = target + 'px';
                }
                index += neg;
                moveElements(direction, element, callback, neg, index);
            }, 30);
        }else if(callback){
            setTimeout(callback(element), 1000);
        }
    };

    var changeTeamElementHeight = function (height, len) {
        if(!len) var len = app.map.players();
        var screenHeight = setupScreenElement.offsetHeight;
        var h = Number(height.replace('%','')) / 100;
        var newHeight = h * screenHeight;
        for (var p = 1; p <= len; p += 1){
            var element = document.getElementById('player' + p);
            element.style.top = newHeight + 'px';
        }
    };

    var changeSelectTeamHeight = function (height) {
        var len = app.players.length();
        for(var t = 1; t <= len; t += 1){
            var element = document.getElementById('player'+t+'Team');
            element.style.top = height + 'px';
        }
    };

    var createArrows = function (element, top, bottom, size) {

        if (!size) size = 30;

        var offset = 192;

        var left = Number(element.parentNode.style.left.replace('px',''));

        var height = element.offsetHeight;
        var width = (element.offsetWidth - (size * 1.25)) / 2;

        var x = element.style.left ? Number(element.style.left.replace('px','')) + left + width : left + width;
        var y = setupScreenElement.offsetHeight * .3 - 10;

        var up =  y - 15 - offset + top;
        var down = y - offset + height + bottom;

        return {
            up: app.effect.arrow('up', x, y - 15 - offset + top, size).background,
            down: app.effect.arrow('down', x, y - offset + height + bottom, size).background
        };
    };

    var coBorderColor = function (resetColor) {

        now = new Date();

        // max allowed players in the game
        var potential = app.map.players();

        // move through the spaces and check the status of the players, change their border color
        // to indicate whether they are ready to go or not
        for(var number = 1; number <= potential; number += 1){

            var ind = number - 1;

            // if there is not player element create an array to store it
            if(!temp.playerElement) temp.playerElement = [];

            // get the player element if we havent already
            if(!temp.playerElement[ind]) temp.playerElement[ind] = document.getElementById('player'+number+'co');

            // loa the player element
            var playerElement = temp.playerElement[ind];

            // check the mode, if it is cp then it should display a solid border color
            var mode = document.getElementById('player'+number+'mode')
                .getElementsByClassName('Cp')[0].style.display;

            if(number > app.players.length() && mode){

                // if the  space is not occupied then make the background white
                playerElement.style.borderColor = app.hsl(color['white']);

            }else if(!mode || app.players.number(number).ready() && playerElement){

                // if the player is ready or set to computer then make the border color solid
                playerElement.style.borderColor = app.hsl(playerColor[number]);

            }else if(playerElement){

                // if the player is not ready yet, but present then fade the color in and out
                app.effect.swell.color(now, playerElement, playerColor[number], speed - .5, false, playerElement.id.replace('co','swell'));
            }
        }
    };

    var clearTempAndPrev = function () {
        temp = {};
        prev = {};
        app.display.clearOld();
        app.display.resetPreviousIndex();
    };

    var resetDefaults = function (type) {

        var length = app.players.length();

        for(var n = 1; n <= length; n += 1){

            var element = document.getElementById('player'+n+type);

            var previous = app.players.number(n)[type.toLowerCase()];
            var name = previous.name ? previous.name : previous;

            if (name) {

                var children = element.childNodes;
                var childrenLength = children.length;

                for (var c = 0; c < childrenLength; c += 1) {

                    var child = children[c];

                    if (child.getAttribute('class').toLowerCase() === name.toLowerCase()){
                        child.setAttribute('default',true);
                    } else if (child.getAttribute('default')) {
                        child.removeAttribute('default');
                    }
                }
            }
        }
    };

    var moveElements = function (direction, element, callback, neg, index) {

        if(!callback) callback = false;
        var elements = element.childNodes;
        var length = elements.length;
        var delay = 5;
        var timeout = delay * 100;

        if(!index && index !== 0) index = neg === true ? length - 1 : 0;
        neg = neg === true || neg === -1 ? -1 : 1;

        if(neg === 1 && length > index || neg === -1 && index >= 0){
            var offScreen = Number(app.offScreen);
            setTimeout(function(){ 
                var elem = elements[index];
                elem.style.transition = 'top .'+delay+'s ease';
                setTimeout(function(){elem.style.transition = null}, timeout);
                var position = Number(elem.style.top.replace('px',''));
                if(position){
                    if(direction === 'up'){
                        var target = position - offScreen;
                    }else if(direction === 'down'){
                        var target = position + offScreen;
                    }else{
                        return false;
                    }
                    elem.style.top = target + 'px';
                }
                index += neg;
                moveElements(direction, element, callback, neg, index);
            }, 30);
        }else if(callback){
            setTimeout(callback(element), 1000);
        }
    };

    var choseCo = function (from) {

        if(!temp.joinCreate){

            var teamsElement = temp.teamsElement = app.display.setup (playerElements, setupScreenElement);

            playerElements.properties = app.settings.playersDisplayElement;

            if (from === 'choseGame') {
                moveElements('up', teamsElement);
                socket.emit('getPlayerStates', {category: app.map.category(), name: app.game.name()});
            }

            temp.joinCreate = true;
        }

        var team = app.display.complexSelect (playerElements, function (property) {
            var element = temp.selectedContainer = document.getElementById(property);
            var top = Number(element.parentNode.style.top.replace('px',''));
            var arrows = createArrows(element, top, top + 25);
            temp.up = arrows.up;
            temp.down = arrows.down;
            return element;
        }, true);
        
        if (team.property && !app.players.empty()) 
            app.players.setProperty(team.property, team.value);

        app.effect.swell.color(now, [temp.up, temp.down], color['white'], speed, swell);
        coBorderColor();

        if (!team.property && team.substring(7) !== 'mode') {
            if (app.key.pressed(app.key.enter())) {

                clearTempAndPrev();
                app.undo.tempAndPrev();
                app.key.undo();
                resetDefaults('co');

                var player = app.user.player();
                player.isReady(true);
                socket.emit('ready', player);

                if(app.map.players() > 2){
                    temp.selectTeams = true;
                }else{
                    temp.ready = true;
                    temp.selectTeams = true;
                    var upArr = document.getElementById('upArrowOutline');
                    var downArr = document.getElementById('downArrowOutline');
                    upArr.style.display = 'none';
                    downArr.style.display = 'none';
                    changeTeamElementHeight('20%');
                }
                return false;
            }else{
                return exit(false, function () {
                    var name, teams = document.getElementById('teams');
                    teams.removeChild(document.getElementById('upArrowOutline'));
                    teams.removeChild(document.getElementById('downArrowOutline'));
                    if (from !== 'choseGame'){
                        moveElements('down', teams);
                    }else{
                        setupScreenElement.removeChild(teams);
                    }
                    app.undo.tempAndPrev();
                    clearTempAndPrev();
                    temp.back = true;
                    nameInput = true;
                    setupScreenElement.removeChild(document.getElementById('descriptionOrChatScreen'));
                    if (app.players.length() < 2) {
                        app.maps.remove(app.map.name());
                        socket.emit('removeRoom', {
                            category:app.map.category(), 
                            name: app.game.name()
                        });
                        app.game.clear();
                    }
                    app.players.reset();
                });
            }
        }
    };

    var choseTeam = function (from) {

        if(!temp.selectingTeams){

            teamElements.properties = app.settings.teamsDisplayElement;

            var element = document.getElementById('player1Team');
            var num = prev.top = Number(element.style.top.replace('px',''));
            var top = num / 4;

            changeSelectTeamHeight(top + (top / 6));

            temp.selectingTeams = true;
            changeTeamElementHeight('20%');    
        }

        var team = app.display.complexSelect(teamElements, function (property) {

            var element = document.getElementById(property);

            var tops = prev.top / 5;
            var top = tops + (tops / 6);
            top *= 2.02;

            var arrows = createArrows(element, top + 5, top);

            temp.up = arrows.up;
            temp.down = arrows.down;

            return element;

        }, true);

        if (team && !app.players.empty()) 
            app.players.setProperty(team.property, team.value);

        app.effect.swell.color(now, [temp.up, temp.down], color['white'], speed, swell);
        coBorderColor();

        if (app.key.pressed(app.key.esc()) || app.key.pressed(app.key.enter()) || boot){

            var top = prev.top;
            changeSelectTeamHeight(top);
            resetDefaults('Team');
            app.undo.tempAndPrev();
            clearTempAndPrev();

            if(app.key.pressed(app.key.enter())){
                var upArr = document.getElementById('upArrowOutline');
                var downArr = document.getElementById('downArrowOutline');
                upArr.style.top = top + 'px';
                downArr.style.top = top + 'px';
                upArr.style.display = 'none';
                downArr.style.display = 'none';
                temp.ready = true;
                temp.selectTeams = true;
                return false;
            }

            app.key.undo();
            changeTeamElementHeight('30%');
            temp.joinCreate = true;
        }
    };

    var playerReady = function (from) {

        if(!temp.readyScreenChanged){

            temp.sButton = app.screens.startButton('setupScreen');

            var bb = 5;
            var chatScreen = temp.chatScreen = document.getElementById('descriptionOrChatScreen');
            chatScreen.style.height = chatScreen.offsetHeight * 1.8 + 'px';

            var chat = temp.descOrChat = document.getElementById('descriptionOrChat');
            chat.style.height = '77%';
            chat.style.borderBottomWidth = bb + 'px';

            var description = document.getElementById('descriptions');
            description.innerHTML = '';

            var mockForm = temp.MForm = document.getElementById('chatForm');
            mockForm.style.display = 'block';
            mockForm.style.height = '15%';
            mockForm.style.borderBottomWidth = bb + 'px';
            temp.readyScreenChanged = true;

            var c = temp.chat = document.getElementById('chat');
            c.style.display = 'block';

            temp.input = document.getElementById('chatInput');
            temp.input.focus();
        }

        coBorderColor();

        var sButton = temp.sButton;

        app.players.ready() && app.user.first() ? sButton.show() : sButton.hide();

        if (ready) return app.players.all();

        if (app.key.pressed(app.key.enter())) 
            app.chat.display(app.chat.message(temp.input));

        if (app.key.pressed(app.key.esc()) || boot) {

            var player = app.user.player();
            player.isReady(false);
            socket.emit('ready', player);
            resetDefaults('co');
            
            temp.chatScreen.style.height = '20%';

            var descOrChat = temp.descOrChat;
            descOrChat.style.height = '83%';
            descOrChat.style.borderBottomWidth = '12px';

            temp.chat.style.display = 'none';

            var MForm = temp.MForm;
            MForm.style.height = '0px';
            MForm.style.display = 'none';

            app.key.undo();
            var upArr = document.getElementById('upArrowOutline');
            var downArr = document.getElementById('downArrowOutline');
            upArr.style.display = '';
            downArr.style.display = '';
            temp.ready = false;
            sButton.remove();

            if (app.map.players() > 2) {
                temp.selectTeams = true;
            } else {
                changeTeamElementHeight('30%');
                temp.selectTeams = false;
                temp.joinCreate = true;
            }
        }
    };  

    return {

        arrowsTo: function (element) { app.display.setIndex(element); },

        back: function(){ boot = true; },

        choseMapOrGame: function (type) {

            var map, maps = app.maps, element = maps.type(type).screen(), allMaps = maps.all();

            var clearSelect = function (setupScreenElement) { 
                var select = document.getElementById(element.section);
                var buildings = document.getElementById('buildingsDisplay');
                var categories = document.getElementById('categorySelectScreen');
                setupScreenElement.removeChild(select);
                setupScreenElement.removeChild(buildings);
                setupScreenElement.removeChild(categories);
                app.display.resetPreviousIndex(); // reset index
                app.key.undo();
                maps.clear();
                clearTempAndPrev();
                app.undo.tempAndPrev();
            };

            if (!temp.select) temp.select = app.display.mapOrGame(element, allMaps);
            if (!temp.category) temp.category = document.getElementById('selectCategoryScreen');

            // send a request to the server for a list of maps if one has not been returned yet
            maps.setCategory(app.effect.horizontalScroll(temp.category));

            if(maps.updated()){
                var elements = app.display.info(allMaps, ['name'], element, element.li);
                app.display.mapOrGameSelection(element.section, elements);
                if (!maps.index()) app.display.resetPreviousIndex(); // reset index
            }

             // enable selection of maps and keep track of which map is being highlighted for selection
            var id = app.display.select(element.li, element.div, app.effect.highlightListItem, 'ul', 5).id;
            var index = app.display.index();

            // display information on each map in their appropriate locations on the setup screen as they are scrolled over
            if(index && maps.index() + 1 !== index) 
                app.display.mapInfo(maps.byIndex(index - 1));
            
            // if a map has been selected, return it for use in the game.
            if(id && (map = maps.byId(id))){

                map.category = maps.category();
                app.map.set(map.map ? map.map : map);

                if (type === 'game'){
                    app.game.name(map.name);
                    map.players.push(app.user.raw());
                    app.players.add(map.players);
                    socket.emit('join', map);
                }
                
                clearSelect(setupScreenElement);
                return true;
            }

            if (app.key.pressed(app.key.esc())) {
                clearSelect(setupScreenElement);
                return 'back';
            }

            return false;
        },

        choseSettings: function () {

            if(!temp.settings){

                temp.swell = false;

                settingsElement = app.display.setup(settingsElements, setupScreenElement, temp.back);

                if (temp.back) moveElements('down', settingsElement, function(){ temp.swell = true; });
                
                else moveElements('up', settingsElement, function(){ temp.swell = true; });

                temp.settings = true;
            }

            if( !nameInput || temp.back ){

                delete temp.back;

                // handle selection of the elements on display
                var selected = app.display.complexSelect(settingsElements, function(property) {

                    var seperation = 85;
                    var position = 30;

                    // get the background of the currently selected element for swelling
                    var setting = temp.selectedContainer = document.getElementById(property + 'Background');

                    var y = Number(setting.style.top.replace('px','')) + position;
                    var x = Number(setting.style.left.replace('px','')) + position;

                    temp.up = app.effect.arrow('up', x, y - seperation).background;
                    temp.down = app.effect.arrow('down', x, y + seperation).background;

                    return document.getElementById(property + 'Settings');
                });

                if( selected ) app.game.set(selected.property, selected.value);
            }

            // make background swell
            if (temp.swell) app.effect.swell.size(temp.selectedContainer, 50, 100);
            app.effect.swell.color(new Date(), [temp.up, temp.down], color.white, speed, swell);

            if(app.key.pressed(app.key.enter()) || nameInput){

                if(typeof(nameInput) !== "object"){
                    app.key.undo();
                    nameInput = app.display.gameNameInput();
                    app.effect.typeLetters(nameInput.description, 'Enter name for game room.');
                }
                
                if(app.key.pressed(app.key.enter())){

                    var weather, name = nameInput.name.value;

                    if(!name){
                        app.effect.typeLetters(nameInput.description, 'A name must be entered for the game.');

                    }else if(name.length < 3){
                        app.effect.typeLetters(nameInput.description, 'Name must be at least three letters long.');

                    }else{
                        app.players.add(app.user.raw());
                        app.menu.setupRoom(name);

                        if((weather = app.game.settings().weather)){
                            app.background.set(weather);
                            socket.emit('background', weather);
                        }

                        app.key.undo();

                        var settingsElem = document.getElementById('settings');
                        settingsElem.removeChild(nameInput.upArrow);
                        settingsElem.removeChild(nameInput.downArrow);

                        clearTempAndPrev();
                        app.undo.tempAndPrev();

                        app.display.clearOld();

                        moveElements('up', settingsElem, function(settings){
                            setupScreenElement.removeChild(settings);
                            moveElements('up', temp.teamsElement);
                        }, true);

                        setupScreenElement.removeChild(document.getElementById('descriptionOrChatScreen'));

                        return settings;
                    }
                }else if(app.key.pressed(app.key.esc())){
                    app.key.undo(app.key.esc());
                    nameInput.description.style.paddingTop = null;
                    nameInput.description.style.paddingBottom = null;
                    nameInput.input.style.display = null;
                    nameInput.input.style.height = null;
                    nameInput.downArrow.style.display = '';
                    nameInput.upArrow.style.display = '';
                    nameInput = false;
                    app.display.clearOld();
                }
            }else{
                return exit( settings, function () {
                    app.display.clearOld();
                    app.display.reset();
                    app.display.resetPreviousIndex();
                    clearTempAndPrev();
                    app.undo.tempAndPrev();
                    setupScreenElement.removeChild(document.getElementById('settings'));
                    setupScreenElement.removeChild(document.getElementById('descriptionOrChatScreen'));
                });
            }
        },

        coSelection: function (properties, prevList, prevSelection){

            // initialize a list to load properties the current user can edit
            var list = [];

            // detect which player so that they can only edit their respective charector settings
            var number = app.user.number();

            // get the keys to the properties that can be edited by the user (co selection, teams etc)
            var keys = Object.keys(properties);

            // number of properties
            var keysLength = keys.length;

            var getValue = app.dom.getDisplayedValue;

            // if there are previous items 
            if (prevSelection !== undefined) var ind = prevList[prevSelection];

            for(var k = 0; k < keysLength; k += 1){

                var key = keys[k];
                var mode = getValue(key);
                var pNumber = key.getNumber();

                if(key.indexOf('mode') > -1 && number === 1){
                    if(pNumber != 1){
                        var i = pNumber - 1;
                        var p = app.user.player();
                        if(mode === 'Cp'){
                            var property = 'player'+pNumber+'co';
                            if(p && !p.cp){
                                var value = getValue(property);
                                var cp = aiPlayer(number, p);
                                socket.emit('boot', {player:p, cp:cp});
                                app.players.remove(i, cp);
                                app.players.setProperty(property, value);
                            }
                            list.push(property);
                        }else if(p && p.cp){
                            socket.emit('boot', {player:false, cp:p});
                            app.players.remove(i);
                        }
                    }
                    list.push(key);
                }else if(key.indexOf('Team') > -1 && (number == pNumber || mode === 'Cp' && number == 1) || key.indexOf(number+'co') > -1){
                    list.push(key);
                }
            }
            return {list:list, ind:ind};
        },

        login: function () { 

            // if login is successful go to game setup, otherwise the user has declined
            var paramsLocation=window.location.toString().indexOf('?');
            var params="";
            if (paramsLocation>=0)
            params=window.location.toString().slice(paramsLocation);

            top.location = 'https://graph.facebook.com/oauth/authorize?client_id=1481194978837888&scope=public_profile&email&redirect_uri=http://localhost/'+params;
        },

        join: function (from){
            if(!temp.selectTeams)
                return choseCo(from);
            else if(temp.ready)
                return playerReady(from);
            else return choseTeam(from);
        },

        setupRoom: function (name) {
            var room = {};
            var map = app.map.get();
            room.name = app.game.name(name);
            room.settings = app.game.settings();
            room.max = app.map.players();
            room.map = map;
            room.category = map.category;
            socket.emit('newRoom', room);
        },

        setup: function (setupScreen){

            // select game mode
            if(app.user.id() && !mode){

                mode = app.display.select('modeItemIndex', 'selectModeMenu', app.effect.setupMenuMovement, 'li', 5, 'infinite').id;

                if(mode){
                    setupScreenElement = document.getElementById('setupScreen');
                    app.dom.removeChildren(setupScreenElement, 'title');
                    var footer = document.getElementById('footer');
                    footer.style.display = 'none';
                }
            }

            // set up the game based on what mode is being selected
            if(mode && !game){
                if(mode === 'logout') return app.modes[mode]();
                //if(mode === 'mapdesign') return app.modes[mode]();
                game = app.modes[mode](setupScreenElement);
            }

            // listen for fading colors in and out on selection
            app.effect.swell.color(Date.now());

            // if a game has been set 
            if (game) {

                // remove the setup screen
                setupScreenElement.parentNode.removeChild(setupScreenElement);                

                // start game adds players, player info, settings, game type, mode, maps etc to be used in game, then 
                // starts the game loop if it the game was successfully set up
                if(game === 'editor' && app.editor.start() || app.game.start(game))
                    return true;

                // if the game cannot be started then reset
                game = mode = false;
                app.display.clear();
                app.screens.modeMenu();
            }

            // if the game hasnt been started then keep looping the setup menu
            window.requestAnimationFrame(app.menu.setup);

            // remove key presses on each iteration
            if(app.key.pressed()) app.key.undo();        
        },

        start: function () { ready = true; }
    };
}();
},{"../controller/background.js":1,"../controller/maps.js":4,"../objects/screens.js":40,"../settings/app.js":46,"../tools/keyboard.js":56,"../tools/sockets.js":60}],23:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\

    holds functions for the selection of game modes / logout etc.. <--- can be redone better

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.menu = require('../menu/menu.js');
app.maps = require('../controller/maps.js');
app.user = require('../objects/user.js');
app.settings = require('../settings/game.js');
app.request = require('../tools/request.js');
app.key = require('../tools/keyboard.js');
app.testMap = require('../objects/testMap.js');
app.editor = require('../game/mapEditor.js');

module.exports = function (){

    var sent;
    var game = {};
    var boot = false, active = false;
    var exitSetupScreen = function () {
        var ss = document.getElementById('setupScreen');
        if (ss) ss.parentNode.removeChild(ss);                
    };
    
    return {
        boot:function(){boot = true},
        logout: function (){
            alert('log out!');
            /*  
            // log user out of facebook
            FB.logout(function(response) {
              console.log(response);
            });
            */
        },
        newgame:function(setupScreen){

            // handle map selection
            if (!game.map){
                game.map = app.menu.choseMapOrGame('map');
                //console.log(game.map);
                if(game.map === 'back'){
                    delete game.map;
                    return 'back';
                }
            }

            // handle settings selection
            if (game.map && !game.settings){
                game.settings = app.menu.choseSettings(setupScreen);
                if (game.settings === 'back') {
                    delete game.settings;
                    delete game.map;
                }
            }

            // handle co position and selection as well as joining the game
            if (game.map && game.settings && !game.players){
                game.players = app.menu.join(setupScreen);
                if(game.players === 'back'){
                    app.display.resetPreviousIndex();
                    socket.emit('exit', boot);
                    delete game.players;
                    delete game.settings;
                    boot = false;
                }
            }

            if (game.map && game.settings && game.players){
                socket.emit('start', game);
                return game;
            }

            return false;
        },
        continuegame:function(){
            alert('continue an old game is under construction. try new game or join new');
        },
        newjoin:function(){
            // handle game selection
            if (!game.room){
                game.room = app.menu.choseMapOrGame('game');
                if(game.room === 'back'){
                    delete game.room;
                    return 'back';
                }
            }

            if(game.room && !game.players){
                game.players = app.menu.join('choseGame');
                if(game.players === 'back'){
                    app.display.resetPreviousIndex();
                    socket.emit('exit');
                    delete game.room;
                    delete game.players;
                }
            }

            if(game.room && game.players){
                if(app.user.player() === app.players.first()) 
                    socket.emit('start', game);
                return game;
            }
        },
        continuejoin:function(){
            alert('continue join is under construction, try new game or join new');
        },
        COdesign:function(){
            alert('design a co is under construction. try new game or join new');
        },
        mapdesign:function(){
            app.map.set(app.maps.random());
            app.players.add(app.user.raw());
            app.cursor.editing();
            return 'editor'; 
        },
        store:function(){
            alert('go to the game store is under construction. try new game or join new');
        },
        active: function(){return active;},
        activate: function(){active = true;},
        deactivate: function(){active = false;},
    };
}();
},{"../controller/maps.js":4,"../game/mapEditor.js":19,"../menu/menu.js":22,"../objects/testMap.js":43,"../objects/user.js":45,"../settings/app.js":46,"../settings/game.js":48,"../tools/keyboard.js":56,"../tools/request.js":58}],24:[function(require,module,exports){
/* ----------------------------------------------------------------------------------------------------------*\
    
    app.options handles the in game options selection, end turn, save etc.
    
\* ----------------------------------------------------------------------------------------------------------*/
app = require('../settings/app.js');
app.game = require('../game/game.js');
app.players = require('../controller/players.js');
socket = require('../tools/sockets.js');

module.exports = function () {

    var active = false;

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
            var player = app.players.current();
            player.endTurn();
            if(app.user.player() === player){
                app.undo.all();
                app.animate(['cursor']);
                socket.emit('endTurn', player.id());
            }
            return this;
        },
        display: function () {
            app.key.undo(app.key.esc());
            active = true;
            app.display.info(app.settings.options, app.settings.optionsDisplay, 
                { section: 'optionsMenu', div: 'optionSelect' }, 'optionSelectionIndex', true);
            return this;
        },
        evaluate: function(){ 
            if((type = app.display.select('optionSelectionIndex', 'optionSelect', app.effect.highlightListItem, 'ul').id))
                return app.options[type]();
        },
        active:function(){return active;},
        activate:function(){active = true;},
        deactivate:function(){active = false;}
    };
}();
},{"../controller/players.js":5,"../game/game.js":18,"../settings/app.js":46,"../tools/sockets.js":60}],25:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    handles scrolling of menu elements etc..
    
\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.undo = require('../tools/undo.js');
app.key = require('../tools/keyboard.js');

module.exports = function () {

    var undo = app.key.undo, 
    direction, then = new Date(),

    scroll = function (neg, pos){
        if (app.key.pressed(neg) || neg == direction){
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
        horizontal:function (){
            this.scroll = scroll('left','right');
            return this;
        },
        verticle:function(){
            this.scroll = scroll('up','down');
            return this;
        },
        infinite: function (index, min, max) {
            var point = index + this.scroll;
            var def = this.scroll < 0 ? max : min;
            return point > max || point < min ? def : point;
        },
        finite: function (index, min, max) {
            if(this.scroll){
                var point = index + this.scroll;
                if (point <= max && point >= min) return point;
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
},{"../settings/app.js":46,"../tools/keyboard.js":56,"../tools/undo.js":62}],26:[function(require,module,exports){
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
},{}],27:[function(require,module,exports){
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
},{"../objects/building.js":28}],28:[function(require,module,exports){
app = require('../settings/app.js');
app.map = require('../controller/map.js');

Terrain = require('../objects/terrain.js');
Unit = require('../objects/unit.js');
Position = require('../objects/position.js');

Building = function (type, position, index, player) {
    
    this.healing = {
        hq:['foot', 'wheels'],
        city:this.hq,
        base:this.hq,
        seaport:['boat'],
        airport:['flight']
    }[type];

    this.def = type.toLowerCase() === 'hq' ? 4 : 3;

	Terrain.call(this, type, position);
    this.pos = new Position(position.x, position.y);
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

Building.prototype.name = function (){ return this._current.name; };
Building.prototype.defaults = { health: function () { return 20; } };
Building.prototype.on = function (object) {
    var objectPosition = object.position ? object.position() : object;
    var position = this.position();
    return position.x === objectPosition.x && position.y === objectPosition.y;
};
Building.prototype.type = function () { return 'building';};
Building.prototype.build = function (type) {

    var player = this.player(), p = this.position();
    var unit = new Unit(player, new Position(p.x, p.y), this.units()[type])

    // create and add the new unit to the map
    if(player.canPurchase(unit.cost())){
        player.purchase(unit.cost());          
        app.map.addUnit(unit);
        if (app.user.turn()) socket.emit('addUnit', unit);
        app.hud.setElements(app.cursor.hovered());
        return this;
    }
    return false;
};

Building.prototype.position = function () {return new Position(this.pos.x, this.pos.y);};
Building.prototype.occupied = function () { return app.map.top(this.position()).type() === 'unit'; };
Building.prototype.changeOwner = function(player) { app.map.changeOwner(this, player); };
Building.prototype.setPlayer = function (player) {
    this._current.player = player;
    return this;
};
Building.prototype.player = function (){ return this._current.player; };
Building.prototype.color = function () { return this.player() ? this.player().color() : 'default'; };
Building.prototype.capture = function (capture) {
    return this.health() - capture > 0 ? (this._current.health -= capture) : false; 
};
Building.prototype.restore = function () { this._current.health = this.defaults.health(); };
Building.prototype.class = function () { return 'building'; };
Building.prototype.index = function () { return this._current.index; };
Building.prototype.get = function(unit) { return app.map.buildings()[this._current.index]; };

// check if the unit is owned by the same player as the passed in object
Building.prototype.owns = function (object) { 
    return object.player && object.player() === this.player(); 
};

Building.prototype.select = function () {
    app.display.selectionInterface(this.name().toLowerCase(), 'unitSelectionIndex');
    return true;
};

Building.prototype.evaluate = function () {
    if(!app.cursor.hidden) app.cursor.hide();
    var unit = app.display.select('unitSelectionIndex', 'selectUnitScreen', app.effect.highlightListItem, 'ul', 7).id;
    if (unit) return this.build(unit);
};

Building.prototype.execute = function () {
    app.hud.setElements(app.cursor.hovered());
    app.undo.all(); 
    return true;
};

module.exports = Building;
},{"../controller/map.js":3,"../objects/position.js":37,"../objects/terrain.js":42,"../objects/unit.js":44,"../settings/app.js":46}],29:[function(require,module,exports){
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
},{"../settings/app.js":46}],30:[function(require,module,exports){
app.dom = require('../tools/dom.js');

StatusHud = function () {
	this._context = undefined;
    this._previous = undefined;
    this._gold = undefined;
};

StatusHud.prototype.visibility = function (visibility) {return document.getElementById('coStatusHud').style.display = visibility;}
StatusHud.prototype.show = function () {this.visibility('');};
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
            document.body.insertBefore(hud, app.domInsertLocation);
        }
        // return the context for animation of the power bar
        return this.context = context;
    }
    return false;
};

module.exports = StatusHud;
},{"../tools/dom.js":53}],31:[function(require,module,exports){
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
    var exists, list = app.dom.createList(element, element.type(), attributes ? attributes : app.settings.hoverInfo, 'hud');
    this.size(list.canvas.canvas);
    app.draw(list.canvas.context).hudCanvas(element.draw(), element.class());
    this.element.appendChild(list.ul);
    return list.ul;
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
},{}],32:[function(require,module,exports){
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
Hud.prototype.hide = function () { this.element.style.display = 'none';};
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
    var exists, list = app.dom.createList(element, element.type(), attributes ? attributes : app.settings.hoverInfo, 'hud');
    this.resize(list.canvas.canvas);
    app.draw(list.canvas.context).hudCanvas(element.draw(), element.class());
    this.element.appendChild(list.ul);
    if(type === 'unit') 
        this.number += 1;
    return list.ul;
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
},{}],33:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    creates map object

\* --------------------------------------------------------------------------------------*/

Validator = require('../tools/validator.js');

module.exports = function (id, name, players, dimensions, terrain, buildings, units) {

    var error;
    validate = new Validator('map'),
    category = units.length ? 'preDeployed' : {
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
},{"../tools/validator.js":63}],34:[function(require,module,exports){
// map elements

module.exports = function (type, x, y, player) {
	this.type = type;
	this.position = {x:x, y:y};
	this.player = player;
};
},{}],35:[function(require,module,exports){
module.exports = function (type, defense) {
    this.type = function () { return type };
    this.defense = function () { return defense };
};
},{}],36:[function(require,module,exports){
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
    this.socketId = function () { return user.socketId; };
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

Player.prototype.color = function () { return this.number(); }; // <-------------- figure out color system at some point
Player.prototype.number = function () { return this._current.number; };
Player.prototype.index = function () { return app.players.indexOf(this); };
Player.prototype.setNumber = function (number) { this._current.number = number; };
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
};

Player.prototype.recover = function () {

    var unit, building, u = 0, b = 0, units = app.map.units(), buildings = app.map.buildings();
    
    // check for units that belong to the current player
    while((unit = units[u++]))
        unit.recover();

    while((building = buildings[b++]))
        if (!(unit = building.occupied()) || building.owns(unit))
            building.restore();

    return true;
};

Player.prototype.isReady = function (state) { this._current.ready = state; };
Player.prototype.ready = function () { return this._current.ready; };
Player.prototype.income = function () {

    // get the amount of income per building for current game
    var  i = 0,  

    // money allotted per building
    income = 0, funds = app.game.settings().funds,

    // list of buildings
    building, buildings = app.map.buildings();
    
    // count the number of buildings that belong to the current player
    while ((building = buildings[i++]))
        if (this.owns(building)) 
            income += funds;

    // add income to score
    this.score.income(income);

    return income;
};

Player.prototype.collectIncome = function () {
    var gold = this.setGold(this.gold() + this.income());
    if (gold) this.score.income(gold);
    return gold;
};

Player.prototype.defeat = function (player, captured) {

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
            building.changeOwner(captured);
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

Player.prototype.hq = function () {

    // list off all buildings on map
    var b = 0, buildings = app.map.buildings();

    while ((building = buildings[b++]))
        if (building.name().toLowerCase() === 'hq' && this.owns(building))
            return building;
};

module.exports = Player;
},{"../controller/map.js":3,"../controller/players.js":5,"../controller/screen.js":6,"../definitions/score.js":10,"../game/game.js":18,"../objects/co.js":29,"../settings/app.js":46}],37:[function(require,module,exports){
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
},{}],38:[function(require,module,exports){
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
},{"../settings/app.js":46,"../tools/validator.js":63}],39:[function(require,module,exports){
ScoreElement = function (name, worth) {
	this.name = name;
	this.worth = worth;
	this.amount = 0;
};

module.exports = ScoreElement;
},{}],40:[function(require,module,exports){
app = require('../settings/app.js');
app.game = require('../game/game.js');
app.dom = require('../tools/dom.js');
app.touch = require('../tools/touch.js');
app.menu = require('../menu/menu.js');

module.exports = function () {

    var inputField = function (name) {
        var text = document.createElement('input');
        text.setAttribute('id', name + 'Input');
        text.setAttribute('class','textInput');
        text.setAttribute('autocomplete','off');
        text.setAttribute('type','text');
        return text;
    };

    var arrow = {

        up: function () {

            var exists = document.getElementById('upArrowOutline');

            var upArrowBackground = document.createElement('div');
            upArrowBackground.setAttribute('id','upArrowBackground');
            upArrowBackground.setAttribute('class','upArrow');

            var upArrowOutline = document.createElement('div');
            upArrowOutline.setAttribute('id','upArrowOutline');
            upArrowOutline.setAttribute('class','upArrow');

            upArrowOutline.appendChild(upArrowBackground);

            if(exists){
                //exists.parentNode.replaceChild(upArrowOutline, exists);
                //return false;
                return upArrowOutline;
            }else{
                return upArrowOutline;
            }
        },
        down: function () {

            var exists = document.getElementById('downArrowOutline');

            var downArrowBackground = document.createElement('div');
            downArrowBackground.setAttribute('id','downArrowBackground');
            downArrowBackground.setAttribute('class','downArrow');

            var downArrowOutline = document.createElement('div');
            downArrowOutline.setAttribute('id','downArrowOutline');
            downArrowOutline.setAttribute('class','downArrow');

            downArrowOutline.appendChild(downArrowBackground);

            if(exists){
                //exists.parentNode.replaceChild(downArrowOutline, exists);
                //return false;
                return downArrowOutline;
            }else{
                return downArrowOutline;
            }        
        }
    };

	return {

		startButton: function (id) {

	        var screen = document.getElementById(id);
	        button = document.createElement('div');
	        button.setAttribute('class', 'button');
	        button.setAttribute('id', 'startButton');
	        button.style.display = 'none';
	        button.addEventListener("click", function(event){
	            event.preventDefault();
	            app.menu.start();
	        });
	        screen.appendChild(button);

	        return {
	            show: function () {button.style.display = '';},
	            hide: function () {button.style.display = 'none';},
	            remove: function (){screen.removeChild(button);}
	        };
	    },

	    rules: function (element, textField, back) {

	        var allowed = ['on', 'off', 'num', 'clear', 'rain', 'snow', 'random', 'a', 'b', 'c']
	        var settings = app.game.settings();
	        var rules = app.settings.settingsDisplayElement;
	        var keys = Object.keys(rules);
	        var len = keys.length;
	        var offScreen = Number(app.offScreen);

	        var cont = document.createElement('section');
	        cont.setAttribute('id', 'settings');

	        var width = element.offsetWidth;
	        var height = element.offsetHeight;

	        var left = width * .05;
	        var middle = height * .5;
	        var top = back ? middle - offScreen : middle + offScreen;
	        var id = 0;

	        var nameInput = app.screens.inputForm('name', textField, 'Enter name here.');
	        textField.appendChild(nameInput);

	        for (var i = 0; i < len; i += 1){

	            var div = document.createElement('div');
	            var stable = document.createElement('div');

	            var property = keys[i];
	            var rule = rules[property];
	            rule.hide = true;
	            rule.index = true;

	            if (rule.inc){
	                for (var n = rule.min; n <= rule.max; n += rule.inc){
	                    rule[n] = n;
	                }
	            }

	            var heading = document.createElement('h1');
	            heading.innerHTML = property;

	            var ul = app.dom.createList(rule, property + 'Settings', allowed).ul;

	            div.setAttribute('id', property + 'Background');
	            div.setAttribute('class', 'rules');

	            stable.setAttribute('id', property + 'Container');
	            stable.setAttribute('class', 'stable');

	            stable.appendChild(heading);

	            div.style.left = left + 'px';
	            div.style.top = top + 'px';

	            stable.style.left = left + 'px';
	            stable.style.top = top + 'px';

	            left += .13 * width;
	            top -= .06 * height;

	            var list = app.dom.getImmediateChildrenByTagName(ul, 'li');

	            var show = app.dom.findElementByTag('class', list, settings[property]);

	            app.dom.show(show, list, 'inline-block');
	            app.touch(stable).element().scroll(ul);

	            stable.appendChild(ul);
	            cont.appendChild(stable);
	            cont.appendChild(div);
	        }

	        var up = arrow.up();
	        var down = arrow.down();
	        if (up) cont.appendChild(up);
	        if (down) cont.appendChild(down);
	        element.appendChild(cont);

	        return cont;
	    },

		teams: function (element, textField) {

	        var cos = app.co;
	        var coList = Object.keys(cos);
	        var len = coList.length;
	        var elem = {};
	        var obj = {};
	        var teamElements = {};
	        var height = element.offsetHeight;
	        var width = element.offsetWidth;
	        var size = 200;
	        var fontSize = size / 4;
	        var nop = app.map.players();
	        var top = (height * .3) + app.offScreen;
	        var exists = document.getElementById('teams');
	        var teams = document.createElement('article');
	        teams.setAttribute('id','teams');

	        var chatScreen = document.getElementById('descriptionOrChatScreen');
	        var chat = app.screens.inputForm('chat', chatScreen, 'type here to chat with other players');

	        chatScreen.appendChild(chat);

	        if(nop === undefined)
	        	throw new Error('players missing!', 'screens', 182);

	        if(nop > 2) {
	            var teamProperties = {
	                ind: true,
	                hide: true,
	                description:'Set alliances by selecting the same team.'
	            };
	            var allowed = [];
	            var teamArr = ['a','b','c','d'];
	            for(var i = 0; i < nop; i += 1){
	                var t = teamArr[i];
	                allowed[i] = t;
	                teamProperties[t] = t.toUpperCase() + 'Team';
	            }
	            var teamSelect = true;
	        }

	        for (var p = 1; p <= nop; p += 1){

	            var ind = p - 1;
	            var playa = 'player' + p;
	            var pName = p+'p';
	            var modes = {
	                index: true,
	                hide:true,
	                Cp:'Cp',
	                description: 'Chose Player or Computer.'
	            };

	            var modeAllow = ['Cp', pName];
	            var sections =  width / nop;
	            var position = (sections * ind) + ((sections - size) / 2);

	            var player = document.createElement('section');

	            player.setAttribute('id','player' + p);
	            player.setAttribute('class','players');
	            player.style.width = size + 'px';
	            player.style.height = size + 'px';
	            player.style.left = position + 'px';
	            player.style.top = top + 'px';

	            var coId = playa + 'co';
	            var modeId = playa + 'mode';

	            elem[coId] = {description: 'Chose a CO.'};

	            for(var i = 0; i < len; i += 1){
	                var name = coList[i];
	                var co = cos[name];
	                elem[coId][name] = {
	                    name:co.name,
	                    image:co.image
	                }
	                obj[name] = name;
	            }

	            modes[pName] = pName;

	            elem[modeId] = modes;

	            obj.index = true;
	            obj.hide = true;

	            var modeUl = app.dom.createList(modes, modeId, modeAllow).ul;
	            modeUl.setAttribute('class','playerMode');
	            modeUl.style.fontSize = fontSize + 'px';
	            modeUl.style.left = size - (fontSize / 2) + 'px';

	            var coUl = app.dom.createList(obj, coId, coList).ul;
	            coUl.setAttribute('class','coList');

	            var users = app.players.all()[ind];

	            if(users && users.mode) pName = users.mode;

	            var modeList = app.dom.getImmediateChildrenByTagName(modeUl, 'li');
	            var list = app.dom.getImmediateChildrenByTagName(coUl, 'li');

	            if(users && users.co){
	                var co = app.dom.show(app.dom.findElementByTag('class', list, users.co), list);
	            }else{
	                var co = app.dom.show(app.dom.findElementByTag(coId + 'Index', list, p), list);
	            }

	            var mode = app.dom.show(app.dom.findElementByTag('class', modeList, pName), modeList);

	            if(teamSelect){
	                teamElements[ playa + 'Team' ] = teamProperties;
	                var id = playa + 'Team';
	                var teamsElement = app.dom.createList(teamProperties, id, allowed).ul;
	                teamsElement.setAttribute('class', 'team');
	                teamsElement.style.width = size + 'px';
	                teamsElement.style.top = size * 4 + 'px';
	                var teamList = app.dom.getImmediateChildrenByTagName(teamsElement, 'li');
	                var def = users && users.team ? users.team : teamArr[ind];
	                var team = app.dom.show(app.dom.findElementByTag('class', teamList, def), teamList);
	            }

	            if(!users && !app.players.empty()){
	                app.players.setProperty(modeId, mode);
	                app.players.setProperty(coId, co);
	                if (teamSelect)
	                    app.players.setProperty(id, team);
	            }

	            player.appendChild(modeUl);
	            player.appendChild(coUl);
	            app.touch(modeUl).element().scroll();
	            app.touch(coUl).element().scroll().doubleTap().esc();

	            if (teamSelect){
	             	player.appendChild(teamsElement);
	             	app.touch(teamsElement).element().scroll().doubleTap();
	            }
	            teams.appendChild(player);
	        }

	        var up = arrow.up();
	        var down = arrow.down();

	        if (up) teams.appendChild(up);
	        if (down) teams.appendChild(down);

	        app.settings.playersDisplayElement = elem;
	        if(teamSelect) app.settings.teamsDisplayElement = teamElements;

	        if(exists){
	            element.replaceChild(teams, exists);
	        }else{
	            element.appendChild(teams);
	        }
	        return teams;
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
	            document.body.insertBefore(damageDisp, app.domInsertLocation);
	        }
	    },

		modeMenu: function () { 

	        // height of each mode element
	        var height = app.settings.selectedModeHeight;

	        // menu layout
	        var menu = app.settings.selectModeMenu;

	        // (war room, campaign) eventually integrate ai opponents?
	        var setupScreen = document.createElement('article');
	        setupScreen.setAttribute('id','setupScreen');
	        app.touch(setupScreen).swipeScreen();

	        // create title to display on page
	        var title = document.createElement('h1');
	        title.setAttribute('id', 'title');
	        title.innerHTML = 'Select*Mode';
	        setupScreen.appendChild(title);

	        // create list of selectable modes
	        var selectMenu = document.createElement('ul');
	        selectMenu.setAttribute('id', 'selectModeMenu');

	        // create footer for game info and chat
	        var footer = document.createElement('footer');
	        var info = document.createElement('p');
	        var footSpan = document.createElement('span');
	        footSpan.setAttribute('id','footerText');
	        info.appendChild(footSpan);
	        info.setAttribute('id', 'scrollingInfo');
	        footer.setAttribute('id','footer');
	        footer.appendChild(info);

	        // create and insert information for each mode
	        for( var m = 0; m < menu.length; m += 1){

	            var mi = menu[m];
	            var color = app.hsl(app.settings.colors[mi.id]);

	            // block is the background bar
	            var block = document.createElement('div');
	            block.setAttribute('class', 'block');
	            block.style.backgroundColor = color;

	            var background = document.createElement('div');
	            background.setAttribute('class', 'modeBackground');

	            // span is to make a background around the text
	            var span = document.createElement('span');
	            span.setAttribute('class', 'textBackground');
	            span.innerHTML = mi.display;

	            // set displayed text for mode selection
	            var text = document.createElement('h1');
	            text.setAttribute('class', 'text');
	            text.style.borderColor = color;
	            text.appendChild(span);

	            app.touch(text).changeMode().doubleTap();
	            app.touch(background).changeMode().doubleTap();

	            // create li item for each mode
	            var item = document.createElement('li');
	            item.setAttribute('class','modeItem');
	            item.setAttribute('modeItemIndex', m + 1);
	            item.setAttribute('id', mi.id);
	            item.style.height = height;
	            item.style.color = color;
	            item.appendChild(background);
	            item.appendChild(block);
	            item.appendChild(text);

	            // if there are further options for the mode
	            if(mi.options){

	                // create list of options
	                var options = document.createElement('ul');
	                var length = mi.options.length;
	                options.setAttribute('class', 'modeOptions');

	                // default to not showing options (hide them when not selected)
	                options.style.opacity = 0;

	                for(var o = 0; o < length; o += 1){

	                    // create li item for each option
	                    var option = document.createElement('li');
	                    option.setAttribute('class', 'modeOption');
	                    option.setAttribute('modeOptionIndex', o + 1);
	                    option.setAttribute('id', mi.options[o] + mi.id);
	                    app.touch(option).modeOptions().doubleTap();

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
	        setupScreen.appendChild(selectMenu);
	        setupScreen.appendChild(footer);

	        // insert select mode screen into dom
	        var ss = document.getElementById('setupScreen');
	        if(ss) {
	            ss.parentNode.replaceChild(setupScreen, ss);
	        }else{
	            document.body.insertBefore(setupScreen, app.domInsertLocation);
	        }
	    },

		inputForm: function (name, element, placeHolder) {

	        var input = document.createElement('p');
	        input.setAttribute('class', 'inputForm');
	        input.setAttribute('id', name + 'Form');
	        var text = inputField(name);

	        if (placeHolder) text.setAttribute('placeholder', placeHolder);

	        text.style.width = element.offsetWidth;
	        input.appendChild(text);

	        return input;
	    },

	    login: function () {

	        // create login screen
	        var loginScreen = document.createElement('article');
	        loginScreen.setAttribute('id', 'login');

	        // login form
	        loginForm = document.createElement('section');
	        loginForm.setAttribute('id', 'loginForm');
	        var form = this.inputForm('loginText', loginForm,'Guest name input.');
	        loginForm.appendChild(form);

	        // create button for fb login
	        var fbButton = document.createElement('button');
	        fbButton.setAttribute('scope', 'public_profile, email');
	        fbButton.setAttribute('onClick', 'app.menu.login();');
	        fbButton.setAttribute('onLogin', 'app.display.checkLoginState();');
	        fbButton.setAttribute('id', 'fbButton');

	        // create a holder for the login status
	        var fbStatus = document.createElement('div');
	        fbStatus.setAttribute('id', 'status');

	        loginForm.appendChild(fbButton);

	        loginScreen.appendChild(loginForm);
	        loginScreen.appendChild(fbStatus);

	        return loginScreen;
	    }
	};
}();
},{"../game/game.js":18,"../menu/menu.js":22,"../settings/app.js":46,"../tools/dom.js":53,"../tools/touch.js":61}],41:[function(require,module,exports){
module.exports = function() {

	var position, action, target, setElement, damage, active, newTarget = true, index = 0, 
	key = app.key, keys = ['left', 'right', 'up', 'down'], cursors = {attack:'target', drop:'pointer'};
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

			if(key.pressed(key.esc()) && key.undo(key.esc())) {
				newTarget = true;
	        	active = false;
	        	action = false;				
	        	app.display.actions(element.actions());
				return refresh();
			}

	        var i, k, pressed, length = element.targets().length;

	        // move to  and from targets units
	        if (length > 1)
	        	for (i = 0; i < length; i += 1)
	            	if ((k = keys[i]) && key.pressed(k) && key.undo(k) && (pressed = true)) 
	               		index += k === 'left' || k === 'down' ? -1 : 1;

	        if (pressed || newTarget) {

	        	newTarget = false;
	        	index = index < 0 ? length - 1 : index = index >= length ? 0 : index;
	            target = element.targets(index);
		        var pos = target.position();

	            if(action === 'attack'){

		            damage = element.target(index);

		            // calcualte damage percentage for each targets unit
		            app.screens.damage(Math.round(damage));
	        	}

	            // create target for rendering at specified coordinates
	            position = {x:pos.x, y:pos.y};
	            refresh();
	        }

	        // if the target has been selected return it
	        if (key.pressed(key.enter()) && key.undo(key.enter())){
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
},{}],42:[function(require,module,exports){
app = require('../settings/app.js');
app.properties = require('../definitions/properties.js');
Position = require('../objects/position.js');
Validator = require('../tools/validator.js');

Terrain = function (type, position) {

	var error, properties = new app.properties(),
    validate = new Validator('terrain'), property = properties[type];
    
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

},{"../definitions/properties.js":9,"../objects/position.js":37,"../settings/app.js":46,"../tools/validator.js":63}],43:[function(require,module,exports){
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

},{"../objects/map.js":33,"../objects/mapElement.js":34}],44:[function(require,module,exports){
app = require('../settings/app.js');
app.settings = require('../settings/game.js');
app.undo = require('../tools/undo.js');
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
        ammo: properties.ammo,
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

    reachable = distance !== undefined ? range : app.path.reachable(this, true);

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
    app.undo.display('actionHud');
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

        } else player.defeat(building.player(), player);

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
        app.undo.display('damageDisplay');
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

    if (this.loaded())
        actions.drop = this._current.loaded;

    // if there are any actions that can be taken then return them
    return actions;
};

Unit.prototype.refresh = function () {app.animate('unit');};

Unit.prototype.evaluate = function (position) {

    if(app.cursor.hidden() && !app.target.active()){
        
        var unload, action;

        if(app.key.pressed(app.key.esc())){
            this.moveBack();
            this.escape();
            this.deselect();

        } else if ((actions = this.actions(position))
        && (type = app.display.select('actionSelectionIndex', 'actions', app.effect.highlightListItem, 'ul'))){

            if ((unload = (action = type.action) === 'drop') || action === 'attack') {
                if (unload) this.unloading = type.id;
                else this._current.targets = actions.attack;
                app.target.activate(action);
            } else {
                this[action](actions[action]);
                app.cursor.show()
            }
            this.escape();
        }
    }
};

Unit.prototype.moveBack = function () { if (this.mov) this.move(this.previous(), -this.mov); };
Unit.prototype.execute = function (p) {

    // and remove the range and path highlights
    this.move(new Position(p.x, p.y), this.moved(p));
    app.undo.effect('highlight').effect('path');

    // if there are actions that can be taken then display the necessary options
    if (!app.display.actions(this.actions(p)))
        app.undo.all();
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
    app.undo.all();
    app.hud.show();
    app.cursor.show();
    app.coStatus.show();
    app.target.deactivate();
    app.hud.setElements(app.cursor.hovered());
};

Unit.prototype.escape = function () {
    app.key.undo();
    app.undo.hudHilight();
    app.undo.display('actionHud');
};

Unit.prototype.occupies = function () {
    var square = app.map.occupantsOf(this.position());
    return square.building !== undefined ? square.building : square.terrain;
};

module.exports = Unit;
},{"../controller/map.js":3,"../controller/players.js":5,"../game/animate.js":13,"../game/effects.js":17,"../game/game.js":18,"../objects/building.js":28,"../objects/position.js":37,"../objects/user.js":45,"../settings/app.js":46,"../settings/game.js":48,"../tools/undo.js":62,"../tools/validator.js":63}],45:[function(require,module,exports){
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
},{"../definitions/score.js":10}],46:[function(require,module,exports){
/* ---------------------------------------------------------------------------------------------------------*\
    
    app is a container and holds variables for all elements of the application 

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

    // target element to insert before
    domInsertLocation: document.getElementById('before'),

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
},{"../settings/app.js":46}],47:[function(require,module,exports){
module.exports = {
	
    // amount of income per building per turn, 1000 - 9500 incrimenting by 500, default is 1000
    funds: 1000,

    // toggle fog
    fog:'off',

    // toggle weather setting
    weather:'random',

    // end of game on number of turns completed 1 - 99, 0 is off
    turn:'off',

    // end game on cartain number of buildings captured 1 - 52,  0 is off
    capt:'off',

    //  toggle co powers active.. default on
    power: 'on',

    // toggle attack animations.. default off
    visuals: 'off',
};
},{}],48:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\
    
    settings consolidates all the customizable options and rules for the game into
    an object for easy and dynamic manipulation
    
\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');

app.settings = {
    // messages to display in the bottom scroll bar as items are hovered over and people join games, etc..
    scrollMessages:{
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
    },

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
            id:'logout',
            display:'Logout',
            type:'exit',
        },{
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
    }],

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

    buildingDisplayElement: {
        city:{
            numberOf:0,
            type:'city'
        },
        base:{
            numberOf:0,
            type:'base'
        },
        airport:{
            numberOf:0,
            type:'airport'
        },
        seaport:{
            numberOf:0,
            type:'seaport'
        },
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

    // displayable attributes for the building count element on map/game selection
    buildingDisplay:['numberOf', 'canvas'],

    // which attributes of objects ( unit, buildings etc ) will be displayed in hud
    hoverInfo: ['ammo', 'showHealth', 'health', 'name', 'fuel', 'defense', 'canvas'],

    // which actions can be displayed
    actionsDisplay: ['attack', 'capture', 'wait', 'load', 'drop', 'join', 'name'],

    // unit info attributes for display
    unitInfoDisplay: ['movement', 'vision', 'fuel', 'weapon1', 'weapon2', 'property', 'value'],

    // which attributes of units will be displayed on unit selection/purchase/building hud
    unitSelectionDisplay: ['name', 'cost'],

    // options attributes for displ
    optionsDisplay: ['options', 'unit', 'intel', 'save', 'end', 'name'],

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
},{"../settings/app.js":46}],49:[function(require,module,exports){
/* ------------------------------------------------------------------------------------------------------*\
    
    takes a string as an optional argument, this string is used as the name of a property 
    in a potential object to be accessed while assessing its value in relation to the 
    other heap elements

\* ------------------------------------------------------------------------------------------------------*/

Heap = function (property) { 
    // create the heap
    this.heap = []; 
    this.property = property;

};

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

    // if we are at the start of the array or the current nodes value is greater then its parent then return the current 
    // index (compensate for 0), otherwise swap the parent and child then repeat from the childs new position
Heap.prototype.bubble = function (index) {return index < 2 || this.lt(this.parent(index), index) ? index - 1 : this.bubble(this.swap(index, this.parent(index)));};

Heap.prototype.sort = function (index) {

    var l = this.left(index), r = this.right(index), length = this.heap.length;

    // if there are no more childnodes, swap the value at the current index with the value at
    // end of the array, sort the value at the current index then remove and return the 
    // last array element (the minimum element)
    if (length <= l) {
        this.swap(index, length); 
        this.bubble(index); 
        return this.heap.pop(); 
    }

    // if the right node is in range and less then the left node then swap 
    // the child with the right node, otherwise swap with the left
    return this.sort(this.swap(index, length > r && this.lt(r,l) ? r : l ));
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
},{}],50:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\

    handle user to user chat

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.user = require('../objects/user.js');

module.exports = {
    // add message for display, input is message object containing a user name and id, or just a message
    display: function (mo) {

        // construct message with user name or if there is no user name just use the message
        var message = mo.user ? mo.user + ': ' + mo.message : mo.message;

        // element that message is being appended to
        var chat = document.getElementById('chat');

        // if the message is a string then append it to the chat element
        if(chat && typeof (message) === 'string') {
            var chatMessage = document.createElement('li'); // create a list element to contain the message
            chatMessage.setAttribute('class', 'message'); // set attribute for styling
            chatMessage.innerHTML = message; // set text to message
            chat.appendChild(chatMessage); // append the li element to the chat element
            return message; // return the appended message
        }
        return false;
    },

    // send message, input is an object/element containing textual user input accessed by ".value"
    message: function (element) {

        var player = app.user.player();
        var text = element.value; // user text input
        var name = player.name(); // get user name of user sending message

        if (name && text){ // make sure there is user input and a user name
            var message = { message:text, user:name }; // create message object containing user name and input text
            socket.emit('gameReadyChat', message); // transmit message to chat room
            element.value = ''; // reset the input box to empty for future input
            return message; // return the input message
        }
        return false;
    }
};
},{"../objects/user.js":45,"../settings/app.js":46}],51:[function(require,module,exports){
Counter = function (limit) {
	this.limit = limit;
	this.frames = 0;
}

Counter.prototype.incriment = function () { this.frames += 1; };
Counter.prototype.reached = function (limit) { return this.frames > (limit ? limit : this.limit); };
Counter.prototype.reset = function () { if (this.reached()) this.frames = 0; };

module.exports = Counter;
},{}],52:[function(require,module,exports){
/* ------------------------------------------------------------------------------------------------------*\
   
   handles all the display screens and the users interaction with them
   
\* ------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
var scrollText = require('../tools/scrollText.js');
socket = require('../tools/sockets.js');
app.game = require('../game/game.js');
app.options = require('../menu/options.js');
app.settings = require('../settings/game.js');
app.animate = require('../game/animate.js');
app.effect = require('../game/effects.js');
app.scroll = require('../menu/scroll.js');
app.buildings = require('../definitions/buildings.js');
app.modes = require('../menu/modes.js');
app.dom = require('../tools/dom.js');
app.undo = require('../tools/undo.js');
app.calculate = require('../game/calculate.js');
app.draw = require('../game/draw.js');
app.co = require('../objects/co.js');
app.menu = require('../menu/menu.js');
app.screens = require('../objects/screens.js');
app.key = require('../tools/keyboard.js');
app.players = require('../controller/players.js');
app.cursor = require('../controller/cursor.js');


module.exports = function () {

    var sideX, sideY, selectionIndex = 1, previousList, touched, previousListLength, 
    selectedElement, hide, len, prevX, prevSelection, prev = {}, temp = {}, selectable = true, 
    prevIndex = undefined, unitSelectionActive = false, loop = false, 
    modeOptionIndex = false, modeChildElement, parentIndex, prevElement, selectedElementId;

    var catElements = {
        section: 'categorySelectScreen',
        div:'selectCategoryScreen'
    };

    var buildingElements = {
        section:'buildingsDisplay',
        div:'numberOfBuildings'
    };

    var chatOrDesc = {
        section:'descriptionOrChatScreen',
        div:'descriptionOrChat',
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

        for (var n = 0; n < propName.length; n += 1)
            if (allowed.hasValue(propName[n]))
                properties[propName[n]] = {
                    property: propName[n].uc_first(),
                    value: props[propName[n]]
                };

        displayInfo(properties, allowed, elements, false, true);
    };

    var selectionInterface = function (building) {

        // get the selectable unit types for the selected building
        unitSelectionActive = true;
        var units = app.buildings[building];

        var elements = {
            section: 'buildUnitScreen',
            div: 'selectUnitScreen'
        };

        displayInfo(units, app.settings.unitSelectionDisplay, elements, 'unitSelectionIndex', true);
    };

    var displayInfo = function (properties, allowedProperties, elements, tag, insert) {
        
        var inner = elements.div;

        // build the outside screen container or use the existing element
        var display = document.createElement('section');
        display.setAttribute('id', elements.section);

        // build inner select screen or use existing one
        var exists = document.getElementById(elements.div);
        var innerScreen = document.createElement('div');
        innerScreen.setAttribute('id', inner);

        // get each unit type for looping over
        var keys = Object.keys(properties);
        var len = keys.length;

        for (var u = 0; u < len; u += 1) {

            var key = keys[u];
            var props = properties[key];

            // create list for each unit with its cost
            var list = app.dom.createList(props, key, allowedProperties, tag);

            if(props.id || props.id === 0) list.ul.setAttribute('id', props.id);

            if (tag) list.ul.setAttribute(tag, u + 1);

            if(inner) list.ul.setAttribute('class', inner + 'Item');  

            if(tag === 'mapSelectionIndex' || tag === 'gameSelectionIndex') {
                app.touch(list.ul.childNodes[0]).mapOrGame().doubleTap();
            };

            // add list to the select screen
            innerScreen.appendChild(list.ul);
        }

        // add select screen to build screen container
        display.appendChild(innerScreen);

        if(insert){
            if (exists) {
                exists.parentNode.replaceChild(innerScreen, exists);
            } else {
                // insert build screen into dom
                document.body.insertBefore(display, app.domInsertLocation);
            }
        }
        return display;
    };

    var select = function (tag, id, display, elementType, max, infiniteScroll) {

        var index, horizon, modeOptionsActive = app.modes.active();
        var limit = infiniteScroll && !modeOptionsActive ? 'infinite' : 'finite';

        // if the index is not the same as it was prior, then highlight the new index ( new element )
        if (!prevIndex || prevIndex !== selectionIndex || app.key.pressed(app.key.left()) || app.key.pressed(app.key.right()) || loop) {

            // if there is a sub menu activated then select from the sub menu element instead of its parent
            if(modeChildElement){

                var hudElement = modeChildElement.element;

                // keep track of selected parent element
                parentIndex = parentIndex || selectionIndex;

                if(!modeOptionsActive || loop) selectionIndex = modeChildElement.index;

                tag = modeChildElement.tag;

            }else if(!modeOptionsActive){
                
                if(loop){
                    selectionIndex = parentIndex;
                    prevIndex = parentIndex;
                    loop = false;
                    parentIndex = undefined;
                }
                var hudElement = document.getElementById(id);
            }

            // get the children
            var elements = app.dom.getImmediateChildrenByTagName(hudElement, elementType);

            len = elements.length;

            // if there is no max set then set max to the length of he array
            if (!max) max = len;

            // hide elements to create scrolling effect
            if (selectionIndex > max) {
                hide = selectionIndex - max;

                for (var h = 1; h <= hide; h += 1) {

                    // find each element that needs to be hidden and hide it
                    var hideElement = app.dom.findElementByTag(tag, elements, h);
                    hideElement.style.display = 'none';
                }
            } else if (selectionIndex <= len - max && hide) {
                // show hidden elements as they are hovered over
                var showElement = app.dom.findElementByTag(tag, elements, selectionIndex);
                showElement.style.display = '';
            }

            selectedElement = app.dom.findElementByTag(tag, elements, selectionIndex);

            // scroll information about the selected element in the footer
            if(selectedElement) scrollText( 
                'footerText',
                app.settings.scrollMessages[selectedElement.getAttribute('id')]
            );

            // callback that defines how to display the selected element ( functions located in app.effect )
            if (selectedElement || loop)
                selectable = display( selectedElement, tag, selectionIndex, prevElement, elements); 
            
            // store the last index for future comparison
            prevIndex = selectionIndex;
            prevElement = selectedElement;
        }

        // if the select key has been pressed and an element is available for selection then return its id
        if (app.key.pressed(app.key.enter()) && selectedElement && selectable) {
            selectionIndex = 1
            app.modes.deactivate();
            parentIndex = undefined;
            modeChildElement = undefined;
            prevIndex = undefined;
            hide = undefined;
            app.key.undo(app.key.enter());
            return {
                action: selectedElement.childNodes[0].innerHTML,
                id : selectedElement.getAttribute('id')
            };
        }else{
            index = app.scroll.verticle()[limit](selectionIndex, 1, len);
            if(index) selectionIndex = index;
        }
        return false;
    };

    var complexSelect = function (elements, callback, player) {

        /*
            complexSelect is for complex selection of items displayed in the dom, it keeps track of 
            which element is currently being scrolled through, the list item that is currently selected
            and the last selected list item for each element if it is nolonger being scrolled through.
            it also broadcasts the descriptions of each selected element, or scrolled through list 
            items to any element of the name specified in the "text" attribute of the "elements" object
            the first argument "elements" is an object which contains the names of the elements being 
            selected in their various positions within the dom. they are as follows:
                    
            type: defines what page will be loaded
            element: name of the element that is parent to the list
            
            index: name of the index, comes after the property name i.e. (property + index)
            attribute: name of the tag being retrieved as a value from the selected element,
             
            text: name of the element that holds the chat and description etc, displayed text,
            properties: the object that defines all that will be scrolled through
            the second is a callback to handle what to do while scrolling and what elements to effect
            the third is an optional parameter that allows you to assign a display type to the currently 
            selected list item that is unhidden for display 
            (all list items are hidden by default and displayed as selected)
            it returns an object containing the current;y selected property and its value
        */

        var properties = elements.properties;

        // create list of property names accessable to the player (object keys)
        // needed for restricting selection options (only player 2 can edit player 2's settings etc..)
        if((app.key.pressed() || !temp.list) && player && !app.players.empty()){
            var co = app.menu.coSelection(properties, previousList, prevSelection);
            temp.list = co.list;
            var ind = co.ind;
        }else if(!temp.list){
            list = Object.keys(properties);
        }

        var list = temp.list ? temp.list : list, 
        listLength = list.length;

        // keep track of what is selected in the list for recall
        if(previousListLength !== listLength && prevSelection && player) 
            prevSelection = list.indexOf(ind);

        // get the index of an element if it has been touched
        touched = list.indexOf(touched);
        
        // get the currently selected index, start with 0 if one has not yet been defined
        var index = touched > -1 ? touched : app.scroll.horizontal().infinite(prevSelection || 0, 0, list.length - 1);

        // get the property name of the currently selected index for use in retrieving elements of the same name
        var property = list[index];

        // get the element that displays the text: descriptions, chat etc...
        if(!temp.text) temp.text = document.getElementById(elements.text);

        // if there arent any previous indexes (we have just started) or the last index is not
        // the same as the current index then manipulate the newly selected element
        if(prevSelection === undefined || prevSelection !== index || previousListLength !== listLength){
            
            previousList = list;
            previousListLength = listLength;

            // if the description for the current element is text then print it
            if (property !== undefined && typeof (properties[property].description) === 'string' ){
                app.effect.typeLetters(temp.text, properties[property].description);
            }
            
            // indicate that we have changed elements
            var change = true;

            // callback that handles what to do with horizontally scrolled elements
            var selected = callback(property);

            // get all the list items from the currently selected element
            temp.items = app.dom.getImmediateChildrenByTagName(selected, 'li');

            // save the currently selected index as a comparison to possibly changed indexes in the future
            prevSelection = index;

            // if we have visited this element before, get the last selected index for it and display that
            // rather then the currently selected list item index
            if (prev[property]) var itemIndex = prev[property].getAttribute(property + elements.index);
        }

        // if there wasnt a previously selected item index for the current element 
        if(!itemIndex){
            
            // get the length of the array of list items in the currently selected element
            var len = temp.items.length;

            // then find the position of scroll that we are currently at for the newly selected element
            // use the length as a boundry marker in the scroll function
            var itemIndex = app.scroll.verticle().infinite(prev.itemIndex || 1, 1, len);
        }

        // if there has been a change, or if the previous item index is not the same as the current
        if(change || itemIndex && prev.itemIndex !== itemIndex){

            // if there has been a change but there is no previously selected list item for the
            // currently selected element
            if(change && !prev[property]){

                // get the element listed as the default value for selection
                var element = app.dom.findElementByTag('default', temp.items, true);

            }else{

                // get the element at the currently selected list items index
                var element = app.dom.findElementByTag(property + elements.index, temp.items, itemIndex);
            }

            // hide the previously selected list item for the currently selected element
            if(prev[property] && !change) prev[property].style.display = 'none';

            // display the currently selected list item
            element.style.display = elements.display ? elements.display : '';

            // save the currently selected list item for use as the last selected item
            // in the currently selected element in case we need to move back to it
            prev[property] = element;

            // save the currently selected index as a comparison to possibly changed indexes in the future
            prev.itemIndex = Number(itemIndex);

            // get the value of the selected attribute
            var value = element.getAttribute(elements.attribute);

            // if the description from properties is an object then use the current value as a key 
            // for that object in order to display a description for each list item, rather then its 
            // parent element as a whole

            if ( typeof (properties[property].description) === 'object' ){
                app.effect.typeLetters(temp.text, properties[property].description[value]);
            }

            // return the selected property and its value
            return {
                property:property, 
                value:value
            };
        }
        touched = undefined;
        return property;
    };

    var elementExists = function (id, element, parent){
        var exists = document.getElementById(id);
        if(exists){
            parent.replaceChild(element, exists);
        }else{
            parent.appendChild(element);
        }
    };

    var selectedMap = function (maps){

        // get setup screen
        var selector = document.getElementById('setupScreen');

        if(maps && maps.buildings){
            var map = maps;
        }else{
            var id = selectedElementId;
            var len = maps ? maps.length : 0;

            // get map
            for(var i = 0; i < len; i += 1){
                if(maps && maps[i].id == id){
                    var map = maps[i];
                    break;
                }
            }
        }

        if(map){
            // display number of buildings on the map
            var num = app.calculate.numberOfBuildings(map);
            var buildings = displayInfo(num, app.settings.buildingDisplay, buildingElements, 'buildings');

            elementExists(buildingElements.section, buildings, selector);

            /*var dimensions = {width:500, height:500};
            //display small version of map
            var canvas = createCanvas('Map', 'preview', dimensions);
            canvas.canvas.style.backgroundColor = 'white';
            var cid = canvas.canvas.getAttribute('id');
            // check if elements exist and replace them if they do, append them if they dont
            elementExists(cid, canvas.canvas);
            // draw map preview
            app.draw(canvas.context).mapPreview();*/
        }
        // return screen
        return selector;
    };

    // create page for selecting map or game to join/create
    var mapOrGameDisplay = function (elements, items) {

        // get the screen
        var selector = document.getElementById('setupScreen');

        // get the title and change it to select whatever type we are selecting
        title = selector.children[0];
        title.innerHTML = 'Select*'+ elements.type;

        // create elements
        var item = displayInfo(items, ['name'], elements, 'mapSelectionIndex');

        // display buildings and how many are on each map
        var buildings = displayInfo(app.settings.buildingDisplayElement, app.settings.buildingDisplay, buildingElements, 'building');

        // display catagories 2p, 3p, 4p, etc...
        var categories = displayInfo(app.settings.categories, '*', catElements, 'categorySelectionIndex');
        var cats = categories.children[0].children;

        // handle touch events for swiping through categories
        app.touch(categories).swipe();

        // hide categories for displaying only one at a time
        var len = cats.length;
        for(var c = 0; c < len; c += 1){
            cats[c].style.display = 'none';
        }

        // add elements to the screen
        selector.appendChild(buildings);
        selector.appendChild(item);
        selector.appendChild(categories);

        //return the modified screen element
        return selector;
    };

    return {
        info: displayInfo,
        selectionInterface: selectionInterface,
        select: select,
        mapInfo: selectedMap,
        complexSelect:complexSelect,
        setup: function (elements, element, back) {

            var chatOrDescription = displayInfo([], [], chatOrDesc, false, true);
            var textField = chatOrDescription.children[0];

            var chat = document.createElement('ul');
            var description = document.createElement('h1');

            chat.setAttribute('id','chat');
            description.setAttribute('id','descriptions');

            textField.appendChild(chat);
            textField.appendChild(description);

            // get the title and change it to select whatever type we are selecting
            title = element.children[0];
            title.innerHTML = elements.type;

            element.appendChild(chatOrDescription);

            var display = app.screens[elements.type](element, textField, back);

            return display;
        },
        clear: function () {temp = {}; prev = {};},
        clearOld: function () {
            prevSelection = undefined; 
            previousList = undefined; 
        },
        previous: function () {
            return {
                selection: prevSelection,
                list: previousList
            }
        },
        reset: function () {selectionIndex = 1},
        setIndex: function (index) {
            selectionIndex = index;
            touched = index;
        },
        setOptionIndex: function (index){modeOptionIndex = index;},
        index: function () {return selectionIndex},
        previousIndex: function () {return prevIndex;},
        setPreviousIndex: function (index) {prevIndex = index;},
        resetPreviousIndex: function () {prevIndex = undefined;},
        loop: function () {loop=true},
        through: function (){loop=false},
        menuItemOptions: function ( menu ) {

            var previous = prev.horizon;
            var horizon = app.scroll.horizontal().finite(previous || 1, 1, 2);

            if(menu) menu.style.opacity = 1;

            // display the menu options
            if(horizon && previous !== horizon){

                var modeOptionsActive = app.modes.active();
                index = modeOptionIndex ? modeOptionIndex : 1;

                if(horizon === 1 && modeOptionsActive){
                    app.modes.deactivate();
                    modeChildElement = undefined;
                }else if(horizon === 2 && !modeOptionsActive){

                    app.modes.activate();
                    modeChildElement = {
                        element:menu,
                        tag:'modeOptionIndex',
                        index:index
                    }
                }
                app.effect.clear();
                prev.horizon = horizon;
                modeOptionIndex = false;
                loop = true;
            }
        },
        mapOrGame:function(type, items) { return mapOrGameDisplay(type, items); },
        mapOrGameSelection: function (id, elements) {
            var replace = document.getElementById(id);
            replace.parentNode.replaceChild(elements, replace);
        },  
        checkLoginState: function () {
            FB.getLoginStatus(function(response) {
                statusChangeCallback(response);
            });
        },

        actions: function (options) {

            if (!options) return false;

            var actions = Object.keys(options);
            var action, array;
            var actionsObj = {};

            for (var i, a = 0; a < actions.length; a += 1)
                if (typeof((array = options[(action = actions[a])])) === 'array')
                    for (i = 0; i < array.length; i += 1)
                        actionsObj[i] = { name: action };
                else actionsObj[action] = { name: action };
            
            app.coStatus.hide();

            unitSelectionActive = true;

            return displayInfo(
                actionsObj, 
                app.settings.actionsDisplay, 
                {
                    section: 'actionHud',
                    div: 'actions'
                }, 
                'actionSelectionIndex', 
                true
            );
        },

        gameNameInput:function(){

            var nameInput = document.getElementById('nameForm');
            var description = document.getElementById('descriptions');
            var upArrow = document.getElementById('upArrowOutline');
            var downArrow = document.getElementById('downArrowOutline');
            var name = document.getElementById('nameInput');

            description.style.paddingTop = '2%';
            description.style.paddingBottom = '1.5%';
            description.parentNode.style.overflow = 'hidden';

            nameInput.style.display = 'block';
            nameInput.style.height = '30%';

            name.focus();

            upArrow.style.display = 'none';
            downArrow.style.display = 'none';

            return {
                input: nameInput,
                description: description,
                upArrow:upArrow,
                downArrow:downArrow,
                name:name
            };
        }
    };
}();
},{"../controller/cursor.js":2,"../controller/players.js":5,"../definitions/buildings.js":7,"../game/animate.js":13,"../game/calculate.js":15,"../game/draw.js":16,"../game/effects.js":17,"../game/game.js":18,"../menu/menu.js":22,"../menu/modes.js":23,"../menu/options.js":24,"../menu/scroll.js":25,"../objects/co.js":29,"../objects/screens.js":40,"../settings/app.js":46,"../settings/game.js":48,"../tools/dom.js":53,"../tools/keyboard.js":56,"../tools/scrollText.js":59,"../tools/sockets.js":60,"../tools/undo.js":62}],53:[function(require,module,exports){
/* ------------------------------------------------------------------------------------------------------*\
    
    list of functions used to assist manipulating the dom

\* ------------------------------------------------------------------------------------------------------*/

module.exports = {

    // create a canvas to display the hovered map element in the hud
    createCanvas: function (id, object, dimensions) {

        var type = typeof object.type === 'function' ? object.type() : object.type;
        var clas = typeof object.class === 'function' ? object.class() : object.class;
        var canvas = document.createElement('canvas'); // create canvas
        var context = canvas.getContext(app.ctx); // get context

        // set width, height and id attributes
        canvas.setAttribute('width', dimensions.width);
        canvas.setAttribute('height', dimensions.height);
        canvas.setAttribute('id', type || on + id + 'Canvas');

        // return canvas info for further use
        return {
            canvas: canvas,
            context: context,
            type: type,
            class: clas
        };
    },

    createList: function (object, id, displayedAttributes, canvasId) {
        
        if (canvasId && displayedAttributes !== '*' && displayedAttributes.hasValue('canvas')) {
            // create canvas and add it to the object
            var canvas = this.createCanvas(canvasId, object, {width:128, height:128});
            object.canvas = canvas.canvas;
        }

        // get a list of property names
        var properties = Object.keys(object);

        // create an unordered list and give it the specified id
        var ul = document.createElement('ul');
        ul.setAttribute("id", id);
        if (object.id) ul.setAttribute('itemNumber', object.id);

        var ind = 0;

        // go through each property and create a list element for it, then add it to the ul;
        for (var i = 0; i < properties.length; i += 1) {

            // properties
            var props = properties[i];

            // only use properties specified in the displayed attributes array
            if (displayedAttributes === '*' || displayedAttributes.hasValue(props) || displayedAttributes.hasValue('num') && !isNaN(props)) {

                ind += 1;

                var property = typeof object[props] === 'function' ? object[props]() : object[props];
       
                if(property === undefined)
                    continue;

                // create list element and give it a class defining its value
                var li = document.createElement('li');
                li.setAttribute('class', props);
                if (object.index) li.setAttribute( id + 'Index', ind);
                if(object.hide) li.style.display = 'none';
                
                // if the list element is a canvas then append it to the list element
                if (props === 'canvas') li.appendChild(property);

                    // if the list is an object, then create another list with that object and append it to the li element
                else if( typeof (property) === 'object') {
                    var list = app.dom.createList(property, props, displayedAttributes);
                    li.appendChild(list.ul);

                    // if the list element is text, add it to the innerHTML of the li element
                } else li.innerHTML = property;

                // append the li to the ul
                ul.appendChild(li);
            }
        }
        
        // return the ul and canvas info
        return {
            ul: ul,
            canvas: canvas
        };
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
        if(keeper) element.appendChild(keeper);
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
    }
};
},{}],54:[function(require,module,exports){
module.exports = function () { var id = 0; return { id: function () {id += 1; return id;}};}();
},{}],55:[function(require,module,exports){
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
},{"../game/draw.js":16,"../settings/app.js":46}],56:[function(require,module,exports){
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

    window.addEventListener("keydown", function (e) {
        if(!app.game.started() || app.user.turn() || e.keyCode === app.key.esc() || app.options.active())
            pressed.push(e.keyCode);
    }, false);

    window.addEventListener("keyup", function (e) { 
        up.push(e.keyCode);
        undo(pressed);
    }, false);

    return {
        press: function (k) { return this.pressed(k) ? true : pressed.push(key(k));},
        pressed: function (k) { return k ? pressed.indexOf(key(k)) > -1 : pressed.length; },
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
},{}],57:[function(require,module,exports){
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
	if(this.get(element).type() !== 'building'){
		if (element.type() === 'unit') {
			if(this.get(element) === element)
				this.insert(element.occupies());
		} else this.insert(new Terrain('plain', element.position()));
	}
	return element;
};

Matrix.prototype.position = function (p, init) {
	var e, d = this.dimensions;
	if (p.x <= d.x && p.x >= 0 && p.y <= d.y && p.y >= 0){
		if(!this.matrix[p.x][p.y] && !init){
			this.dummies.push(p);
			this.matrix[p.x][p.y] = new Terrain('plain', p);
		}
		return this.matrix[p.x][p.y];
	}
	return false;
};

Matrix.prototype.clean = function () {
	for (var p, e, i = 0; i < this.dummies.length; i += 1){
		var p = this.dummies[i];
		if((e = this.matrix[p.x][p.y]) && e.type() !== 'unit')
			this.matrix[p.x][p.y] = undefined;
	}
	this.dummies = [];
};

Matrix.prototype.close = function (p) { this.matrix[p.x][p.y].closed = true; };
Matrix.prototype.get = function (element) { return this.position(element.position());};
Matrix.prototype.log = function () {
	console.log(' ');
	console.log('------- matrix --------');
	console.log(' ');
	for (var arr, x = 0; x < this.matrix.length; x += 1)
		for (var y = 0; y < this.matrix[x].length; y += 1)
			if(this.matrix[x][y])
				console.log(this.matrix[x][y]);
			//else console.log('nothing at {x:'+x+', y:'+y+'}');
	console.log('--------- end ---------');
	console.log(' ');
};

module.exports = Matrix;
},{"../objects/terrain.js":42}],58:[function(require,module,exports){
/* ---------------------------------------------------------------------------------------------------------*\
    
    handle AJAJ calls
    
\* ---------------------------------------------------------------------------------------------------------*/

module.exports = function () {

    var ajaj = function (input, action, callback, url) {

        if ( !url ) throw new Error('No address specified for back end services');

        try{
          // Opera 8.0+, Firefox, Chrome, Safari
          var request = new XMLHttpRequest();
       }catch (e){
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
            {
                if (callback){
                    return callback(JSON.parse(request.responseText));
                }else{
                    // Javascript function JSON.parse to parse JSON data
                    return JSON.parse(request.responseText);
                }
            }
        }

        try {
            var ts = new Date().getTime();
            request.open(action, url+'?ts='+ts, true);
            request.setRequestHeader("Content-type","application/json;charset=UTF-8");
            request.send(JSON.stringify(input));
        }catch (e){
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
},{}],59:[function(require,module,exports){
/* ------------------------------------------------------------------------------------------------------*\
   
   handles scrolling of text accross the screen, requires the id of the containing element, which must be 
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
},{}],60:[function(require,module,exports){
/* --------------------------------------------------------------------------------------*\

    handle socket connections

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.game = require('../game/game.js');
app.chat = require('../tools/chat.js');
app.modes = require('../menu/modes.js');
app.options = require('../menu/options.js');
app.key = require('../tools/keyboard.js');
app.maps = require('../controller/maps.js');
app.map = require('../controller/map.js');
app.players = require('../controller/players.js');
app.cursor = require('../controller/cursor.js');
app.background = require('../controller/background.js');
app.units = require('../definitions/units.js');

Validator = require('../tools/validator.js');
Player = require('../objects/player.js');
Unit = require('../objects/unit.js');

var validate = new Validator('sockets');
var socket = io.connect("http://127.0.0.1:8080") || io.connect("http://jswars-jswars.rhcloud.com:8000");

socket.on('setMap', function (map) {app.game.setMap(map)});
socket.on('start', function (game) {app.menu.start();});
//socket.on('player', function (player) { app.players.add(player); });
socket.on('userAdded', function (message) {app.chat.display(message);});
socket.on('gameReadyMessage', function (message) {app.chat.display(message);});
socket.on('propertyChange', function (properties) {app.players.changeProperty(properties);});
socket.on('readyStateChange', function (player) {
    app.players.get(new Player(player)).isReady(player.ready);
});

socket.on('addPlayer', function (player) {app.players.add(player);});
socket.on('addRoom',function (room) { app.maps.add(room); });
socket.on('removeRoom', function  (room) { app.maps.remove(room); });

socket.on('disc', function (user) {
    app.chat.display({message:'has been disconnected.', user:user.name.uc_first()});
    app.players.remove(user);
});

socket.on('userLeft', function (user) {
    app.chat.display({message: 'has left the game.', user: user.name.uc_first()});
    app.players.remove(user);
});

socket.on('userRemoved', function  (user) {
    app.chat.display({message:'has been removed from the game.', user:user.name.uc_first()});
    app.players.remove(user);
});

socket.on('userJoined', function (user) {
    app.players.add(user);
    if(!user.cp) app.chat.display({message:'has joined the game.', user:user.name.uc_first()});
});

socket.on('joinedGame', function (joined) {
    app.background.set(joined.background);
    app.game.load(joined);
});

socket.on('back', function () {
    app.modes.boot();
    app.menu.back();
});

socket.on('cursorMove', function (move) {
    app.key.press(move);
    app.cursor.move(true);
});

socket.on('background', function (type) { app.background.set(type); });

socket.on('endTurn', function (id) {    
    if(validate.turn({id: function  () {return id;}}))
        app.options.end();
});

socket.on('addUnit', function (unit) {
    var u = unit._current;
    var player = app.players.get({id:function () {return u.player._current.id;}});
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

socket.on('unload', function (transport) { 
    var unit = app.map.getUnit(transport);
    unit.drop(transport, transport.index); 
});

socket.on('updatePlayerStates', function (players) { app.players.add(players); });

module.exports = socket;
},{"../controller/background.js":1,"../controller/cursor.js":2,"../controller/map.js":3,"../controller/maps.js":4,"../controller/players.js":5,"../definitions/units.js":11,"../game/game.js":18,"../menu/modes.js":23,"../menu/options.js":24,"../objects/player.js":36,"../objects/unit.js":44,"../settings/app.js":46,"../tools/chat.js":50,"../tools/keyboard.js":56,"../tools/validator.js":63}],61:[function(require,module,exports){
app = require('../settings/app.js');
app.key = require('../tools/keyboard.js');
app.scroll = require('../menu/scroll.js');
app.user = require('../objects/user.js');
app.display = require('../tools/display.js');
app.modes = require('../menu/modes.js');

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
	        	app.display.setIndex(index);
	        });
			return this;
		},
		modeOptions: function (elem) {

			var e = input(elem);

			e.addEventListener('touchstart', function(){

	        	// get the index
	        	var index = e.attributes.modeOptionIndex.value;

	        	// if the mode options are already under selection, then change the index
	        	if(app.modes.active()){
					app.display.setIndex(index);

				// otherwise simulate selecting them with the key right push
				// and set the default index to the selected option
	        	}else{
	        		app.display.setOptionIndex(index);
		        	app.key.press(app.key.right());
	        	}
	        });
	        return this;
		},
		changeMode: function (elem) {
			input(elem).addEventListener('touchstart', function () {if(app.modes.active()) app.key.press(app.key.left());});
			return this;
		},
		doubleTap: function (elem) {
			input(elem).addEventListener('touchstart', function() {if(doubleTap()) return app.key.press(app.key.enter());});
			return this;
		},
		element: function (elem) {
			input(elem).addEventListener('touchstart', function (touch){
				var touched = touch.target;
				var name = touched.parentNode.id == 'settings' ? touched.id : touched.parentNode.id;
				var setting = name.replace('Settings','').replace('Container','');
				app.display.setIndex(setting);
			});
			return this;
		},
		esc: function (elem) {
			input(elem).addEventListener('touchstart', function() {if(app.user.player().ready()) return app.key.press(app.key.esc());});
			return this;
		},
	};
};
},{"../menu/modes.js":23,"../menu/scroll.js":25,"../objects/user.js":45,"../settings/app.js":46,"../tools/display.js":52,"../tools/keyboard.js":56}],62:[function(require,module,exports){
/* ---------------------------------------------------------------------------------------------------------*\
    
    handles the cleanup and disposal of elements that are no longer needed or need to be removed

\* ---------------------------------------------------------------------------------------------------------*/
app = require('../settings/app.js');
app.game = require('../game/game.js');
app.options = require('../menu/options.js');
app.settings = require('../settings/game.js');
app.animate = require('../game/animate.js');
app.effect = require('../game/effects.js');
app.display = require('../tools/display.js');
app.key = require('../tools/keyboard.js');
app.cursor = require('../controller/cursor.js');

module.exports = function () {

    // show undoes a hide of an element
    var show = function (hiddenElement) {

        // get hidden element
        var hidden = document.getElementById(hiddenElement);

        // show element
        if (hidden) hidden.style.display = '';
    };

    return {

        // undo the selection of map elements
        selectElement: function () {
            app.cursor.deselect();
        },

        hudHilight:function(){
            app.display.reset();
            if(app.display.index()) app.display.resetPreviousIndex();
            if (app.options.active()) {
                show('coStatusHud');
                app.options.deactivate();
            }
        },

        selectUnit:function(){
            if (app.cursor.selected() && app.cursor.selected().type() === 'unit') {
                app.cursor.deselect();
                app.animate('unit');
            }
        },

        actionsSelect: function (){
            this.display('actionHud');
            this.display('damageDisplay');
            app.animate('cursor');
        },

        effect: function (effect) {
            if (app.effect.undo[effect]) {
                app.effect.undo[effect]();
                app.animate('effects');
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
            for (var r = 0; r < removeArray.length; r += 1) {
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
            app.key.undo(app.key.enter());
            this.buildUnitScreen();
            this.effect('highlight').effect('path');
            app.cursor.show();
            return this;
        },

        tempAndPrev: function () {
            app.display.clear();
            app.cursor.clear();
            app.effect.clear();
            app.temp = {};
            app.prev = {};
        }
    };
}();
},{"../controller/cursor.js":2,"../game/animate.js":13,"../game/effects.js":17,"../game/game.js":18,"../menu/options.js":24,"../settings/app.js":46,"../settings/game.js":48,"../tools/display.js":52,"../tools/keyboard.js":56}],63:[function(require,module,exports){
// validates stuff
app = require('../settings/app.js');
app.players = require('../controller/players.js');
Building = require('../objects/building.js');

Validator = function (fileName) {
	this.fileName = fileName;
};

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

module.exports = Validator;
},{"../controller/players.js":5,"../objects/building.js":28,"../settings/app.js":46}]},{},[20]);
