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