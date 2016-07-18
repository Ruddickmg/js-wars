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

    var getIndex = function (element) {
        var elements, id = element.id !== undefined;
        switch (element.type()) {
            case 'unit': elements = units;
                break;
            case 'building': elements = buildings;
                break;
            default: elements = terrain;
        }
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
        if(element.type() == 'unit'){
            allowedUnits += 1;
            app.map.removeUnit(element);
        }else if(element.type() == 'building'){
            allowedBuildings += 1;
            buildings.splice(getIndex(element), 1, matrix.remove(element));
        } else if(isSea(element))
            terrain.splice(getIndex(element), 1, matrix.insert(adjustOrientation(new Terrain('sea', element.position()))));
        else matrix.remove(position);
    }

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
                terrain.splice(getIndex(neighbor), 1, adjusted);
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
            return units.splice(getIndex(existing.unit), 1, matrix.insert(unit));
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
            buildings.splice(getIndex(existing.building), 1, building);
        else buildings.push(building);

        if (existing.terrain.type() !== 'plain') {
            terrain.splice(getIndex(existing.terrain), 1);
            var i, n = neighbors(new Position(p.x,p.y));
            for (i = 0; i < n.length; i += 1)
                terrain.splice(getIndex(n[i]), 1, adjustOrientation(n[i]));
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
            terrain.splice(getIndex(existing.terrain), 1, element);
        else terrain.push(element);
        if (existing.building)
            buildings.splice(getIndex(existing.building), 1);
        if (existing.unit && !existing.unit.canBuildOn(element)){
            units.splice(getIndex(existing.unit), 1);
            return matrix.insert(element);
        } else if (!existing.unit) 
            return matrix.insert(element);
        return element;
    };

    return {
        getNeighbors: neighbors,
        getIndex: getIndex,
        occupantsOf: occupants,
        addUnit: addUnit,
        id: function () { return map.id; },
        name: function () { return map.name; },
        players: function () { return map.players; },
        getUnit: function (unit) { return units[getIndex(unit)]; },
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
            var e, current = units[getIndex(unit)];

            if (current) matrix.remove(current);
            else current = unit;
            current.setPosition(target);

            if(!(e = matrix.position(target)) || e.type() !== 'unit')
                matrix.insert(current);

            refresh();
            return current;
        },
        removeUnit: function (unit){
            var i = getIndex(unit);
            if(i !== undefined) unit = units.splice(i, 1)[0];
            if((e = matrix.get(unit)) && e.type() === 'unit' && e.id === unit.id)
                matrix.remove(unit);
            refresh();
            return unit;
        },
        attackUnit: function (unit, damage) {
            units[getIndex(unit)].takeDamage(unit.health() - damage);
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