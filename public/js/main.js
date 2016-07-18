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