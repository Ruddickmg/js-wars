/* ---------------------------------------------------------------------------------------------------------*\   
    app
\* ---------------------------------------------------------------------------------------------------------*/

app = require("./game/app.js");

/* ---------------------------------------------------------------------------------------------------------*\   
    add useful methods to prototypes
\* ---------------------------------------------------------------------------------------------------------*/

// add first letter capitalization funcitonality
String.prototype.uc_first = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// simple check if value is in a flat array
Array.prototype.hasValue = function (value) {return this.indexOf(value) > -1;};

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

/* --------------------------------------------------------------------------------------*\ 
    load dummy variables if/for testing locally 
\* --------------------------------------------------------------------------------------*/

if (app.testing){

    gameMap = require('./objects/map.js');

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
            visuals: 'off', 
        },
        name:'testing'
    });
}

/* ---------------------------------------------------------------------------------------------------------*\
    event listeners
\* ---------------------------------------------------------------------------------------------------------*/

window.addEventListener("keydown", function (e) {
    if( !app.game.started() || app.usersTurn || e.keyCode === app.settings.keys.exit || app.options.active() ){
        app.keys[e.keyCode] = e.keyCode;
    }
}, false);

window.addEventListener("keyup", function (e) {
    app.keys[e.keyCode] = false;
    app.keys.splice(0,app.keys.length);
}, false);

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
    animation instructions
\*-----------------------------------------------------------------------------------------------------------*/

app.drawTerrain = function (draw) { draw.cache().coordinate('map', 'terrain');};
app.drawBuilding = function (draw) { draw.coordinate('map', 'building');};
app.drawBackground = function (draw) {draw.background('background');};
app.drawUnit = function (draw) { draw.coordinate('map', 'unit'); };
app.drawWeather = function (draw) {}; // weather stuff animated here
app.drawEffects = function (draw) { 
    draw.coordinate('effect', 'highlight'); // highlighting of movement range
    draw.coordinate('effect', 'path'); // highlighting current path
};

app.drawCursor = function (draw) {
    if (!app.settings.hideCursor && app.usersTurn) draw.coordinate('map', 'cursor', [app.settings.cursor]);
    if (app.settings.target) draw.coordinate('map', 'target', [app.settings.target]);
};