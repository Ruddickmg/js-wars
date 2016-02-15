/* ------------------------------------------------------------------------------------------------------*\

    app.move handles all the movement in the game, the cursor, scrolling, and moving of units etc..

\* ------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.units = require('../objects/units.js');
app.animate = require('../game/animate.js');
app.settings = require('../settings/game.js');
app.select = require('../game/select.js');
app.options = require('../game/options.js');
app.actions = require('../game/actions.js');
app.undo = require('../tools/undo.js');
app.display = require('../tools/display.js');

module.exports = function () {

    var abs = Math.abs;

    var refreshMovement = function (player) {
        var unit;
        var units = app.map.unit;

        // used for accessing the correct building array via what type of transportation the unit uses
        var ports = {
            air: 'airport',
            foot: 'base',
            wheels: 'base',
            boat: 'seaport'
        };
        for (var u = 0; u < units.length; u += 1) {
            unit = units[u];
            // check for units that belong to the current player
            if (unit.player === player) {
                // add the original movement allowance to each unit on the board belonging to the current player
                app.map.unit[u].movement = app.units[unit.type].properties.movement;

                // reset attack abilities
                app.map.unit[u].attacked = false;   

                // reset capture abilities
                app.map.unit[u].captured = false;
            }
        }
        return true;
    };

    // screenRefresh the postions on the screen of all the units/terrain/buildings/etc
    var screenRefresh = function () { 
        window.requestAnimationFrame(app.animate(['terrain', 'building', 'unit']));
    };

    var moveScreen = function (axis, x, screenDim) {

        var delay = app.settings.scrollSpeed;
        var screenZeroWidth = app.settings.cursor.scroll[axis];
        var midScreen = screenDim / 2;
        var lower = screenZeroWidth + midScreen;
        var scroll = app.settings.cursor.scroll[axis] + screenDim;
        var dimensions = app.map.dimensions[axis];

//        if (!app.temp.scrollTimer) app.temp.scrollTimer = new Date();

        app.settings.cursor[axis] = x;

        // if the hq is located to the right or below the center of the screen then move there
        if (x > scroll - midScreen) {
            // loop with a recursive function so that the time can be delayed
            // creating the effect of moving the screen rather then immediately jumping to the hq
            (function loopDelay(i, dim) {
                setTimeout(function () { // set delay time
                    screenDim += 1;
                    app.settings.cursor.scroll[axis] += 1;
                    screenRefresh();
                    // if the distance between the center screen position and the hq has not been traveled
                    // then keep going, or if the screen has reached the limit of the map dimensions then stop
                    if (--i && screenDim <= dim) loopDelay(i, dim);
                }, delay); // <--- delay time
            })(x - (scroll - midScreen), dimensions);

            // if its to the left or above the screen then move the opposite direction
        } else if (x < lower) {
            (function loopDelay2(i, dim) {
                setTimeout(function () { // set delay time
                    screenZeroWidth -= 1;
                    app.settings.cursor.scroll[axis] -= 1;
                    screenRefresh();
                    if (--i && screenZeroWidth > dim) loopDelay2(i, dim);
                }, delay); // <--- delay time
            })(lower - x, 0);
        }
    };

    // checks if movement is within allowed range
    var canMove = function (move, range) {

        for (var o = 0; o < range.length; o += 1) {

            if (range[o].x === move.x && range[o].y === move.y) {
                return true;
            }
        }
        return false;
    };

    // creates scrolling effect allowing movement and map dimensions beyond screen dimensions
    var scrol = function (incriment, axis, operation) {

        var d = app.map.dimensions[axis]; // map dimensions
        var screenDimensions = {
            x: 15,
            y: 10
        }; // screen dimensions
        var s = screenDimensions[axis];
        var c = app.settings.cursor.scroll[axis];

        // if the resulting movement is greater then the screen size but within the dimensions of the map then scroll
        if (incriment >= s + c && incriment <= d) {
            app.settings.cursor.scroll[axis] += operation;
            screenRefresh();

            // if the resulting movement is less then the screen size but within the dimensions of the map then scroll back
        } else if (incriment < c && incriment >= 0) {
            app.settings.cursor.scroll[axis] += operation;
            screenRefresh();
        }
    };

    var cursor = function (axis, comparison, operation) {

        if (!app.select.building() && !app.options.active() && !app.actions.active()) {

            var cursor = app.settings.cursor[axis]; // cursor location

            scrol(cursor + operation, axis, operation); // handle scrolling

            if (app.select.unit()) {
                var result = limit(axis, operation);
                if (result) {
                    app.undo.effect('path');
                    app.display.path({
                        x: result.x,
                        y: result.y
                    });
                    return true;
                }
            } else if (operation < 0) {
                if (cursor + operation >= comparison) {
                    app.settings.cursor[axis] += operation;
                    return true;
                }
            } else {
                if (cursor + operation <= comparison) {
                    app.settings.cursor[axis] += operation;
                    return true;
                }
            }
        }
        return false;
    };

    var limit = function (axis, operation) {
        var oAxis = axis === 'x' ? 'y' : 'x';
        var a = {};
        var d = app.map.dimensions;

        a[axis] = app.settings.cursor[axis] + operation;
        a[oAxis] = app.settings.cursor[oAxis];

        if (canMove(a, app.select.range()) && a[axis] >= 0 && a.x <= d.x && a.y <= d.y) {
            app.settings.cursor[axis] += operation;
            return app.settings.cursor;
        }
        return false;
    };

    return {

        refresh: function (player) {
            return refreshMovement(player.id);
        },

        // move screen to current players hq
        screenToHQ: function (player) {
            var sd = app.cursorCanvas.dimensions();
            var screenWidth = sd.width / 64;
            var screenHeight = sd.height / 64;
            var x = player.hq.x;
            var y = player.hq.y;

            moveScreen('x', x, screenWidth);
            moveScreen('y', y, screenHeight);
        },

        // keep track of cursor position
        cursor: function () {
            if (!app.select.building() && !app.options.active() && !app.actions.active()) {
                var d = app.map.dimensions;
                var key = app.key;
                var pressed;

                // Player holding up
                // if the cursor has moved store a temporary varibale that expresses this @ app.def.cursorMoved
                if (key.pressed('up') && cursor('y', 0, -1)) pressed = key.up;

                if (key.pressed('down') && cursor('y', d.y, 1)) pressed = key.down;

                // player holding left
                if (key.pressed('left') && cursor('x', 0, -1)) pressed = key.left;

                // Player holding right
                if (key.pressed('right') && cursor('x', d.x, 1)) pressed = key.right;

                if(pressed){
                    app.def.cursorMoved = true;
                    socket.emit('cursorMove', pressed);
                };
                window.requestAnimationFrame(app.animate('cursor'));
            }
            return this;
        }
    };
}();