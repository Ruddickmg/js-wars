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

gameMap = require('./map/map.js');

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
    draw.coordinate('highlight', 'movementRange'); // highlighting of movement range
    draw.coordinate('highlight', 'path'); // highlighting current path
    draw.coordinate('highlight', 'attackRange'); // highlight attack range
};
app.drawCursor = function (draw) {
    if (!app.cursor.hidden() && app.user.turn())
        draw.coordinate('map', 'cursor', [app.cursor.position()]);
    if (app.target.active()) 
        draw.coordinate('map', app.target.cursor(), [app.target.position()]);
};