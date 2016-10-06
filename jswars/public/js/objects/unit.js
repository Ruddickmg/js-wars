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
        && (type = app.display.verticle().select('actionSelectionIndex', 'actions', app.effect.highlightListItem, 'ul'))){

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