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

    var unit, building, u = 0, b = 0, units = app.map.units(), buildings = app.map.buildings();
    
    // check for units that belong to the current player
    while((unit = units[u++]))
        unit.recover();

    while((building = buildings[b++]))
        if (!(unit = building.occupied()) || building.owns(unit))
            building.restore();

    return true;
};

Player.prototype.isReady = function (state) { 
    this._current.ready = state; 
    app.players.checkReady();
};

Player.prototype.ready = function () { return this._current.ready; };
Player.prototype.income = function () {

    // get the amount of income per building for current game
    var  i = 0; 

    console.log(app.game.settings());

    // money allotted per building
    var income = 0, funds = app.game.settings().funds,

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