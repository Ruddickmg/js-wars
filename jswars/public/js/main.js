"use strict";

const
    app = require("./game/app.js"),
    gameMap = require('./map/map.js');

function isBoolean(object) {
    
    return object === false || object === true
}

function isArray(object) {

    return object && object.constructor === Array; 
}

function isFunction(object) {

    return object && object.constructor === Function;
}

function isString(object) {

    return object && object.constructor === String;
}

String.prototype.uc_first = function () { 

    return this.charAt(0).toUpperCase() + this.slice(1); 
};

Array.prototype.hasValue = function (value) { 

    return this.indexOf(value) > -1; 
};

if (app.testing) {

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

window.addEventListener("wheel", (e) => app.scroll.wheel(e.deltaY, new Date()));

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

app.drawTerrain = function (draw) { 

    draw.cache().coordinate('map', 'terrain'); 
};

app.drawBuilding = function (draw) { 

    draw.coordinate('map', 'buildings'); 
};

app.drawBackground = function (draw) {

    draw.background('background'); 
};

app.drawUnit = function (draw) { 

    draw.coordinate('map', 'units'); 
};

app.drawWeather = function (draw) {};

app.drawEffects = function (draw) {

    draw.coordinate('highlight', 'movementRange'); // highlighting of movement range
    draw.coordinate('highlight', 'path'); // highlighting current path
    draw.coordinate('highlight', 'attackRange'); // highlight attack range
};

app.drawCursor = function (draw) {

    if (!app.cursor.hidden() && app.user.turn()) {

        draw.coordinate('map', 'cursor', [app.cursor.position()]);
    }

    if (app.target.active()) {

        draw.coordinate('map', app.target.cursor(), [app.target.position()]);
    }
};