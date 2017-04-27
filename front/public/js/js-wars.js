(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/* ----------------------------------------------------------------------------------------------------------*\

    The animate functions insert the draw methods into the specified canvas for rendering and then make a 
    call to the canvas to render those drawings with the render method. Calling the render method of an
    initialized canvas object will render the animations once. If a loop is wanted ( for changing animations 
    for example ), you may pass the parent function into the render function to be called recursively.

\*-----------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');

module.exports = function (objectName, hide) {

    window.requestAnimationFrame(function () {

        if (typeof objectName === 'string') {

            app[objectName + 'Canvas'].setAnimations(app['draw' + objectName.uc_first()]).render(hide);
        } else for (var i = 0; i < objectName.length; i += 1) {

            app[objectName[i] + 'Canvas'].setAnimations(app['draw' + objectName[i].uc_first()]).render(hide);
        }
    });
};

},{"../settings/app.js":83}],2:[function(require,module,exports){
"use strict";

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

        hide: function hide() {
            transparent = 0.1;
        },
        cursor: function cursor(canv, m) {
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

        movementRange: function movementRange(canv, m) {
            canv.fillStyle = "rgba(255,255,255,0.3)";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            return canv;
        },

        attackRange: function attackRange(canv, m) {
            canv.fillStyle = "rgba(240,5,0,0.4)";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            return canv;
        },

        target: function target(canv, m) {
            canv.fillStyle = "rgba(0,255,0,0.3)";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            return canv;
        },

        pointer: function pointer(canv, m) {
            canv.fillStyle = "rgba(255,143,30,0.3)";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            return canv;
        },

        path: function path(canv, m) {
            canv.fillStyle = "rgba(255,0,0,0.5)";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            return canv;
        },

        base: function base(canv, m) {
            canv.fillStyle = "rgba(0,0,200,0.9)";
            canv.beginPath();
            canv.lineTo(m.r(m.w - 5), m.y - 5);
            canv.lineTo(m.r(m.w - 5), m.u(m.h + 5));
            canv.lineTo(m.x - 5, m.u(m.h + 5));
            canv.lineTo(m.x - 5, m.y - 5);
            canv.fill();
            return canv;
        },

        hq: function hq(canv, m) {
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
        plain: function plain(canv, m) {
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

        tallMountain: function tallMountain(canv, m) {
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

        shortMountain: function shortMountain(canv, m) {
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

        tree: function tree(canv, m) {
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

        infantry: function infantry(canv, m) {
            canv.globalAlpha = transparent || 1;
            canv.fillStyle = "blue";
            canv.beginPath();
            canv.arc(m.r(32), m.u(32), 10, 0, 2 * Math.PI);
            canv.fill();
            return canv;
        },

        apc: function apc(canv, m) {
            canv.globalAlpha = transparent || 1;
            canv.fillStyle = "orange";
            canv.beginPath();
            canv.arc(m.r(32), m.u(32), 10, 0, 2 * Math.PI);
            canv.fill();
            return canv;
        }
    };
};

},{}],3:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------------------------*\

    app.draw provides a set of methods for interacting with, scaling, caching, coordinating  
    and displaying the drawings/animations provided in the app.animations

\*---------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.animations = require('../animation/animations.js');
app.settings = require('../settings/game.js');
app.screen = require('../controller/screen.js');
app.map = require('../controller/map.js');
app.background = require('../map/background.js');

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
    var smallCanvas = function smallCanvas() {
        var smallCanvas = document.createElement('canvas');
        smallCanvas.width = w * 2;
        smallCanvas.height = h * 2;
        return smallCanvas;
    };

    // caches drawings so they can be recalled without redrawing ( performance boost in certain situations )
    var cacheDrawing = function cacheDrawing(name) {

        // create a canvas
        var canvas = smallCanvas();

        // get context  
        var cacheCanvas = canvas.getContext(app.ctx);

        // set the position of the image to the center of the cached canvas                         
        var position = setPosition(w / 2, h / 2);

        // draw image to cache to canvas
        animationObjects[name](cacheCanvas, position);

        // cache the canvas with drawing on it ( drawings cached by their class name )
        app.cache[name] = canvas;
    };

    // calculates the base for scaling
    var calcBase = function calcBase(d) {
        return d / base;
    };

    // scales items by calculating their base size multplied by 
    var scale = function scale(type, value) {
        var multiple = type === 'w' ? calcBase(w) : calcBase(h);
        return value === null || value === undefined ? multiple : multiple * value;
    };

    // creates a friendlier interface for drawing and automatically scales drawings etc for screen size
    var setPosition = function setPosition(x, yAxis) {

        var y = yAxis + h;

        return {

            // u = right, will move right the amonut of pixles specified
            r: function r(number) {
                return x + scale('w', number);
            },
            // u = left, will move left the amonut of pixles specified
            l: function l(number) {
                return x - scale('w', number);
            },
            // u = down, will move down the amonut of pixles specified
            d: function d(number) {
                return y + scale('h', number);
            },
            // u = up, will move up the amonut of pixles specified
            u: function u(number) {
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
            random: function random(min, max) {

                return Math.random() * (max - min) + min;
            }
        };
    };

    // offset of small canvas drawing ( since the drawing is larger then single grid square it needs to be centered )
    var smallX = w / 2;
    var smallY = h / 2;

    return {

        // cache all images for performant display ( one drawing to rule them all )
        cache: function cache() {
            this.cached = true;
            return this;
        },

        hide: function hide() {

            animationObjects.hide();
        },

        // place drawings where they belong on board based on coorinates
        coordinate: function coordinate(objectClass, object, coordinet) {

            var s = {}; // holder for scroll coordinates
            var name; // holder for the name of an object to be drawn
            var position = app.screen.position(); // scroll positoion ( map relative to display area )
            var wid = w * 16; // display range
            var len = h * 11;

            // get the coordinates for objects to be drawn
            var coordinate,
                coordinates = !coordinet ? app[objectClass][object]() : coordinet;

            // for each coordinates
            for (var i = 0; i < coordinates.length; i += 1) {

                coordinate = coordinates[i].position ? terrainController.position(coordinates[i]) : coordinates[i];

                // var s modifys the coordinates of the drawn objects to allow scrolling behavior
                // subtract the amount that the cursor has moved beyond the screen width from the 
                // coordinates x and y axis, making them appear to move in the opposite directon
                s.x = coordinate.x * w - position.x * w;
                s.y = coordinate.y * h - position.y * h;

                // only display coordinates that are withing the visable screen
                if (s.x >= 0 && s.y >= 0 && s.x <= wid && s.y <= len) {

                    // get the name of the object to be drawn on the screen
                    name = objectClass === 'map' && coordinet === undefined ? terrainController.draw(coordinates[i]) : object;

                    // if it is specified to be cached
                    if (this.cached) {

                        // check if it has already been cached and cache the drawing if it has not yet been cached
                        if (app.cache[name] === undefined) {

                            cacheDrawing(name);
                        }

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
        background: function background() {

            var dimensions = app.map.dimensions();
            var type = app.background.drawing();

            for (var x = 0; x < dimensions.x; x += 1) {

                for (var y = 0; y < dimensions.y; y += 1) {

                    animationObjects[type](canvas, setPosition(x * w, y * h));
                }
            }
        },

        hudCanvas: function hudCanvas(object, objectClass) {

            // draw a background behind terrain and building elements
            if (objectClass !== 'unit') {

                animationObjects.plain(canvas, setPosition(smallX, smallY));
            }

            if (app.cache[object]) {
                // use cached drawing if available

                canvas.drawImage(app.cache[object], 0, 0);
            } else if (animationObjects[object]) {

                animationObjects[object](canvas, setPosition(smallX, smallY));
            }
        }
    };
};

},{"../animation/animations.js":2,"../controller/map.js":10,"../controller/screen.js":15,"../map/background.js":43,"../settings/app.js":83,"../settings/game.js":85}],4:[function(require,module,exports){
"use strict";

/* ------------------------------------------------------------------------------------------------------*\
   
    controller/actions.js controls action selection
   
\* ------------------------------------------------------------------------------------------------------*/

buildingController = require("../controller/building.js");
terrainController = require("../controller/terrain.js");
unitController = require("../controller/unit.js");
createDefaults = require("../definitions/defaults.js");
terrainDefaults = require("../definitions/properties.js");
buildingDefaults = require("../definitions/buildings.js");
unitDefaults = require("../definitions/units.js");
userActions = require("../user/actions.js");

module.exports = function () {

    var defaults = createDefaults(unitDefaults, buildingDefaults, terrainDefaults);

    return {

        unit: {

            select: function select(unit) {

                if (!unitController.selectable(unit)) {

                    return false;
                }

                // set the range highlight to the calculated range
                app.highlight.setMovementRange(unitController.movementRange(false, unit));

                // animate changes
                app.animate("effects");

                return true;
            },

            displayActions: function displayActions(target, unit) {

                var options = unitController.actions(target, unit);
                var actions = {};

                Object.keys(options).forEach(function (action) {

                    if (action === "drop" && isArray(options.drop)) {

                        options.drop.forEach(function (unit, index) {

                            actions[index] = { name: action };
                        });
                    } else if (options[action]) {

                        actions[action] = { name: action };
                    }
                });

                app.coStatus.hide();

                var menu = app.dom.createMenu(actions, app.settings.actionsDisplay, { section: "actionHud", div: "actions" }).firstChild;

                unit = unitController.setActions(new UList(menu).highlight(), unit);

                var actions = unitController.getActions(unit);

                this.setActions(options);
                this.setSelected(actions.id());

                return this.getSelected();
            },

            setActions: function setActions(actions) {

                this.actions = actions;
            },

            getActions: function getActions() {

                return this.actions;
            },

            setSelected: function setSelected(selected) {

                this.selected = selected;
            },

            getSelected: function getSelected() {

                return this.selected;
            },

            refresh: function refresh() {

                app.animate("unit");
            },

            execute: function execute(target, unit) {

                var position = terrainController.position(target);
                var moved = unitController.moved(terrainController.position(unit), app.path.get(), unit);

                // and remove the range and path highlights
                unit = unitController.move(new Position(position.x, position.y), moved, unit);

                if (app.user.turn()) {

                    transmit.move(unitController.id(unit), position, moved);
                }

                // display path to cursor
                app.path.clear();
                app.range.clear();

                // if there are actions that can be taken then display the necessary options
                if (!this.displayActions(target, unit)) {

                    app.screen.reset();
                }

                app.cursor.hide();
                this.refresh();
            },

            deselect: function deselect() {

                app.screen.reset();
                app.hud.show();
                app.cursor.show();
                app.coStatus.show();
                app.target.deactivate();
                app.hud.setElements(app.cursor.hovered());
            },

            escape: function escape() {

                app.key.undo();
                app.coStatus.show();

                delete this.selected;
                delete this.actions;

                // app.options.deactivate();
                app.dom.remove("actionHud");
            },

            evaluate: function evaluate(unit) {

                if (app.cursor.hidden() && !app.target.active()) {

                    var action = this.getSelected();
                    var actions = this.getActions();

                    if (app.key.pressed(app.key.esc())) {

                        unitController.moveBack(unit);
                        this.refresh();
                        this.escape();
                        this.deselect();
                    } else if (actions && action) {

                        if (app.key.pressed(["up", "down"])) {

                            this.setSelected(Select.verticle(this.getActions().deHighlight()).highlight().id());
                        }

                        if (app.key.pressed(app.key.enter())) {

                            action = (isNaN(action) ? userActions[action] : userActions.drop)(actions, unit, action);

                            this.escape();

                            return action;
                        }
                    }
                }
            }
        },

        building: {

            setScreen: function setScreen(screen) {

                this.screen = screen;

                return this;
            },

            getScreen: function getScreen() {

                return this.screen;
            },

            select: function select(building) {

                this.setScreen(new UList(app.dom.createMenu(app.buildings[buildingController.name(building)], ["name", "cost"], {
                    section: "buildUnitScreen",
                    div: "selectUnitScreen"
                }).firstChild).setScroll(0, 6).highlight());

                this.setSelected(this.getScreen().id());

                return this;
            },

            execute: function execute() {

                app.hud.setElements(app.cursor.hovered());

                app.screen.reset();

                return true;
            },

            setSelected: function setSelected(selected) {

                this.selectedElement = selected;

                return this;
            },

            selected: function selected() {

                return this.selectedElement;
            },

            evaluate: function evaluate(building) {

                if (!app.cursor.hidden()) {

                    app.cursor.hide();
                }

                if (app.key.pressed(["up", "down"])) {

                    this.setSelected(Select.verticle(this.screen.deHighlight()).highlight().id());
                }

                if (app.key.pressed(app.key.enter())) {

                    var unit = buildingController.build(this.selected(), building);
                    var cost = defaults.cost(unit);
                    var player = app.user.player();

                    if (playerController.canPurchase(player, cost)) {

                        playerController.purchase(player, cost);

                        app.map.addUnit(unit);
                        transmit.addUnit(unit);
                        app.hud.show();

                        return unit;
                    }
                }
            }
        },

        type: function type(element) {

            var type = terrainController.type(element);

            if (!this[type]) {

                throw new Error("Invalid element type input.", "actions.js");
            }

            return this[type];
        }
    };
}();

},{"../controller/building.js":5,"../controller/terrain.js":17,"../controller/unit.js":18,"../definitions/buildings.js":19,"../definitions/defaults.js":20,"../definitions/properties.js":22,"../definitions/units.js":24,"../user/actions.js":105}],5:[function(require,module,exports){
"use strict";

/* ------------------------------------------------------------------------------------------------------*\
   
    Building.js controls modification and interaction with building map elements 
   
\* ------------------------------------------------------------------------------------------------------*/

Validator = require("../tools/validator.js");
composer = require("../tools/composition.js");
terrainController = require("../controller/terrain.js");
createUnit = require("../map/unit.js");
createDefaults = require('../definitions/defaults.js');
terrainDefaults = require("../definitions/properties.js");
buildingDefaults = require("../definitions/buildings.js");
unitDefaults = require("../definitions/units.js");
playerController = require("../controller/player.js");
app.players = require("../controller/players.js");
curry = require("../tools/curry.js");

module.exports = function () {

	var validate = new Validator("controller/building.js");
	var defaults = createDefaults(unitDefaults, buildingDefaults, terrainDefaults);

	var controller = composer.exclude("draw").compose({

		/*
  	returns the id of the owner (player id) of the passed in element
  		@element = building or unit object
  */

		playerId: function playerId(element) {

			var player = this.player(element);

			if (!player) {

				player = element;
			}

			var id = playerController.id(player);

			return !isBoolean(id) && id !== undefined ? id : player;
		},

		/*
  	returns the units produced by the building type passed to the element
  		@element = building object
  */

		units: function units(element) {

			return defaults.units(element);
		},

		/*
  	returns the health of a passed in building
  		@element = Object, building
  */

		health: function health(element) {

			return defaults.health(element);
		},

		/*
  	returns the id of the player of a passed in element, may need to be modified
  		@element = Object, building or unit
  	@player = Integer, player number
  */

		player: function player(element) {

			var player = element.player;

			return player;
		},

		/*
  	returns the player of a passed in element, may need to be modified
  		@element = Object, building or unit
  	@player = Integer, player number
  */

		getPlayer: function getPlayer(element) {

			var id = this.player(element);

			if (!isNaN(id) || isString(id)) {

				return app.players.byId(id);
			}

			throw new Error("Invalid id pulled from element passed to \"getPlayer\".", "controller/building.js");
		},

		/*
  	returns the color of an element
  		@element = Object, building or unit
  */

		color: function color(element) {

			return this.player(element) ? this.player(element).color() : "default";
		},

		/*
  	modifies the passed in building, restoring it to its default health, then returns it
  		@element = Object, building
  */

		restore: function restore(element) {

			element.health = defaults.health(element);

			return element;
		},

		/*
  	returns the saved index of the passed in building
  		@element = Object, building
  */

		indexOf: function indexOf(element) {

			return element.index;
		},

		/*
  	returns the match of the passed in element from the buildings array
  		@element = Object, building
  */

		get: function get(element) {

			return app.map.buildings()[this.indexOf(element)];
		},

		/*
  	returns a string from the selected parameter from the bulding object
  		@building = Object, building
  */

		selected: function selected(building) {

			if (!isString(building.selected)) {

				throw new Error("parameter of building object: \"selected\" must be a string. in method: \"selected\".", "controller/bulding.js");
			}

			return building.selected;
		},

		/*
  	returns a boolean representing whether the passed in bulding is a headquarters or not
  		@building = Object, building
  */

		isHQ: function isHQ(building) {

			return this.name(building) === "hq";
		}

	}, terrainController);

	/*--------------------------------------------------------------------------------------*\
 \\ all functions below are curried functions, they are declared seperately so that they //
 // can maintain the context of "this"                                                   \\
 \*--------------------------------------------------------------------------------------*/

	/*
 	returns a modified building, with its selected parameter set to its second argument
 		@building = Object, building
 	@selected = String
 */

	controller.select = curry(function (selected, building) {

		if (!isString(selected)) {

			throw new Error("parameter of building object: \"selected\" must be a string, in method: \"select\".", "controller/bulding.js");
		}

		building.selected = selected;

		return building;
	}.bind(controller));

	/*
 	returns a boolean that tests whether one object has the same owner as the other
 		@Object1 & Object2 = Object, building or unit
 */

	controller.owns = curry(function (object1, object2) {

		return this.playerId(object1) === this.playerId(object2);
	}.bind(controller));

	/*
 	modifies the building passed in, subtracting the amount it has been captured from its health, then returns it
 		@element = Object, building
 	@capture = Integer
 */

	controller.capture = curry(function (capture, element) {

		element.health -= capture;

		return element;
	}.bind(controller)),

	/*
 	modifies the building object passed to the function, changing the player who owns the building, then returns it
 		@element = Object, building
 	@player = Integer, player number
 */

	controller.changeOwner = curry(function (player, element) {
		// <--- remove, just use map

		app.map.changeOwner(element, player);

		return element;
	}.bind(controller)),

	/*
 	returns a unit object
 		@element = Object, building
 	@type = String, type of unit to be built
 */

	controller.build = curry(function (type, element) {

		var playerId = this.playerId(element);
		var position = this.position(element);

		return createUnit(type, new Position(position.x, position.y), playerId);
	}.bind(controller)),

	/*
 	modifies the passed in element, setting its player to the passed in player, then returns it
 		@element = Object, building or unit
 	@player = Integer, player number
 */

	controller.setPlayer = curry(function (player, element) {

		element.player = player;

		return element;
	}.bind(controller)),

	/*
 	returns a boolean as to whether the passed in building can build a specified unit type
 		@element = Object, building object
 	@type = String, building type
 */

	controller.canBuild = curry(function (type, element) {

		return defaults.build(element).indexOf(type) >= 0;
	}.bind(controller)),

	/*
 	returns a boolean as to whether a passed in unit (unit) can be healed by the passed in building (element)
 		@element = Object, building
 	@unit = Object, unit
 */

	controller.canHeal = curry(function (unit, element) {

		var canHeal = defaults.canHeal(element);
		var transportation = defaults.transportation(unit);

		return canHeal ? canHeal.indexOf(transportation) >= 0 : false;
	}.bind(controller));

	return controller;
}();

},{"../controller/player.js":13,"../controller/players.js":14,"../controller/terrain.js":17,"../definitions/buildings.js":19,"../definitions/defaults.js":20,"../definitions/properties.js":22,"../definitions/units.js":24,"../map/unit.js":51,"../tools/composition.js":91,"../tools/curry.js":93,"../tools/validator.js":104}],6:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\

    handle user to user chat

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.user = require('../user/user.js');
transmit = require("../sockets/transmitter.js");
playerController = require("../controller/player.js");

module.exports = {

    titled: function titled(user, message) {

        return user + ": " + message;
    },

    // add message for display, input is message object containing a user name and id, or just a message
    post: function post(mo) {

        // construct message with user name or if there is no user name just use the message
        var user = mo.user,
            message = mo.message;

        message = user ? this.titled(user, message) : message;

        // if the message is a string then append it to the chat element
        if (this.chat && typeof message === 'string') {

            var chatMessage = document.createElement('li'); // create a list element to contain the message
            chatMessage.setAttribute('class', 'message'); // set attribute for styling
            chatMessage.innerHTML = message; // set text to message
            this.chat.appendChild(chatMessage); // append the li element to the chat element

            return message; // return the appended message
        }

        return false;
    },

    // send message, input is an object/element containing textual user input accessed by ".value"
    send: function send(element) {

        var text = this.input(); // user text input
        var name = playerController.name(app.user.player());

        if (name && text) {
            // make sure there is user input and a user name

            var message = { message: text, user: name }; // create message object containing user name and input text

            transmit.message(message);

            element.value = ''; // reset the input box to empty for future input

            return message; // return the input message
        }
        return false;
    },

    input: function input() {

        return this.chatInput.value;
    },

    display: function display() {

        var bb = 5;

        this.chatScreen = document.getElementById('descriptionOrChatScreen');
        this.chatScreen.style.height = this.chatScreen.offsetHeight * 1.8 + 'px';

        this.chatBox = document.getElementById('descriptionOrChat');
        this.chat = document.getElementById('chat');
        this.chatBox.style.height = '77%';
        this.chatBox.style.borderBottomWidth = bb + 'px';

        this.chatInput = document.getElementById('chatInput');
        document.getElementById('descriptions').innerHTML = '';

        this.chatForm = document.getElementById('chatForm');
        this.chatForm.style.display = 'block';
        this.chatForm.style.height = '15%';
        this.chatForm.style.borderBottomWidth = bb + 'px';
        this.chat.style.display = 'block';
        this.chatInput.focus();
    },

    remove: function remove() {

        this.chatScreen.style.height = '20%';

        var doc = this.chatBox;
        doc.style.height = '83%';
        doc.style.borderBottomWidth = '12px';
        this.chat.style.display = 'none';

        var form = this.chatForm;
        form.style.height = '0px';
        form.style.display = 'none';
    }
};

},{"../controller/player.js":13,"../settings/app.js":83,"../sockets/transmitter.js":88,"../user/user.js":109}],7:[function(require,module,exports){
"use strict";

app.maps = require("../controller/maps.js");
app.click = require("../input/click.js");
app.touch = require("../input/touch.js");
app.type = require("../effects/typing.js");

module.exports = {

	active: function active() {

		return this.a;
	},

	activate: function activate() {

		this.a = true;
	},

	deactivate: function deactivate() {

		this.a = false;
	},

	save: function save(player) {

		this.sender = player;
		player.confirm();
		this.display(player.name().uc_first() + " wants to save the game and continue later, is that ok? ");
	},

	evaluate: function evaluate() {

		var response = this.response;

		if (response) {

			if (app.key.pressed(["left", "right"])) {

				Select.horizontal(response.deHighlight()).highlight();
			}

			if (app.key.pressed(["enter", "esc"])) {

				var answer = app.key.pressed(app.key.esc()) ? false : response.id() === "yes";

				app.input.remove();

				this.a = false;

				transmit.confirmstionResponse(answer, this.sender);

				if (!answer) {

					app.players.unconfirm();
				}
			}
		}
	},

	display: function display(message, inactive) {

		var scope = this;
		var text = app.footer.display();
		var description = app.input.descriptions();

		app.game.screen().appendChild(text.parentNode);

		app.input.activate();

		app.type.letters(description, message, function (element) {

			var yes = document.createElement("span");
			var no = document.createElement("span");

			yes.innerHTML = " Yes ";
			no.innerHTML = " No ";

			yes.setAttribute("id", "yes");
			no.setAttribute("id", "no");

			app.touch(yes).element();
			app.click(no).element();

			description.appendChild(yes);
			description.appendChild(no);

			scope.response = new UList(description).setElements([yes, no]).highlight();

			if (!inactive) {

				app.confirm.activate();
			}
		});
	},

	player: function player(answer, _player) {

		var i,
		    message,
		    players = app.players.other();

		if (answer) {

			_player.confirm();

			message = _player.name().uc_first() + " agrees to continue later. ";
		} else {

			return this.no(_player);
		}

		var waiting = players.filter(function (p) {

			return !p.confirmed();
		});

		app.input.message(message);

		return waiting.length ? this.waiting(waiting, message) : this.yes();
	},

	yes: function yes() {

		app.players.unconfirm();
		app.save.recieved(true);
	},

	no: function no(player) {

		app.input.message(player.name().uc_first() + " wants to finish the game.");
		app.players.unconfirm();
		app.save.recieved(false);
	},

	waiting: function waiting(players) {

		app.input.message("Waiting for a response from " + app.players.names(players));
	}
};

},{"../controller/maps.js":11,"../effects/typing.js":32,"../input/click.js":38,"../input/touch.js":41}],8:[function(require,module,exports){
"use strict";

/* ------------------------------------------------------------------------------------------------------*\
   
    cursor.js controls cursor movement and map element selection
   
\* ------------------------------------------------------------------------------------------------------*/

app = require("../settings/app.js");
app.map = require("../controller/map.js");
app.options = require("../menu/options/optionsMenu.js");
app.calculate = require("../tools/calculate.js");
app.animate = require("../animation/animate.js");
app.key = require("../input/keyboard.js");
app.highlight = require("../effects/highlight.js");
app.game = require("../controller/game.js");
app.feature = require("../huds/featureHud.js");
transmit = require("../sockets/transmitter.js");
terrainController = require("../controller/terrain.js");
unitController = require("../controller/unit.js");
actions = require("../controller/actions.js");

module.exports = function () {

    var _editing,
        _selected,
        _deleting,
        _moved,
        _active,
        enter,
        _hidden,
        _position = { x: 7, y: 5 };

    var allowed = function allowed(range) {

        if (!range) {

            range = app.range.get();
        }

        var p,
            l = range.length;

        while (l--) {

            p = terrainController.position(range[l]);

            if (p.on(_position)) {

                return true;
            }
        }

        return false;
    };

    var canMove = function canMove(axis, comparison, operation) {

        var move = _position[axis] + operation; // distance

        if (comparison <= 0 ? move >= 0 : move < comparison) {

            _position[axis] += operation;

            if (_selected && allowed()) {

                app.path.clear().find(_selected, _position);

                app.animate("effects");
            }

            return _position;
        }
        return false;
    };

    // check which side of the screen the cursor is on
    var checkSide = function checkSide(axis) {

        var dimensions = app.screen.dimensions()[axis]; // screen dimensions
        var screenPosition = app.screen.position()[axis]; // position of the screen

        if (_position[axis] > screenPosition + dimensions / 2) {

            return true;
        }
        return false;
    };

    return {

        editing: function editing() {

            _editing = true;
        },

        clear: function clear() {

            _selected = false, _hidden = false, _moved = false;
        },

        hide: function hide() {

            _hidden = true;

            app.animate("cursor");
        },

        show: function show() {

            _hidden = false;

            app.animate("cursor");
        },

        active: function active() {

            return _active;
        },

        hidden: function hidden() {

            return _hidden;
        },

        // returns cursor location ( left or right side of screen )
        side: function side(axis) {

            if (checkSide(axis)) {

                return axis === 'x' ? "right" : "bottom";
            }

            return axis === 'x' ? "left" : "top";
        },

        setSelected: function setSelected(s) {

            _selected = s;
        },

        hovered: function hovered() {

            return app.map.occupantsOf(_position);
        },

        setPosition: function setPosition(p) {

            if (!isNaN(p.x + p.y)) {

                _position = { x: p.x, y: p.y };
            } else {

                throw new Error("Position must have an x and a y axis that are both numeric", "cursor");
            }
        },

        position: function position() {

            return { x: _position.x, y: _position.y };
        },

        moved: function moved() {

            return _moved;
        },

        deselect: function deselect() {

            _selected = false;
        },

        selected: function selected() {

            return _selected;
        },

        select: function select(element) {

            if (_hidden || _deleting) {

                return false;
            }

            // set selection
            if (element) {

                return _selected = element;
            }

            var range = app.key.range();
            var enter = app.key.enter();

            // if its the users turn and theyve pressed enter
            if ((app.key.pressed(enter) || app.key.pressed(range) || app.key.keyUp(range)) && app.user.turn() && !app.target.active()) {

                var hovered = app.map.top(_position);
                var isUnit = terrainController.isUnit(hovered);

                if (!_active && app.key.pressed(enter) && app.key.undo(enter)) {

                    // if something was selected
                    if (_selected && (allowed() && !isUnit || unitController.canCombine(hovered, _selected) || hovered === _selected)) {

                        // if selection is finished then continue
                        if (actions.type(_selected).execute(hovered, _selected)) {

                            // deselect
                            return _selected = false;
                        }

                        // if there is nothing selected
                    } else if (!_selected && !app.options.active() && app.user.owns(hovered)) {

                        // save the selected element and select it
                        if (actions.type(_selected = hovered).select(_selected)) {

                            app.hud.hide();
                        } else {

                            _selected = false;
                        }
                    }
                } else if (!_selected && (terrainController.isUnit(hovered) || app.key.keyUp(range))) {

                    if (app.key.keyUp(range)) {

                        _active = false;

                        app.highlight.clear();
                    } else if (!_active) {

                        app.key.undo(app.key.range());

                        _active = unitController.showAttackRange(hovered);
                    }

                    app.highlight.refresh();
                }
            }

            // handle attack range display
            return this;
        },

        displayPosition: function displayPosition() {

            return true;
        },

        copy: function copy() {

            if (_editing && app.key.pressed(app.key.copy()) && !app.build.active()) {

                app.feature.set(_selected = app.map.top(_position));
            }
        },

        build: function build() {

            if (app.key.pressed(app.key.enter()) && !app.build.active() && app.map.build(_selected, _position)) {

                app.animate(["unit", "building", "terrain"]);
            }
        },

        selectMode: function selectMode() {

            _deleting = false;
        },

        deleteMode: function deleteMode() {

            _deleting = true;
        },

        deleting: function deleting() {

            return _deleting;
        },

        deleteUnit: function deleteUnit() {

            if (app.key.pressed(app.key.enter())) {

                app.key.undo(app.key.enter());

                var hovered = app.map.top(_position);

                if (terrainController.isUnit(hovered)) {

                    app.map.removeUnit(hovered);
                    transmit.delete(hovered);
                }
            }
        },

        move: function move(emitted) {

            _moved = false;

            if ((!_selected || !terrainController.isBuilding(_selected)) && !app.options.active() && !_hidden && app.user.turn() || emitted) {
                //  ||  app.editor.active() after isBuilding

                var d = app.map.dimensions(),
                    pressed;

                if (app.key.pressed(app.key.up()) && canMove('y', 0, -1)) {

                    pressed = app.key.up();
                }

                if (app.key.pressed(app.key.down()) && canMove('y', d.y, 1)) {

                    pressed = app.key.down();
                }

                if (app.key.pressed(app.key.left()) && canMove('x', 0, -1)) {

                    pressed = app.key.left();
                }

                if (app.key.pressed(app.key.right()) && canMove('x', d.x, 1)) {

                    pressed = app.key.right();
                }

                if (pressed) {

                    if (_editing) {

                        app.feature.set(_selected);
                    }

                    if (app.user.turn()) {

                        transmit.cursor(pressed);
                    }

                    _moved = true;
                    app.screen.scroll();
                    app.animate("cursor");
                };
            }

            return this;
        }
    };
}();

},{"../animation/animate.js":1,"../controller/actions.js":4,"../controller/game.js":9,"../controller/map.js":10,"../controller/terrain.js":17,"../controller/unit.js":18,"../effects/highlight.js":29,"../huds/featureHud.js":36,"../input/keyboard.js":40,"../menu/options/optionsMenu.js":72,"../settings/app.js":83,"../sockets/transmitter.js":88,"../tools/calculate.js":90}],9:[function(require,module,exports){
"use strict";

/* ------------------------------------------------------------------------------------------------------*\
   
    Game.js controls the setting up and selection of games / game modes 
   
\* ------------------------------------------------------------------------------------------------------*/

StatusHud = require("../huds/coStatusHud.js");
Counter = require("../tools/counter.js");
Hud = require("../huds/hud.js");
transmit = require("../sockets/transmitter.js");

app = require("../settings/app.js");
app.menu = require("../controller/menu.js");
app.animate = require("../animation/animate.js");
app.key = require("../input/keyboard.js");
app.target = require("../controller/target.js");
app.user = require("../user/user.js");
app.players = require("../controller/players.js");
app.cursor = require("../controller/cursor.js");
app.options = require("../menu/options/optionsMenu.js");
app.confirm = require("../controller/confirmation.js");
app.request = require("../tools/request.js");
app.coStatus = new StatusHud();
actions = require("../controller/actions.js");

playerController = require("../controller/player.js");
buildingController = require("../controller/building.js");

module.exports = function () {

    var game, saved, mode, _name, _joined, selected, _settings, _map, _id, created;
    var _end = false,
        _started = false;
    var menus = ["optionsMenu", "options", "intel", "save", "exit", "yield"];

    // used for accessing the correct building array via what type of transportation the unit uses
    var ports = {
        air: "airport",
        foot: "base",
        wheels: "base",
        boat: "seaport"
    };

    var tick = new Counter(1000);

    var removeScreen = function removeScreen() {

        var screen = document.getElementById("setupScreen");
        screen.parentNode.removeChild(screen);
    };

    return {

        tick: tick.reached,

        setId: function setId(i) {

            return _id = i;
        },

        id: function id() {

            return _id;
        },

        raw: function raw() {

            return {
                name: _name,
                map: app.map.raw(),
                settings: _settings,
                players: app.players.all() // players.map(function (player) {return player.raw();})
            };
        },

        joined: function joined() {

            return _joined;
        },

        setJoined: function setJoined(bool) {

            _joined = bool;
        },

        started: function started() {

            return _started;
        },

        settings: function settings() {

            return _settings;
        },

        map: function map() {

            return _map;
        },

        removeSaved: function removeSaved() {

            saved = undefined;

            return this;
        },

        removeMap: function removeMap() {

            _map = undefined;

            return this;
        },

        removeSettings: function removeSettings() {

            _settings = undefined;

            return this;
        },

        // removePlayers: function () {

        //     players = undefined;

        //     return this;
        // },

        // players: function () {

        //     return players;
        // },

        name: function name() {

            return _name;
        },

        category: function category() {

            return _map.category;
        },

        room: function room() {

            return {

                name: _name,
                category: _map.category
            };
        },

        screen: function screen() {

            return gameScreen;
        },

        clear: function clear() {

            // players = undefined;
            saved = undefined;
            _settings = undefined;
            _name = undefined;
            _started = false;
            _end = false;
        },

        setName: function setName(n) {

            return _name = n;
        },

        setSettings: function setSettings(s) {

            return _settings = s;
        },

        // setPlayers: function (p) {

        //     return players = p;
        // },

        setMap: function setMap(m) {

            return _map = m;
        },

        logout: function logout() {

            // handle logout
            alert("logout!!");
        },

        setCreated: function setCreated(c) {

            created = c;
        },

        create: function create(name, id) {

            var room = {};

            room.map = app.map.get();
            room.name = this.setName(name);
            room.settings = this.setSettings(_settings);
            room.max = app.map.players();
            room.saved = app.players.saved();
            room.category = app.map.category();
            room.id = this.setId(id);

            transmit.createRoom(room);
        },

        load: function load(room) {

            this.setId(room.id);
            this.setCreated(room.created);

            if (app.players.length() > 1) {

                app.players.add(room.players);

                // players = app.players.all();
            }
        },

        setup: function setup(setupScreen) {

            // select game mode
            if (app.user.id() && !mode) {

                mode = app.menu.mode();
            }

            // if a game has been set 
            if (game) {

                removeScreen();

                return game === "editor" && app.editor.start() || _started ? true : app.game.reset();

                // set up the game based on what mode is being selected
            } else if (mode) {

                mode === "logout" ? app.game.logout() : game = app.menu[mode]();
            }

            // loop
            window.requestAnimationFrame(app.game.setup);

            if (app.key.pressed()) {

                app.key.undo();
            }
        },

        reset: function reset() {

            game = false;
            mode = app.menu.mode();
            this.setup();
        },

        start: function start(game) {

            if (app.players.length() !== app.map.players()) {

                return false;
            }

            // set up game map
            app.map.initialize();

            // make sure players are ready
            app.players.initialize();

            // get the player whos turn it is
            var player = app.players.current();

            var hq = composer.functions([buildingController.position, playerController.hq], player);

            var gold = app.players.saved() ? playerController.gold(player) : playerController.income(player);

            playerController.score(player).income(gold);

            app.players.update(playerController.setGold(player, gold));

            // setup game huds
            app.hud = new Hud(app.map.occupantsOf(hq));

            // start game mechanics
            app.game.loop();

            // move the screen to the current players headquarters
            app.screen.to(hq);

            // begin game animations
            app.animate(["background", "terrain", "building", "unit", "cursor"]);

            // mark the game as started
            return _started = true;
        },

        /* --------------------------------------------------------------------------------------------------------*\
            
            app.game.loop consolidates all the game logic and runs it in a loop, coordinating animation calls and 
            running the game
         \* ---------------------------------------------------------------------------------------------------------*/

        update: function update() {

            return app.game.started() ? app.game.loop() : app.game.setup();
        },

        loop: function loop() {

            var confirmation = app.confirm.active();
            var selected = app.cursor.selected();
            var menu,
                options = app.options.active();

            // incriment frame counter
            tick.incriment();

            if (confirmation) {

                app.confirm.evaluate();
            }

            if (app.cursor.deleting()) {

                app.cursor.deleteUnit();
            }

            // if target is active, enabel target selection
            if (app.target.active()) {

                app.target.chose(selected);
            }

            // move cursor
            if (!options && !confirmation) {

                app.cursor.move();
            }

            // handle selection of objects
            if (selected && actions.type(selected).evaluate(selected)) {

                app.screen.reset();

                // display co status hud
            } else if (!options) {

                app.coStatus.display(app.players.current(), app.cursor.side("x"));

                app.map.focus();
            }

            if (options) {

                app.options.select();
            }

            // controls cursor selection
            if (!options && !confirmation) {

                app.cursor.select();
            }

            app.hud.listen(app.cursor, app.map, app.user, app.input);

            // exit menus when esc key is pressed
            if (app.key.pressed(app.key.esc())) {

                if (app.cursor.deleting()) {

                    app.cursor.selectMode();
                } else if (!app.options.active() && !selected && !confirmation) {

                    app.options.display();
                    app.coStatus.hide();
                } else if (!app.options.subMenu()) {

                    app.screen.reset();
                }
            }

            app.key.undo();
            app.key.undoKeyUp();

            tick.reset();

            return _end || window.requestAnimationFrame(app.game.loop);
        },

        save: function save() {

            app.request.post({ user: app.user.raw(), game: this.raw() }, "games/save", function (response) {

                if (response && !response.error) {

                    alert("ending game");;
                }
            });
        },

        end: function end(saved) {

            // create game screen
            alert("player " + playerController.number(app.players.first()) + " wins!  with a score of " + playerController.score(app.players.first()).calculate() + "!");
            _end = true;
        },

        remove: function remove(saved) {

            // transmit.removeRoom(name, id, created, saved);
            app.input.deactivate();
            app.maps.remove(app.map.get());
            app.players.removeSaved();
            this.clear();
        }
    };
}();

},{"../animation/animate.js":1,"../controller/actions.js":4,"../controller/building.js":5,"../controller/confirmation.js":7,"../controller/cursor.js":8,"../controller/menu.js":12,"../controller/player.js":13,"../controller/players.js":14,"../controller/target.js":16,"../huds/coStatusHud.js":35,"../huds/hud.js":37,"../input/keyboard.js":40,"../menu/options/optionsMenu.js":72,"../settings/app.js":83,"../sockets/transmitter.js":88,"../tools/counter.js":92,"../tools/request.js":101,"../user/user.js":109}],10:[function(require,module,exports){
"use strict";

/* ------------------------------------------------------------------------------------------------------*\
   
    controller/map.js controls the setting up and modification of the map
   
\* ------------------------------------------------------------------------------------------------------*/

app = require("../settings/app.js");
app.settings = require("../settings/game.js");
app.players = require("../controller/players.js");
app.units = require("../definitions/units.js");
app.animate = require("../animation/animate.js");

Validator = require("../tools/validator.js");
Matrix = require("../tools/matrix.js");
createTerrain = require("../map/terrain.js");
createBuilding = require("../map/building.js");
createUnit = require("../map/unit.js");
Position = require("../objects/position.js");

unitController = require("../controller/unit.js");
terrainController = require("../controller/terrain.js");
buildingController = require("../controller/building.js");

module.exports = function () {

    var error,
        _focused,
        longestLength,
        map = {},
        matrix,
        _buildings = [],
        _terrain = [],
        _units = [],
        color = app.settings.playerColor,
        allowedUnits,
        allowedBuildings;
    // var validate = new Validator("map");

    var restricted = {

        sea: ["sea", "reef", "shoal"],
        reef: this.sea,
        shoal: this.sea,
        road: ["road"],
        pipe: ["pipe"],
        bridge: ["bridge"],
        river: ["river"]
    };

    var occupants = function occupants(position) {

        var on = {};
        var l = app.calculate.longestLength([_terrain, _buildings, _units]);

        // look through arrays and check if they are at the current or passed grid point
        while (l--) {

            [_units[l], _buildings[l], _terrain[l]].forEach(function (element) {

                if (element && terrainController.on(position, element)) {

                    on[terrainController.type(element)] = element;
                }
            });
        }

        if (!on.terrain) {

            on.terrain = createTerrain("plain", new Position(position.x, position.y));
        }

        return on;
    };

    var detectIndex = function detectIndex(element) {

        return getIndex(element, {

            unit: _units,
            building: _buildings,
            terrain: _terrain

        }[terrainController.type(element)]);
    };

    var getIndex = function getIndex(element, elements) {

        var id = unitController.id(element);
        var position = terrainController.position(element);

        if (element && (id || position)) {

            var compare,
                l = elements.length;

            while (l--) {

                compare = elements[l];

                if (unitController.id(compare) === id || terrainController.on(position, compare)) {

                    return l;
                }
            }
        }

        return false;
    };

    var refresh = function refresh(hide) {

        app.animate("unit", hide);
    };

    var neighbors = function neighbors(position) {

        var neighbors = [];
        var positions = position.neighbors();

        for (var neighbor, i = 0; i < 4; i += 1) {

            neighbor = matrix.position(positions[i]);

            if (neighbor) {

                neighbors.push(neighbor);
            }
        }
        return neighbors;
    };

    var addUnit = function addUnit(unit) {

        _units.push(matrix.insert(unit));
        refresh();
    };

    var deleteElement = function deleteElement(element) {

        if (terrainController.isUnit(element)) {

            allowedUnits += 1;
            app.map.removeUnit(element);
        } else if (terrainController.isBuilding(element)) {

            allowedBuildings += 1;
            _buildings.splice(detectIndex(element), 1, matrix.remove(element));
        } else if (isSea(element)) {

            _terrain.splice(detectIndex(element), 1, matrix.insert(adjustOrientation(createTerrain("sea", element.position()))));
        } else {

            matrix.remove(position);
        }
    };

    var facing = function facing(element) {

        var allowed,
            position = element.position();
        var neighbors = position.neighbors();
        var elem,
            i,
            open = {};

        if (!(allowed = restricted[terrainController.name(element)])) {

            return "";
        }

        for (i = 0; i < neighbors.length; i += 1) {

            elem = app.map.top(neighbors[i]);

            if (allowed.hasValue(terrainController.name(elem))) {

                open[neighbors[i].orientation] = true;
            }
        }

        if (open.north && open.south && open.west && open.east) {

            return "";
        }

        if (open.north) {

            if (open.south && !open.east && !open.west) {

                return "verticle";
            }

            if (open.west) {

                return open.east ? "north" : "northWest";
            } else if (open.east) {

                return "northEast";
            } else {

                return "closedNorth";
            }
        } else if (open.east) {

            if (!open.south) {

                return open.west ? "horazontal" : "closedEast";
            }

            return "southEast";
        } else if (open.south) {

            return open.west ? "southWest" : "closedSouth";
        } else if (open.west) {

            return "closedWest";
        }

        return "single";
    };

    var adjustOrientation = function adjustOrientation(element) {

        return terrainController.setDrawing(facing(element) + terrainController.name(element), element);
    };

    var adjustSurroundings = function adjustSurroundings(element) {

        var position = terrainController.position(element);
        var surroundings = position.surrounding();

        for (var adjusted, neighbor, name, i = 0; i < surroundings.length; i += 1) {

            neighbor = matrix.position(surroundings[i]);

            if (terrainController.isShoal(neighbor) || terrainController.isReef(element) && !isSea(neighbor)) {

                deleteElement(neighbor, "sea");
            } else if (adjusted = adjustOrientation(neighbor)) {

                _terrain.splice(detectIndex(neighbor), 1, adjusted);

                if (terrainController.isUnit(matrix.get(neighbor))) {

                    matrix.insert(adjusted);
                }
            }
        }
    };

    var isSea = function isSea(element) {

        return restricted.sea.hasValue(terrainController.name(element));
    };

    var isBeach = function isBeach(element) {

        if (isSea(element)) {

            var neighbors = terrainController.position(element).neighbors();

            for (var i = 0; i < neighbors.length; i += 1) {

                if (!isSea(neighbors[i])) {

                    return true;
                }
            }
        }

        return false;
    };

    var buildUnit = function buildUnit(unit, position, existing) {

        var element = existing.building || existing.terrain;

        unit = createUnit(unitController.player(unit), new Position(position.x, position.y), unitController.name(unit));

        if (existing.unit && unitController.canBuildOn(unitController.occupies(existing.unit), unit)) {

            allowedUnits -= 1;

            return _units.splice(detectIndex(existing.unit), 1, matrix.insert(unit));
        } else if (element && unitController.canBuildOn(element, unit)) {

            allowedUnits -= 1;

            return addUnit(unit);
        }

        return false;
    };

    var indexOfHQ = function indexOfHQ(hq) {

        var building,
            l = _buildings.length;

        while (l--) {

            building = _buildings[l];

            if (buildingController.isHQ(building) && hq.owns(building)) {

                return l;
            }
        }

        return false;
    };

    var buildBuilding = function buildBuilding(building, position, existing) {

        var hq;

        building = createBuilding(buildingController.name(building), new Position(position.x, position.y), buildingController.player(building), _buildings.length);

        if (buildingController.isHQ(building) && (hq = indexOfHQ(building)) !== false) {

            matrix.remove(_buildings[hq]);
            _buildings.splice(hq, 1);
        }

        if (existing.building) {

            _buildings.splice(detectIndex(existing.building), 1, building);
        } else {

            _buildings.push(building);
        }

        if (!terrainController.isPlain(existing.terrain)) {

            _terrain.splice(detectIndex(existing.terrain), 1);

            var neighbor,
                neighbors = neighbors(new Position(p.x, p.y));
            var l = n.length;

            while (l--) {

                neighbor = neighbors[l];

                _terrain.splice(detectIndex(neighbor), 1, adjustOrientation(neighbor));
            }
        }

        if (!existing.unit) {

            matrix.insert(building);
        }

        allowedBuildings -= 1;

        return building;
    };

    var buildTerrain = function buildTerrain(element, position, type, existing) {

        if (type === "river" && isSea(existing.terrain) || type === "shoal" && !isBeach(existing.terrain)) {

            return false;
        }

        element = adjustOrientation(createTerrain(element.draw(), new Position(position.x, position.y)));

        element.index = _terrain.length;

        adjustSurroundings(element);

        if (!terrainController.isPlain(existing.terrain)) {

            _terrain.splice(detectIndex(existing.terrain), 1, element);
        } else {

            _terrain.push(element);
        }

        if (existing.building) {

            _buildings.splice(detectIndex(existing.building), 1);
        }

        if (existing.unit) {

            if (!unitController.canBuildOn(element, existing.unit)) {

                _units.splice(detectIndex(existing.unit), 1);

                return matrix.insert(element);
            }
        } else {

            return matrix.insert(element);
        }

        return element;
    };

    return {

        getNeighbors: neighbors,
        detectIndex: detectIndex,
        getIndex: getIndex,
        occupantsOf: occupants,
        addUnit: addUnit,

        id: function id() {

            return map.id;
        },

        name: function name() {

            return map.name;
        },

        players: function players() {

            return map.players;
        },

        setUnits: function setUnits(u) {

            if (!isArray(u)) {

                throw new Error("First argument of \"setUnits\" must be an array.");
            }

            _units = u;
        },

        getUnit: function getUnit(unit) {

            return _units[getIndex(unit, _units)];
        },

        category: function category() {

            return map.category;
        },

        dimensions: function dimensions() {

            var dimensions = map.dimensions;

            return { x: dimensions.x, y: dimensions.y };
        },

        background: function (_background) {
            function background() {
                return _background.apply(this, arguments);
            }

            background.toString = function () {
                return _background.toString();
            };

            return background;
        }(function () {

            return background;
        }),

        setBackground: function setBackground(type) {

            background = createTerrain(type);
        },

        buildings: function buildings() {

            return _buildings;
        },

        setBuildings: function setBuildings(b) {

            if (!b.isArray()) {

                throw new Error("First argument of \"setBuildings\" must be an array.");
            }

            _buildings = b;
        },

        terrain: function terrain() {

            return _terrain;
        },

        insert: function insert(element) {

            return matrix.insert(element);
        },

        units: function units() {

            return _units;
        },

        top: function top(position, replace) {

            return matrix.position(position, replace);
        },

        get: function get() {

            return map;
        },

        set: function set(selectedMap) {

            map = selectedMap;
        },

        initialize: function initialize(editor) {

            var dim = map.dimensions,
                product = dim.x * dim.y;

            matrix = new Matrix(dim);

            allowedBuildings = Math.ceil(product / 10) - 1;
            allowedUnits = Math.ceil(product / 12.5);

            _terrain = map.terrain.map(function (t) {

                return matrix.insert(createTerrain(terrainController.type(t), terrainController.position(t)));
            });

            _buildings = map.buildings.map(function (b, index) {

                var player = buildingController.player(b);

                return matrix.insert(createBuilding(buildingController.type(b) || buildingController.name(b), buildingController.position(b), editor ? player : playerController.id(app.players.number(player)), index));
            });

            _units = map.units.map(function (u) {

                var player = unitController.player(u);

                var unit = createUnit(unitController.type(u) || unitController.name(u), editor ? player : playerController.id(app.players.number(player)), unitController.position(u));

                if (map.saved || app.game.started()) {

                    unitController.update(unit, u);
                }

                return matrix.insert(unit);
            });
        },

        moveUnit: function moveUnit(unit, target) {

            console.log(unit);

            var index = getIndex(unit, _units);
            var current = _units[index];
            var element = matrix.position(target);

            if (current) {

                matrix.remove(current);
            } else {

                current = unit;
            }

            current = unitController.setPosition(target, current);

            if (!element || !terrainController.isUnit(element)) {

                matrix.insert(current);
            }

            _units.splice(index, 1, current);

            refresh();

            return current;
        },

        removeUnit: function removeUnit(unit) {

            console.log("-- removing --");
            console.log(unit);

            var index = getIndex(unit, _units);

            if (!isNaN(index)) {

                unit = _units.splice(index, 1)[0];
            }

            if ((element = matrix.get(unit)) && terrainController.isUnit(element) && unitController.isSame(element, unit)) {

                matrix.remove(unit);
            }

            refresh();

            return unit;
        },

        attackUnit: function attackUnit(unit, damage) {

            var health = unitController.health(unit);

            _units[getIndex(unit, _units)].takeDamage(health - damage);

            matrix.get(unit).takeDamage(health - damage);
        },

        changeOwner: function changeOwner(element, player) {

            var element = matrix.get(element);

            building = terrainController.isUnit(element) ? unitController.occupies(element) : element;

            buildingController.setPlayer(player, building);
            building.restore();

            if (!buildingController.isBuilding(b)) {

                throw new Error("Attempted capture on a non building map element");
            }

            buildingController.setPlayer(player, building).restore(building);

            refresh();
        },

        takeHQ: function takeHQ(hq) {

            var index = buildingController.indexOf(hq);

            var building = createBuilding("city", buildingController.position(hq), buildingController.player(hq), index);

            _buildings.splice(index, 1, building);

            Matrix.insert(building);
        },

        printMatrix: function printMatrix() {

            matrix.log();
        },

        clean: function clean() {

            matrix.clean();

            return this;
        },

        focus: function focus() {

            if (app.key.keyUp(app.key.map()) && app.key.undoKeyUp(app.key.map())) {

                app.hud.show();
                app.coStatus.show();
                app.cursor.show();
                refresh();
                _focused = false;
            } else if (app.key.pressed(app.key.map()) && app.key.undo(app.key.map()) && !_focused) {

                app.hud.hide();
                app.coStatus.hide();
                app.cursor.hide();
                refresh(true);
                _focused = true;
            }

            refresh();
        },

        focused: function focused() {

            return _focused;
        },

        refresh: function refresh() {

            app.animate(["unit", "building"]);
        },

        build: function build(element, p) {

            var position = new Position(p.x, p.y);
            var type = terrainController.type(element);
            var existing = occupants(position);

            return {
                unit: buildUnit(element, position, existing),
                building: buildBuilding(element, position, existing),
                terrain: buildTerrain(element, position, type, existing)
            }[type];
        },

        surplus: function surplus() {

            return { building: allowedBuildings, unit: allowedUnits };
        },

        displaySurplus: function displaySurplus() {},
        displayPlayers: function displayPlayers() {},

        raw: function raw(player) {

            return {

                player: player,
                name: map.name,
                players: map.players,
                category: map.category,
                dimensions: map.dimensions,
                terrain: app.map.terrain(),
                buildings: app.map.buildings(),
                units: app.map.units(),
                background: background
            };
        },

        unitsInfo: function unitsInfo() {

            return _units.map(function (unit) {

                return {
                    unit: unitController.name(unit),
                    hp: unitController.health(unit),
                    gas: unitController.fuel(unit),
                    rounds: unitController.ammo(unit)
                };
            });
        }
    };
}();

},{"../animation/animate.js":1,"../controller/building.js":5,"../controller/players.js":14,"../controller/terrain.js":17,"../controller/unit.js":18,"../definitions/units.js":24,"../map/building.js":44,"../map/terrain.js":49,"../map/unit.js":51,"../objects/position.js":81,"../settings/app.js":83,"../settings/game.js":85,"../tools/matrix.js":98,"../tools/validator.js":104}],11:[function(require,module,exports){
"use strict";

/* --------------------------------------------------------------------------------------*\
    
    Maps.js controls the saving and retrieving of maps

\* --------------------------------------------------------------------------------------*/

app = require("../settings/app.js");
app.settings = require("../settings/game.js");
app.request = require("../tools/request.js");
app.game = require("../controller/game.js");

Validator = require("../tools/validator.js");
Map = require("../map/map.js");

module.exports = function () {

	var error,
	    maps,
	    keys,
	    change,
	    _index,
	    _type = "map",
	    _category;
	var validate = new Validator("maps"),
	    categories = ["two"],
	    which = "open";

	var types = {

		map: {
			url: "maps/type",
			items: [],
			elements: {
				section: "mapSelectScreen",
				div: "selectMapScreen",
				li: "mapSelectionIndex",
				type: "map"
			}
		},

		game: {
			url: "games/open",
			items: [],
			elements: {
				section: "gameSelectScreen",
				div: "selectGameScreen",
				li: "mapSelectionIndex",
				type: "game",
				index: "Index",
				attribute: "class",
				url: "games/open",
				properties: app.settings.categories
			}
		}
	};

	var byCategory = function byCategory(cat, callback) {

		if (which === "saved") {

			cat = app.user.id();
		}

		if (cat && cat !== _category) {

			maps = [], keys = [], _category = cat;

			app.request.get(_category, types[_type].url, function (response) {

				if (response && !response.error) {

					// console.log(response);

					maps = types[_type].items = response;
					keys = Object.keys(response);

					if (callback) {

						callback(maps);
					}
				}
				change = true;
			});
		}
		return this;
	};

	var format = function format(map) {

		return map ? map.map ? map : new Map(map.id, map.name, map.players, map.dimensions, map.terrain, map.buildings, map.units) : {};
	};

	var byIndex = function byIndex(ind) {

		_index = ind;

		var m = sub(format(maps[ind]));

		return m.map ? m.map : m;
	};

	var indexById = function indexById(array, id) {

		return array.findIndex(function (element) {

			return element.id == id;
		});
	};

	var _byId = function _byId(array, id) {

		return array[indexById(array, id)];
	};

	var sub = function sub(map) {

		return maps.length ? map : [];
	};

	var edit = function edit(array, element, callback) {

		if (_category === element.category || element.saved) {

			var index = indexById(array, element.id);

			callback(array, element, index);

			change = true;

			return element;
		}
		return false;
	};

	var elementExists = function elementExists(id, element, parent) {

		var exists = document.getElementById(id);

		exists ? parent.replaceChild(element, exists) : parent.appendChild(element);
	};

	var buildingElements = {

		section: "buildingsDisplay",
		div: "numberOfBuildings"
	};

	byCategory(categories[0]);

	return {

		byIndex: byIndex,

		type: function type(t) {

			if (_type !== t) {

				_type = t;
				_category = false;
				byCategory("two");
			}

			return this;
		},

		running: function running() {

			this.setGameUrl(which = "running");

			return this;
		},

		open: function open() {

			this.setGameUrl(which = "open");

			return this;
		},

		setGameUrl: function setGameUrl(type) {

			types.game.url = "games/" + type;
		},

		saved: function saved() {

			this.setGameUrl(which = "saved");

			return this;
		},

		empty: function empty() {

			return !maps.length;
		},

		category: function category() {

			return _category;
		},

		setCategory: function setCategory(category) {

			return byCategory(category);
		},

		all: function all() {

			return maps;
		},

		byId: function byId(id) {

			var map = _byId(maps, id);

			if (map) {

				return format(map);
			}

			return false;
		},

		first: function first() {

			return sub(maps[0]);
		},

		add: function add(room) {

			return edit(types.game.items, room, function (games, room, index) {

				return isNaN(index) ? games.push(room) : games[index] = room;
			});
		},

		remove: function remove(room) {

			return edit(types.game.items, room, function (games, room, index) {

				if (!isNaN(index) && !room.saved) {

					return games.splice(index, 1)[0];
				}
			});
		},

		removePlayer: function removePlayer(room, player) {

			return edit(types.game.items, room, function (games, room, index) {

				if (!isNaN(index)) {

					(room = games[index]).players.splice(room.players.findIndex(function (p) {

						return p.id === player.id;
					}), 1)[0];
				}
			});
		},

		updated: function updated() {

			if (change) {

				change = false;
				return true;
			}
		},

		random: function random() {

			byCategory(categories[app.calculate.random(categories.length - 1) || "two"], function (maps) {

				app.map.set([app.calculate.random(maps.length - 1)]);
			});
		},

		index: function index() {

			return _index;
		},

		info: function info() {

			return app.calculate.numberOfBuildings(byIndex(_index || 0));
		},

		clear: function clear() {

			maps = [], _category = undefined, _index = undefined;
		},

		screen: function screen() {

			return types[_type].elements;
		},

		save: function save(map, name) {

			if (error = validate.defined(app.user.email(), "email") || (error = validate.map(map))) {

				throw error;
			}

			app.request.post(mapController.setCreator(app.user.id(), map), "maps/save", function (response) {

				change = true;
			});
		}
		//getbyid: function (id) { app.request.get(id, "maps/select", function (response) { app.map.set(response); }); },
	};
}();

},{"../controller/game.js":9,"../map/map.js":45,"../settings/app.js":83,"../settings/game.js":85,"../tools/request.js":101,"../tools/validator.js":104}],12:[function(require,module,exports){
"use strict";

/* --------------------------------------------------------------------------------------*\

    menu.js holds handles the selection of game modes / logout etc.. <--- can be redone better

\* --------------------------------------------------------------------------------------*/

app = require("../settings/app.js");
app.maps = require("../controller/maps.js");
app.user = require("../user/user.js");
app.testMap = require("../map/testMap.js");

Join = require("../menu/join.js");
Settings = require("../menu/settings.js");
Teams = require("../menu/teams.js");
Modes = require("../menu/modes.js");
transmit = require("../sockets/transmitter.js");

module.exports = function () {

    var sent,
        _boot,
        _active,
        game = {};

    var exitSetupScreen = function exitSetupScreen() {

        var ss = document.getElementById("setupScreen");
        if (ss) ss.parentNode.removeChild(ss);
    };

    var join = function join(category, type) {

        // handle game selection
        if (!app.game.map()) {

            if (Join.back()) {

                return "back";
            } else {

                app.game.setMap(Join[category](type));
            }

            // handle settings selection
        } else if (category === "map" && !app.game.settings()) {

            if (Settings.back()) {

                app.game.removeMap().removeSettings();
            } else {

                app.game.setSettings(Settings.withArrows().select());
            }
        } else if (!app.game.started()) {

            if (Teams.back()) {

                // app.game.removePlayers();

            } else {

                Teams.withArrows().select();
            }
        } else {

            Teams.remove();

            // app.game.setPlayers(app.players.all());

            if (app.user.player() === app.players.first()) {

                transmit.start(true);
            }

            return true;
        }
    };

    return {

        boot: function boot() {

            _boot = true;
        },

        mode: function mode() {

            return Modes.select();
        },

        newgame: function newgame() {

            return join("map", "open");
        },

        continuegame: function continuegame() {

            return join("game", "saved");
        },

        newjoin: function newjoin() {

            return join("game", "open");
        },

        continuejoin: function continuejoin() {

            return join("game", "running");
        },

        mapdesign: function mapdesign() {

            app.maps.save(app.testMap(), "testMap #1");

            app.game.reset();

            // if (!game.map) {
            //     game.map = Join.map();
            //     if (game.map) {
            //         if (game.map === "back") {
            //             delete game.map;
            //             return "back";
            //         }
            //         app.players.add(app.user.raw());
            //         app.cursor.editing();
            //         return "editor";
            //     }
            // }
        },

        COdesign: function COdesign() {

            alert("Co design is under construction");
        },

        store: function store() {

            alert("The game store is under construction");
        },

        joined: function (_joined) {
            function joined() {
                return _joined.apply(this, arguments);
            }

            joined.toString = function () {
                return _joined.toString();
            };

            return joined;
        }(function () {

            return joined;
        }),

        active: function active() {

            return _active;
        },

        activate: function activate() {

            _active = true;
        },

        deactivate: function deactivate() {

            _active = false;
        }
    };
}();

},{"../controller/maps.js":11,"../map/testMap.js":50,"../menu/join.js":67,"../menu/modes.js":69,"../menu/settings.js":75,"../menu/teams.js":76,"../settings/app.js":83,"../sockets/transmitter.js":88,"../user/user.js":109}],13:[function(require,module,exports){
'use strict';

/* ------------------------------------------------------------------------------------------------------*\
   
    controller/player.js modifies and returns properties of player objects in game
   
\* ------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.game = require('../controller/game.js');
app.co = require('../user/co.js');
app.map = require('../controller/map.js');
app.players = require('../controller/players.js');
app.screen = require('../controller/screen.js');
Score = require('../definitions/score.js');
unitController = require("../controller/unit.js");
buildingController = require("../controller/building.js");

composer = require("../tools/composition.js");
transmit = require("../sockets/transmitter.js");

module.exports = function () {

    // var validate = new Validator("controller/player.js");

    return {

        update: function update(player, _update) {

            player.id = _update.id;
            player.gold = _update.gold;
            player.special = _update.special;
            player.ready = app.game.started() || app.players.saved() !== undefined;
            player.number = _update.number;
            player.co = app.co[_update.co.toLowerCase()](player);
            player.score = new Score(_update.score);

            return player;
        },

        id: function id(player) {

            return player.id;
        },

        setProperty: function setProperty(player, property, value) {

            player[property] = value;

            if (app.user.number() === this.number(player)) {

                transmit.setUserProperty(player, property, value);
            }

            return player;
        },

        getProperty: function getProperty(player, property) {

            return player[property];
        },

        setCo: function setCo(player, co) {

            return this.setProperty(player, "co", app.co[co](player));
        },

        color: function color(player) {

            // figure out color system

            return this.number(player);
        },

        index: function index(player) {

            // may need to change this to account for copies

            return app.players.indexOf(player);
        },

        setNumber: function setNumber(player, number) {

            player.number = number;

            return player;
        },

        number: function number(player) {

            return player.number;
        },

        endTurn: function endTurn() {

            // update score
            if ((current = app.players.current()) === app.user.player()) {

                app.user.score.update(this.score(current));
            }

            app.map.clean();

            current.isTurn = false;

            // get the next player
            var player = composer.functions([this.collectIncome, this.recover, this.endPower, this.resetScore], app.players.next());

            player.isTurn = true;

            // move the screen to the next players headquarters
            app.screen.to(buildingController.position(this.hq(player)));

            // assign the next player as the current player
            app.players.setCurrent(player);

            // if the player is ai then send the games current state 
            if (this.isComputer(player)) {

                transmit.aiTurn(player);
            }
        },

        setScore: function setScore(player, score) {

            player.score = score;

            return player;
        },

        resetScore: function resetScore(player) {

            player.score = new Score();

            return player;
        },

        endPower: function endPower(player) {

            player.co.endPower();

            return player;
        },

        recover: function recover(player) {

            var units = app.map.units();

            // check for units that belong to the current player
            app.map.setUnits(units.map(function (unit) {

                var element = unitController.occupies(unit);

                if (unitController.owns(player, unit)) {

                    unit = unitController.recover(unit);

                    // playerController is difficult here, scoping does not work with this so name reliance 
                    if (buildingController.owns(player, element) && buildingController.canHeal(unit, element)) {

                        unit = unitController.repair(unit);
                    }
                }

                return unit;
            }));

            app.map.setBuildings(app.map.buildings().map(function (building) {

                var unit = buildingController.occupied(building);

                if (!unit || buildingController.owns(building, unit)) {

                    building = buildingController.restore(building);
                }

                return building;
            }));

            return player;
        },

        isComputer: function isComputer(player) {

            var isComputer = player.isComputer;

            if (!isBoolean(isComputer)) {

                throw new Error("isComputer must be boolean value, found: " + isComputer, "controller/player.js");
            }

            return isComputer;
        },

        isReady: function isReady(player, state) {
            // check this out for functionality

            player.ready = state;

            app.players.checkReady();

            return player;
        },

        displayedInfo: function displayedInfo(player) {

            var info = this.score(player).display();

            info.bases = this.buildings(player).length;
            info.income = this.income(player);
            info.funds = this.gold(player);
            info.player = this.number(player);

            return info;
        },

        ready: function ready(player) {

            return player.ready;
        },

        income: function income(player) {

            var scope = this,
                funds = app.game.settings().funds;

            var income = app.map.buildings().reduce(function (money, building) {

                return money + (scope.owns(player, building) ? funds : 0);
            }, 0);

            return income;
        },

        collectIncome: function collectIncome(player) {

            var income = playerController.income(player);

            player.score.income(income);
            player.gold += income;

            return player;
        },

        defeat: function defeat(player1, player2, capturing) {

            if (app.user.owns(player1)) {

                transmit.defeat(player1, player2, capturing);
            }

            this.score(player1).conquer();
            this.score(player2).defeat();

            app.players.defeat(player2);

            var buildings = app.map.buildings();
            var building,
                l = buildings.length;

            capturing = capturing ? player1 : capturing;

            // assign all the buildings belonging to the owner of the captured hq to the capturing player
            while (l--) {

                if (this.owns(player, building = buildings[l])) {

                    this.lostBuilding(player2);
                    this.score(player1).capture();

                    if (buildingController.isHQ(building)) {

                        app.map.takeHQ(building);
                    }

                    buildingController.changeOwner(capturing, building);
                }
            }

            app.animate('building');
        },

        score: function score(player) {

            return player.score;
        },

        get: function get(player) {

            return app.players.get(player);
        },

        isTurn: function isTurn(player) {
            // change this outside of object 

            return this.id(player) === this.id(app.players.current());
        },

        first: function first(player) {

            return this.id(player) === this.id(app.players.first());
        },

        special: function special(player) {

            return player.special;
        },

        gold: function gold(player) {

            return player.gold;
        },

        canPurchase: function canPurchase(player, cost) {

            return this.gold(player) - cost >= 0;
        },

        purchase: function purchase(player, cost) {

            this.score(player).expenses(cost);

            return this.setGold(player, this.gold(player) - cost);
        },

        setGold: function setGold(player, gold) {

            return gold >= 0 ? (player.gold = gold) + 1 : false;
        },

        owns: function owns(player, object) {
            // could modify game parameters to add a dimension to the game like territory

            return this.id(this.get(player)) === buildingController.playerId(object);
        },

        co: function co(player) {

            if (player) {

                return player.co;
            }

            return player;
        },

        units: function units(player) {

            var units = app.map.units();
            var owned = [];
            var l = units.length;

            while (l--) {

                if (this.owns(player, units[l])) {

                    owned.push(units[l]);
                }
            }

            return owned;
        },

        buildings: function buildings(player) {

            var scope = this;

            return app.map.buildings().filter(function (building) {

                return scope.owns(player, building);
            });
        },

        confirm: function confirm(player) {

            player.confirmation = true;

            return player;
        },

        confirmed: function confirmed(player) {

            return player.confirmation;
        },

        unconfirm: function unconfirm(player) {

            delete player.confirmation;

            return player;
        },

        hq: function hq(player) {

            var buildings = app.map.buildings();
            var building,
                l = buildings.length;

            while (l--) {

                building = buildings[l];

                if (buildingController.isHQ(building) && buildingController.owns(player, building)) {

                    return building;
                }
            }
        }
    };
}();

},{"../controller/building.js":5,"../controller/game.js":9,"../controller/map.js":10,"../controller/players.js":14,"../controller/screen.js":15,"../controller/unit.js":18,"../definitions/score.js":23,"../settings/app.js":83,"../sockets/transmitter.js":88,"../tools/composition.js":91,"../user/co.js":107}],14:[function(require,module,exports){
'use strict';

/* ------------------------------------------------------------------------------------------------------*\
   
    Players.js controls player coordination within the game
   
\* ------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.map = require('../controller/map.js');
createPlayer = require('../user/player.js');
AiPlayer = require('../user/aiPlayer.js');
Teams = require('../menu/teams.js');
playerController = require("../controller/player.js");
trasmit = require("../sockets/transmitter.js");

/// set current player upon start of a continued game (need to save current player on save)

module.exports = function () {

    var _current,
        _saved,
        players = [],
        _defeated = [],
        elements = [],
        _ready;

    var exists = function exists(player) {

        var id = playerController.id(player);

        return players.findIndex(function (player) {

            return playerController.id(player) === id;
        });
    };

    var addPlayer = function addPlayer(player, number) {

        // check if player is already in and replace if they are
        if (players.length <= app.map.players()) {

            var number, index, id;

            if (!playerController.isComputer(player)) {

                player = createPlayer(player);
            }

            if (_saved) {

                id = playerController.id(player);

                index = _saved.findIndex(function (player) {

                    return playerController.id(player) === id;
                });
            }

            if (isNaN(index) || app.game.started()) {

                index = exists(player);
            }

            if (!isNaN(index)) {

                if (_saved) {

                    players[index] = player;
                    number = _saved[index].number;
                } else {

                    players.splice(index, 1, player);
                    number = playerController.number(players[index]);
                }
            } else {

                players.push(player);
            }

            player = playerController.setNumber(player, number || (number = players.length));

            if (_saved) {

                player = playerController.update(player, _saved[number - 1]);
            }

            var element = Teams.playerElement(number);
            var value = playerController.co(player) || element && element.coName();

            if (value) {

                player = playerController.setCo(player, value);
            }

            players[exists(player)] = player;

            if (!playerController.number(player)) {

                throw new Error("Number has not been set for added player.", "players.js");
            }

            return players;
        }
        return false;
    };

    var shiftPlayers = function shiftPlayers(index) {

        var playerNumber = app.user.number();

        players.slice(index).forEach(function (player, index) {

            var number = index + 1;

            players[index] = playerController.setNumber(player, number);

            Teams.playerElement(number).co().changeCurrent(playerController.co(player).name.toLowerCase());
        });

        if (index < playerNumber) {

            Teams.arrows.setPosition(Teams.playerElement(app.user.number()).co());
        }
    };

    var replacePlayer = function replacePlayer(player) {

        var index = exists(player);

        if (!isNaN(index)) {

            transmit.boot(players[index]);

            players[index] = new AiPlayer(playerController.number(player));
        } else {

            throw new Error("Not able to replace player, player not found.", "controller/players.js");
        }
    };

    var allReady = function allReady() {

        var l = app.map.players();

        while (l--) {

            if (!players[l] || !playerController.ready(players[l])) {

                return false;
            }
        }

        return true;
    };

    return {

        replace: replacePlayer,

        saved: function saved(players) {

            return players ? _saved = players : _saved;
        },

        removeSaved: function removeSaved() {

            _saved = undefined;
        },

        changeProperty: function changeProperty(p) {
            // change this its weird

            var player = players[exists(p.player)];
            var property = p.property;
            var value = p.value;
            var element = Teams.playerElement(playerController.number(player));

            if (element && element[property]) {

                element[property]().changeCurrent(value);
            }

            playerController.setProperty(player, property, value);
        },

        getInfo: function getInfo() {

            return players.map(function (player) {

                return playerController.displayedInfo(player);
            });
        },

        update: function update(player) {

            var index = exists(player);

            if (!isNaN(index)) {

                players[index] = player;
            }
        },

        setElements: function setElements(e) {

            elements = e;
        },

        addElement: function addElement(e) {

            elements.push(e);
        },

        element: function element(number) {

            return elements[number - 1];
        },

        empty: function empty() {

            return !players.length;
        },

        // first might cause weirdness if indices change.. 
        first: function first() {

            return players[0];
        },

        last: function last() {

            return players[players.length - 1];
        },

        next: function next() {

            return _current === this.last() ? this.first() : players[playerController.number(_current)];
        },

        other: function other() {

            return players.filter(function (player) {

                return playerController.id(player) !== app.user.id();
            });
        },

        all: function all() {

            return players.concat(_defeated);
        },

        length: function length() {

            return players.reduce(function (prev, player) {

                return prev + (player ? 1 : 0);
            }, 0);
        },

        add: function add(player) {

            if (player.isArray()) {

                player.forEach(function (p, i) {

                    addPlayer(p, i + 1);
                });
            } else {

                addPlayer(player);
            }

            return _current = players[0];
        },

        // check if all players are present and ready
        ready: function ready() {

            return _ready;
        },

        checkReady: function checkReady() {

            _ready = allReady();
        },

        get: function get(object) {

            var id = playerController.id(object);

            return this.all().find(function (player) {

                return player && id == playerController.id(player);
            });
        },

        byId: function byId(id) {

            return this.get({ id: id });
        },

        reset: function reset() {

            players = [];

            this.removeSaved();

            return this;
        },

        current: function current() {

            return _current ? _current : this.first();
        },

        setCurrent: function setCurrent(player) {

            if (_current) {

                _current.isTurn = false;
            }

            player.isTurn = true;

            _current = player;
        },

        defeated: function defeated() {

            return _defeated;
        },

        defeat: function defeat(player) {

            _defeated.concat(players.splice(playerController.index(player), 1));

            if (app.players.length() <= 1) {

                return app.game.end();
            }

            alert('player ' + playerController.number(player) + ' defeated');
        },

        indexOf: function indexOf(object) {

            var l = players.length;

            while (l--) {

                if (playerController.id(players[l]) === playerController.id(object)) {

                    return l;
                }
            }

            return false;
        },

        number: function number(_number) {

            if (app.game.started()) {

                return players.find(function (player) {

                    return playerController.number(player) == _number;
                });
            }

            return (player = players[_number - 1]) ? player : false;
        },

        names: function names(players) {

            return players.reduce(function (previous, player, i, players) {

                var len = players.length;
                var p = typeof prev === "string" ? previous : '';
                var transition = i + 1 < len ? i + 2 < len ? ', ' : ' and ' : '';

                return p + playerController.name(player) + transition;
            });
        },

        unconfirm: function unconfirm() {

            players = players.map(function (player) {

                return playerController.unconfirm(player);
            });
        },

        remove: function remove(player) {

            var index, removed;

            if (app.game.started() && !playerController.isComputer(player)) {

                replacePlayer(player);
            } else if (!isNaN(index = exists(player))) {

                removed = players.splice(index, 1)[0];

                if (playerController.isComputer(removed) && app.user.first()) {

                    transmit.removeAi(removed);
                }

                if (players.length >= index + 1 && !_saved) {

                    shiftPlayers(index);
                }
            }
        },

        initialize: function initialize() {

            players = players.map(function (player) {

                if (isString(playerController.co(player))) {

                    playerController.setCo(player, playerController.co(player));
                }

                if (playerController.isTurn(player)) {

                    _current = player;
                }

                return player;
            });
        }
    };
}();

},{"../controller/map.js":10,"../controller/player.js":13,"../menu/teams.js":76,"../settings/app.js":83,"../sockets/transmitter.js":88,"../user/aiPlayer.js":106,"../user/player.js":108}],15:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    screen.js handles screen movement

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.settings = require('../settings/game.js');
app.animate = require('../animation/animate.js');
app.map = require('../controller/map.js');
app.cursor = require('../controller/cursor.js');

module.exports = function () {

	var screenDimensions,
	    _dimensions,
	    _focused,
	    _position = { x: 0, y: 0 },
	    axis = ['x', 'y'];

	var scale = function scale(dimension) {
		return dimension / 64 - 1;
	};

	// screenRefresh the postions on the screen of all the units/terrain/buildings/etc
	var screenRefresh = function screenRefresh() {
		app.animate(['terrain', 'cursor', 'building', 'unit', 'effects']);
	};

	var refreshMap = function refreshMap() {

		app.animate(["unit", "building"]);
	};

	var move = function move(distance, view, limit, sign, axis) {

		setTimeout(function () {
			// set delay time
			if (distance > -1 && view * sign + sign < limit) {
				view += sign; // <--- keep track of screen edge as it moves
				_position[axis] += sign; // <---- move screen
				screenRefresh(); // <-- animate screen movement
				move(distance - 1, view, limit, sign, axis); //<--- call self and decriment the distance to target
			}
		}, app.settings.scrollSpeed); // <--- delay time
	};

	return {

		setDimensions: function setDimensions(dim) {

			screenDimensions = dim;

			_dimensions = { x: scale(dim.width), y: scale(dim.height) };
		},

		width: function width() {

			return screenDimensions.width;
		},

		dimensions: function dimensions() {

			return _dimensions;
		},

		position: function position() {

			return _position;
		},

		top: function top() {

			return _position.y;
		},

		bottom: function bottom() {

			return _position.y + _dimensions.y;
		},

		left: function left() {

			return _position.x;
		},

		right: function right() {

			return _position.x + _dimensions.x;
		},

		// deactivate all menus/selections and display screen in its initial state
		reset: function reset() {

			['actionHud', 'damageDisplay', 'buildUnitScreen', 'unitInfoScreen', 'optionsMenu'].forEach(function (screen) {
				app.dom.remove(screen);
			});

			app.coStatus.show();
			app.hud.show();
			app.options.deactivate();
			app.cursor.deselect();
			app.path.clear();
			app.range.clear();
			app.cursor.show();
			app.animate(['cursor', 'unit', 'effects']);

			return this;
		},

		// creates scrolling effect allowing movement and map dimensions beyond screen dimensions
		scroll: function scroll(map) {

			var mapDimensions = app.map.dimensions();
			var a,
			    cursor = app.cursor.position();

			for (var p, i = 0; i < 2; i += 1) {

				a = axis[i];

				if (cursor[a] >= 0 && cursor[a] < (p = _position[a]) + 2 && p > 0) {

					_position[a] -= 1;
				}

				if (cursor[a] < mapDimensions[a] && cursor[a] > (p = _position[a] + _dimensions[a]) - 2 && p < mapDimensions[a] - 1) {

					_position[a] += 1;
				}
			}

			screenRefresh();
		},

		// move screen to target position
		to: function to(coordinates, map) {

			app.cursor.setPosition(coordinates);

			var a, target, limit, distance, view, sign, beginning, end, middle;
			var mapDimensions = app.map.dimensions();

			for (var i = 0; i < 2; i += 1) {

				a = axis[i], target = coordinates[a];

				// beginning of screen view
				beginning = _position[a];

				// end / edge of screen view
				end = _position[a] + _dimensions[a];

				// middle of screen view
				middle = end - Math.ceil(_dimensions[a] / 2);

				// if the hq is located to the right or below the center of the screen then move there
				if (target > middle) {

					sign = 1;
					distance = target - middle;
					limit = mapDimensions[a];
					view = end;
				} else {

					sign = -1;
					distance = middle - target;
					limit = -1;
					view = beginning;
				}
			}

			// create the effect of moving the screen rather then immediately jumping to the hq
			move(distance, view, limit, sign, a);
		},

		focus: function focus() {

			if (app.key.keyUp(app.key.map()) && app.key.undoKeyUp(app.key.map())) {

				app.hud.show();
				app.coStatus.show();
				app.cursor.show();
				refresh();
				_focused = false;
			} else if (app.key.pressed(app.key.map()) && app.key.undo(app.key.map()) && !_focused) {

				app.hud.hide();
				app.coStatus.hide();
				app.cursor.hide();
				refresh(true);
				_focused = true;
			}

			refreshMap();
		},

		focused: function focused() {

			return _focused;
		}
	};
}();

},{"../animation/animate.js":1,"../controller/cursor.js":8,"../controller/map.js":10,"../settings/app.js":83,"../settings/game.js":85}],16:[function(require,module,exports){
"use strict";

DamageDisplay = require('../objects/damageDisplay.js');
actions = require("./actions.js");
terrainController = require("./terrain.js");
unitController = require("./unit.js");
Fader = require('../effects/fade.js');

module.exports = function () {

	var _position,
	    action,
	    target,
	    setElement,
	    damage,
	    _active,
	    newTarget = true,
	    index = 0,
	    damageDisplay,
	    keys = ['left', 'right', 'up', 'down'],
	    cursors = { attack: 'target', drop: 'pointer' };

	var refresh = function refresh() {

		app.animate(['cursor']);
	};

	var removeDamageDisplay = function removeDamageDisplay() {

		if (damageDisplay) {

			damageDisplay.remove();
		}
	};

	return {

		deactivate: function deactivate() {

			_active = false;
			app.animate(['cursor']);
		},

		set: function set(element) {

			setElement = element;
		},

		activate: function activate(acting) {

			if (!acting) {

				throw new Error('no action input for target');
			}

			action = acting;
			_active = true;
		},

		drop: function drop() {

			this.activate("drop");
		},

		attack: function attack() {

			this.activate("attack");
		},

		active: function active() {

			return _active;
		},

		position: function position() {

			return _position;
		},

		cursor: function cursor() {

			return cursors[action];
		},

		chose: function chose(element) {

			if (app.key.pressed(app.key.esc()) && app.key.undo(app.key.esc())) {

				removeDamageDisplay();

				newTarget = true;
				_active = false;
				action = false;
				actions.type(element).displayActions();
				app.hud.hide();

				return refresh();
			}

			var targets = unitController.targets(element); // <--- dunno, fix this
			var k,
			    pressed,
			    length = targets.length;

			// move to  and from targets units
			if (length > 1) {

				for (var i = 0; i < length; i += 1) {

					if ((k = keys[i]) && app.key.pressed(k) && app.key.undo(k) && (pressed = true)) {

						index += k === 'left' || k === 'down' ? -1 : 1;
					}
				}
			}

			if (pressed || newTarget) {

				newTarget = false;
				index = index < 0 ? length - 1 : index = index >= length ? 0 : index;
				target = targets[index];
				var p = terrainController.position(target);

				if (action === 'attack') {

					damage = unitController.target(index, element);

					// calcualte damage percentage for each targets unit
					damageDisplay = new DamageDisplay(Math.round(damage));
				}

				// create target for rendering at specified coordinates
				_position = new Position(p.x, p.y);

				refresh();
			}

			// if the target has been selected return it
			if (app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter())) {

				unitController[action](target, damage, true, element);

				removeDamageDisplay();

				newTarget = true;
				_active = false;
				action = false;

				return target;
			}

			return false;
		}
	};
}();

},{"../effects/fade.js":28,"../objects/damageDisplay.js":80,"./actions.js":4,"./terrain.js":17,"./unit.js":18}],17:[function(require,module,exports){
"use strict";

/* ------------------------------------------------------------------------------------------------------*\
   
    controller/terrain.js modifies and returns properties of terrain objects in game
   
\* ------------------------------------------------------------------------------------------------------*/

Validator = require("../tools/validator.js");
curry = require("../tools/curry.js");

module.exports = function () {

	// var validate = new Validator("controller/terrain.js");

	var restricted = {

		sea: ["sea", "reef", "shoal"],
		reef: this.sea,
		shoal: this.sea,
		road: ["road"],
		pipe: ["pipe"],
		bridge: ["bridge"],
		river: ["river"]
	};

	var controller = {

		/*
  	returns the position of a passed in element
  		@element = Object, Terrain, Building or Unit
  */

		position: function position(element) {

			var position = element.position;

			// var error = validate.isCoordinate(position);

			// if (error) {

			// 	throw error;
			// };

			return new Position(position.x, position.y);
		},

		/*
  	returns a boolean stating whether the passed in elements position is occupied by a unit
  		@element = Object, Terrain, Building or Unit
  */

		occupied: function occupied(element) {

			return this.type(app.map.top(this.position(element))) === "unit";
		},

		/*
  	returns the type of a passed in element
  		@element = Object, Terrain, Building or Unit
  */

		type: function type(element) {

			var type = element.type;
			// var error = validate.mapElementType(type);

			// if (error) {

			// 	throw error;
			// }

			return type;
		},

		/*
  	returns the name of a passed in element
  		@element = Object, Terrain, Building or Unit
  */

		name: function name(element) {

			var name = element.name.toLowerCase();

			// var error = validate.mapElementName(name);

			// if (error) {

			// 	throw error;
			// }

			return name;
		},

		/*
  	returns the parameter name of the input element (element) that is to be drawn on canvas
  		@element = Object, Terrain, Building or Unit
  */

		draw: function draw(element) {

			var name = element.draw || element.name;
			var orientaion = element.orientaion || "";

			// var error = validate.isString(name) || validate.isString(orientaion);

			// if (error) {

			// 	throw error;
			// }

			return name + orientaion;
		},

		/*
  	returns a boolean as to whether a map element is terrain
  		@element = Object, Terrain, Building or Unit
  */

		isTerrain: function isTerrain(element) {

			return this.type(element) === "terrain";
		},

		/*
  	returns a boolean as to whether a map element is a building
  		@element = Object, Terrain, Building or Unit
  */

		isBuilding: function isBuilding(element) {

			return this.type(element) === "building";
		},

		/*
  	returns a boolean as to whether a map element is a unit
  		@element = Object, Terrain, Building or Unit
  */

		isUnit: function isUnit(element) {

			return this.type(element) === "unit";
		},

		isSea: function isSea(element) {

			return restricted.sea.hasValue(terrainController.name(element));
		},

		isShoal: function isShoal(element) {

			return this.name(element) === "shoal";
		},

		isReef: function isReef(element) {

			return this.name(element) === "reef";
		},

		isRiver: function isRiver(element) {

			return this.name(element) === "river";
		},

		isBeach: function isBeach(element) {

			if (this.isSea(element)) {

				var neighbors = this.position(element).neighbors();

				for (var i = 0; i < neighbors.length; i += 1) {

					if (!isSea(neighbors[i])) {

						return true;
					}
				}
			}

			return false;
		},

		isPlain: function isPlain(element) {

			return this.name(element) === "plain";
		},

		restrictions: function restrictions(type) {

			return Object.assign(restricted[type]);
		}
	};

	/*--------------------------------------------------------------------------------------*\
    \\ all functions below are curried functions, they are declared seperately so that they //
    // can maintain the context of "this"                                                   \\
    \*--------------------------------------------------------------------------------------*/

	/*
 	returns the passed in element (element), modified by adding the name of its drawing (drawing)
 		@element = Object, Terrain, Building or Unit
 	@drawing = String
 */

	controller.setDrawing = curry(function (drawing, element) {

		if (!isString(drawing)) {

			throw new Error("the second argument of \"setDrawing\": drawing, must be a string.", "controller/terrain.js");
		}

		element.draw = drawing;

		return element;
	}.bind(controller)),

	/*
 	returns the passed in element (element), modified by adding the orientaion of its drawing (drawing)
 	
 	@orientaion = String
 	@element = Object, Terrain, Building or Unit
 */

	controller.setOrientation = curry(function (orientation, element) {

		var copy = Object.assign(element);

		if (!isString(drawing)) {

			throw new Error("the second argument of \"setDrawing\": drawing, must be a string.", "controller/terrain.js");
		}

		element.orientaion = orientaion;

		return element;
	}.bind(controller)), controller.setIndex = curry(function (index, element) {

		var copy = Object.assign(element);

		copy.index = index;

		return copy;
	}.bind(controller)),

	/*
 	returns a boolean of whether the input element (element) is on the input position (target)
 		@element = Object, Terrain, Building or Unit
 */

	controller.on = curry(function (target, element) {

		var position = this.position(element);

		// var error = validate.isCoordinate(target) || validate.isCoordinate(position);

		// if (error) {

		// 	throw error;
		// };

		return position.x === target.x && position.y === target.y;
	}.bind(controller));

	return controller;
}();

},{"../tools/curry.js":93,"../tools/validator.js":104}],18:[function(require,module,exports){
"use strict";

/* ------------------------------------------------------------------------------------------------------*\
   
    controller/unit.js controls the updating, modification and actions performed on unit objects
   
\* ------------------------------------------------------------------------------------------------------*/

Validator = require("../tools/validator.js");
transmit = require("../sockets/transmitter.js");
composer = require("../tools/composition.js");
createDefaults = require("../definitions/defaults.js");
buildingController = require("../controller/building.js");
terrainDefaults = require("../definitions/properties.js");
buildingDefaults = require("../definitions/buildings.js");
unitDefaults = require("../definitions/units.js");
playerController = require("../controller/player.js");
curry = require("../tools/curry.js");

module.exports = function () {

    var validate = new Validator("controller/unit.js");
    var defaults = createDefaults(unitDefaults, buildingDefaults, terrainDefaults);

    var controller = composer.include(["player", "getPlayer", "owns", "on", "color", "health", "position", "type", "name", "defense", "co", "isUnit"]).compose({

        /*
            returns the id of a unit object
             @unit = Object, unit
        */

        id: function id(unit) {

            return unit.id;
        },

        /*
            returns a boolean as to whether a unit object is loaded or not
             @unit = Object, unit
        */

        isLoaded: function isLoaded(unit) {

            var loaded = unit.loaded;

            return loaded && loaded.length;
        },

        /*
            returns the loaded elements of the passed in unit
             @unit = Object, unit
        */

        loaded: function loaded(unit) {

            return unit.loaded;

            // return loaded && loaded.length ? loaded : false; 
        },

        /*
            returns a boolean as to whether the passed in unit object is a ranged unit
             @unit = Object, unit
        */

        ranged: function ranged(unit) {

            return defaults.range(unit).high > 1;
        },

        /*
            modifies a passed in unit (unit) by marking it as selected, then returns it
             @unit = Object, unit
        */

        select: function select(unit) {

            unit.selectable = false;

            return unit;
        },

        ammo: function ammo(unit) {

            return unit.ammo;
        },

        fuel: function fuel(unit) {

            return unit.fuel;
        },

        movement: function movement(unit) {

            return unit.movement;
        },

        vision: function vision(unit) {

            return unit.vision;
        },

        refuel: function refuel(unit) {

            unit.fuel = defaults.fuel(unit);

            return unit;
        },

        reload: function reload(unit) {

            unit.ammo = defaults.ammo(unit);

            return unit;
        },

        recover: function recover(unit) {

            unit.movement = defaults.movement(unit);
            unit.selectable = true;
            unit.attacked = false;
            unit.captured = false;
            unit.actions = {};
            unit.targets = [];
            unit.damage = [];
            unit.moved = 0;

            return unit;
        },

        needsRepair: function needsRepair(unit) {

            var repairing,
                l = 3;
            var repair = ['health', 'fuel', 'ammo'];

            while (l--) {

                repairing = repair[l];

                if (unit[repairing] < defaults[repairing](unit)) {

                    return true;
                }
            }

            return false;
        },

        repair: function repair(unit) {

            // address player getting in this function
            var player = this.getPlayer(unit);
            var cost = defaults.cost(unit) / 10;

            if (this.needsRepair(unit) && playerController.canPurchase(player, cost)) {

                playerController.purchase(player, cost);

                return composer.functions([this.heal(false), this.reload, this.refuel], Object.assign(unit));
            }

            return unit;
        },

        previous: function previous(unit) {

            var moves = unit.moves;

            return moves[moves.length - 1];
        },

        attack: function attack(attacker, attacked, damage) {

            attacker.attacked = true;
            attacker.selectable = false;

            return this.damage(attacked, damage);
        },

        attacked: function attacked(unit) {

            return unit.attacked;
        },

        resetTargets: function resetTargets(unit) {

            unit.targets = [];

            return unit;
        },

        action: function action(unit) {

            return unit.action;
        },

        getActions: function getActions(unit) {

            var actions = unit.actions;

            return actions;
        },

        selectable: function selectable(unit) {

            return unit.selectable;
        },

        occupies: function occupies(unit) {
            // maybe change this

            var square = app.map.occupantsOf(this.position(unit));

            return square.building || square.terrain;
        },

        moveBack: function moveBack(unit) {

            var moved = unit.moved;

            if (moved) {

                this.move(this.previous(unit), -moved, unit);
            }
        },

        canTransport: function canTransport(unit2, unit1) {

            var loadable = this.canLoad(unit2);
            var type = this.name(unit1).toLowerCase();

            return loadable && loadable.indexOf(type) >= 0;
        },

        canLoad: function canLoad(unit) {

            return defaults.load(unit);
        },

        showAttackRange: function showAttackRange(unit) {

            if (this.ranged(unit)) {

                app.path.set(this.attackRange(unit));
            } else {

                var range = app.path.reachable(unit, defaults.movement(unit));
                var visited = app.path.visited();
                var neighbor,
                    neighbors,
                    length = range.length;

                for (var j, i = 0; i < length; i += 1) {

                    neighbors = app.map.getNeighbors(this.position(range[i]));

                    for (j = 0; j < neighbors.length; j += 1) {

                        neighbor = neighbors[j];

                        if (!visited.element(neighbor)) {

                            visited.close(neighbor);
                            range.push(neighbor);
                        }
                    }
                }

                app.path.clean();
                app.attackRange.set(range);
            }

            return unit;
        },

        attackRange: function attackRange(unit) {

            var array = [];

            var range = defaults.range(unit);

            var high = this.range(range.high, unit);

            var low = this.range(range.low - 1, unit);

            var push,
                l,
                h = high.length;

            while (h--) {

                push = true;

                l = low.length;

                while (l--) {

                    if (this.on(this.position(low[l]), high[h])) {

                        push = false;
                    }
                }

                if (push) {

                    array.push(high[h]);
                }
            }

            return array;
        }

        // turn: function () { <-- take out of unit object
        //    
        //     return app.players.current().owns(this); 
        // }

        // showHealth: function () { return Math.ceil(health / 10)}, <-- take out of object 

    }, buildingController, playerController);

    /*--------------------------------------------------------------------------------------*\
    \\ all functions below are curried functions, they are declared seperately so that they //
    // can maintain the context of "this"                                                   \\
    \*--------------------------------------------------------------------------------------*/

    /*
        finds and returns either the index of a passed in unit (loaded), or negative 1 if it is not found, 
        in the loaded array of a passed in unit (unit)
         @unit = Object, unit
        @loaded = Object, unit
    */

    controller.indexOfLoaded = curry(function (loaded, unit) {

        if (isNaN(loaded.id)) {

            throw new Error("Invalid unit id found in second argument of \"indexOfLoaded\".");
        }

        if (!unit.loaded) {

            throw new Error("Loaded property missing from unit in the first argument of \"indexOfLoaded\".");
        }

        var loaded = unit.loaded;

        var l = loaded.length;

        while (l--) {

            if (loaded[l].id === loaded.id) {

                return l;
            }
        }

        return -1;
    }.bind(controller));

    /*
        returns a boolean as to whether a unit object is within a specified range or not
         @unit = Object, unit
        @range = Array, [{x:Integer, y:integer}]
    */

    controller.inRange = curry(function (range, unit) {

        var l = range.length;

        while (l--) {

            if (this.on(range[l], unit)) {

                return true;
            }
        }

        return false;
    }.bind(controller));

    /*
        returns a an array of attackable units in a specified range (range), 
        from a specified position (position), 
        by a specified unit (unit)
         @unit = Object, unit
        @position = Object, {x:Integer, y:Integer}
        @range = Array, [position]
    */

    controller.attackable = curry(function (position, range, unit) {
        // changed so that it always returns an array, will have to check for length

        // get list of units
        var array = [];
        var l = range.length;

        while (l--) {

            element = range[l];

            if (this.type(element) === 'unit' && !this.owns(unit, element) && this.canAttack(unit, element)) {

                array.push(element);
            }
        }

        // if their are any units in the attackable array, then return it, otherwise return false
        return array;
    }.bind(controller));

    /*
        modifies a passed in unit (unit) by adding a passed in unit (passanger) to it's loaded array, then returns it
         @unit = Object, unit
        @passenger = Object, unit
    */

    controller.load = curry(function (unit, passanger) {

        if (isNaN(unit.id)) {

            throw new Error("Invalid unit id found in first argument of \"load\".", "controller/unit.js");
        }

        if (isNaN(passanger.id)) {

            throw new Error("Invalid unit id found in second argument of \"load\".", "controller/unit.js");
        }

        app.map.removeUnit(passanger);

        unit.loaded.push(passanger);

        if (app.user.turn()) {
            // <--- check out

            transmit.load(unit.id, passanger.id);

            this.select(unit);
        }

        console.log(unit);

        return unit;
    }.bind(controller));

    /*
        modifies a passed in unit (unit) by removing an element at the passed in index from its loaded array, 
        then returns the removed element
         @unit = Object, unit
        @index = Integer
    */

    controller.unload = curry(function (index, unit) {

        if (isNaN(index)) {

            throw new Error("First argument \"index\" of \"unload\" must be an integer", "controller/unit.js");
        }

        if (!unit.loaded) {

            throw new Error("Loaded property missing from unit in the second argument of \"unload\".", "controller/unit.js");
        }

        if (!unit.loaded[index]) {

            throw new Error("Index supplied to \"unload\" is undefined in the loaded property.", "controller/unit.js");
        }

        return unit.loaded.splice(index, 1)[0];
    }.bind(controller));

    /*
        removes a unit from a passed in unit's (unit) loaded array at the passed in index (unloading), 
        then modifies the removed unit, setting its position to the passed in position (target) and returns it
         @unit = Object, unit
        @unloading = Integer
        @target = Object, {x:Integer, y:Integer}
    */

    controller.drop = curry(function (unloading, target, unit) {

        if (isNaN(unloading)) {

            throw new Error("Second argument \"unloading\" of \"drop\" must be an integer.", "controller/unit.js");
        }

        if (!unit.loaded) {

            throw new Error("Loaded property missing from unit in the first argument of \"drop\".", "controller/unit.js");
        }

        if (validate.isCoordinate(target)) {

            throw new Error("Invalid target position supplied as third argument of \"drop\".", "controller/unit.js");
        }

        //  var index = isNaN(unloading) ? unit.loaded.indexOf(unloading) : unloading; // <-- extract logic

        var passanger = this.unload(unit, index);

        this.setPosition(passanger, new Position(target.x, target.y));

        this.select(passanger);

        // app.map.addUnit(unit); <-- take out of unit

        if (app.user.turn()) {

            transmit.unload(unit.id, target, index);

            this.select(unit);

            // figure this out.. (function defined doesnt belong in unit object)
            // this.deselect();
        }

        return passanger;
    }.bind(controller));

    /*
        returns a new unit with the combined health, ammo, and fuel of two passed in unit objects (unit1 and unit2)
         @unit = Object, unit
        @passenger = Object, unit
    */

    controller.join = curry(function (unit2, unit1) {

        if (this.type(unit1) !== this.type(unit2)) {

            throw new Error("Units must be of the same type to be joined.", "controller/unit.js");
        }

        // copy unit2
        var unit = Object.assign(unit2);
        var min = Math.min;

        // emit units to be combined to other players games for syncronization
        if (app.user.turn()) {

            transmit.join(unit1, unit2);
        }

        unit.health = min(unit1.health + unit2.health, defaults.health(unit1));
        unit.ammo = min(unit1.ammo + unit2.ammo, defaults.ammo(unit1));
        unit.fuel = min(unit1.fuel + unit2.fuel, defaults.fuel(unit1));

        // remove selected unit
        // app.map.removeUnit(this.raw()); <-- take out of unit object

        // FIGURE IT OUT!! <--- change method location
        // this.deselect();

        return unit;
    }.bind(controller));

    controller.damage = curry(function (damage, unit) {

        unit.health -= damage;

        return unit;
    }.bind(controller));

    controller.moved = curry(function (position, path, unit) {

        if (isNaN(path.length)) {

            throw new Error("Second argument of \"moved\" must be an array.", "controller/unit.js");
        }

        var moved = 0,
            len = path.length;

        for (var i = 1; i < len; i += 1) {

            moved += this.moveCost(path[i], unit);

            if (this.on(position, path[i])) {

                return moved;
            }
        }

        return moved;
    }.bind(controller));

    controller.move = curry(function (target, moved, unit) {
        // try to make functional

        if (!isArray(unit.moves)) {

            throw new Error("The \"moves\" property in argument \"unit\" of \"move\" must be an array.", "controller/unit.js");
        }

        if (isNaN(unit.movement)) {

            throw new Error("Unit in argument \"unit\" of \"move\" has an Invalid \"movement\" property, \"movement\" must be represented as an integer.", "controller/unit.js");
        }

        if (isNaN(unit.fuel)) {

            throw new Error("Unit in argument \"unit\" of \"move\" has an Invalid \"fuel\" property, \"fuel\" must be represented as an integer.", "controller/unit.js");
        }

        if (isNaN(unit.id)) {

            throw new Error("Invalid unit id found in argument \"unit\" of \"move\".", "controller/unit.js");
        }

        var position = this.position(unit);

        unit = composer.functions([this.setMovement(this.movement(unit) - moved), this.setFuel(this.fuel(unit) - moved), this.setMoved(moved), this.resetTargets], unit);

        // change selected units position to the specified location
        unit = app.map.moveUnit(unit, new Position(target.x, target.y));

        // track how much fuel has been used
        this.getPlayer(unit).score.fuel(moved);

        // save move
        if (moved < 0) {

            this.removeMove(unit);
        } else if (moved > 0) {

            this.addMove(position, unit);
        }

        return unit;
    }.bind(controller));

    controller.setAction = curry(function (action, unit) {

        unit.action = action;

        return unit;
    }.bind(controller));

    controller.setActions = curry(function (actions, unit) {

        unit.actions = actions;

        return unit;
    }.bind(controller));

    controller.getTargets = curry(function (targets, neighbors, index, unit) {

        if (this.isLoaded(unit)) {

            var neighbor,
                l = neighbors.length;

            while (l--) {

                neighbor = neighbors[l];

                if (this.isUnit(neighbor) || this.canLoad(unit)) {

                    targets.push(neighbor);
                }
            }
        }

        return isNaN(index) ? targets : targets[index];
    }.bind(controller));

    controller.setMovement = curry(function (movement, unit) {

        unit.movement = movement;

        return unit;
    }.bind(controller));

    controller.setFuel = curry(function (fuel, unit) {

        unit.fuel = fuel;

        return unit;
    }.bind(controller));

    controller.setMoved = curry(function (moved, unit) {

        unit.moved = moved;

        return unit;
    }.bind(controller));

    controller.setTargets = curry(function (targets, unit) {

        unit.targets = targets;

        return unit;
    }.bind(controller));

    controller.addMove = curry(function (move, unit) {

        if (!isArray(unit.moves)) {

            throw new Error("\"moves\" property on argument \"unit\" in \"addMove\" must be an array.", "controller/unit.js");
        }

        unit.moves.push(new Position(move.x, move.y));

        return unit;
    });

    controller.removeMove = curry(function (move, unit) {

        if (!isArray(unit.moves)) {

            throw new Error("\"moves\" property on argument \"unit\" in \"removeMove\" must be an array.", "controller/unit.js");
        }

        unit.moves.pop();

        return unit;
    });

    controller.targets = curry(function (neighbors, index, unit) {

        return this.getTargets(targets, neighbors, index, unit);
    }.bind(controller));

    controller.target = curry(function (index, unit) {

        if (isNaN(index)) {

            throw new Error("Invalid index supplied in second argument of \"target\".", "controller/unit.js");
        }

        if (!unit.damage) {

            throw new Error("Damage parameter is missing from unit in first argument of \"target\".", "controller/unit.js");
        }

        if (!unit.damage[index]) {

            throw new Error("Damage calculation is undefined at index from unit supplied as first argument of \"target\".", "controller/unit.js");
        }

        // edit this maybe... use try catch

        return unit.damage[index] !== undefined ? unit.damage[index] : unit.damage[index] = app.calculate.damage(app.map.getNeighbors(this.position(unit)), unit);
    }.bind(controller));

    controller.heal = curry(function (health, unit) {

        unit.health = Math.min(unit.health + (health || 1), defaults.health(unit));

        return unit;
    }.bind(controller));

    controller.setTargets = curry(function (targets, unit) {

        unit.targets = targets;

        return unit;
    }.bind(controller));

    controller.movementCost = curry(function (obsticle, unit) {

        return defaults.movementCosts(unit)[obsticle];
    }.bind(controller));

    controller.canAttack = curry(function (attacked, attacker) {

        return !this.canLoad(attacker) && defaults.canAttack(attacker).indexOf(defaults.transportaion(attacked)) >= 0;
    }.bind(controller));

    controller.canCapture = curry(function (building, unit) {

        // if the selected unit can capture buildings then continue
        return defaults.capture(unit) && buildingController.isBuilding(building) && !this.owns(building, unit) && this.on(building, unit);
    }.bind(controller));

    controller.canBuildOn = curry(function (location, unit) {

        return this.movementCost(location, unit) < defaults.movement(unit);
    }.bind(controller));

    controller.moveCost = curry(function (obsticle, unit) {

        if (this.isUnit(obsticle)) {

            if (this.owns(obsticle, unit)) {

                obsticle = this.occupies(obsticle);
            } else {

                return this.movement(unit);
            }
        }

        return defaults.movementCost(unit, obsticle);
    }.bind(controller));

    controller.canCombine = curry(function (unit2, unit1) {

        // check if the unit being landed on belongs to the current player and is not the same unit
        return unit1 && unit2 && this.isUnit(unit1) && this.isUnit(unit2) && !this.isSame(unit1, unit2)

        // check if is the same unit type and can be joined
        && (this.name(unit1) === this.name(unit2) && this.health(unit1) < defaults.health(unit1)

        // check if is a valid transport and capable of transporting
        || this.canTransport(unit2, unit1) && this.loaded(unit2).length < defaults.maxLoad(unit2));
    }.bind(controller));

    controller.actions = curry(function (target, unit) {

        var exists = false;

        var attackable = this.attackable(terrainController.position(target), this.attackRange(unit), unit);

        var actions = {

            attack: attackable.length > 0 ? attackable : false,
            capture: this.canCapture(target, unit),
            drop: this.loaded(unit) || false
        };

        var player = this.getPlayer(unit); // maybe extract this.

        if (this.isUnit(target) && playerController.isTurn(player) && this.canCombine(target, unit)) {

            exists = true;

            if (this.name(target) === this.name(unit)) {

                actions.join = target;
            } else {

                actions.load = target;
            }
        }

        actions.wait = !actions.load;

        return actions.attack || actions.capture || actions.drop || actions.wait || exists ? actions : false;
    }.bind(controller));

    controller.range = curry(function (allowed, unit) {

        var allowed = allowed || this.movement(unit);
        var position = this.position(unit);
        var dimensions = app.map.dimensions();
        var range = allowed * 2;
        var right = position.x + allowed;
        var left = position.x - allowed;
        var array = [],
            abs = Math.abs;

        // get the diamond pattern of squares
        for (var i, y, t, b, x = left, inc = 0; x <= right, inc <= range; x += 1, inc += 1) {

            i = inc > allowed ? range - inc : inc;
            t = (t = position.y - i) > 0 ? t : 0; // top
            b = (b = position.y + i) < dimensions.y ? b : dimensions.y - 1; // bottom

            // add all reachable squares to array
            if (x >= 0 && x <= dimensions.x) {

                for (y = t; y <= b; y += 1) {

                    array.push(app.map.top(new Position(x, y))); // <-- maybe seperate concerns
                }
            }
        }

        return array;
    }.bind(controller));

    controller.movementRange = curry(function (distance, unit) {

        var range = [];
        var reachable = app.path.reachable(unit);
        var l = reachable.length;

        while (l--) {

            if (this.on(this.position(reachable[l]), unit)) {

                range.unshift(reachable[l]);
            } else if (!this.isUnit(reachable[l]) || this.owns(unit, reachable[l])) {

                range.push(reachable[l]);
            }
        }

        app.path.clean();

        return range;
    }.bind(controller));

    controller.inAttackRange = curry(function (unit2, unit1) {

        return this.inRange(unit2, this.attackRange(unit1));
    }.bind(controller));

    controller.inMovementRange = curry(function (unit2, unit1) {

        return this.inRange(unit2, this.movementRange(false, unit1));
    }.bind(controller));

    controller.isSame = curry(function (unit1, unit2) {

        return this.id(unit1) === this.id(unit2);
    }.bind(controller));

    /*
        modifies the passed in unit, setting its position then returning it
         @unit = Object, unit
        @position = Object, {x:Integer, y:Integer}
    */

    controller.setPosition = curry(function (position, unit) {

        var error = validate.isCoordinate(position);

        if (error) {

            throw error;
        }

        unit.position = new Position(position.x, position.y);

        return unit;
    }.bind(controller));

    return controller;
}();

},{"../controller/building.js":5,"../controller/player.js":13,"../definitions/buildings.js":19,"../definitions/defaults.js":20,"../definitions/properties.js":22,"../definitions/units.js":24,"../sockets/transmitter.js":88,"../tools/composition.js":91,"../tools/curry.js":93,"../tools/validator.js":104}],19:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    a list of each building and the inits they are capable of producing

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.units = require('../definitions/units.js');

module.exports = {

    base: {
        infantry: app.units.infantry,
        mech: app.units.mech,
        recon: app.units.recon,
        apc: app.units.apc,
        antiAir: app.units.antiAir,
        tank: app.units.tank,
        midTank: app.units.midTank,
        artillery: app.units.artillery,
        missles: app.units.missles,
        rockets: app.units.rockets,
        neoTank: app.units.neoTank
    },

    airport: {
        tCopter: app.units.tCopter,
        bCopter: app.units.bCopter,
        fighter: app.units.fighter,
        bomber: app.units.bomber
    },

    seaport: {
        lander: app.units.lander,
        cruiser: app.units.cruiser,
        submerine: app.units.submerine,
        bShip: app.units.bShip
    }
};

},{"../definitions/units.js":24,"../settings/app.js":83}],20:[function(require,module,exports){
"use strict";

app.properties = require("../definitions/properties.js");
terrainController = require("../controller/terrain.js");
composer = require("../tools/composition.js");

module.exports = function (units, buildings, terrain) {

	var elements = {
		unit: units,
		building: buildings,
		terrain: terrain
	};

	var healing = {

		hq: ["foot", "wheels"],
		city: ["foot", "wheels"],
		base: ["foot", "wheels"],
		seaport: ["boat"],
		airport: ["flight"]
	};

	var get = function get(element) {

		return elements[element.type.toLowerCase()][element.name.toLowerCase()];
	};

	var property = function property(element) {

		return get(element).properties;
	};

	var cost = function cost(element) {

		return get(element).cost;
	};

	return {

		canHeal: function canHeal(building) {

			var name = buildingController.name(building);

			if (!isString(name)) {

				throw new Error("\"name\" property of argument \"building\" must be a string.");
			}

			return healing[buildingController.name(building).toLowerCase()] || false;
		},

		name: function name(type) {

			var name = (elements.terrain[type] || elements.building[type] || elements.unit[type]).name;

			return name;
		},

		find: function find(type) {

			return elements.unit[type] || false;
		},

		ammo: function ammo(unit) {

			return property(unit).ammo;
		},

		fuel: function fuel(unit) {

			return property(unit).fuel;
		},

		movement: function movement(unit) {

			return property(unit).movement;
		},

		vision: function vision(unit) {

			return property(unit).vision;
		},

		canAttack: function canAttack(unit) {

			return property(unit).canAttack;
		},

		range: function range(unit) {

			return property(unit).range;
		},

		damageType: function damageType(unit) {

			return property(unit).damageType;
		},

		movementCost: function movementCost(unit, obsticle) {

			var name = obsticle.name.toLowerCase();

			var key = {

				plains: "plain",
				woods: "wood",
				base: "building",
				seaport: "building",
				airport: "building",
				hq: "building"

			}[name];

			return property(unit).movementCosts[key || name];
		},

		movable: function movable(unit) {

			return property(unit).movable;
		},

		transportation: function transportation(unit) {

			return property(unit).transportation;
		},

		capture: function capture(unit) {

			return property(unit).capture;
		},

		weapon1: function weapon1(unit) {

			return property(unit).weapon1;
		},

		weapon2: function weapon2(unit) {

			return property(unit).weapon2;
		},

		maxLoad: function maxLoad(unit) {

			return property(unit).maxLoad;
		},

		load: function load(unit) {

			return property(unit).load;
		},

		loaded: function loaded(unit) {

			return property(unit).loaded;
		},

		health: function health() {

			return 100;
		},

		cost: function cost(unit) {

			return get(unit).cost;
		}
	};
};

},{"../controller/terrain.js":17,"../definitions/properties.js":22,"../tools/composition.js":91}],21:[function(require,module,exports){
'use strict';

/* ---------------------------------------------------------------------- *\
    
    Obsticles.js holds the each possible object for the map 

\* ---------------------------------------------------------------------- */

var obsticle = require('../map/obsticle.js');

module.exports = {
    mountain: obsticle('mountain', 2),
    wood: obsticle('wood', 3),
    building: obsticle('building', 2),
    plain: obsticle('plain', 1),
    snow: obsticle('snow', 1),
    unit: obsticle('unit', 0)
};

},{"../map/obsticle.js":47}],22:[function(require,module,exports){
'use strict';

/* ---------------------------------------------------------------------- *\
    
    Properties.js holds the properties of each map object

\* ---------------------------------------------------------------------- */

createProperty = require('../map/property.js');
obsticles = require('../definitions/obsticles.js');
Validator = require('../tools/validator.js');

module.exports = function () {

    //    Validator = require('../tools/validator.js');
    //    console.log(Validator);

    // var validate = new Validator('properties');
    //    var error = validate.hasElements(obsticles, ['wood','building','plain','mountain', 'unit']);

    // if (error) {

    //    throw error;
    //    }

    return {

        tallMountain: createProperty('Mountain', obsticles.mountain),
        tree: createProperty('Woods', obsticles.wood),
        hq: createProperty('HQ', obsticles.building),
        base: createProperty('Base', obsticles.building),
        plain: createProperty('Plains', obsticles.plain),
        unit: createProperty('Unit', obsticles.unit),
        snow: createProperty('Snow', obsticles.snow)
    };
}();

},{"../definitions/obsticles.js":21,"../map/property.js":48,"../tools/validator.js":104}],23:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    Score.js calculates the game score

\* --------------------------------------------------------------------------------------*/

ScoreElement = require('../objects/scoreElement.js');
Score = function Score(previous) {

	this.parameters = ['moneyMade', 'moneySpent', 'mileage', 'damageRecieved', 'damageDone', 'buildingsCaptured', 'buildingsLost', 'buildingsHeld', 'unitsHeld', 'defeated', 'conquered'];

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

	this.score = 0;

	if (previous) {

		this.init(previous);
	}
};

Score.prototype.income = function (money) {

	this.moneyMade.amount += money / 1000;
};

Score.prototype.expenses = function (money) {

	this.moneySpent.amount += money / 1000;
};

Score.prototype.fuel = function (fuel) {

	this.mileage.amount += fuel / 10;
};

Score.prototype.buildings = function (owned) {

	this.buildingsHeld.amount = owned;
};

Score.prototype.capture = function () {

	this.buildingsCaptured.amount += 1;
};

Score.prototype.lostBuilding = function () {

	this.buildingsLost.amount += 1;
};

Score.prototype.damageTaken = function (damage) {

	this.damageRecieved.amount += damage / 10;
};

Score.prototype.damageDealt = function (damage) {

	this.damageDone.amount += damage / 10;
};

Score.prototype.units = function (owned) {

	this.unitsHeld.amount = owned;
};

Score.prototype.lostUnit = function () {

	this.unitsLost.amount += 1;
};

Score.prototype.destroyedUnit = function () {

	this.unitsDestroyed.amount += 1;
};

Score.prototype.defeat = function () {

	this.defeated.amount += 1;
};

Score.prototype.conquer = function () {

	this.conquered.amount += 1;
};

Score.prototype.amount = function (parameter) {

	return this[parameter].amount;
};

Score.prototype.setAmount = function (parameter, amount) {

	this[parameter].amount = amount;
};

Score.prototype.add = function (parameter, amount) {

	this[parameter].amount += amount;
};

Score.prototype.worth = function (parameter) {

	return this[parameter].worth;
};

Score.prototype.turn = function () {

	return this.turns.length;
};

Score.prototype.allTurns = function () {

	return this.turns;
};

Score.prototype.update = function (turn) {

	var scope = this;

	this.parameters.forEach(function (parameter) {

		scope.add(parameter, turn.amount(parameter));
	});

	this.turns.push(turn);
};

Score.prototype.calculate = function () {

	var scope = this;

	return Math.ceil(this.parameters.reduce(function (prev, parameter) {

		return prev + scope.amount(parameter) * scope.worth(parameter);
	}));
};

Score.prototype.display = function () {

	return {

		units: this.unitsHeld.amount,
		lost: this.unitsLost.amount
	};
};

Score.prototype.raw = function () {

	var scope = this,
	    score = {};

	this.parameters.forEach(function (parameter) {
		score[parameter] = scope.amount(parameter);
	});

	score.turns = this.turns;

	return score;
};

Score.prototype.init = function (score) {

	var scope = this;

	this.parameters.forEach(function (parameter) {

		scope.setAmount(parameter, score[parameter].amount);
	});

	this.turns = score.turns;
};

module.exports = Score;

},{"../objects/scoreElement.js":82}],24:[function(require,module,exports){
'use strict';

var _properties;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
            damageType: 'direct',
            baseDamage: {
                infantry: 55,
                mech: 45,
                recon: 12,
                tank: 5,
                midTank: 1,
                neoTank: 1,
                apc: 14,
                artillery: 15,
                rockets: 25,
                antiAir: 5,
                missles: 25,
                bCopter: 7,
                tCopter: 30,
                pipe: 1
            },
            movementCosts: {
                mountain: 2,
                wood: 1,
                plain: 1,
                building: 1
            },
            movable: app.settings.movable.foot,
            transportation: 'foot',
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
            damageType: 'direct',
            baseDamage: {
                infantry: 65,
                mech: 55,
                recon: 85,
                tank: 55,
                midTank: 15,
                neoTank: 15,
                apc: 75,
                artillery: 70,
                rockets: 85,
                antiAir: 65,
                missles: 85,
                bCopter: 9,
                tCopter: 35,
                pipe: 15
            },
            movable: app.settings.movable.foot,
            transportation: 'foot',
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
            damageType: 'direct',
            baseDamage: {
                infantry: 70,
                mech: 65,
                recon: 32,
                tank: 6,
                midTank: 1,
                neoTank: 1,
                apc: 45,
                artillery: 45,
                rockets: 55,
                antiAir: 4,
                missles: 28,
                bCopter: 10,
                tCopter: 35,
                pipe: 1
            },
            movable: app.settings.movable.wheels,
            transportation: 'wheels',
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
            maxLoad: 1,
            load: ['infantry', 'mech'],
            loaded: [],
            canAttack: [],
            movable: app.settings.movable.wheels,
            movementCosts: {
                mountain: 7,
                wood: 2,
                plain: 1,
                building: 1
            },
            transportation: 'wheels',
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
            damageType: 'direct',
            baseDamage: {
                infantry: 105,
                mech: 105,
                recon: 60,
                tank: 25,
                midTank: 10,
                neoTank: 5,
                apc: 50,
                artillery: 50,
                rockets: 55,
                antiAir: 45,
                missles: 55,
                bCopter: 120,
                tCopter: 120,
                fighter: 65,
                bomber: 75,
                pipe: 55
            },
            movable: app.settings.movable.wheels,
            transportation: 'wheels',
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
            damageType: 'direct',
            baseDamage: {
                infantry: 75,
                mech: 70,
                recon: 85,
                tank: 55,
                midTank: 15,
                neoTank: 15,
                apc: 75,
                artillery: 70,
                rockets: 85,
                antiAir: 65,
                missles: 85,
                bCopter: 10,
                tCopter: 40,
                bShip: 1,
                lander: 10,
                cruiser: 5,
                sub: 1,
                pipe: 15
            },
            movable: app.settings.movable.wheels,
            transportation: 'wheels',
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
            damageType: 'direct',
            baseDamage: {
                infantry: 105,
                mech: 95,
                recon: 105,
                tank: 85,
                midTank: 55,
                neoTank: 45,
                apc: 105,
                artillery: 105,
                rockets: 105,
                antiAir: 105,
                missles: 105,
                bCopter: 12,
                tCopter: 45,
                bShip: 10,
                lander: 35,
                cruiser: 45,
                sub: 10,
                pipe: 55
            },
            movable: app.settings.movable.wheels,
            transportation: 'wheels',
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
        properties: (_properties = {
            type: 'artillery',
            name: 'Artillary',
            movement: 5,
            vision: 1,
            damageType: 'ranged',
            range: {
                low: 2,
                high: 3
            }
        }, _defineProperty(_properties, 'damageType', 'direct'), _defineProperty(_properties, 'baseDamage', {
            infantry: 90,
            mech: 85,
            recon: 80,
            tank: 70,
            midTank: 45,
            neoTank: 40,
            apc: 70,
            artillery: 75,
            rockets: 80,
            antiAir: 75,
            missles: 80,
            bShip: 40,
            lander: 55,
            cruiser: 65,
            sub: 60,
            pipe: 45
        }), _defineProperty(_properties, 'movable', app.settings.movable.wheels), _defineProperty(_properties, 'transportation', 'wheels'), _defineProperty(_properties, 'health', 10), _defineProperty(_properties, 'ammo', 10), _defineProperty(_properties, 'fuel', 50), _defineProperty(_properties, 'weapon1', {}), _defineProperty(_properties, 'weapon2', {}), _properties),
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
            damageType: 'ranged',
            baseDamage: {
                infantry: 95,
                mech: 90,
                recon: 90,
                tank: 80,
                midTank: 55,
                neoTank: 50,
                apc: 80,
                artillery: 80,
                rockets: 85,
                antiAir: 85,
                missles: 90,
                bShip: 55,
                lander: 60,
                cruiser: 85,
                sub: 85,
                pipe: 55
            },
            movable: app.settings.movable.wheels,
            transportation: 'wheels',
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
            damageType: 'ranged',
            baseDamage: {
                fighter: 100,
                bomber: 100,
                bCopter: 120,
                tCopter: 120
            },
            movable: app.settings.movable.wheels,
            transportation: 'wheels',
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
            damageType: 'direct',
            baseDamage: {
                infantry: 125,
                mech: 115,
                recon: 125,
                tank: 105,
                midTank: 75,
                neoTank: 55,
                apc: 125,
                artillery: 115,
                rockets: 125,
                antiAir: 115,
                missles: 125,
                bCopter: 22,
                tCopter: 55,
                bShip: 15,
                lander: 40,
                cruiser: 50,
                sub: 15,
                pipe: 75
            },
            movable: app.settings.movable.wheels,
            transportation: 'wheels',
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
            load: ['infantry', 'mech'],
            loaded: [],
            transport: 1,
            movable: app.settings.movable.flight,
            transportation: 'flight',
            health: 10,
            canAttack: [],
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
            damageType: 'direct',
            baseDamage: {
                infantry: 75,
                mech: 75,
                recon: 55,
                tank: 55,
                midTank: 25,
                neoTank: 20,
                apc: 60,
                artillery: 65,
                rockets: 65,
                antiAir: 25,
                missles: 65,
                bCopter: 65,
                tCopter: 95,
                bShip: 25,
                lander: 25,
                cruiser: 55,
                sub: 25,
                pipe: 25
            },
            movable: app.settings.movable.flight,
            transportation: 'flight',
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
            damageType: 'direct',
            baseDamage: {
                bCopter: 100,
                tCopter: 100,
                bomber: 100,
                fighter: 55
            },
            movable: app.settings.movable.flight,
            transportation: 'flight',
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
            damageType: 'direct',
            baseDamage: {
                infantry: 110,
                mech: 110,
                recon: 105,
                tank: 105,
                midTank: 95,
                neoTank: 90,
                apc: 105,
                artillery: 105,
                rockets: 105,
                antiAir: 95,
                missles: 105,
                bShip: 75,
                lander: 95,
                cruiser: 85,
                sub: 95,
                pipe: 95
            },
            movable: app.settings.movable.flight,
            transportation: 'flight',
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
            transport: 2,
            load: ['infantry', 'mech', 'tank', 'midTank', 'apc', 'missles', 'rockets', 'neoTank', 'antiAir', 'artillery', 'recon'],
            loaded: [],
            movable: app.settings.movable.boat,
            transportation: 'boat',
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
            damageType: 'direct',
            baseDamage: {
                bCopter: 115,
                tCopter: 115,
                fighter: 55,
                bomber: 65,
                sub: 90
            },
            transport: 2,
            load: ['tCopter', 'bCopter'],
            loaded: [],
            movable: app.settings.movable.boat,
            transportation: 'boat',
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
            damageType: 'direct',
            baseDamage: {
                bShip: 55,
                lander: 95,
                cruiser: 25,
                sub: 55
            },
            movable: app.settings.movable.boat,
            transportation: 'boat',
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
            damageType: 'ranged',
            baseDamage: {
                infantry: 95,
                mech: 90,
                recon: 90,
                tank: 80,
                midTank: 55,
                neoTank: 50,
                apc: 80,
                artillery: 80,
                rockets: 85,
                antiAir: 85,
                missles: 90,
                bShip: 50,
                lander: 95,
                cruiser: 95,
                sub: 95,
                pipe: 55
            },
            movable: app.settings.movable.boat,
            transportation: 'boat',
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

},{"../settings/app.js":83,"../settings/game.js":85}],25:[function(require,module,exports){
"use strict";

Row = function Row(name, data, type) {

	var d,
	    len = data.length;

	this.row = document.createElement("tr");
	this.row.setAttribute("id", name);
	this.data = [];

	for (var i = 0; i < len; i += 1) {
		if (d = this.field(data[i], type)) {
			this.row.appendChild(d);
			this.data.push(d);
		}
	}
};
Row.prototype.field = function (value, type) {
	var element = document.createElement(type || "td");
	if (value || !isNaN(value)) element.innerHTML = value;
	return element;
};

module.exports = Row;

},{}],26:[function(require,module,exports){
"use strict";

Row = require("./row.js");

Table = function Table(name, items, rows) {

    var row,
        element = document.createElement("table");
    var headings,
        length = items.length;
    var rows = rows || Object.keys(items);

    title = document.createElement("caption");
    title.innerHTML = name;

    element.setAttribute("id", name + "Table");
    element.appendChild(title);
    element.appendChild(headings = new Row(name, rows, "th").row);

    this.elements = items.map(function (item) {
        element.appendChild(row = new Row("player" + item.player + name, rows.map(function (column) {
            return item[column.toLowerCase()];
        })).row);
        return row;
    });

    this.name = name;
    this.parameters = rows;
    this.element = element;
    this.title = title;
    this.columns = new UList(headings);
    this.sort = new Sort(items);
    this.rows = new UList(element).setElements(this.elements);
};
Table.prototype.sortBy = function (parameter) {
    this.setElements(this.sort.by(parameter).max().heap());
};
Table.prototype.setElements = function (list, bool) {

    var table = this.element,
        elements = table.childNodes;
    var l = elements.length - 2,
        name = this.name,
        scope = this;
    var index = this.rows.index();

    while (l--) {
        table.removeChild(table.lastChild);
    }return this.rows.setElements(list.map(function (row) {
        table.appendChild(newRow = new Row("player" + row.player + name, scope.parameters.map(function (column) {
            return row[column.toLowerCase()];
        })).row);
        return newRow;
    })).setIndex(index);
};

module.exports = Table;

},{"./row.js":25}],27:[function(require,module,exports){
"use strict";

module.exports = function (x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
};

},{}],28:[function(require,module,exports){
"use strict";

/* --------------------------------------------------------------------------------------*\
    
    Fader.js creates an object that controls color fading

\* --------------------------------------------------------------------------------------*/

Fader = function Fader(element, color, speed) {
	this.fadeBorder();
	this.setElement(element);
	if (color) this.setColor(color);
	this.setSpeed(speed || 10);
	this.setIncriment(app.settings.colorSwellIncriment);
	this.setTime(new Date());
};
Fader.prototype.element = function () {
	return this.e;
};
Fader.prototype.colors = app.settings.colors;
Fader.prototype.setElement = function (element) {
	this.e = element;
	return this;
};
Fader.prototype.fadeBackground = function () {
	this.fadingName = "Background";
	return this;
};
Fader.prototype.fadeBorder = function () {
	this.fadingName = "Border";
	return this;
};
Fader.prototype.fadeBoth = function () {
	this.fadingName = "Both";
	return this;
};
Fader.prototype.fadingElement = function () {
	return "set" + this.fadingName + "Color";
};
Fader.prototype.setDefault = function (color) {
	this.d = color;
};
Fader.prototype.setColor = function (color) {
	this.setDefault(color);
	this.color = new Hsl(color);
	return this;
};
Fader.prototype.setSpeed = function (speed) {
	this.s = speed;
};
Fader.prototype.setTime = function (time) {
	this.t = time;
};
Fader.prototype.time = function () {
	return this.t;
};
Fader.prototype.setLightness = function (lightness) {
	this.color.lightness = lightness;
};
Fader.prototype.element = function () {
	return this.e;
};
Fader.prototype.speed = function () {
	return this.s;
};
Fader.prototype.fading = function () {
	return this.f;
};
Fader.prototype.setIncriment = function (incriment) {
	this.i = incriment;
};
Fader.prototype.incriment = function () {
	return this.i;
};
Fader.prototype.stop = function () {
	this.f = false;
	clearTimeout(this.fada);
	this.clear();
	return this;
};
Fader.prototype.transparentBorder = function () {
	this.transparent = true;
	return this;
};
Fader.prototype.clear = function () {
	this.callback ? this.callback(null, this.element()) : this[this.fadingElement()](null);
};
Fader.prototype.toWhite = function () {
	this[this.fadingElement()](new Hsl(this.colors.white).format());
};
Fader.prototype.toSolid = function () {
	this[this.fadingElement()](this.setColor(this.defaultColor()).color.format());
};
Fader.prototype.defaultColor = function () {
	return this.d;
};
Fader.prototype.lightness = function () {
	return this.color.lightness;
};
Fader.prototype.increase = function () {
	this.setLightness(this.lightness() + this.incriment());
};
Fader.prototype.decrease = function () {
	this.setLightness(this.lightness() - this.incriment());
};
Fader.prototype.start = function (callback) {
	this.f = true;
	this.fade(callback);
	return this;
};
Fader.prototype.changeElement = function (element) {
	return this.stop().setElement(element).start();
};
Fader.prototype.previous = function () {
	return this.p;
};
Fader.prototype.setPrevious = function (previous) {
	this.p = previous;
};
Fader.prototype.setBorderColor = function (color) {
	this.element().style.borderColor = this.transparent ? color + " transparent" : color;
};
Fader.prototype.setBackgroundColor = function (color) {
	this.element().style.backgroundColor = color;
};
Fader.prototype.setBothColor = function (color) {
	this.setBackgroundColor(color);
	this.setBorderColor(color);
};
Fader.prototype.fade = function (callback) {
	this.callback = callback;
	var scope = this;
	this.fada = setTimeout(function () {
		var prev = scope.previous();
		var lightness = scope.lightness();
		var color = scope.color;
		var inc = scope.incriment();
		scope.setPrevious(lightness);
		callback ? callback(color.format(), scope.element()) : scope[scope.fadingElement()](color.format());
		if (lightness + inc <= 100 + inc && prev < lightness || lightness - inc < 50) scope.increase();else if (lightness - inc >= scope.defaultColor().l && prev > lightness || lightness + inc > 50) scope.decrease();
		return scope.fading() ? scope.fade(callback) : scope.clear();
	}, scope.speed());
};
module.exports = Fader;

},{}],29:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\

    Effect.js holds the coordinates for effects

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
Path = require('../tools/path.js');
app.confirm = require('../controller/confirmation.js');
app.path = new Path();
app.range = new Path();
app.attackRange = new Path();

module.exports = function () {

    var highlight = app.range;
    var _path = app.path;
    var _attackRange = app.attackRange;

    return {
        refresh: function refresh() {
            app.animate('effects');
        },
        clear: function clear() {
            _path.clear();
            highlight.clear();
            _attackRange.clear();
            return this;
        },
        movementRange: function movementRange() {
            return highlight.get();
        },
        path: function path() {
            return _path.get();
        },
        attackRange: function attackRange() {
            return _attackRange.get();
        },
        setMovementRange: function setMovementRange(range) {
            highlight.set(range);
        },
        setPath: function setPath(path) {
            path.set(path);
        },
        setAttackRange: function setAttackRange(range) {
            _attackRange.set(range);
        }
    };
}();

},{"../controller/confirmation.js":7,"../settings/app.js":83,"../tools/path.js":100}],30:[function(require,module,exports){
'use strict';

/* ------------------------------------------------------------------------------------------------------*\
   
   ScrollText.js handles scrolling of text accross the screen, requires the id of the containing element, which must be 
   three elements, one a span, inside something else, inside something else. it also requires a message 
   to be displayed
   
\* ------------------------------------------------------------------------------------------------------*/

module.exports = function () {

    var position;

    var scrollText = function scrollText(container, message, footer, text, scroll) {

        // if this is our first time through initialize all variables
        if (!text) {
            text = document.getElementById(container);
            if (!text) return false;
            text.innerHTML = message;
            if (!position) position = -text.offsetWidth;
            scroll = text.parentNode;
            footer = scroll.parentNode;
            if (!scroll || !footer) throw new Error('something up with the textual scroll, no parents.. needs parents');
        }

        // if the element is no longer visable then stop
        if (!text.offsetParent) {
            position = false;
            return false;
        }

        // if the text has been changed then stop
        if (text.innerHTML !== message) return false;

        // compare the postion of the text to its containor
        if (position !== undefined) {

            // if we are less then the container width then move right
            if (position <= footer.offsetWidth) {
                scroll.style.left = position + 'px';
                position += 1;
            } else {

                // otherwise reset the position to the left
                position = -text.offsetWidth * 4;
            }
        }
        setTimeout(function () {
            scrollText(container, message, footer, text, scroll);
        }, 10);
    };
    return scrollText;
}();

},{}],31:[function(require,module,exports){
'use strict';

app.settings = require('../settings/game.js');
Origin = require('../effects/elements/origin.js');
Sweller = function Sweller(element, min, max, speed) {
    this.setElement(element);
    this.setMin(min);
    this.setMax(max);
    this.setIncriment(app.settings.swellIncriment);
    this.setSpeed(speed || 2);
};

Sweller.prototype.setMin = function (min) {
    this.min = min;
};
Sweller.prototype.setMax = function (max) {
    this.max = max;
};
Sweller.prototype.swell = function (callback) {
    var scope = this;
    var size = this.size();
    var inc = this.incriment();
    var prev = this.previous();

    if (this.swelling()) {
        if (size + inc <= this.max && prev < size || size - inc < this.min) this.setPrevious(size).increase();else if (size - inc >= this.min && prev > size || size + inc > this.min) this.setPrevious(size).decrease();

        callback ? callback(this.element(), this.size(), this.position()) : this.resize();
        this.sweller = setTimeout(function () {
            scope.swell(callback);
        }, 15);
    } else this.clear();
};
Sweller.prototype.swelling = function () {
    return this.a;
};
Sweller.prototype.start = function (callback) {
    this.a = true;
    this.init();
    this.swell(callback);
    return this;
};
Sweller.prototype.stop = function () {
    this.a = false;
    this.clear();
    return this;
};
Sweller.prototype.clear = function () {
    if (!this.origin) throw new Error('origin has not been set');
    clearTimeout(this.sweller);
    this.setLeft(this.origin.x);
    this.setTop(this.origin.y);
    this.setSize(this.origin.size);
    this.resize();
};
Sweller.prototype.centerElement = function (center) {
    this.setLeft(this.left() + center);
    this.setTop(this.top() + center);
};
Sweller.prototype.setLeft = function (position) {
    this.l = position;
};
Sweller.prototype.left = function () {
    return this.l;
};
Sweller.prototype.setTop = function (position) {
    this.t = position;return this;
};
Sweller.prototype.top = function () {
    return this.t;
};
Sweller.prototype.center = function () {
    return this.incriment() / 2;
};
Sweller.prototype.incriment = function () {
    return this.i;
};
Sweller.prototype.setIncriment = function (incriment) {
    this.i = incriment;
};
Sweller.prototype.setSize = function (size) {
    this.s = size;return this;
};
Sweller.prototype.resize = function () {
    var size = this.size();
    this.element().style.width = size + 'px';
    this.element().style.height = size + 'px';
    this.element().style.top = this.top() + 'px';
    this.element().style.left = this.left() + 'px';
    return this;
};
Sweller.prototype.size = function () {
    return this.s;
};
Sweller.prototype.incSize = function (incriment) {
    this.setSize(this.size() + incriment);
};
Sweller.prototype.increase = function () {
    this.incSize(this.incriment());
    this.centerElement(-this.center());
    return this;
};
Sweller.prototype.decrease = function () {
    this.incSize(-this.incriment());
    this.centerElement(this.center());
    return this;
};
Sweller.prototype.position = function () {
    return { x: this.left(), y: this.top() };
};
Sweller.prototype.setPrevious = function (p) {
    this.p = p;return this;
};
Sweller.prototype.previous = function () {
    return this.p;
};
Sweller.prototype.setElement = function (element) {
    this.e = element;
    return this;
};
Sweller.prototype.init = function () {
    var element = this.element();
    var size = element.offsetWidth;
    var left = Number(element.style.left.replace('px', ''));
    var top = Number(element.style.top.replace('px', ''));
    this.setSize(size);
    this.setLeft(left);
    this.setTop(top);
    this.origin = new Origin(left, top, 80);
};
Sweller.prototype.setSpeed = function (speed) {
    this.s = speed;
};
Sweller.prototype.speed = function () {
    return this.s;
};
Sweller.prototype.element = function () {
    return this.e;
};
module.exports = Sweller;

},{"../effects/elements/origin.js":27,"../settings/game.js":85}],32:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    Typing.js controls typing effect in game menus

\* --------------------------------------------------------------------------------------*/

module.exports = {
    defaults: function defaults() {
        return this.speed = app.settings.typingSpeed * 10;
    },
    speed: app.settings.typingSpeed * 10,
    isPrev: function isPrev(sentance) {
        return this.text === sentance;
    },
    letters: function letters(element, sentance, followup) {
        if (!this.isPrev(sentance)) {
            this.text = sentance;
            element.innerHTML = '';
            return this.type(element, sentance, 0, followup);
        }
        return false;
    },
    type: function type(element, sentance, index, followup) {
        var scope = this;
        this.typer = setTimeout(function () {
            if (sentance[index] && scope.isPrev(sentance)) {
                element.innerHTML += sentance[index];
                index += 1;
                scope.type(element, sentance, index, followup);
            } else {
                if (followup) followup(element);
                if (scope.isPrev(sentance)) scope.reset();
                return false;
            }
        }, this.speed);
    },
    reset: function reset() {
        clearTimeout(this.typer);
        delete this.text;
    },
    setSpeed: function setSpeed(speed) {
        this.speed = speed * 10;
    }
};

},{}],33:[function(require,module,exports){
'use strict';

/* -------------------------------------------------------------------------------------- *\
	
	Visuals controls the visuals that will be displayed, selectable via the options menu

\* -------------------------------------------------------------------------------------- */

module.exports = function () {

	var _element = document.createElement("ul");

	var _options = ['a', 'b', 'c', "none"].map(function (option) {

		var item = document.createElement("li");
		item.innerHTML = option;
		_element.appendChild(item);
	});

	var list = new List(["A", "B", "C", "None"]);

	var descriptions = {

		none: "No visuals.",
		a: "View battle and capture animations.",
		b: "Only view battle animations.",
		c: "Only view player battle animations."
	};

	var describe = function describe(d) {

		console.log("describe: " + d);
	};

	return {

		element: function element() {

			return _element;
		},

		options: function options() {

			return _options;
		},

		select: function select() {

			list.next();
		},

		set: function set(d) {

			describe(descriptions[d]);
		}
	};
};

// category theory for compuer scientists

},{}],34:[function(require,module,exports){
"use strict";

// ------------------------------------------ settings -----------------------------------------------------------------

app = require("../settings/app.js"); // app holds all elements of the application 
app.settings = require("../settings/game.js"); // app.settings holds application settings
app.socket = require("../sockets/socket.js");

// ------------------------------------------- tools --------------------------------------------------------------------

app.init = require("../tools/init.js"); // app.init creates a new canvas instance
app.request = require("../tools/request.js"); //handles AJAJ calls where needed
app.dom = require("../tools/dom.js"); // app.dom is a list of functions used to assist manipulating the dom
app.calculate = require("../tools/calculate.js"); //app.calculate handles calculations like pathfinding etc
app.increment = require("../tools/increment.js");

// ------------------------------------------- input --------------------------------------------------------------------

app.touch = require("../input/touch.js"); // handle touch screen operations
app.key = require("../input/keyboard.js"); // handles keyboard input

// -------------------------------------------- menu --------------------------------------------------------------------

app.login = require("../menu/login.js"); // login control
app.modes = require("../menu/modes.js"); // app.modes holds functions for the selection of game modes / logout etc..
app.options = require("../menu/options/optionsMenu.js"); // app.options handles the in game options selection, end turn, save etc.
app.scroll = require("../menu/scroll.js"); // app.game.settings consolidates holds settings for the game

// ----------------------------------------- definitions ----------------------------------------------------------------

app.units = require("../definitions/units.js"); // app.units is a repo for the units that may be created on the map and their stats
app.buildings = require("../definitions/buildings.js"); // holds building blueprints
app.obsticles = require("../definitions/obsticles.js"); // holds obsticles
app.properties = require("../definitions/properties.js"); // holds properties

// ------------------------------------------ map -------------------------------------------------------------------

app.property = require("../map/property.js");
app.obsticle = require("../map/obsticle.js");

// ------------------------------------------ animation -------------------------------------------------------------------

app.animations = require("../animation/animations.js"); // app.animations is a collection of animations used in the game
app.draw = require("../animation/draw.js"); // app.draw controls drawing of animations
app.animate = require("../animation/animate.js"); // app.animate triggers game animations

// ------------------------------------------ effects -------------------------------------------------------------------

app.highlight = require("../effects/highlight.js");

// ------------------------------------------ hud -------------------------------------------------------------------

app.hud = require("../huds/hud.js");

// ------------------------------------------ user -------------------------------------------------------------------

app.co = require("../user/co.js"); // app.co holds all the co"s, their skills and implimentation
app.user = require("../user/user.js");

// ---------------------------------------- controllers -----------------------------------------------------------------

app.target = require("../controller/target.js");
app.players = require("../controller/players.js");
app.map = require("../controller/map.js");
app.maps = require("../controller/maps.js");
app.cursor = require("../controller/cursor.js");
app.screen = require("../controller/screen.js");
app.chat = require("../controller/chat.js");
app.game = require("../controller/game.js"); //controls the setting up and selection of games / game modes 

module.exports = app;

},{"../animation/animate.js":1,"../animation/animations.js":2,"../animation/draw.js":3,"../controller/chat.js":6,"../controller/cursor.js":8,"../controller/game.js":9,"../controller/map.js":10,"../controller/maps.js":11,"../controller/players.js":14,"../controller/screen.js":15,"../controller/target.js":16,"../definitions/buildings.js":19,"../definitions/obsticles.js":21,"../definitions/properties.js":22,"../definitions/units.js":24,"../effects/highlight.js":29,"../huds/hud.js":37,"../input/keyboard.js":40,"../input/touch.js":41,"../map/obsticle.js":47,"../map/property.js":48,"../menu/login.js":68,"../menu/modes.js":69,"../menu/options/optionsMenu.js":72,"../menu/scroll.js":74,"../settings/app.js":83,"../settings/game.js":85,"../sockets/socket.js":87,"../tools/calculate.js":90,"../tools/dom.js":94,"../tools/increment.js":96,"../tools/init.js":97,"../tools/request.js":101,"../user/co.js":107,"../user/user.js":109}],35:[function(require,module,exports){
'use strict';

app.dom = require('../tools/dom.js');
playerController = require("../controller/player.js");

StatusHud = function StatusHud() {

    this._context = undefined;
    this._previous = undefined;
    this._gold = undefined;
};

StatusHud.prototype.visibility = function (visibility) {

    return document.getElementById('coStatusHud').style.display = visibility;
};

StatusHud.prototype.show = function () {

    this.visibility('');
    this._previous = undefined;
};

StatusHud.prototype.hide = function () {

    this.visibility('none');
};

StatusHud.prototype.power = function () {

    return this._context;
};

StatusHud.prototype.display = function (player, location) {

    if (location !== this._previous || this._gold !== playerController.gold(player)) {

        this._previous = location;

        var coHud = document.getElementById('coStatusHud');

        // create container section, for the whole hud
        var hud = document.createElement('section');
        hud.setAttribute('id', 'coStatusHud');

        if (location === 'left') {

            hud.style.left = '864px';
        }

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
        playerGold.innerHTML = this._gold = app.user.turn() ? playerController.gold(player) : '?';
        gold.appendChild(playerGold);

        // put it all together and insert it into the dom
        hud.appendChild(gold);
        hud.appendChild(power);

        if (coHud) {

            coHud.parentNode.replaceChild(hud, coHud);
        } else {

            document.body.insertBefore(hud, app.dom.insertLocation);
        }

        // return the context for animation of the power bar
        return this.context = context;
    }
    return false;
};

module.exports = StatusHud;

},{"../controller/player.js":13,"../tools/dom.js":94}],36:[function(require,module,exports){
"use strict";

terrainController = require("../controller/terrain.js");

Feature = function Feature(selected) {

    this.element = document.createElement("div");
    this.element.setAttribute("id", "hud");
    this.element.style.backgroundColor = "yellow";

    if (selected) {

        this.set(selected);
    }
};

Feature.prototype.clear = function () {

    while (this.element.firstChild) {

        this.element.removeChild(this.element.firstChild);
    }
};

Feature.prototype.hidden = function () {

    return this.element.style.display === "none";
};

Feature.prototype.show = function () {

    this.element.style.display = null;

    this.setElement(app.cursor.selected());
};

Feature.prototype.hide = function () {

    this.element.style.display = "none";
};

Feature.prototype.size = function (canvas) {

    var screenWidth = app.screen.width();
    var width = app.settings.hudWidth + 20;
    var left = app.settings.hudLeft + 150 - width;

    if (app.cursor.side("x") === "right") {

        left = screenWidth - (screenWidth - width) + 100;
    }

    this.element.style.height = (app.settings.hudHeight + 20).toString() + "px";
    this.element.style.left = left.toString() + "px";
    this.element.style.width = width.toString() + "px";

    canvas.setAttribute("class", "hudCanvas");
    canvas.style.left = (120 * (this.number - 1) - 4).toString() + "px";
};

Feature.prototype.addElement = function (element, type, attributes) {

    var feature = app.dom.createCanvas("hud", element, { width: 128, height: 128 });
    var exists,
        canvas = app.dom.createElement("li", false, "canvas");
    var type = terrain.type(element);

    canvas.appendChild(feature.canvas);

    var list = app.dom.createList(element, type, attributes ? attributes : app.settings.hoverInfo);

    list.appendChild(canvas);

    this.size(canvas);

    app.draw(feature.context).hudCanvas(terrain.draw(element), type);

    this.element.appendChild(list);

    return list;
};

Feature.prototype.set = function (element) {

    this.clear();

    var exists = document.getElementById("hud");

    // display unit and any unit being transported by that unit
    this.addElement(element, terrainController.type(element), ["name", "canvas"]);

    if (exists) {

        exists.parentNode.replaceChild(this.element, exists);
    } else {

        document.body.insertBefore(this.element, document.getElementById("before"));
    }
};

module.exports = Feature;

},{"../controller/terrain.js":17}],37:[function(require,module,exports){
"use strict";

units = require("../controller/unit.js");

Hud = function Hud(elements) {

    this.element = document.createElement("div");
    this.element.setAttribute("id", "hud");

    if (elements) {

        this.setElements(elements);
    }
};

Hud.prototype.clear = function () {

    while (this.element.firstChild) {

        this.element.removeChild(this.element.firstChild);
    }
};

Hud.prototype.hidden = function () {

    return this.element.style.display === "none";
};

Hud.prototype.show = function () {

    this.element.style.display = null;
    this.setElements(app.cursor.hovered());
};

Hud.prototype.position = function () {

    return new Position(this.l, this.element.offsetTop);
};

Hud.prototype.hide = function () {

    this.element.style.display = "none";
};

Hud.prototype.resize = function (canvas) {

    var screenWidth = app.screen.width();
    var width = app.settings.hudWidth * this.number;

    // check what side of the screen were on and adjust position accordingly
    this.l = left = app.cursor.side('x') === "right" && app.cursor.side('y') === "bottom" ? screenWidth - (screenWidth - app.settings.hudWidth) + 150 : app.settings.hudLeft + 120 - width;

    this.element.style.height = app.settings.hudHeight.toString() + "px";
    this.element.style.left = left.toString() + "px";
    this.element.style.width = width.toString() + "px";

    canvas.setAttribute("class", "hudCanvas");
    canvas.style.left = (120 * (this.number - 1) - 4).toString() + "px";
};

Hud.prototype.addElement = function (element, type, attributes) {

    var c = app.dom.createCanvas("hud", element, { width: 128, height: 128 });
    var canvas = app.dom.createElement("li", false, "canvas");

    canvas.appendChild(c.canvas);

    var exists,
        list = app.dom.createList(element, terrainController.type(element), attributes ? attributes : app.settings.hoverInfo);

    list.appendChild(canvas);

    this.resize(canvas);

    app.draw(c.context).hudCanvas(terrainController.draw(element), terrainController.type(element));

    this.element.appendChild(list);

    if (type === "unit") {

        this.number += 1;
    }

    return list;
};

Hud.prototype.listen = function (cursor, map, user, input) {

    // control map info hud
    if (!cursor.selected()) {

        if (user.turn()) {

            if (this.hidden() && !map.focused() && !input.active()) {

                this.show();
            }

            if (cursor.moved()) {

                this.setElements(cursor.hovered());
            }
        } else if (!this.hidden()) {

            this.hide();
        }
    }

    return this;
};

Hud.prototype.setElements = function (elements) {

    this.clear();
    this.number = 1;

    var i, e, element, exists, loaded, unit, building, passanger;

    // display unit and any unit being transported by that unit
    if (unit = elements.unit) {

        if (loaded = unitController.loaded(unit)) {

            for (i = 0; i < loaded.length; i += 1) {

                this.addElement(loaded[i], "unit", ["canvas"]).setAttribute("loaded", true);
            }
        }

        this.addElement(unit, "unit", ["ammo", "showHealth", "name", "fuel", "canvas"]);
    }

    if (elements.building) {

        this.addElement(elements.building, "building");
    } else {

        this.addElement(elements.terrain, "terrain");
    }

    if (exists = document.getElementById("hud")) {

        exists.parentNode.replaceChild(this.element, exists);
    } else {

        document.body.insertBefore(this.element, document.getElementById("before"));
    }
};

module.exports = Hud;

},{"../controller/unit.js":18}],38:[function(require,module,exports){
'use strict';

app = require('../settings/app.js');
app.key = require('../input/keyboard.js');
app.scroll = require('../menu/scroll.js');
app.user = require('../user/user.js');
app.menu = require('../controller/menu.js');

module.exports = function (element) {

	var timer = new Date();
	var x,
	    y,
	    down = false;

	var _doubleClick = function _doubleClick() {
		var now = new Date();
		var tappedTwice = now - timer < 300 ? true : false;
		timer = now;
		return tappedTwice;
	};

	var input = function input(_input) {
		return _input ? _input : element;
	};

	return {
		scroll: function scroll(elem) {

			var e = input(elem);

			e.addEventListener('mousedown', function () {
				down = true;
			});
			e.addEventListener('mouseup', function () {
				down = false;
			});
			e.addEventListener('mouseleave', function (element) {
				if (down) {
					//  get the position of the mouse
					var position = parseFloat(element.clientY) - 70;

					// if the position is above the top, move the element up, 
					// otherwise move it down if it is below the bottom
					if (position < e.offsetTop) app.scroll.wheel(1, new Date());else app.scroll.wheel(-1, new Date());
					//app.game.update();
					down = false;
				}
			});

			return this;
		},
		swipe: function swipe(elem) {

			var e = input(elem);

			// scroll via touch
			e.addEventListener('mousedown', function () {
				down = true;
			});
			e.addEventListener('mouseup', function (element) {

				if (down) {

					var width = e.offsetWidth / 3;

					var offset = width / 3;

					// get the left boundry of the element
					var left = e.offsetLeft + offset + 10;

					// get the bottom boundry
					var right = e.offsetLeft + width - offset;

					//  get the position of the element
					var position = parseFloat(element.clientX) - 200;

					// if the position is above the top, move the element up, 
					// otherwise move it down if it is below the bottom
					if (position < left) {
						app.scroll.swipe(-1, new Date());
					} else if (position > right) {
						app.scroll.swipe(1, new Date());
					}
					down = false;
					//app.game.update();
				}
			});
			return this;
		},
		swipeScreen: function swipeScreen(elem) {

			var e = input(elem),
			    start;

			// get the start location of the finger press
			e.addEventListener('mousedown', function (element) {
				start = element.clientX;
				down = true;
			});

			// scroll via touch
			e.addEventListener('mouseup', function (element) {

				if (down) {
					//  get the position of the end of element
					var end = element.clientX;

					// make the length needed to swipe the width of the page divided by three and a half
					var swipeLength = e.offsetWidth / 3.5;

					// go back if swiping right
					if (start < end && end - start > swipeLength) {
						app.key.press(app.key.esc());

						// go forward if swiping left
					} else if (start > end && start - end > swipeLength) {
						app.key.press(app.key.enter());
					}
				}
				start = undefined;
				down = false;
			});

			return this;
		},
		// may need to change to eliminate less useful select method
		mapOrGame: function mapOrGame(elem) {

			var e = input(elem);

			e.addEventListener('click', function () {
				var label = 'SelectionIndex';
				var clicked = e.id.indexOf(label) > -1 ? e : e.parentNode;
				var type = clicked.id.indexOf('map') ? 'map' : 'game';
				var index = clicked.attributes[type + label].value;
				// app.display.setIndex(index);
				//app.game.update();
			});

			return this;
		},
		modeOptions: function modeOptions(elem) {

			var e = input(elem);

			e.addEventListener('click', function () {

				// get the index
				var index = e.attributes.modeOptionIndex.value;

				// if the mode options are already under selection, then change the index
				if (app.modes.active()) {
					// app.display.setIndex(index);
					//app.game.update();

					// otherwise simulate selecting them with the key right push
					// and set the default index to the selected option
				} else {
					// app.display.setOptionIndex(index);
					app.key.press(app.key.right());
				}
			});
			return this;
		},
		changeMode: function changeMode(elem) {
			input(elem).addEventListener('click', function () {
				if (app.modes.active()) app.key.press(app.key.left());
			});
			return this;
		},
		doubleClick: function doubleClick(elem) {
			input(elem).addEventListener('click', function () {
				if (_doubleClick()) return app.key.press(app.key.enter());
			});
			return this;
		},
		element: function element(elem) {
			var e = input(elem);

			e.addEventListener('click', function () {
				var name = e.parentNode.id == 'settings' ? e.id : e.parentNode.id;
				var setting = name.replace('Settings', '').replace('Container', '');
				// app.display.setIndex(setting);
				//app.game.update();
			});
			return this;
		},
		esc: function esc(elem) {
			input(elem).addEventListener('click', function () {
				if (app.user.player().ready()) return app.key.press(app.key.esc());
			});
			return this;
		}
	};
};

},{"../controller/menu.js":12,"../input/keyboard.js":40,"../menu/scroll.js":74,"../settings/app.js":83,"../user/user.js":109}],39:[function(require,module,exports){
'use strict';

/* ------------------------------------------------------------------------------- *\

    Input handles user input (Generally displayed via the footer element)

\* ------------------------------------------------------------------------------- */

app.type = require('../effects/typing.js');
module.exports = {

    // takes the name of the form, the element it is being inserted into and 
    // a placeholder/words to be displayed in the form box before entry
    form: function form(name, element, placeHolder) {

        var input = document.createElement('p');
        input.setAttribute('class', 'inputForm');
        input.setAttribute('id', name + 'Form');

        var text = document.createElement('input');
        text.setAttribute('id', name + 'Input');
        text.setAttribute('class', 'textInput');
        text.setAttribute('autocomplete', 'off');
        text.setAttribute('type', 'text');

        if (placeHolder) text.setAttribute('placeholder', placeHolder);

        text.style.width = element.offsetWidth;
        input.appendChild(text);
        return input;
    },

    // returns user input if it is found and adequate
    entry: function entry() {
        var name = this.value();

        // inform the user that no input was detected
        if (!name) app.type.letters(this.description, 'A name must be entered for the game.');

        // inform the user that input must be over three charachtors long
        else if (name.length < 3) app.type.letters(this.description, 'Name must be at least three letters long.');

            // return the input value
            else if (name) {
                    this.val = name;
                    return name;
                }
        return false;
    },

    // create display screen for name input
    name: function name(parent, text) {

        this.a = true;
        var existing = document.getElementById('descriptionOrChatScreen');
        var textField = this.text = app.footer.display();
        var tfp = textField.parentNode;
        this.parent = tfp;

        if (existing) parent.replaceChild(tfp, existing);else parent.appendChild(tfp);

        this.description = document.getElementById('descriptions');
        this.description.style.paddingTop = '2%';
        this.description.style.paddingBottom = '1.5%';
        this.description.parentNode.style.overflow = 'hidden';

        this.addInput();
        app.type.letters(this.description, text || 'Enter name for game.');

        return tfp;
    },

    // remove the screen and deactivate input
    remove: function remove() {
        this.a = false;
        app.confirm.deactivate();
        app.type.reset();
        delete this.val;
        app.footer.remove();
        app.screen.reset();
    },
    active: function active() {
        return this.a;
    },

    // remove input form from footer
    clear: function clear() {
        if (this.a) {
            this.description.style.paddingTop = null;
            this.description.style.paddingBottom = null;
            this.nameInput.style.display = null;
            this.nameInput.style.height = null;
            this.a = false;
        }
    },
    removeInput: function removeInput() {
        this.text.removeChild(this.nameInput);
        //this.description.style.display = 'inline-block';
        //this.text.style.display = 'inline-block';
    },
    addInput: function addInput() {
        this.text.appendChild(this.form('name', this.text, 'Enter name here.'));
        this.nameInput = document.getElementById('nameForm');
        this.nameInput.style.display = 'block';
        this.nameInput.style.height = '30%';
        // this.description.style.display = null;
        document.getElementById('nameInput').focus();
    },
    value: function value() {
        return this.val || document.getElementById('nameInput').value;
    },
    goBack: function goBack() {
        this.a = true;
        this.b = true;
    },
    a: false,
    back: function back() {
        return this.b;
    },
    undoBack: function undoBack() {
        this.b = false;
    },
    activate: function activate() {
        this.a = true;
    },
    deactivate: function deactivate() {
        this.a = false;
    },
    descriptions: function descriptions() {
        return document.getElementById('descriptions');
    },
    message: function message(_message) {
        return app.type.letters(this.descriptions(), _message);
    }
};

},{"../effects/typing.js":32}],40:[function(require,module,exports){
'use strict';

app.options = require('../menu/options/optionsMenu.js');
app.game = require('../controller/game.js');

module.exports = function () {

    var pressed = [],
        up = [],
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
        key = function key(k) {
        return isNaN(k) ? keys[k] : k;
    },
        _undo = function _undo(array) {
        return array.splice(0, array.length);
    };
    press = function press(k) {
        //app.game.update();
        return pressing(k) ? true : pressed.push(key(k));
    }, pressing = function pressing(k) {
        return k ? pressed.indexOf(key(k)) > -1 : pressed.length;
    };

    window.addEventListener("keydown", function (e) {
        if (!app.game.started() || app.user.turn() || e.keyCode === app.key.esc() || app.options.active() || app.confirm.active()) press(e.keyCode);
    }, false);

    window.addEventListener("keyup", function (e) {
        up.push(e.keyCode);
        _undo(pressed);
        //app.game.update();
    }, false);

    return {
        press: press,
        pressed: function pressed(k) {
            if (k && k.isArray()) {
                var i = k.length;
                while (i--) {
                    if (pressing([k[i]])) return true;
                }
            } else return pressing(k);
        },
        keyUp: function keyUp(k) {
            return k ? up.indexOf(key(k)) > -1 : up.length;
        },
        undo: function undo(k) {
            return k ? pressed.splice(pressed.indexOf(key(k)), 1) : _undo(pressed);
        },
        undoKeyUp: function undoKeyUp(k) {
            return k ? up.splice(up.indexOf(key(k)), 1) : _undo(up);
        },
        set: function set(key, newKey) {
            keys[key] = newKey;
        },
        esc: function esc() {
            return keys.esc;
        },
        enter: function enter() {
            return keys.enter;
        },
        up: function up() {
            return keys.up;
        },
        down: function down() {
            return keys.down;
        },
        left: function left() {
            return keys.left;
        },
        right: function right() {
            return keys.right;
        },
        range: function range() {
            return keys.range;
        },
        map: function map() {
            return keys.map;
        },
        info: function info() {
            return keys.info;
        },
        copy: function copy() {
            return keys.copy;
        }
    };
}();

},{"../controller/game.js":9,"../menu/options/optionsMenu.js":72}],41:[function(require,module,exports){
'use strict';

app = require('../settings/app.js');
app.key = require('../input/keyboard.js');
app.scroll = require('../menu/scroll.js');
app.user = require('../user/user.js');
app.menu = require('../controller/menu.js');

module.exports = function (element) {

	var timer = new Date();

	var _doubleTap = function _doubleTap() {
		var now = new Date();
		var tappedTwice = now - timer < 300 ? true : false;
		timer = now;
		return tappedTwice;
	};

	var input = function input(_input) {
		return _input ? _input : element;
	};

	return {
		scroll: function scroll(elem) {

			var e = input(elem);

			// scroll via touch
			e.addEventListener('touchmove', function (touch) {

				// get the top  boundry of the element
				var top = e.offsetTop - 50;

				// get the bottom boundry
				var bottom = top + e.offsetHeight + 50;

				//  get the position of the touch
				var position = parseFloat(touch.changedTouches[0].pageY) - 50;

				// if the position is above the top, move the element up, 
				// otherwise move it down if it is below the bottom
				if (position < top) {
					app.scroll.wheel(1, new Date());
				} else if (position > bottom) {
					app.scroll.wheel(-1, new Date());
				}
				//app.game.update();
			});
			return this;
		},
		swipe: function swipe(elem) {

			var e = input(elem);

			// scroll via touch
			e.addEventListener('touchmove', function (touch) {

				touch.preventDefault();

				var width = e.offsetWidth / 3;

				var offset = width / 3;

				// get the left boundry of the element
				var left = e.offsetLeft + offset;

				// get the bottom boundry
				var right = e.offsetLeft + width - offset;

				//  get the position of the touch
				var position = parseFloat(touch.changedTouches[0].pageX);

				// if the position is above the top, move the element up, 
				// otherwise move it down if it is below the bottom
				if (position < left) {
					app.scroll.swipe(-1, new Date());
				} else if (position > right) {
					app.scroll.swipe(1, new Date());
				}
				//app.game.update();
			});
			return this;
		},
		swipeScreen: function swipeScreen(elem) {

			var e = input(elem),
			    start;

			// get the start location of the finger press
			e.addEventListener('touchstart', function (touch) {
				touch.preventDefault();
				start = touch.changedTouches[0].pageX;
			});

			// scroll via touch
			e.addEventListener('touchend', function (touch) {
				touch.preventDefault();

				//  get the position of the end of touch
				var end = touch.changedTouches[0].pageX;

				// make the length needed to swipe the width of the page divided by three and a half
				var swipeLength = e.offsetWidth / 3.5;

				// go back if swiping right
				if (start < end && end - start > swipeLength) {
					app.key.press(app.key.esc());

					// go forward if swiping left
				} else if (start > end && start - end > swipeLength) {
					app.key.press(app.key.enter());
				}
				start = undefined;
			});

			return this;
		},
		// may need to change to eliminate less useful select method
		mapOrGame: function mapOrGame(elem) {
			var e = input(elem);
			e.addEventListener('touchstart', function (touch) {
				var label = 'SelectionIndex';
				var target = touch.target;
				var touched = target.id.indexOf(label) > -1 ? target : target.parentNode;
				var type = touched.id.indexOf('map') ? 'map' : 'game';
				var index = touched.attributes[type + label].value;
				// Game.element.setIndex(index);
			});
			return this;
		},
		modeOptions: function modeOptions(elem) {

			var e = input(elem);

			e.addEventListener('touchstart', function () {

				// get the index
				var index = Array.prototype.indexOf.call(e.parentNode.childNodes, e);

				// if the mode options are already under selection, then change the index
				if (app.menu.active()) {
					// app.display.setIndex(index);
					//app.game.update();

					// otherwise simulate selecting them with the key right push
					// and set the default index to the selected option
				} else {
					// app.display.setOptionIndex(index);
					app.key.press(app.key.right());
				}
			});

			return this;
		},
		changeMode: function changeMode(elem) {
			input(elem).addEventListener('touchstart', function () {
				if (app.menu.active()) app.key.press(app.key.left());
			});
			return this;
		},
		doubleTap: function doubleTap(elem) {
			input(elem).addEventListener('touchstart', function () {
				if (_doubleTap()) app.key.press(app.key.enter());
			});
			return this;
		},
		element: function element(elem) {
			input(elem).addEventListener('touchstart', function (touch) {
				var touched = touch.target;
				var name = touched.parentNode.id == 'settings' ? touched.id : touched.parentNode.id;
				var setting = name.replace('Settings', '').replace('Container', '');
				// app.display.setIndex(setting);
				//app.game.update();
			});
			return this;
		},
		esc: function esc(elem) {
			input(elem).addEventListener('touchstart', function () {
				if (app.user.player().ready()) app.key.press(app.key.esc());
			});
			return this;
		}
	};
};

},{"../controller/menu.js":12,"../input/keyboard.js":40,"../menu/scroll.js":74,"../settings/app.js":83,"../user/user.js":109}],42:[function(require,module,exports){
'use strict';

/* ---------------------------------------------------------------------------------------------------------*\   
    add needed methods / polyfill
\* ---------------------------------------------------------------------------------------------------------*/

if (typeof Object.assign != 'function') {

    Object.assign = function (target, varArgs) {
        // .length of function is 2
        'use strict';

        if (target == null) {
            // TypeError if undefined or null

            throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        var index = arguments.length;

        while (index--) {

            var nextSource = arguments[index];

            if (nextSource != null) {
                // Skip over if undefined or null

                for (var nextKey in nextSource) {

                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {

                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}

Object.prototype.isArray = function () {

    return this.constructor === Array;
};

isBoolean = function isBoolean(object) {

    return object === false || object === true;
};

isArray = function isArray(object) {

    return object && object.constructor === Array;
};

isFunction = function isFunction(object) {

    return object && object.constructor === Function;
};

isString = function isString(object) {

    return object && object.constructor === String;
};

String.prototype.uc_first = function () {

    return this.charAt(0).toUpperCase() + this.slice(1);
};

Array.prototype.hasValue = function (value) {

    return this.indexOf(value) > -1;
};

Array.prototype.map = function (callback) {

    var mapped = [];

    for (var i = 0, len = this.length; i < len; i += 1) {

        mapped.push(callback(this[i], i, this));
    }

    return mapped;
};

Array.prototype.filter = function (callback) {

    var filtered = [],
        len = this.length;

    for (var i = 0; i < len; i += 1) {

        if (callback(this[i], i, this)) {

            filtered.push(this[i]);
        }
    }

    return filtered;
};

Array.prototype.reduce = function (callback, initial) {

    var prev = initial || !isNaN(initial) ? initial : this[0];

    for (var i = initial || !isNaN(initial) ? 0 : 1, len = this.length; i < len; i += 1) {

        prev = callback(prev, this[i], i, this);
    }

    return prev;
};

Array.prototype.findIndex = function (callback) {

    var i = this.length;

    while (i--) {

        if (callback(this[i], i, this)) {

            return i;
        }
    }
};

Array.prototype.find = function (callback) {

    return this[this.findIndex(callback)];
};

/* ---------------------------------------------------------------------------------------------------------*\   
    app
\* ---------------------------------------------------------------------------------------------------------*/

app = require("./game/app.js");

/* --------------------------------------------------------------------------------------*\ 
    load dummy variables if/for testing locally 
\* --------------------------------------------------------------------------------------*/

gameMap = require('./map/map.js');

if (app.testing) {

    app.games.push({
        category: gameMap.category,
        max: gameMap.players,
        mapId: gameMap.id,
        settings: {
            funds: 1000,
            fog: 'off',
            weather: 'random',
            turn: 'off',
            capt: 'off',
            power: 'on',
            visuals: 'off'
        },
        name: 'testing'
    });
}

/* ---------------------------------------------------------------------------------------------------------*\
    event listeners
\* ---------------------------------------------------------------------------------------------------------*/

window.addEventListener("wheel", function (e) {
    app.scroll.wheel(e.deltaY, new Date());
});

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

},{"./game/app.js":34,"./map/map.js":45}],43:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    Background.js controls the weather

\* --------------------------------------------------------------------------------------*/

app.calcualte = require('../tools/calculate.js');
Terrain = require('../map/terrain.js');
transmit = require("../sockets/transmitter.js");

module.exports = {

	pos: { x: 0, y: 0 },
	rand: false,
	cat: 'random',

	background: new Terrain('plain', { x: 0, y: 0 }),

	category: function category() {

		return this.cat;
	},

	type: function type() {

		return terrainController.type(this.background);
	},

	defense: function defense() {

		return terrainController.defense(this.background);
	},

	name: function name() {

		return terrainController.name(this.background);
	},

	drawing: function drawing() {

		return terrainController.draw(this.background).toLowerCase();
	},

	alias: function alias(name) {

		// var alias = {
		// 	clear:'plain',
		// 	rain:'plain',
		// 	snow:'snow'
		// } [name];
		return name === 'snow' ? 'snow' : 'plain';
	},

	set: function set(type) {

		console.log(type);

		this.cat = type;

		if (type === 'random') {

			this.rand = true;
			return this.change();
		}

		if (!app.game.started()) {

			this.rand = false;
		}

		if (type === 'rain') {

			// app.effects.rain();
			return this.background = new Terrain('plain', this.pos);
		}

		return this.background = new Terrain(this.alias(type) || type, this.pos);
	},

	random: function random() {

		return this.rand;
	},

	weighted: function weighted(chance) {

		var calculated = app.calculate.random(chance);

		console.log('uncomment this when weather graphics are set up and ready');

		// if(calculated < 4)
		// 	return 'snow';
		// else if(calculated < 6)
		// 	return 'rain';

		return 'plain';
	},

	change: function change() {

		if (!app.game.started() && app.user.first() || app.user.turn()) {

			var type = this.weighted(20);

			if (app.game.started() && app.user.turn()) {

				transmit.background(type);
			}

			if (type === 'rain') {

				//app.effects.rain();
				return background = new Terrain('plain', this.pos);
			}

			return this.background = new Terrain(this.alias(type), this.pos);
		}
	}
};

},{"../map/terrain.js":49,"../sockets/transmitter.js":88,"../tools/calculate.js":90}],44:[function(require,module,exports){
"use strict";

createTerrain = require("../map/terrain.js");
composer = require("../tools/composition.js");

module.exports = function (type, position, player, index) {

	var building = composer.exclude(["type", "name"]).compose({

		type: "building",
		player: player,
		health: 20,
		name: type,
		index: index

	}, createTerrain(type, position));

	return building;
};

},{"../map/terrain.js":49,"../tools/composition.js":91}],45:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    creates map object

\* --------------------------------------------------------------------------------------*/

Validator = require('../tools/validator.js');

Map = function Map(id, name, players, dimensions, terrain, buildings, units) {

    var error,
        validate = new Validator('map');
    var category = units.length ? 'preDeployed' : {
        2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight'
    }[players];

    this.id = id;
    this.name = name;
    this.players = players;
    this.category = category;
    this.dimensions = dimensions;
    this.terrain = terrain;
    this.buildings = buildings;
    this.units = units;

    if (error = validate.map(this)) {

        throw error;
    }
};

module.exports = Map;

},{"../tools/validator.js":104}],46:[function(require,module,exports){
"use strict";

// map elements

module.exports = function (type, position, player) {
	this.type = type;
	this.position = position;
	this.player = player;
};

},{}],47:[function(require,module,exports){
"use strict";

/* --------------------------------------------------------------------------------------*\
    
    Obsticle.js is a generic object with methods common to all map obsticles

\* --------------------------------------------------------------------------------------*/

module.exports = function (type, defense) {

	return {
		type: type,
		defense: defense
	};
};

},{}],48:[function(require,module,exports){
'use strict';

app = require('../settings/app.js');
Validator = require('../tools/validator.js');

module.exports = function (name, obsticle) {

	// var validate = new Validator("property.js");

	// var error = validate.isString(name) || validate.hasElements(obsticle, ['type', 'defense']);

	// if (error) {
	//
	//  	throw error;
	// }

	return {
		type: obsticle.type,
		defense: obsticle.defense,
		name: name
	};
};

},{"../settings/app.js":83,"../tools/validator.js":104}],49:[function(require,module,exports){
'use strict';

/* ---------------------------------------------------------------------- *\
    
    Terrain.js holds the terrain object, defining specific map terrain

\* ---------------------------------------------------------------------- */

app = require('../settings/app.js');
app.properties = require('../definitions/properties.js');
Position = require('../objects/position.js');
Validator = require('../tools/validator.js');
MapElement = require('../map/mapElement.js');
terrainDefaults = require("../definitions/properties.js");
buildingDefaults = require("../definitions/buildings.js");
unitDefaults = require("../definitions/units.js");
createDefaults = require("../definitions/defaults.js");

module.exports = function (type, position) {

    var defaults = createDefaults(unitDefaults, buildingDefaults, terrainDefaults);

    var error,
        validate = new Validator("terrain.js");

    // if ((error = (validate.mapElementType(type) || validate.isCoordinate(position)))) {

    //     console.log(position);
    //     console.log("type: "+type);

    //     throw error;
    // }

    return {

        type: "terrain",
        orientation: "",
        name: defaults.name(type),
        draw: type,
        position: new Position(position.x, position.y)
    };
};

},{"../definitions/buildings.js":19,"../definitions/defaults.js":20,"../definitions/properties.js":22,"../definitions/units.js":24,"../map/mapElement.js":46,"../objects/position.js":81,"../settings/app.js":83,"../tools/validator.js":104}],50:[function(require,module,exports){
"use strict";

Position = require("../objects/position.js");
Map = require("../map/map.js");
module.exports = function () {

	var element = require("../map/mapElement.js"),
	    map = require("../map/map.js");

	terrain = [new element("tallMountain", new Position(5, 6)), new element("tallMountain", new Position(8, 9)), new element("tallMountain", new Position(3, 15)), new element("tallMountain", new Position(4, 20)), new element("tallMountain", new Position(10, 4)), new element("tallMountain", new Position(8, 12)), new element("tallMountain", new Position(5, 12)), new element("tallMountain", new Position(1, 15)), new element("tallMountain", new Position(3, 9)), new element("tallMountain", new Position(4, 6)), new element("tallMountain", new Position(4, 16)), new element("tree", new Position(2, 16)), new element("tree", new Position(1, 18)), new element("tree", new Position(3, 6)), new element("tree", new Position(3, 5)), new element("tree", new Position(15, 12)), new element("tree", new Position(10, 10)), new element("tree", new Position(11, 15)), new element("tree", new Position(20, 3)), new element("tree", new Position(19, 5))], buildings = [new element("hq", new Position(0, 9), 1), new element("hq", new Position(20, 9), 2), new element("base", new Position(4, 9), 1), new element("base", new Position(16, 9), 2)];

	return new Map(null, "test map #1", 2, { x: 20, y: 20 }, terrain, buildings, []);
};

},{"../map/map.js":45,"../map/mapElement.js":46,"../objects/position.js":81}],51:[function(require,module,exports){
"use strict";

/* ------------------------------------------------------------------------------------------------------*\
   
    unit.js creates new units 
   
\* ------------------------------------------------------------------------------------------------------*/

app = require("../settings/app.js");
app.increment = require("../tools/increment.js");

Position = require("../objects/position.js");
createDefaults = require("../definitions/defaults.js");
terrainDefaults = require("../definitions/properties.js");
buildingDefaults = require("../definitions/buildings.js");
unitDefaults = require("../definitions/units.js");

module.exports = function (type, position, player) {

    if (isNaN(player)) {

        throw new Error("Invalid player number supplied in third argument of unit.", "map/unit.js");
    }

    if (isNaN(position.x) || isNaN(position.y)) {

        throw new Error("Invalid position supplied in second argument of unit.", "map/unit.js");
    }

    var defaults = createDefaults(unitDefaults, buildingDefaults, terrainDefaults);

    if (typeof type !== "string" || !defaults.find(type)) {

        throw new Error("Invalid type supplied in first argument of unit.", "map/unit.js");
    }

    var identity = {

        type: "unit",
        name: type
    };

    return composer.exclude(["type", "health", "index"]).compose({

        type: "unit",
        name: type,
        id: app.increment.id(),
        player: player,
        position: new Position(position.x, position.y),
        actions: {},
        targets: [],
        damage: [],
        health: defaults.health(identity),
        ammo: defaults.ammo(identity),
        fuel: defaults.fuel(identity),
        vision: defaults.vision(identity),
        movement: 0,
        selectable: false,
        loaded: defaults.loaded(identity),
        moves: [],
        moved: 0,
        action: false

    }, createBuilding(type, position, player));
};

},{"../definitions/buildings.js":19,"../definitions/defaults.js":20,"../definitions/properties.js":22,"../definitions/units.js":24,"../objects/position.js":81,"../settings/app.js":83,"../tools/increment.js":96}],52:[function(require,module,exports){
'use strict';

BuildingDisplay = function BuildingDisplay() {
	var property = function property(id) {
		return document.getElementById(id).firstChild;
	};
	this.e = app.dom.createMenu({
		city: { numberOf: 0, type: 'city' },
		base: { numberOf: 0, type: 'base' },
		airport: { numberOf: 0, type: 'airport' },
		seaport: { numberOf: 0, type: 'seaport' }
	}, ['numberOf', 'canvas'], { section: 'buildingsDisplay', div: 'numberOfBuildings' }, app.dom.addCanvas);
	this.city = property('city');
	this.base = property('base');
	this.airport = property('airport');
	this.seaport = property('seaport');
};

BuildingDisplay.prototype.element = function () {
	return this.e;
};
BuildingDisplay.prototype.cities = function (number) {
	this.city.innerHtml = number;
};
BuildingDisplay.prototype.bases = function (number) {
	this.base.innerHTML = number;
};
BuildingDisplay.prototype.airPorts = function (number) {
	this.airport.innerHtml = number;
};
BuildingDisplay.prototype.seaPorts = function (number) {
	this.seaport.innerHtml = number;
};
BuildingDisplay.prototype.set = function (numberOf) {
	if (numberOf.city) this.cities(numberOf.city);
	if (numberOf.base) this.bases(numberOf.base);
	if (numberOf.seaport) this.seaPorts(numberOf.seaport);
	if (numberOf.airport) this.airPorts(numberOf.airport);
};

module.exports = BuildingDisplay;

},{}],53:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    CoElement.js defines the element that holds co selection information

\* --------------------------------------------------------------------------------------*/

Element = require('../../menu/elements/element.js');

CoElement = function CoElement(number, init) {

    this.setType('co');
    this.setNumber(number);
    this.setColor(app.settings.playerColor[number]);

    var list = Object.keys(app.co);
    var allowed = { index: true, hide: true };

    for (var name, i = 0, len = list.length; i < len; i += 1) {

        var name = list[i],
            co = app.co[name];

        this.addProperty(name, { name: co.name, image: co.image });
        allowed[name] = name;
    }

    this.setElement(app.dom.createList(allowed, this.id(), list));
    this.setClass('coList');
    this.setCurrent(init);
    this.setDescription('Chose a CO.');
    this.setBorder(this.element().clientLeft);
    this.fader = new Fader(this.element(), this.color.get());

    app.touch(this.element()).element().scroll().doubleTap().esc();
    app.click(this.element()).element().scroll().doubleClick().esc();
};

CoElement.prototype = Object.create(Element);

CoElement.prototype.constructor = CoElement;

CoElement.prototype.name = function () {

    return this.current().className;
};

CoElement.prototype.getStyle = function (parameter) {

    return Number(this.element().parentNode.style[parameter].replace('px', ''));
};

module.exports = CoElement;

},{"../../menu/elements/element.js":54}],54:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    Element.js defines a generic menu element with methods common to all game menus

\* --------------------------------------------------------------------------------------*/

UList = require('../../menu/elements/ul.js');
Element = Object.create(UList.prototype);
Element.p = {};
Element.isComputer = function () {
    return this.value() === 'cp';
};
Element.addProperty = function (index, value) {
    this.p[index] = value;
};
Element.properties = function () {
    return this.p;
};
Element.property = function (index) {
    return this.p[index];
};
Element.setDescription = function (description) {
    this.d = description;
};
Element.description = function () {
    return this.descriptions() ? this.d[this.indexOf(this.current())] : this.d;
};
Element.descriptions = function () {
    return !(typeof this.d === "string");
};
Element.element = function () {
    return this.e;
};
Element.setType = function (type) {
    this.t = type;return this;
};
Element.setHeight = function (height) {
    this.element().style.height = height + 'px';
};
Element.setTop = function (top) {
    this.element().style.top = top + 'px';
};
Element.setWidth = function (width) {
    return this.e.style.width = width + 'px';
};
Element.setColor = function (color) {
    this.color = new Hsl(color);
};
Element.type = function () {
    return this.t;
};
Element.index = function () {
    return this.number() - 1;
};
Element.add = function (element) {
    this.element().appendChild(element);
};
Element.id = function () {
    return 'player' + this.number() + this.type();
};
Element.setNumber = function (number) {
    this.n = number;
};
Element.number = function () {
    return this.n;
};
Element.getStyle = function (parameter) {
    return Number(this.element().style[parameter].replace('px', ''));
};
Element.position = function () {
    return { x: this.left(), y: this.top() };
};
Element.dimensions = function () {
    return { x: this.width(), y: this.height() };
};
Element.top = function () {
    return this.getStyle('top');
};
Element.left = function () {
    return this.getStyle('left');
};
Element.height = function () {
    return this.getStyle('height') || this.element().offsetHeight;
};
Element.width = function () {
    return this.getStyle('width') || this.element().offsetWidth;
};
Element.setBorder = function (border) {
    this.b = border;return this;
};
Element.border = function () {
    return this.b;
};
module.exports = Element;

},{"../../menu/elements/ul.js":65}],55:[function(require,module,exports){
"use strict";

/* --------------------------------------------------------------------------------------*\
    
    List.js creates an interface for iterating over a list of dom elements

\* --------------------------------------------------------------------------------------*/

List = function List(elements, init) {

    this.setElements(elements || []);

    this.setCurrent(init);
};

List.prototype.setIndex = function (index) {

    this.i = index && index > 0 ? index : 0;

    return this;
};

List.prototype.setCurrent = function (property) {

    return this.setIndex(isNaN(property) ? this.indexOf(property) : property || 0);
};

List.prototype.reset = function () {

    return this.setIndex(0);
}, List.prototype.index = function () {

    return this.i;
}, List.prototype.wrap = function (number) {

    var elements = this.limited || this.elements(),
        length = elements.length;

    return !number ? 0 : number >= length ? number - length : number < 0 ? length + number : number;
};

List.prototype.move = function (index) {

    return this.setIndex(this.wrap(index));
};

List.prototype.next = function () {

    return this.move(this.i + 1);
};

List.prototype.prev = function () {

    return this.move(this.i - 1);
};

List.prototype.indexOf = function (property) {

    return this.find(function (element, index) {

        if (property === element) {

            return index;
        }
    });
};

List.prototype.add = function (element) {

    this.elements().push(element);
};

List.prototype.find = function (callback) {

    var elements = this.limited || this.elements();

    for (var i = 0, len = elements.length; i < len; i += 1) {

        if (callback(elements[i], i)) {

            return i;
        }
    }
};

List.prototype.elements = function () {

    return this.li;
};

List.prototype.setElements = function (elements) {

    this.li = elements;return this;
};

List.prototype.current = function () {

    var limit = this.limited,
        index = this.i;

    return limit ? limit[index < limit.length ? index : 0] : this.getElement(index);
};

List.prototype.getElement = function (index) {

    return this.elements()[index];
};

List.prototype.limit = function (callback) {

    var elements = this.elements();
    var current = this.current();
    var limited = elements.filter(callback);

    this.setIndex(limited.indexOf(current));

    this.limited = limited;

    return this;
};

List.prototype.describe = function (selected) {

    if (selected.description && selected.description()) {

        app.input.message(selected.description());
    }
};

List.prototype.getHorizontal = function () {

    return this.hElement;
};

List.prototype.getVerticle = function () {

    return this.vElement;
};

List.prototype.verticle = function (elements) {

    return this.changeElement(elements, ["up", "down"]);
};

List.prototype.horizontal = function (elements) {

    return this.changeElement(elements, ["left", "right"]);
};

List.prototype.changeElement = function (elements, keys) {

    return app.key.pressed(keys[1]) ? elements.next() : elements.prev();
};

List.prototype.setHorizontal = function (e) {

    var selected = e.current();

    this.describe(selected);
    this.hElement = selected;

    return this;
};

List.prototype.setVerticle = function (e) {

    if (e.descriptions()) {

        this.describe(e);
    }

    this.vElement = e;

    return this;
};

List.prototype.clear = function () {

    delete this.vElement;
    delete this.hElement;
};

module.exports = List;

},{}],56:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    Menu.js is a generic object that contains methods common to all menus

\* --------------------------------------------------------------------------------------*/

app = require('../../settings/app.js');

module.exports = {
    // for co border color
    color: app.settings.colors,
    playerElement: [],
    playerColor: app.settings.playerColor,
    time: new Date(),
    bck: false,
    withArrows: function withArrows() {
        if (!this.arrows && !app.players.saved()) this.arrows = new Arrows();
        return this;
    },
    active: function active() {
        return this.a;
    },
    activate: function activate() {
        this.a = true;
    },
    deactivate: function deactivate() {
        this.a = false;
    },
    goBack: function goBack() {
        this.setBack(true);
    },
    back: function back() {
        return this.bck ? this.setBack(false) : false;
    },
    setBack: function setBack(bool) {
        this.bck = bool;
        return this;
    },
    exit: function exit(value, callback, _exit) {
        if (app.key.pressed(app.key.enter()) || app.key.pressed(app.key.esc()) || this.boot) {
            if (callback) callback(value);
            if (app.key.pressed(app.key.esc()) || this.boot) {
                app.key.undo();
                if (this.boot) this.boot = false;
                return _exit ? _exit : 'back';
            }
            app.key.undo();
        }
        return false;
    },
    moveElements: function moveElements(direction, callback, speed, index) {

        var elements = this.element.childNodes;
        var length = elements.length;
        var scope = this;
        var delay = speed || 5;
        var timeout = delay * 100;
        this.m = true;

        if (!index) index = 0;
        if (length > index) {
            var offScreen = Number(app.offScreen);
            setTimeout(function () {
                var elem = elements[index];
                elem.style.transition = 'top .' + delay + 's ease';
                setTimeout(function () {
                    elem.style.transition = null;
                }, timeout);
                var position = Number(elem.style.top.replace('px', ''));
                if (position) {
                    if (direction === 'up') target = position - offScreen;else if (direction === 'down') target = position + offScreen;else return false;
                    elem.style.top = target + 'px';
                }
                scope.moveElements(direction, callback, speed, index + 1);
            }, 30);
        } else {
            this.m = false;
            if (callback) setTimeout(callback, 80);
        }
    },
    moving: function moving() {
        return this.m;
    },
    screen: function screen() {
        return this._s;
    },
    setScreen: function setScreen(s) {
        this._s = s;
    },
    createTitle: function createTitle(title) {
        var element = document.createElement('h1');
        element.setAttribute('id', 'title');
        element.innerHTML = title;
        this.screen().appendChild(element);
        return element;
    },
    percentage: function percentage(height) {
        return Number(height.replace('%', '')) / 100;
    },
    screenHeight: function screenHeight() {
        return this.screen().offsetHeight;
    },
    removeScreen: function removeScreen() {
        document.body.removeChild(this.screen());
    },
    createScreen: function createScreen(name) {
        var existing = document.getElementById(name);
        var screen = document.createElement('article');
        screen.setAttribute('id', name);
        existing ? document.body.replaceChild(screen, existing) : document.body.appendChild(screen);
        this.setScreen(screen);
        app.touch(screen).swipeScreen();
        app.click(screen).swipeScreen();
        return screen;
    },
    resetDefaults: function resetDefaults(type) {

        var element,
            previous,
            name,
            child,
            children,
            childrenLength,
            length = app.players.length();

        for (var c, n = 1; n <= length; n += 1) {

            element = document.getElementById('player' + n + type);
            previous = app.players.number(n).property(type.toLowerCase());

            if (name = previous.name ? previous.name : previous) {

                children = element.childNodes;
                childrenLength = children.length;

                for (c = 0; c < childrenLength; c += 1) {
                    if ((child = children[c]).getAttribute('class').toLowerCase() === name.toLowerCase()) child.setAttribute('default', true);else if (child.getAttribute('default')) child.removeAttribute('default');
                }
            }
        }
    },
    changeTitle: function changeTitle(name) {
        this.screen().firstChild.innerHTML = name;
    },
    rise: function rise(callback, speed) {
        this.moveElements('up', callback, speed);
    },
    fall: function fall(callback, speed) {
        this.moveElements('down', callback, speed);
    }
};

},{"../../settings/app.js":83}],57:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    ModeElement.js defines the element used for option selection on the mode menu

\* --------------------------------------------------------------------------------------*/

ModeElement = function ModeElement(c, id) {
    this.createElement().setClass(c).setId(id);
    this.setName(c);
};
ModeElement.prototype.setName = function (name) {
    this.c = name;
};
ModeElement.prototype.setClass = function (c) {
    this.element().setAttribute('class', c);
    return this;
};
ModeElement.prototype.element = function () {
    return this.e;
};
ModeElement.prototype.setIndex = function (index) {
    this.element().setAttribute(this.name() + 'Index', index);
};
ModeElement.prototype.setId = function (id) {
    this.element().setAttribute('id', id);
};
ModeElement.prototype.setHeight = function (height) {
    this.element().style.height = height;
};
ModeElement.prototype.setColor = function (color) {
    this.element().style.color = color;
};
ModeElement.prototype.createElement = function () {
    this.e = document.createElement('li');
    return this;
};
ModeElement.prototype.add = function (element) {
    this.element().appendChild(element);
    return this;
};
ModeElement.prototype.clearHeight = function () {
    this.current().style.height = '';
};
module.exports = ModeElement;

},{}],58:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    ModesElement.js defines the element that is used in game mode selection

\* --------------------------------------------------------------------------------------*/

UList = require('../../menu/elements/ul.js');
TextElement = require('../../menu/elements/textElement.js');
ModeElement = require('../../menu/elements/modeElement.js');
Hsl = require('../../tools/hsl.js');
OptionElement = require('../../menu/elements/optionElement.js');

ModesElement = function ModesElement(element, index) {

    var background,
        text,
        outline,
        li,
        id = element.id;
    this.setOutline(outline = this.createOutline('block'));
    this.setBackground(background = this.createBackground('modeBackground'));
    this.setText(new TextElement(id));
    this.setElement(li = new ModeElement('modeItem', id));
    this.setIndex(index);
    var text = this.text.element();
    this.setColor(new Hsl(app.settings.colors[id]));
    li.add(background).add(outline).add(text).setColor(this.color.format());

    app.touch(text).changeMode().doubleTap();
    app.touch(background).changeMode().doubleTap();
    app.touch(li.element()).scroll();

    app.click(text).changeMode().doubleClick();
    app.click(background).changeMode().doubleClick();
    app.click(li.element()).scroll();

    if (element.options) {
        var options = new OptionElement('modeOptions').hide();
        for (var i = 0, len = element.options.length; i < length; i += 1) {
            options.add(option = this.createOption(element.options[i], element.id, i));
            app.touch(option).modeOptions().doubleTap();
            app.click(option).modeOptions().doubleClick();
        }
        li.add(options.element());
        this.options = options;
    }
};
ModesElement.prototype.background = function () {
    return this.b;
};
ModesElement.prototype.element = function () {
    return this.e.element();
};
ModesElement.prototype.object = function () {
    return this.e;
};
ModesElement.prototype.setBackground = function (background) {
    this.b = background;
};
ModesElement.prototype.setText = function (text) {
    this.text = text;
};
ModesElement.prototype.setElement = function (element) {
    this.e = element;
};
ModesElement.prototype.setOptions = function (options) {
    this.options = options;
};
ModesElement.prototype.setPosition = function (position) {
    this.element().setAttribute('pos', position);
    this.p = position;
};
ModesElement.prototype.position = function () {
    return this.p;
};
ModesElement.prototype.setOutline = function (outline) {
    this.o = outline;
};
ModesElement.prototype.outline = function () {
    return this.o;
};
ModesElement.prototype.setColor = function (color) {
    this.outline().style.backgroundColor = color.format();
    this.color = color;
    this.text.setColor(color);
};
ModesElement.prototype.createBackground = function (c) {
    var background = document.createElement('div');
    background.setAttribute('class', c);
    return background;
};
ModesElement.prototype.createOutline = function (c) {
    var outline = document.createElement('div');
    outline.setAttribute('class', c);
    return outline;
};
ModesElement.prototype.createOption = function (option, id, index) {
    var element = document.createElement('li');
    element.setAttribute('class', 'modeOption');
    element.setAttribute('modeOptionIndex', index + 1);
    element.setAttribute('id', option + id);
    element.innerHTML = option;
    return element;
};
ModesElement.prototype.id = function () {
    return this.element().id;
};
ModesElement.prototype.outlineDisplay = function (type) {
    this.outline().style.display = type;
};
ModesElement.prototype.hideOutline = function () {
    this.outlineDisplay('none');
};
ModesElement.prototype.showOutline = function () {
    this.outlineDisplay(null);
};
ModesElement.prototype.setIndex = function (index) {
    this.i = index;
};
ModesElement.prototype.index = function () {
    return this.i;
};
ModesElement.prototype.select = function () {
    if (this.options) this.options.show();
    this.text.select();
    this.hideOutline();
    return this;
};
ModesElement.prototype.deselect = function () {
    if (this.options) this.options.hide();
    this.text.deselect();
    this.showOutline();
    return this;
};
module.exports = ModesElement;

},{"../../menu/elements/modeElement.js":57,"../../menu/elements/optionElement.js":59,"../../menu/elements/textElement.js":64,"../../menu/elements/ul.js":65,"../../tools/hsl.js":95}],59:[function(require,module,exports){
'use strict';

UList = require('../../menu/elements/ul.js');
OptionElement = function OptionElement(c) {
    this.setElement(document.createElement('ul'));
    this.setIndex(0);
    this.setClass(c);
};
OptionElement.prototype = Object.create(UList.prototype);
OptionElement.prototype.constructor = OptionElement;
OptionElement.prototype.setOpacity = function (opacity) {
    this.element().style.opacity = opacity;
    return this;
};
OptionElement.prototype.show = function () {
    return this.setOpacity(1);
};
OptionElement.prototype.hide = function () {
    return this.setOpacity(0);
};
OptionElement.prototype.active = function () {
    return this.a;
};
OptionElement.prototype.activate = function () {
    this.a = true;
};
OptionElement.prototype.deactivate = function () {
    this.setIndex(0);
    this.a = false;
};
module.exports = OptionElement;

},{"../../menu/elements/ul.js":65}],60:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    PlayerElement.js creates an element and interface for interacting with co selection

\* --------------------------------------------------------------------------------------*/

Element = require('../../menu/elements/element.js');

PlayerElement = function PlayerElement(number, size, height) {

    var screen = document.getElementById('setupScreen');
    var width = screen.offsetWidth;
    var sections = width / app.map.players();

    this.setNumber(number);
    this.setElement(document.createElement('section'));
    this.setId('player' + number);
    this.setClass('players');
    this.setWidth(size);
    this.setHeight(size);
    this.setLeft(sections * this.index() + (sections - size) / 2);
    this.setTop(height);
};

PlayerElement.prototype = Object.create(Element);

PlayerElement.prototype.list = function () {

    return this.element().childNodes;
};

PlayerElement.prototype.setMode = function (mode) {

    this.m = mode;
};

PlayerElement.prototype.mode = function () {

    return this.m;
};

PlayerElement.prototype.setCo = function (co) {

    this.c = co;
};

PlayerElement.prototype.co = function () {

    return this.c;
};

PlayerElement.prototype.coName = function () {

    return this.co().name();
};

PlayerElement.prototype.setTeam = function (team) {

    this.t = team;
};

PlayerElement.prototype.team = function () {

    return this.t;
};

PlayerElement.prototype.fade = function () {

    return this.co().fader.start();
};

PlayerElement.prototype.fading = function () {

    return this.co().fader.fading();
};

PlayerElement.prototype.stopFading = function () {

    return this.co().fader.stop();
};

PlayerElement.prototype.bottom = function () {

    return this.top() + this.height() + 10;
};

PlayerElement.prototype.toSolid = function () {

    return this.co().fader.stop().toSolid();
};

PlayerElement.prototype.toWhite = function () {

    return this.co().fader.stop().toWhite();
};

PlayerElement.prototype.show = function () {

    this.co().show();
    this.mode().show();
};

PlayerElement.prototype.constructor = PlayerElement;

module.exports = PlayerElement;

},{"../../menu/elements/element.js":54}],61:[function(require,module,exports){
'use strict';

Element = require('../../menu/elements/element.js');
PlayerNumber = function PlayerNumber(number, size, init) {
	var fontSize = size / 4,
	    properties = {
		index: true,
		hide: true
	};
	this.name = number + 'p';
	properties[this.name] = this.name;
	if (number !== 1 || app.game.started()) properties.Cp = 'Cp';
	var props = [this.name, 'Cp'];
	this.setNumber(number);
	this.setType('mode');
	this.setElement(app.dom.createList(properties, this.id(), props));
	this.setClass('playerMode');
	this.sizeFont(fontSize);
	this.setLeft(size - fontSize / 2);
	this.setIndex(init ? props.indexOf(init.uc_first()) : 0);
	this.setDescription('Chose Player or Computer.');
	app.touch(this.element()).element().scroll();
	app.click(this.element()).element().scroll();
};
PlayerNumber.prototype = Object.create(Element);
PlayerNumber.prototype.constructor = PlayerNumber;
PlayerNumber.prototype.getStyle = function (parameter) {
	var parent = Number(this.element().parentNode.style[parameter].replace('px', ''));
	var element = Number(this.element().style[parameter].replace('px', ''));
	return parameter === 'top' || parameter === 'left' ? parent + element : element;
};
module.exports = PlayerNumber;

},{"../../menu/elements/element.js":54}],62:[function(require,module,exports){
'use strict';

Element = require('../../menu/elements/element.js');
SettingElement = function SettingElement(property, parameters) {
    var def,
        list = app.dom.createList(this.rule(property), property + 'Settings', this.allowed);
    this.setType(property);
    this.createOutline(list);
    this.createBackground();
    this.setElements(list.childNodes);
    this.setHeading(property);
    (def = this.settings[property].def) ? this.setDefault(def) : this.setIndex(0);
    app.touch(this.background()).element().scroll(list);
    app.click(this.background()).element().scroll(list);
    this.show();
};
SettingElement.prototype = Object.create(Element);
SettingElement.prototype.constructor = SettingElement;
SettingElement.prototype.setDefault = function (def) {
    this.setIndex(this.find(function (element) {
        return element.className === def.toLowerCase();
    }));
};
SettingElement.prototype.createBackground = function () {
    var background = document.createElement('div');
    background.setAttribute('id', this.type() + 'Background');
    background.setAttribute('class', 'rules');
    return this.b = background;
};
SettingElement.prototype.createOutline = function (list) {
    var outline = document.createElement('div');
    outline.setAttribute('id', this.type() + 'Container');
    outline.setAttribute('class', 'stable');
    outline.appendChild(this.createHeading());
    outline.appendChild(list);
    return this.setElement(outline);
};
SettingElement.prototype.createHeading = function () {
    this.heading = document.createElement('h1');
    return this.heading;
};
SettingElement.prototype.setHeading = function (text) {
    return this.heading.innerHTML = text;
};
SettingElement.prototype.indexOf = function (property) {
    var elements = this.elements();
    for (var i = 0, len = elements.length; i < len; i += 1) {
        if (property === elements[i]) return i;
    }
};
SettingElement.prototype.setHeight = function (top) {
    this.h = top;
    this.background().style.top = top + 'px';
    this.outline().style.top = top + 'px';
};
SettingElement.prototype.setLeft = function (left) {
    this.l = left;
    this.background().style.left = left + 'px';
    this.outline().style.left = left + 'px';
};
SettingElement.prototype.setPosition = function (left, top) {
    this.setHeight(top);
    this.setLeft(left);
};
SettingElement.prototype.allowed = ['on', 'off', 'num', 'clear', 'rain', 'snow', 'random', 'a', 'b', 'c'];
SettingElement.prototype.addNumbers = function (object, inc, min, max) {
    for (var n = min; n <= max; n += inc) {
        object[n] = n;
    }return object;
};
SettingElement.prototype.outline = function () {
    return this.e;
};
SettingElement.prototype.background = function () {
    return this.b;
};
SettingElement.prototype.rule = function (property) {
    var rule = this.settings[property];
    rule.hide = true;
    rule.index = true;
    if (rule.description) this.setDescription(rule.description);
    return rule.inc ? this.addNumbers(rule, rule.inc, rule.min, rule.max) : rule;
};
SettingElement.prototype.rules = app.settings.settingsDisplayElement;
SettingElement.prototype.settings = {
    fog: {
        description: 'Set ON to limit vision with fog of war.',
        on: 'ON',
        off: 'OFF'
    },
    weather: {
        description: 'RANDOM causes climate to change.',
        clear: 'Clear',
        rain: 'Rain',
        snow: 'Snow',
        random: 'Random'
    },
    funds: {
        description: 'Set funds recieved per allied base.',
        inc: 500,
        min: 1000,
        max: 9500
    },
    turn: {
        description: 'Set number of days to battle.',
        off: 'OFF',
        def: 'OFF',
        inc: 1,
        min: 5,
        max: 99
    },
    capt: {
        description: 'Set number of properties needed to win.',
        off: 'OFF',
        def: 'OFF',
        inc: 1,
        min: 7,
        max: 45
    },
    power: {
        description: 'Select ON to enamble CO powers.',
        on: 'ON',
        off: 'OFF'
    },
    visuals: {
        description: ['No animation.', 'Battle and capture animation.', 'Battle animation only.', 'Battle animation for players only.'],
        off: 'OFF',
        a: 'Type A',
        b: 'Type B',
        c: 'Type C'
    }
};
module.exports = SettingElement;

},{"../../menu/elements/element.js":54}],63:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    TeamElement.js defines the element that is used in team selection

\* --------------------------------------------------------------------------------------*/

Element = require('../../menu/elements/element.js');
TeamElement = function TeamElement(number, size) {

    this.teams = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].slice(0, app.map.players());
    var properties = {
        ind: true,
        hide: true
    };
    for (var t, i = 0; i < this.teams.length; i += 1) {
        properties[t = this.teams[i]] = t.toUpperCase() + 'Team';
    }this.setNumber(number);
    this.setType('team');
    this.setElement(app.dom.createList(properties, this.id(), this.teams));
    this.setClass('team');
    this.setTop(size * 4); // may be setTop
    this.setWidth(size);
    this.setCurrent(number - 1);
    this.setDescription('Set alliances by selecting the same team.');
    app.touch(this.element()).element().scroll().doubleTap();
    app.click(this.element()).element().scroll().doubleClick();
};
TeamElement.prototype = Object.create(Element);
TeamElement.prototype.getStyle = function (parameter) {
    var parent = Number(this.element().parentNode.style[parameter].replace('px', ''));
    var element = Number(this.element().style[parameter].replace('px', ''));
    if (parameter === 'top') return parent + element + 10;else return parameter === 'left' ? parent + element : element;
};
TeamElement.prototype.constructor = TeamElement;
module.exports = TeamElement;

},{"../../menu/elements/element.js":54}],64:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    TextElement.js controls the text element on the mode screen

\* --------------------------------------------------------------------------------------*/

TextElement = function TextElement(text) {
    this.createBackground('textBackground').setText(text);
    this.createElement('text').add(this.background());
};
TextElement.prototype.createBackground = function (c) {
    var span = document.createElement('span');
    span.setAttribute('class', c);
    this.setBackground(span);
    return this;
};
TextElement.prototype.setBackground = function (background) {
    this.b = background;
};
TextElement.prototype.background = function () {
    return this.b;
};
TextElement.prototype.setText = function (text) {
    this.t = text;
    this.background().innerHTML = text;
};
TextElement.prototype.text = function () {
    return this.t;
};
TextElement.prototype.length = function () {
    return this.t.length;
};
TextElement.prototype.width = function () {
    return this.element().clientWidth;
};
TextElement.prototype.backgroundWidth = function () {
    return this.background().offsetWidth;
};
TextElement.prototype.setElement = function (element) {
    this.e = element;
};
TextElement.prototype.setColor = function (color) {
    this.element().style.borderColor = typeof color === "string" ? color : color.format();
    this.color = color;
};
TextElement.prototype.setClass = function (c) {
    this.element().setAttribute('class', c);
};
TextElement.prototype.add = function (element) {
    this.element().appendChild(element);
};
TextElement.prototype.createElement = function (c) {
    var text = document.createElement('h1');
    this.setElement(text);
    this.setClass(c);
    return this;
};
TextElement.prototype.element = function () {
    return this.e;
};
TextElement.prototype.setSpacing = function (spacing) {
    this.element().style.letterSpacing = spacing ? spacing + 'px' : null;
};
TextElement.prototype.setBackgroundColor = function (color) {
    this.background().style.backgroundColor = color;
};
TextElement.prototype.hideBackground = function () {
    this.setBackgroundColor('transparent');
};
TextElement.prototype.showBackground = function () {
    this.setBackgroundColor(null);
};
TextElement.prototype.setTransform = function (transform) {
    this.background().style.transform = transform;
};
TextElement.prototype.select = function () {

    var letters = this.length();
    var parentWidth = this.width();
    var bgWidth = this.backgroundWidth();

    // devide the text width by the width of the parent element and divide it by 4 to split between letter spacing and stretching
    var diff = bgWidth / parentWidth / 4;

    // find the amount of spacing between letters to fill the parent
    var spacing = diff * bgWidth / letters;

    this.setTransform(diff + 1); // find the amount of stretch to fill the parent
    this.setSpacing(spacing);
    this.hideBackground();
};
TextElement.prototype.deselect = function () {
    this.setTransform(null);
    this.setSpacing(null);
    this.setBackgroundColor('white');
};
module.exports = TextElement;

},{}],65:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    Ul.js creates an interface for iterating over ul list items
    
\* --------------------------------------------------------------------------------------*/

List = require('../../menu/elements/list.js');

Ul = function Ul(ul, init) {

    this.setElement(ul = ul || document.createElement('ul'));

    this.setCurrent(init);
};

Ul.prototype = Object.create(List.prototype);

Ul.prototype.changeCurrent = function (value) {

    return this.hide().setCurrent(value).show();
};

Ul.prototype.element = function () {

    return this.e;
};

Ul.prototype.setElement = function (element) {

    this.e = element;
    this.setElements(element.childNodes);

    return this;
};

Ul.prototype.hideAll = function () {

    var elements = this.elements(),
        i = elements.length;

    while (i--) {

        elements[i].style.display = 'none';
    }

    return this;
};

Ul.prototype.move = function (index) {

    return this.setIndex(this.scroll(this.wrap(index)));
};

Ul.prototype.setMin = function (min) {

    this.listTop = min;

    return this;
};

Ul.prototype.setMax = function (max) {

    this.listBottom = this.max = max;

    return this;
};

Ul.prototype.setScroll = function (min, max) {

    this.setMin(min).setMax(max).scroll(this.index());

    return this;
};

Ul.prototype.scroll = function (target) {

    var max = this.max;

    if (max) {

        var move = false;

        if (target > this.listBottom) {

            move = true;
            this.listBottom = target;
            this.listTop = target - max;
        } else if (target < this.listTop) {

            move = true;
            this.listBottom = target + max;
            this.listTop = target;
        }

        if (move) {

            var top = this.listTop;
            var bottom = this.listBottom;
            var elements = this.elements();
            var i = elements.length;

            while (i--) {

                this.display(i < top || i > bottom ? "none" : "block", elements[i]);
            }
        }
    }

    return target;
};

Ul.prototype.display = function (display, element) {

    (element ? element : this.current()).style.display = display || null;

    return this;
};

Ul.prototype.indexOf = function (property) {

    var scope = this;

    return this.find(function (element, index) {

        return property && property.toString() === element.className;
    });
};

Ul.prototype.setLeft = function (left) {

    this.element().style.left = left + 'px';
};

Ul.prototype.setBackgroundColor = function (color) {

    if (this.current()) {

        this.current().style.backgroundColor = color || null;
    }
};

Ul.prototype.highlight = function () {

    this.setBackgroundColor('tan');

    return this;
};

Ul.prototype.deHighlight = function () {

    this.setBackgroundColor(null);

    return this;
};

Ul.prototype.show = function (property, display) {

    if (property) {

        this.hide().setCurrent(property);
    }

    this.display(display || 'block');

    return this;
};

Ul.prototype.hide = function () {

    return this.display('none');
};

Ul.prototype.value = function () {

    return this.current().innerHTML.toLowerCase();
};

Ul.prototype.setId = function (id) {

    this.element().setAttribute('id', id);
};

Ul.prototype.id = function (element) {

    return element ? element.id : this.current() ? this.current().id : false;
};

Ul.prototype.class = function (element) {

    return element ? element.className : this.current().className;
};

Ul.prototype.setClass = function (c) {

    this.element().setAttribute('class', c);
};

Ul.prototype.sizeFont = function (s) {

    this.element();
};

Ul.prototype.add = function (element) {

    this.element().appendChild(element);
};

Ul.prototype.prepHorizontal = function () {

    for (var index = 0, ind = this.index(), i = ind - 1; i < ind + 1; i += 1) {

        this.getElement(this.wrap(i)).setAttribute('pos', ['left', 'center', 'right'][index++]);
    }
};

Ul.prototype.constructor = Ul;

module.exports = Ul;

},{"../../menu/elements/list.js":55}],66:[function(require,module,exports){
'use strict';

var _module$exports;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* --------------------------------------------------------------------------------------*\
    
    Footer.js controls the creation and coordination of footer elements

\* --------------------------------------------------------------------------------------*/

module.exports = (_module$exports = {
    display: function display() {

        var footer = app.dom.createMenu([], [], { section: 'descriptionOrChatScreen', div: 'descriptionOrChat' });
        this.setElement(footer);
        var textField = footer.children[0];

        var chat = document.createElement('ul');
        var description = document.createElement('h1');

        chat.setAttribute('id', 'chat');
        description.setAttribute('id', 'descriptions');

        textField.appendChild(chat);
        textField.appendChild(description);

        return textField;
    },
    setElement: function setElement(element) {
        this.e = element;
    },
    element: function element() {
        return this.e;
    }, // could cause problems
    remove: function remove() {
        var element = this.element();
        if (element) element.parentNode.removeChild(element);
    },
    scrolling: function scrolling() {
        var footer = document.createElement('footer');
        var info = document.createElement('p');
        var footSpan = document.createElement('span');
        footSpan.setAttribute('id', 'footerText');
        info.appendChild(footSpan);
        info.setAttribute('id', 'scrollingInfo');
        footer.setAttribute('id', 'footer');
        footer.appendChild(info);
        this.setElement(footer);
        this.setScrollBar(info);
        this.setSpan(footSpan);
        return footer;
    },
    hide: function hide() {
        this.element().display = 'none';
    },
    show: function show() {
        this.element().display = null;
    },
    setScrollBar: function setScrollBar(bar) {
        this.s = bar;
    },
    scrollBar: function scrollBar() {
        return this.s;
    },
    setText: function setText(text) {
        this.t = text;
        this.scrollBar().innerHTML = text;
    },
    setSpan: function setSpan(span) {
        this.sp = span;
    },
    span: function span() {
        return this.sp;
    },
    text: function text() {
        return this.t;
    },
    width: function width() {
        return this.element().offsetWidth;
    },
    textWidth: function textWidth() {
        return this.span().offsetWidth;
    },
    incriment: function incriment() {
        return this.scrollBar().offsetWidth;
    },
    increase: function increase() {
        this.move(1);
    },
    decrease: function decrease() {
        this.move(-1);
    },
    move: function move(_move) {
        this.setPosition(this.position() + _move);
    },
    setPosition: function setPosition(position) {
        this.setLeft(position);
        this.p = position;
    },
    position: function position() {
        return this.p;
    },
    reset: function reset() {
        this.setPosition(-(this.incriment() * 4));
    },
    setLeft: function setLeft(left) {
        this.scrollBar().style.left = left + 'px';
    }
}, _defineProperty(_module$exports, 'increase', function increase() {
    return this.setPosition(this.position() + 1);
}), _defineProperty(_module$exports, 'scroll', function scroll(message) {
    var scope = this,
        position = this.position();
    if (message) {
        if (this.scroller) clearTimeout(this.scroller);
        if (!position) this.setPosition(-this.incriment());
        this.setText(message);
    }
    this.position() <= this.width() ? this.increase() : this.reset();
    this.scroller = setTimeout(function () {
        scope.scroll();
    }, 8);
}), _module$exports);

},{}],67:[function(require,module,exports){
"use strict";

Menu = require("../menu/elements/menu.js");
BuildingsDisplay = require("../menu/elements/buildingsDisplay.js");
Ulist = require("../menu/elements/ul.js");
Select = require("../tools/selection.js");
transmit = require("../sockets/transmitter.js");

Join = Object.create(Menu);

Join.map = function (category) {

    this.h = true;

    return this.chose("map", category);
};

Join.game = function (category) {

    this.h = false;

    return this.chose("game", category);
};

Join.host = function () {

    return this.h;
};

Join.init = function (type, category) {

    this.activate();

    if (category) {

        this.category = category;
    }

    if (type) {

        this.type = type;
    }

    this.element = app.maps[this.category]().type(this.type).screen();

    this.display(type);
};

Join.display = function (type) {

    var screen = this.createScreen("setupScreen");

    this.createTitle("Select*" + type);

    var categories,
        maps = app.dom.createMenu(app.maps.all(), ["name"], this.element, function (list) {
        var element = list.childNodes[0];
        app.touch(element).mapOrGame().doubleTap();
        app.click(element).mapOrGame().doubleClick();
    });

    this.category = categories = app.dom.createMenu(app.settings.categories, "*", {
        section: "categorySelectScreen",
        div: "selectCategoryScreen"
    });

    this.maps = new UList(maps.firstChild).setScroll(0, 4).highlight();
    this.buildings = new BuildingsDisplay();
    this.categories = new UList(categories.firstChild).hideAll().show();

    // handle touch events for swiping through categories
    app.touch(categories).swipe();
    app.click(categories).swipe();

    // add elements to the screen
    screen.appendChild(this.buildings.element());
    screen.appendChild(maps);
    screen.appendChild(categories);

    app.maps.setCategory(this.categories.id());

    //return the modified screen element
    return screen;
};

Join.chose = function (type, category) {

    var map;

    if (!this.active()) {

        this.init(type, category);
    }

    if (app.key.pressed(["left", "right"])) {

        this.selectCategory();
    }

    if (app.maps.updated()) {

        this.update(type);
    }

    if (app.key.pressed(["up", "down"])) {

        this.buildings.set(Select.verticle(this.maps.deHighlight()).highlight().current());
    }

    if (app.key.pressed(app.key.enter()) && (map = app.maps.byId(this.maps.id())) || app.key.pressed(app.key.esc())) {

        app.key.undo();

        return map ? this.setup(map) : this.goBack();
    }
};

Join.selectCategory = function () {

    var categories = this.categories.hide();

    Select.horizontal(categories).show().prepHorizontal();

    app.maps.setCategory(categories.id());

    this.buildings.set(this.maps.current());
};

Join.update = function (type) {

    var elements = app.dom.createMenu(app.maps.all(), ["name"], this.element);
    var replace = document.getElementById(this.element.section);

    replace.parentNode.replaceChild(elements, replace);

    this.buildings.set(app.maps.info());

    this.maps.setElement(elements.firstChild);
    this.maps.highlight();
};

Join.setup = function (game) {

    app.map.set(game.map ? game.map : game);
    app.players.saved(game.saved);

    if (!this.host()) {

        game.players.push(app.user.raw());

        app.players.add(game.players);

        app.game.setSettings(game.settings);

        app.game.setName(game.name);

        app.game.setJoined(true);

        if (game.loaded) {

            transmit.join(game);
        } else if (game.saved) {

            app.game.create(game.name, game.id);
        }
    }

    this.remove();

    return game;
};

Join.goBack = function () {

    app.maps.clear();
    app.game.clear();
    app.game.removeMap();
    this.setBack(true);
    this.remove();
};

Join.remove = function () {

    this.deactivate();

    var select = document.getElementById(this.element.section);
    var buildings = document.getElementById("buildingsDisplay");
    var categories = document.getElementById("categorySelectScreen");

    var screen = this.screen();

    screen.removeChild(select);
    screen.removeChild(buildings);
    screen.removeChild(categories);

    app.key.undo();
};

module.exports = Join;

},{"../menu/elements/buildingsDisplay.js":52,"../menu/elements/menu.js":56,"../menu/elements/ul.js":65,"../sockets/transmitter.js":88,"../tools/selection.js":102}],68:[function(require,module,exports){
'use strict';

app.game = require('../controller/game.js');
app.input = require('../input/input.js');
Menu = require('../menu/elements/menu.js');
User = require('../user/user.js');
transmit = require("../sockets/transmitter.js");

Login = Object.create(Menu);

Login.testAPI = function () {

    var scope = this;

    FB.api('/me', function (response) {

        return scope.loginToSetup(response, 'facebook');
    });
};

// allow login through fb ---- fb sdk
// This is called with the results from from FB.getLoginStatus().
Login.statusChangeCallback = function (response) {

    if (response.status === 'connected') {

        return this.testAPI();
    } else {

        this.loginScreen.style.display = null;

        if (response.status === 'not_authorized') {

            document.getElementById('status').innerHTML = 'Log in to play JS-WARS!';
        } else {

            document.getElementById('status').innerHTML = 'Please log in';
        }
    }
};

// format is where the login is coming from, allowing different actions for different login sources
Login.loginToSetup = function (user, origin) {

    if (user && user.id) {

        app.user = new User(user, origin);

        transmit.addUser(app.user.raw());

        app.user.get();

        if (!app.testing) {

            this.loginScreen.parentNode.removeChild(this.loginScreen);
        }

        app.game.setup();

        return true;
    }
};

Login.setup = function () {

    // create login screen
    var loginScreen = this.createScreen('login');

    // login form
    loginForm = document.createElement('section');
    loginForm.setAttribute('id', 'loginForm');

    var form = app.input.form('loginText', loginForm, 'Guest name input.');
    loginForm.appendChild(form);

    // create button for fb login
    var fbButton = document.createElement('button');
    fbButton.setAttribute('scope', 'public_profile, email');
    fbButton.setAttribute('onClick', 'app.login.send();');
    fbButton.setAttribute('onLogin', 'app.login.verify();');
    fbButton.setAttribute('id', 'fbButton');

    // create a holder for the login status
    var fbStatus = document.createElement('div');
    fbStatus.setAttribute('id', 'status');

    loginForm.appendChild(fbButton);

    loginScreen.appendChild(loginForm);
    loginScreen.appendChild(fbStatus);

    return loginScreen;
};

Login.send = function () {

    // if login is successful go to game setup, otherwise the user has declined
    var paramsLocation = window.location.toString().indexOf('?');
    var params = "";

    if (paramsLocation >= 0) {

        params = window.location.toString().slice(paramsLocation);
    }

    top.location = 'https://graph.facebook.com/oauth/authorize?client_id=1481194978837888&scope=public_profile&email&redirect_uri=http://localhost/' + params;
};

Login.verify = function () {

    var scope = this;

    FB.getLoginStatus(function (response) {

        scope.statusChangeCallback(response);
    });
};

Login.display = function () {

    if (!app.testing) {

        var scope = this;

        window.fbAsyncInit = function () {

            FB.init({

                appId: '1481194978837888',
                oauth: true,
                cookie: true, // enable cookies to allow the server to access 
                xfbml: true, // parse social plugins on this page
                version: 'v2.3' // use version 2.2
            });

            FB.getLoginStatus(function (response) {
                scope.statusChangeCallback(response);
            });
        };

        (function (d, s, id) {

            var js,
                fjs = d.getElementsByTagName(s)[0];

            if (d.getElementById(id)) {

                return;
            }

            js = d.createElement(s);js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        })(document, 'script', 'facebook-jssdk');

        this.loginScreen = this.setup();

        document.body.appendChild(this.loginScreen, app.dom.insertLocation);

        // hide the login screen, only show if someone has logged in
        this.loginScreen.style.display = 'none';
    } else {

        this.loginToSetup({

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

module.exports = Login;

},{"../controller/game.js":9,"../input/input.js":39,"../menu/elements/menu.js":56,"../sockets/transmitter.js":88,"../user/user.js":109}],69:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    Modes.js controls game mode selection 

\* --------------------------------------------------------------------------------------*/

ModesElement = require('../menu/elements/modesElement.js');
ScrollText = require('../effects/scrollText.js');
Menu = require('../menu/elements/menu.js');
List = require('../menu/elements/list.js');
Ulist = require('../menu/elements/ul.js');
Fader = require('../effects/fade.js');
Select = require('../tools/selection.js');

Modes = Object.create(Menu);
Modes.positions = ['twoAbove', 'oneAbove', 'selected', 'oneBelow', 'twoBelow'];
Modes.messages = {
    logout: 'select to log out of the game',
    game: 'Create or continue a saved game',
    newgame: 'Set up a new game',
    continuegame: 'Resume a saved game',
    join: 'Join a new or saved game',
    newjoin: 'Find and join a new game',
    continuejoin: 'Re-Join a saved game started at an earlier time',
    COdesign: 'Customize the look of your CO',
    mapdesign: 'Create your own custom maps',
    design: 'Design maps or edit CO appearance',
    store: 'Purchase maps, CO\'s, and other game goods'
};
Modes.setList = function (elements) {
    this.l = elements;
};
Modes.list = function () {
    return this.l;
};
Modes.setElement = function (element) {
    this.e = element;
};
Modes.element = function () {
    return this.e;
};
Modes.setHeight = function (height) {
    this.h = height;
};
Modes.height = function () {
    return this.h;
};
Modes.properties = function () {
    return app.settings.selectModeMenu;
};
Modes.message = function (id) {
    return this.messages[id];
};
Modes.insert = function (screen) {
    document.body.insertBefore(screen, app.dom.insertLocation);
};
Modes.remove = function () {
    app.dom.removeChildren(this.screen(), 'title');
    app.footer.remove();
    this.deactivate();
    this.fader.stop();
    return this;
};
Modes.init = function () {
    this.activate();
    this.display();
};
Modes.select = function () {
    if (!this.active()) this.init();
    var options = this.options();
    return options && options.active() ? this.selectOption() : this.selectMode();
};
Modes.options = function () {
    return this.mode().options;
};
Modes.mode = function () {
    return this.list().current();
};
Modes.option = function () {
    return this.options().current();
};
Modes.setMode = function (name) {
    this.mode = name;
};
Modes.selectMode = function () {

    if (app.key.pressed(['up', 'down'])) {
        this.mode().deselect();
        this.fader.changeElement(Select.verticle(this.list()).current().select().background()).setColor(this.mode().color.get());
        app.footer.scroll(this.message(this.mode().id()));
        this.rotate();
    }

    var options = this.options();

    if (!options && app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter())) return this.remove().mode().id();

    if (options && app.key.pressed(app.key.right()) && app.key.undo(app.key.right())) {
        options.activate();
        this.fader.changeElement(this.option());
        app.footer.scroll(this.message(this.option().id));
    }
};
Modes.selectOption = function () {
    if (app.key.pressed(['up', 'down'])) {
        this.fader.changeElement(Select.verticle(this.options()).current());
        app.footer.scroll(this.message(this.option().id));
    }

    if (app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter())) return this.remove().option().id;

    if (app.key.pressed(app.key.left()) && app.key.undo(app.key.left())) {
        this.fader.changeElement(this.mode().background());
        app.footer.scroll(this.message(this.mode().id()));
        this.options().deactivate();
    }
};

// rotation stuff
Modes.getPosition = function (index) {
    return this.positions[this.list().wrap(index)] || 'hidden';
};
Modes.getElement = function (index) {
    var list = this.list();
    return list.elements()[list.wrap(index)];
};
Modes.setPosition = function (element, index) {
    this.getElement(element).setPosition(this.getPosition(index));
};
Modes.rotate = function () {
    for (var index = 0, ind = this.mode().index(), i = ind - 2; i <= ind + 2; i += 1) {
        this.setPosition(i, index++);
    }
};

// initialize screen
Modes.display = function () {

    this.setHeight(app.settings.selectedModeHeight);
    var screen = this.createScreen('setupScreen');
    var properties = this.properties(),
        items = [];
    this.createTitle('Select*Mode');

    // create list of selectable modes
    var menu = document.createElement('ul');
    menu.setAttribute('id', 'selectModeMenu');

    // create footer for game info and chat
    var footer = app.footer.scrolling();

    for (var i = 0, len = properties.length; i < len; i += 1) {
        var item = new ModesElement(properties[i], i);
        menu.appendChild(item.element());
        items.push(item);
    }

    // add select menu to select mode screen
    screen.appendChild(menu);
    screen.appendChild(footer);
    this.setList(new List(items));
    this.setElement(new UList(menu));
    var mode = this.mode();
    this.rotate(this.list().indexOf(mode));
    this.insert(screen);
    this.fader = new Fader(mode.select().background(), mode.color.get()).start();
    app.footer.scroll(this.message(this.mode().id()));
    return screen;
};
module.exports = Modes;

},{"../effects/fade.js":28,"../effects/scrollText.js":30,"../menu/elements/list.js":55,"../menu/elements/menu.js":56,"../menu/elements/modesElement.js":58,"../menu/elements/ul.js":65,"../tools/selection.js":102}],70:[function(require,module,exports){
"use strict";

/* --------------------------------------------------------------------------------------*\
    
    exit.js controls exiting a game

\* --------------------------------------------------------------------------------------*/

Select = require('../../tools/selection.js');
transmit = require("../../sockets/transmitter.js");

Exit = function Exit(callback) {

	this.leave = callback || function () {

		app.game.end();
		app.game.remove();
		this.a = false;

		transmit.exit(app.user.player());

		return this;
	};
};

Exit.prototype.prompt = function (message) {

	app.hud.hide();
	app.coStatus.hide();
	app.cursor.hide();
	this.a = true;
	app.confirm.display(message, true);

	return this;
};

Exit.prototype.evaluate = function () {

	var response = app.confirm.response;

	if (response) {

		if (app.key.pressed(["left", "right"])) {

			Select.horizontal(response.deHighlight()).highlight();
		}

		if (app.key.pressed(['enter', 'esc'])) {

			this.deactivate();
			app.confirm.deactivate();
			app.input.remove();

			if (app.key.pressed(app.key.enter()) && response.id() === "yes") this.leave();

			delete app.confirm.response;
			delete this.selected;
			return true;
		}
	}
};

Exit.prototype.active = function () {

	return this.a;
};

Exit.prototype.deactivate = function () {

	this.a = false;
};

module.exports = Exit;

},{"../../sockets/transmitter.js":88,"../../tools/selection.js":102}],71:[function(require,module,exports){
"use strict";

Table = require("../../dom/table.js");
Sort = require("../../tools/sort.js");
Info = function Info(type, display, parameters) {

	var outline = document.createElement("section");
	var container = document.createElement("div");
	var table = new Table(type, display, parameters);

	outline.setAttribute("id", type);
	outline.setAttribute("class", "infoTable");
	outline.appendChild(container);

	container.setAttribute("id", "innerInfo");
	container.appendChild(table.element);

	this.display = display;
	this.parameters = parameters;
	this.type = type;
	this.parent = outline;
	this.child = container;
	this.table = table;

	this.screen().appendChild(this.parent);
};
Info.prototype.remove = function () {
	this.screen().removeChild(this.parent);
};
Info.prototype.screen = function () {
	return document.getElementById("gameScreen");
};

module.exports = Info;

},{"../../dom/table.js":26,"../../tools/sort.js":103}],72:[function(require,module,exports){
"use strict";

/* ----------------------------------------------------------------------------------------------------------*\
    
    options.js handles the in game options selection, end turn, save etc.
    
\* ----------------------------------------------------------------------------------------------------------*/

app = require("../../settings/app.js");
app.game = require("../../controller/game.js");
app.settings = require("../../settings/game.js");
app.players = require("../../controller/players.js");
app.save = require("./save.js");

Info = require("./info.js");
Exit = require("./exit.js");
UList = require("../elements/ul.js");
Teams = require("../teams.js");
Settings = require("../settings.js");
visuals = require("../../effects/visuals.js");
app.key = require("../../input/keyboard.js");
transmit = require("../../sockets/transmitter.js");
playerController = require("../../controller/player.js");

Options = Object.create(UList.prototype);

Options.subMenus = ["rules", "exit", "yield", "save", "status", "unit", "co"];

Options.ruleMenus = [Settings, Teams];
Options.ri = 0;

/* ------=======------ helpers -------=====------ *\
\* -----------------------------------------------*/

Options.hidden = function () {

    return this.hid;
};

Options.deactivate = function () {

    this.a = false;
};

Options.active = function () {

    return this.a;
};

Options.activate = function () {

    this.a = true;
};

Options.screen = function () {

    return this.s;
};

Options.setScreen = function (s) {

    this.s = s;
};

Options.setMode = function (mode) {

    this.m = mode;return this;
};

Options.mode = function () {

    return this.m;
};

Options.screen = function () {

    return document.getElementById("optionsMenu");
};

Options.leaveGame = function (callback) {

    if (!this.leave) {

        this.leave = new Exit(callback).prompt("Are you sure you want to " + this.mode() + "? ");
        this.hide();
    } else if (this.leave.evaluate()) {

        this.leave = false;
        app.screen.reset();
        this.remove();
    }
};

Options.remove = function () {

    this.setMode(false);
    this.deactivate();
    this.show();

    var menu = this.screen();

    if (menu) {

        menu.parentNode.removeChild(menu);
    }
};

Options.init = function (properties, allowed, elements) {

    this.activate();
    this.parent = app.dom.createMenu(properties, allowed, elements);
    this.selected = this.setElement(this.parent.firstChild).setIndex(0).highlight().id();

    return this;
};

Options.select = function () {

    if (!this.hidden()) {

        if (app.key.pressed(["up", "down"])) {

            this.selected = Select.verticle(this.deHighlight()).highlight().id();
        }

        if (app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter())) {

            this[this.setMode(this.selected).mode()]();
        }
    }

    var menu = this.subMenu();

    if (menu) {

        this[menu]();
    }
};

Options.subMenu = function () {

    var mode = this.mode();

    return this.subMenus.find(function (option) {
        return mode === option;
    });
};

Options.hide = function () {

    this.parent.style.display = "none";
    this.hid = true;

    return this;
};

Options.show = function () {

    this.parent.style.display = null;
    this.hid = false;

    return this;
};

/* ------=======------ main menus -------=====------ *\
\* --------------------------------------------------*/

Options.display = function () {

    this.init(app.settings.optionsMenu, app.settings.optionsMenuDisplay, {
        section: "optionsMenu",
        div: "optionSelect"
    });

    return this;
};

Options.co = function () {

    app.screen.reset();
};

Options.save = function () {

    if (!app.save.active()) {

        this.hide();
        app.save.display();
    } else if (app.save.evaluate()) {

        app.save.deactivate();
        this.remove();
        app.screen.reset();
    }
};

Options.end = function () {

    var player = app.players.current();

    playerController.endTurn();

    if (app.user.player() === player) {

        app.screen.reset();

        app.animate(["cursor"]);

        transmit.endTurn(player);
    }

    return this;
};

/* ------=======------ option menus -------=====------ *\
\* ----------------------------------------------------*/

Options.options = function () {

    this.init({
        del: { name: "Delete" },
        yield: { name: "Yield" },
        // music: { name: "Music" },
        visual: { name: "Visual" },
        exit: { name: "Leave" }
    }, ["del", "yield", "visual",
    // "music",
    "exit", "name"], { section: "optionsMenu", div: "optionSelect" });
};

Options.del = function () {

    this.remove();

    app.screen.reset();
    app.hud.show();
    app.coStatus.show();
    app.cursor.deleteMode();
};

Options.yield = function () {

    this.leaveGame(function () {

        app.game.end();

        var player = app.user.player();

        transmit.defeat(player, player, false);
    });
};

Options.music = function () {

    this.remove();

    alert("no music yet");
};

Options.visuals = visuals();

Options.visual = function () {

    if (app.key.pressed(app.key.enter())) {

        selected = Select.verticle(this.visuals.element());
    }

    if (selected) {

        this.visuals.setDescription(selected.toLowerCase());
    }
};

Options.exit = function () {

    this.leaveGame();
};

/* ------=======------ intel menus -------=====------ *\
\* ---------------------------------------------------*/

Options.intel = function () {

    this.init({
        rules: { name: "Rules" },
        status: { name: "Status" },
        unit: { name: "Unit" }
    }, ["rules", "status", "unit", "name"], { section: "optionsMenu", div: "optionSelect" });
};

Options.info = function (name, object, parameters) {

    var selected,
        info = this.infoDisplay;

    if (!info) {

        this.infoDisplay = info = new Info(name, object, parameters);
        info.table.columns.highlight();
        this.hide();
    } else if (app.key.pressed(app.key.left()) || app.key.pressed(app.key.right())) {

        if (selected = Select.horizontal(info.table.columns.deHighlight()).highlight()) {

            info.table.sortBy(selected.value().toLowerCase());
        }
    } else if (app.key.pressed(app.key.esc())) {

        info.remove();

        this.show().setMode("intel").intel();

        delete this.infoDisplay;

        return false;
    }

    return info;
};

Options.status = function () {

    this.info("status", app.players.getInfo(), ["Units", "Lost", "Bases", "Income", "Funds"]);
};

Options.unit = function () {

    var init = this.infoDisplay ? false : true;
    var info = this.info("unit", app.map.unitsInfo(), ["Unit", "HP", "Gas", "Rounds"]);

    if (init || app.key.pressed(app.key.left()) || app.key.pressed(app.key.right())) {

        info.table.rows.highlight();
    }

    if (info && (app.key.pressed(app.key.up()) || app.key.pressed(app.key.down()))) {

        Select.verticle(info.table.rows.deHighlight()).highlight();
    }
};

Options.ruleIndex = function () {

    return this.ri + 1 < this.ruleMenus.length ? this.ri += 1 : this.ri = 0;
};

Options.rules = function () {

    if (app.key.pressed(app.key.enter()) || !this.hidden()) {

        if (!this.hidden()) {

            this.hide();
        } else {

            this.currentMenu.remove();
        }

        (this.currentMenu = this.ruleMenus[this.ruleIndex()]).select();
    } else if (app.key.pressed(app.key.esc())) {

        this.currentMenu.remove();

        var element = document.getElementById("setupScreen");

        element.parentNode.removeChild(element);

        this.show().setMode("intel").intel();
    }
};

module.exports = Options;

},{"../../controller/game.js":9,"../../controller/player.js":13,"../../controller/players.js":14,"../../effects/visuals.js":33,"../../input/keyboard.js":40,"../../settings/app.js":83,"../../settings/game.js":85,"../../sockets/transmitter.js":88,"../elements/ul.js":65,"../settings.js":75,"../teams.js":76,"./exit.js":70,"./info.js":71,"./save.js":73}],73:[function(require,module,exports){
'use strict';

// save
app.key = require('../../input/keyboard.js');
app.cursor = require('../../controller/cursor.js');
app.input = require('../../input/input.js');
app.confirm = require('../../controller/confirmation.js');
transmit = require("../../sockets/transmitter.js");

module.exports = {

    display: function display() {

        app.hud.hide();
        app.coStatus.hide();
        app.cursor.hide();
        app.input.name(app.game.screen(), 'Enter name for save game.');
        this.a = true;
    },

    evaluate: function evaluate() {

        var save = false;

        if (!this.sent() && app.key.pressed(app.key.enter()) && app.input.entry()) {

            this.s = true;

            transmit.confirmSave(app.user.player());

            app.input.removeInput();
            app.confirm.waiting(app.players.other());
        } else if (this.r) {

            if (app.key.pressed(app.key.enter())) {

                if (this.canSave) {

                    app.game.save();
                    this.canSave = false;
                }

                this.remove();
                return true;
            } else if (app.key.pressed(app.key.esc())) {

                transmit.cancelSave(app.user.player());

                this.remove();
                return true;
            }
        }
    },

    recieved: function recieved(answer) {

        this.r = true;
        this.canSave = answer;
    },

    active: function active() {

        return this.a;
    },

    sent: function sent() {

        return this.s;
    },

    remove: function remove() {

        app.input.remove();
        app.screen.reset();
        this.a = false;
        this.s = false;
        this.r = false;
    },

    deactivate: function deactivate() {

        this.a = false;
    }
};

},{"../../controller/confirmation.js":7,"../../controller/cursor.js":8,"../../input/input.js":39,"../../input/keyboard.js":40,"../../sockets/transmitter.js":88}],74:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    handles scrolling of menu elements etc..
    
\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.key = require('../input/keyboard.js');

module.exports = function () {

    var undo = app.key.undo,
        direction,
        then = new Date(),
        scroll = function scroll(neg, pos) {
        if (app.key.pressed(neg) || neg == direction) {
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
        horizontal: function horizontal() {
            this.scroll = scroll('left', 'right');
            return this;
        },
        verticle: function verticle() {
            this.scroll = scroll('up', 'down');
            return this;
        },
        infinite: function infinite(index, min, max) {
            var point = index + this.scroll;
            var def = this.scroll < 0 ? max : min;
            return point > max || point < min ? def : point;
        },
        finite: function finite(index, min, max) {
            if (this.scroll !== undefined) {
                var point = index + this.scroll;
                if (point <= max && point >= min) return point;
            }
            return false;
        },
        wheel: function wheel(dir, now) {
            if (now - then > 200) {
                direction = dir < 0 ? 'up' : 'down';
                then = now;
            }
        },
        swipe: function swipe(dir, now) {
            if (now - then > 200) {
                direction = dir < 0 ? 'left' : 'right';
                then = now;
            }
        }
    };
}();

},{"../input/keyboard.js":40,"../settings/app.js":83}],75:[function(require,module,exports){
'use strict';

Menu = require('../menu/elements/menu.js');
Arrows = require('../objects/arrows.js');
Teams = require('../menu/teams.js');
Select = require('../tools/selection.js');
SettingElement = require('../menu/elements/settingElement.js');
DefaultSettings = require('../settings/default.js');
Sweller = require('../effects/swell.js');
transmit = require("../sockets/transmitter.js");

Settings = Object.create(Menu);
Settings.parameters = new DefaultSettings();
Settings.swelling = false;
Settings.properties = [];
Settings.elements = [];

Settings.rules = {

    // optional parameter defines what display type will be displayed when revealing an element
    display: 'inline-block',

    // type defines what page will be loaded
    type: 'rules',

    // name of the element that is parent to the list
    element: 'Settings',

    // name of the index, comes after the property name: property + index
    index: 'SettingsIndex',

    // holds the name of the tag being retrieved as a value from the selected element
    attribute: 'class',

    // holds the name of the element used for chat and description etc, displayed text
    text: 'descriptions',

    // holds the object that defines all that will be scrolled through
    properties: app.settings.settingsDisplayElement
};

Settings.init = function () {

    var scope = this;
    this.now = new Date();
    this.element = this.display();
    this.activate();

    if (this.arrows) {

        app.input.back() ? this.fall(function () {
            scope.sweller.start();
        }) : this.rise(function () {
            scope.sweller.start();
        });
    } else {

        this.sweller.start();
    }

    Select.setHorizontal(this.elements);
};

Settings.selected = function () {

    return this.elements.current();
};

Settings.select = function (selected) {

    if (!this.active()) {

        this.init();
    }

    if (!app.input.active() || app.input.back()) {

        if (app.key.pressed(['left', 'right'])) {

            selected = Select.setHorizontal(Select.horizontal(this.elements)).getHorizontal();

            this.sweller.stop().setElement(selected.background()).start();

            if (this.arrows) {

                this.arrows.setPosition(selected);
            }
        }

        if (app.key.pressed(['up', 'down']) && !app.game.started()) {

            selected = Select.setVerticle(Select.verticle(Select.getHorizontal().hide())).getHorizontal().show();
        }

        if (selected && !app.game.started()) {

            this.set(selected.type(), selected.value());
        }
    }

    if (!app.game.started()) {

        if (app.key.pressed(app.key.enter()) || app.input.active()) {

            return this.input();
        } else return this.exit(this, function (scope) {

            scope.m = false;
            scope.goBack();
            scope.remove();
        });
    }
};

Settings.set = function (setting, value) {

    return this.parameters[setting] = value;
};

Settings.input = function () {

    if (!app.input.active() || app.input.back()) {
        app.input.undoBack();
        app.input.name(this.screen());
        if (this.arrows) this.arrows.hide();
        app.key.undo();
    }

    if (app.key.pressed(app.key.enter())) {

        var weather,
            name = app.input.value(),
            scope = this;

        if (name) {

            app.players.add(app.user.raw());
            app.game.setSettings(this.parameters);
            app.game.create(name);

            if (weather = this.parameters.weather) {

                app.background.set(weather);
                transmit.background(weather);
            }

            this.remove();

            this.rise(function () {
                scope.element.parentNode.removeChild(scope.element);
            }, 5);

            return this.parameters;
        }
    } else if (app.key.pressed(app.key.esc())) {

        app.key.undo(app.key.esc());
        app.input.clear();
        this.arrows.show();
    }
};

Settings.remove = function () {

    app.footer.remove();

    if (this.arrows) {

        this.arrows.remove();
    }

    this.deactivate();
    this.swelling = false;

    delete this.elements;

    Select.clear();

    if (app.key.pressed(app.key.esc())) {

        this.screen().removeChild(this.element);
    }

    app.key.undo();
};

Settings.display = function () {

    var screen = this.createScreen('setupScreen');
    var keys = Object.keys(app.settings.settingsDisplayElement);
    var offScreen = Number(app.offScreen);
    var elements = [];

    this.createTitle('rules');

    var element = document.createElement('section');

    element.setAttribute('id', 'settings');

    var width = screen.offsetWidth;
    var height = screen.offsetHeight;
    var left = width * .05;
    var middle = height * .5;
    var top = this.arrows ? app.input.back() ? middle - offScreen : middle + offScreen : middle;

    var footer = app.footer.display(screen, this.rules);
    var nameInput = app.input.form('name', footer, 'Enter name here.');

    footer.appendChild(nameInput);

    screen.appendChild(footer.parentNode);

    for (var setting, i = 0, len = keys.length; i < len; i += 1) {

        setting = new SettingElement(keys[i], this.parameters);
        setting.setPosition(left, top);

        left += .13 * width;
        top -= .06 * height;

        element.appendChild(setting.outline());
        element.appendChild(setting.background());
        elements.push(setting);
    }

    this.parameters = app.game.settings() || new DefaultSettings();
    this.sweller = new Sweller(elements[0].background(), 50, 100);
    this.elements = new List(elements);

    screen.appendChild(element);

    if (this.arrows) {

        this.arrows.insert(element).setSpace(40).setPosition(this.elements.current()).fade();
    }

    return element;
};

module.exports = Settings;

},{"../effects/swell.js":31,"../menu/elements/menu.js":56,"../menu/elements/settingElement.js":62,"../menu/teams.js":76,"../objects/arrows.js":78,"../settings/default.js":84,"../sockets/transmitter.js":88,"../tools/selection.js":102}],76:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    Teams.js controls co and team selection

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.key = require('../input/keyboard.js');
app.footer = require('../menu/footer.js');

Menu = require('../menu/elements/menu.js');
Select = require('../tools/selection.js');
PlayerNumber = require('../menu/elements/playerNumber.js');
CoElement = require('../menu/elements/coElement.js');
PlayerElement = require('../menu/elements/playerElement.js');
TeamElement = require('../menu/elements/teamElement.js');
playerController = "../controller/player.js";
aiPlayer = require('../user/aiPlayer.js');
Button = require('../objects/button.js');
transmit = require("../sockets/transmitter.js");

Teams = Object.create(Menu);
Teams.speed = 1.5;
Teams.players = [];
Teams.aiNumber = 0;

Teams.select = function () {

    if (!this.active()) {

        this.init();
    }

    this.coBorderColor();

    if (this.selectingCo()) {

        this.choseCo();
    } else if (this.selectingTeam()) {

        this.choseTeam();
    } else {

        return this.playerReady();
    }
};

Teams.view = function () {

    if (!this.active()) {

        this.init();
    }

    this.coBorderColor();

    if (app.key.pressed(app.key.esc())) {

        return this.remove();
    }
};

Teams.init = function () {

    var scope = this;

    this.display();
    this.activate();

    // initialize player properties
    app.players.all().map(function (player, index) {

        var element = scope.playerElement(index + 1);

        player = playerController.setProperty(player, 'mode', element.mode().value());

        return playerController.setProperty(player, 'co', element.co().value());
    });

    // create start button
    this.button = new Button('setupScreen', function () {
        app.game.start();
    });

    if (this.arrows) {

        this.rise();
    }

    app.game.started() ? this.toTeam() : app.players.saved() ? this.toReady() : this.toCo();
};

Teams.selectableTeams = function (team) {

    var number = app.user.number();
    var teamNumber = team.number();

    return number === teamNumber || number === 1 && Teams.playerElement && Teams.playerElement(teamNumber).mode().isComputer();
};

Teams.selectable = function (element, index, elements) {

    var mode = elements[index + 1];
    var player = app.user.number();
    var number = element.number();

    return element.type() === 'co' ? player === number || player === 1 && mode.isComputer() : player === 1;
};

Teams.top = function () {

    return Number(this.screen().style.top.replace('px', ''));
};

Teams.selectingCo = function () {

    return this.mode === 'co';
};

Teams.selectingTeam = function () {

    return this.mode === 'team';
};

Teams.ready = function () {

    return this.mode === 'ready';
};

Teams.booted = function () {

    return this.bt;
};

Teams.boot = function () {

    this.goBack();
};

Teams.toCo = function (from) {

    if (app.game.joined()) {

        transmit.getPlayerStates(app.map.category(), app.game.name(), app.game.id());
    }

    if (this.mode) {

        this.playersHeight('30%');
    }

    if (this.arrows) {

        this.arrows.setSpace(10).setPosition(this.elements.current()).show();
    }

    Select.setHorizontal(this.elements);
    this.setMode('co');
    this.sel = true;

    return this;
};

Teams.fromCo = function () {

    app.key.undo();

    this.setMode(this.selectTeams() ? 'team' : 'ready');

    return this;
};

Teams.toTeam = function () {

    this.playersHeight('20%');

    this.teamsHeight(this.playerElement(1).bottom() / 1.5);

    this.showTeams();

    if (this.arrows) {

        this.arrows.setSpace(0).setPosition(this.teams.current()).show();
    }

    Select.setHorizontal(this.teams.limit(this.selectableTeams));

    this.setMode('team');

    return this;
};

Teams.fromTeam = function () {

    this.hideTeams();

    return this;
};

Teams.toReady = function () {

    var top,
        player = app.user.player();

    playerController.isReady(player, true);

    this.setMode('ready');

    transmit.ready(player);

    this.playersHeight('20%');

    if (this.arrows) {

        this.arrows.setSpace(10).setPosition(this.elements.current()).hide();
    }

    app.chat.display();

    return this;
};

Teams.fromReady = function () {

    var player = app.user.player();

    playerController.isReady(player, false);

    transmit.ready(player);

    if (this.arrows) {

        this.arrows.hide();
    }

    app.chat.remove();

    app.key.undo();

    this.button.hide();

    return this;
};

Teams.setMode = function (mode) {

    this.mode = mode;
};

Teams.selectTeams = function () {

    return app.map.players() > 2 || app.game.started();
};

Teams.choseCo = function () {

    var player,
        element,
        wasComputer,
        scope = this;

    if (app.key.pressed(['left', 'right'])) {

        element = Select.setHorizontal(Select.horizontal(this.elements.limit(this.selectable))).getHorizontal();

        this.selected = element.type();

        if (this.arrows) {

            this.arrows.setPosition(element);
        }
    }

    if (app.key.pressed(['up', 'down']) && !app.players.saved()) {

        wasComputer = Select.getHorizontal().isComputer();

        element = Select.setVerticle(Select.verticle(Select.getHorizontal().hide())).getVerticle().show();

        if (element.isComputer()) {

            if (!wasComputer) {

                this.addAiPlayer(element.number());
            }
        } else if (wasComputer) {

            this.removeAiPlayer(element.number());
        }
    }

    if (element && (player = app.players.number(element.number()))) {

        app.players.update(playerController.setProperty(player, element.type(), element.value()));
    }

    if (app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter())) {

        this.selectTeams() ? this.fromCo().toTeam() : this.fromCo().toReady();
    } else if (app.key.pressed(app.key.esc())) return this.exit(this, function (scope) {

        scope.goBack();
    });
};

Teams.choseTeam = function () {

    var team;

    if (!app.game.started()) {

        if (app.key.pressed(['left', 'right'])) {

            team = Select.setHorizontal(Select.horizontal(this.teams).limit(this.selectableTeams)).getHorizontal();

            if (this.arrows) {

                this.arrows.setPosition(team);
            }
        }

        if (app.key.pressed(['up', 'down'])) {

            team = Select.verticle(Select.getHorizontal().hide()).show();
        }

        if (team) {

            app.players.number(team.number()).setProperty(team.type(), team.value());
        }

        if (app.key.pressed(app.key.esc()) || app.key.pressed(app.key.enter()) || this.booted()) {

            if (app.key.pressed(app.key.enter())) {

                return this.fromTeam().toReady();
            }

            this.fromTeam().toCo();

            app.key.undo();
        }
    }
};

Teams.playerReady = function (from) {

    app.players.ready() && (app.user.first() || app.players.saved()) ? this.button.show() : this.button.hide();

    if (app.key.pressed(app.key.enter())) {

        app.chat.post(app.chat.send(app.chat.input()));
    }

    if (app.key.pressed(app.key.esc())) {

        if (app.players.saved()) {

            this.goBack();
        } else {

            this.selectTeams() ? this.fromReady().toTeam() : this.fromReady().toCo();
        }
    }
};

Teams.coBorderColor = function () {

    // move through the spaces and check the status of the players, change their border color
    // to indicate whether they are ready to go or not
    for (var number = 1, len = app.map.players(); number <= len; number += 1) {

        // get the player element
        var element = this.playerElement(number);

        // get player
        var player = app.players.number(number);

        // check the mode, if it is cp then it should display a solid border color
        var mode = element.mode();

        // if the  space is not occupied then make the background white
        if (!player && !mode.isComputer()) {

            element.toWhite();

            // if the player is ready or set to computer then make the border color solid
        } else if (mode.isComputer() || playerController.ready(player)) {

            element.toSolid();

            // if the player is not ready yet, but present then fade the color in and out
        } else if (player && !element.fading()) {

            element.fade();
        }
    }
};

Teams.playerElement = function (number) {

    if (this.playerElements) {

        return this.playerElements.getElement(number - 1);
    }
};

Teams.teamElement = function (number) {

    return this.teams.getElement(number - 1);
};

Teams.playersHeight = function (height, len) {

    var height = this.screenHeight() * this.percentage(height);

    for (var n = 1, len = app.map.players(); n <= len; n += 1) {

        this.playerElement(n).setTop(height);
    }
};

Teams.teamsHeight = function (height) {

    for (var n = 1, len = app.map.players(); n <= len; n += 1) {

        this.teamElement(n).setTop(height);
    }
};

Teams.showTeams = function () {

    for (var n = 1, len = app.map.players(); n <= len; n += 1) {

        this.teamElement(n).show();
    }
};

Teams.hideTeams = function () {

    for (var n = 1, len = app.map.players(); n <= len; n += 1) {

        this.teamElement(n).hide();
    }
};

Teams.addAiPlayer = function (number) {

    var player = app.players.number(number),
        n = this.aiNumber += 1;

    player = player ? app.players.replace(player, n) : app.players.add(new AiPlayer(n));
};

Teams.removeAiPlayer = function (number) {

    app.players.remove(app.players.number(number));

    this.selected = Select.setHorizontal(this.elements.limit(this.selectable)).getHorizontal().type();
};

Teams.display = function () {

    var screen = this.createScreen('setupScreen');

    var elements = [],
        teams = [],
        players = [],
        size = 200;

    var element = document.createElement('article');
    element.setAttribute('id', 'teams');

    var footer = app.footer.display(screen).parentNode;
    screen.appendChild(footer);
    this.createTitle('Teams');

    var chatScreen = document.getElementById('descriptionOrChatScreen');
    var chat = app.input.form('chat', chatScreen, 'type here to chat with other players');
    chatScreen.appendChild(chat);

    var height = screen.offsetHeight * .3 + (this.arrows ? app.offScreen : 0),
        started = app.game.started();

    for (var co, player, playerElement, mode, number = 1, nop = app.map.players(); number <= nop; number += 1) {

        playerElement = new PlayerElement(number, size, height);
        player = app.players.number(number);

        elements.push((co = new CoElement(number, player ? player.co : number - 1)).setBorder(5));
        elements.push((mode = new PlayerNumber(number, size, player ? player.mode : 0)).setBorder(5));

        this.players[co.id()] = co.properties();
        this.players[mode.id()] = mode.properties();

        if (!started && player) {

            player = playerController.setNumber(player, number);
            player = playerController.setProperty(player, co.type(), co.value());
            player = playerController.setProperty(player, mode.type(), mode.value());
        }

        playerElement.setMode(mode);
        playerElement.setCo(co);

        playerElement.add(mode.element());
        playerElement.add(co.element());

        if (this.selectTeams()) {

            var team = new TeamElement(number, size);

            if (!started && player) {

                player = playerController.setProperty(player, team.type(), team.value());
            }

            playerElement.add(team.element());
            teams.push(team);
        }

        element.appendChild(playerElement.element());
        players.push(playerElement);
        playerElement.show();
    }

    this.playerElements = new List(players);
    this.elements = new List(elements).limit(this.selectable);

    if (this.selectTeams()) {

        this.teams = new List(teams).limit(this.selectableTeams);
    }

    if (this.arrows) {

        this.arrows.setSize(30).setSpace(10).insert(element).setPosition(this.elements.current()).fade();
    }

    this.selected = this.elements.current().type();

    if (!app.players.saved()) {

        Select.setHorizontal(this.elements);
    }

    screen.appendChild(element);

    return this.element = element;
};

Teams.remove = function () {

    var name,
        teams = this.element;

    this.deactivate();

    if (this.arrows) {

        this.arrows.remove();
    }

    delete this.arrows;
    delete this.mode;
    delete this.playerElements;

    if (app.game.started() || app.game.joined()) {

        this.screen().removeChild(teams);
    }
};

Teams.goBack = function () {

    this.remove();

    if (!app.game.joined()) {

        this.fall(function () {

            screen.removeChild(teams);
        });
    }

    if (app.players.length() < 2) {

        app.game.remove(app.players.saved() ? true : false);

        if (app.game.joined()) {

            app.game.setJoined(false);
            app.game.removeMap();
        }
    }

    app.players.reset();
    transmit.exit();
    app.input.goBack();
    this.setBack(true);
};

module.exports = Teams;

},{"../input/keyboard.js":40,"../menu/elements/coElement.js":53,"../menu/elements/menu.js":56,"../menu/elements/playerElement.js":60,"../menu/elements/playerNumber.js":61,"../menu/elements/teamElement.js":63,"../menu/footer.js":66,"../objects/button.js":79,"../settings/app.js":83,"../sockets/transmitter.js":88,"../tools/selection.js":102,"../user/aiPlayer.js":106}],77:[function(require,module,exports){
'use strict';

Arrow = function Arrow(d) {
    this.direction = d;
    this.arrowBackground = document.createElement('div');
    this.arrowBackground.setAttribute('id', d + 'ArrowBackground');
    this.arrowBackground.setAttribute('class', d + 'Arrow');

    this.arrowOutline = document.createElement('div');
    this.arrowOutline.setAttribute('id', d + 'ArrowOutline');
    this.arrowOutline.setAttribute('class', d + 'Arrow');
    this.arrowOutline.appendChild(this.arrowBackground);

    var existing = document.getElementById(this.arrowOutline.id);
    if (existing) existing.parentNode.replaceChild(this.arrowOutline, existing);
};
Arrow.prototype.width = function () {
    return this.w;
};
Arrow.prototype.setWidth = function (width) {
    this.w = width;
};
Arrow.prototype.side = {
    up: 'Bottom',
    down: 'Top',
    left: 'Right',
    right: 'Left'
};
Arrow.prototype.setColor = function (color) {
    this.background().style['border' + this.side[this.direction] + 'Color'] = color;
};
Arrow.prototype.outline = function () {
    return this.arrowOutline;
};
Arrow.prototype.background = function () {
    return this.arrowBackground;
};
Arrow.prototype.height = function (height) {
    this.outline().style.top = height + 'px';
};
Arrow.prototype.setLeft = function (left) {
    this.outline().style.left = left + 'px';
};
Arrow.prototype.setTop = function (top) {
    this.outline().style.top = top + 'px';
};
Arrow.prototype.setPosition = function (x, y) {
    this.setLeft(x);
    this.setTop(y);
};
Arrow.prototype.remove = function () {
    var outline = this.outline();
    outline.parentNode.removeChild(outline);
};
Arrow.prototype.setSize = function (size) {
    var border = size / 4,
        arrow = this.outline(),
        background = this.background(),
        type = this.direction;
    this.setWidth(size);
    background.style.left = border - size + 'px';
    if (type === 'up') {
        arrow.style.borderLeftWidth = size + 'px';
        arrow.style.borderRightWidth = size + 'px';
        arrow.style.borderTopWidth = size + 'px';
        background.style.borderLeftWidth = size - border + 'px';
        background.style.borderRightWidth = size - border + 'px';
        background.style.borderTopWidth = size - border + 'px';
    } else if (type === 'down') {
        arrow.style.borderLeftWidth = size + 'px';
        arrow.style.borderRightWidth = size + 'px';
        arrow.style.borderBottomWidth = size + 'px';
        background.style.borderLeftWidth = size - border + 'px';
        background.style.borderRightWidth = size - border + 'px';
        background.style.borderBottomWidth = size - 2 + 'px';
    } else if (type === 'left') {
        arrow.style.borderLeftWidth = size + 'px';
        arrow.style.borderBottomWidth = size + 'px';
        arrow.style.borderTopWidth = size + 'px';
        background.style.borderLeftWidth = size - border + 'px';
        background.style.borderBottomWidth = size - border + 'px';
        background.style.borderTopWidth = size - border + 'px';
    } else if (type === 'right') {
        arrow.style.borderBottomWidth = size + 'px';
        arrow.style.borderRightWidth = size + 'px';
        arrow.style.borderTopWidth = size + 'px';
        background.style.borderBottomWidth = size - border + 'px';
        background.style.borderRightWidth = size - border + 'px';
        background.style.borderTopWidth = size - border + 'px';
    }
    return this;
};

},{}],78:[function(require,module,exports){
'use strict';

arrow = require('../objects/arrow.js');
Fader = require('../effects/fade.js');

Arrows = function Arrows(screen, space, over, under) {
    this.setDown(new Arrow('down'));
    this.setUp(new Arrow('up'));
    this.fader = new Fader(this.list(), this.color);
    this.over = over || 0;
    this.under = under || 0;
    this.space = space || 0;
    this.setScreen(screen);
};
Arrows.prototype.setSeperation = function (seperation) {
    this.seperation = seperation;
    return this;
};
Arrows.prototype.setDown = function (arrow) {
    this.d = arrow;
};
Arrows.prototype.setUp = function (arrow) {
    this.u = arrow;
};
Arrows.prototype.list = function () {
    return [this.up(), this.down()];
};
Arrows.prototype.setScreen = function (screen) {
    this.s = screen;
};
Arrows.prototype.color = app.settings.colors.white;
Arrows.prototype.hide = function () {
    this.display('none');
};
Arrows.prototype.show = function () {
    this.display(null);
};
Arrows.prototype.display = function (display) {
    this.list().map(function (arrow) {
        arrow.outline().style.display = display;
    });
};
Arrows.prototype.remove = function () {
    if (this.fader.fading()) this.fader.stop();
    this.list().map(function (arrow) {
        arrow.remove();
    });
};
Arrows.prototype.setSize = function (size) {
    this.setWidth(size);
    this.list().map(function (arrow) {
        arrow.setSize(size);
    });
    return this;
};
Arrows.prototype.setSpace = function (space) {
    this.space = space;return this;
};
Arrows.prototype.setOver = function (over) {
    this.over = over;return this;
};
Arrows.prototype.setUnder = function (under) {
    this.under = under;return this;
};
Arrows.prototype.setWidth = function (width) {
    this.w = width;return this;
};
Arrows.prototype.width = function () {
    return this.w || 30;
};
Arrows.prototype.setPosition = function (element) {

    var b,
        border = element.border && !isNaN(b = element.border()) ? b : 0;

    var position = element.position();
    var dimension = element.dimensions();
    var arrow = this.width() / 2;
    var top = position.y - arrow - border;
    var left = position.x;
    var width = dimension.x - border * 2;
    var bottom = top + dimension.y + arrow + border * 3;
    var center = width / 2 - arrow;

    this.up().setPosition(left + center, top - this.space - this.over);
    this.down().setPosition(left + center, bottom + this.space + this.under);

    return this;
};
Arrows.prototype.fade = function (speed, swell) {
    this.fader.start(function (color, arrows) {
        for (var i = 0, len = arrows.length; i < len; i += 1) {
            arrows[i].setColor(color);
        }
    });
};
Arrows.prototype.insert = function (element) {
    this.setScreen(element);
    element.appendChild(this.u.outline());
    element.appendChild(this.d.outline());
    return this;
};
Arrows.prototype.screen = function () {
    return this.s;
};
Arrows.prototype.up = function () {
    return this.u;
};
Arrows.prototype.down = function () {
    return this.d;
};

module.exports = Arrows;

},{"../effects/fade.js":28,"../objects/arrow.js":77}],79:[function(require,module,exports){
'use strict';

Button = function Button(id, action) {
    this.screen = document.getElementById(id);
    this.action = action;
    var button = document.createElement('div');
    button.setAttribute('class', 'button');
    button.setAttribute('id', 'startButton');
    button.style.display = 'none';
    this.button = button;
    this.screen.appendChild(button);
    var scope = this;
    this.button.addEventListener("click", function (event) {
        event.preventDefault();
        if (scope.action) scope.action();
    });
};
Button.prototype.show = function () {
    this.button.style.display = '';
};
Button.prototype.hide = function () {
    this.button.style.display = 'none';
};
Button.prototype.remove = function () {
    this.screen.removeChild(this.button);
};
module.exports = Button;

},{}],80:[function(require,module,exports){
'use strict';

app = require('../settings/app.js');
app.dom = require('../tools/dom.js');
app.touch = require('../input/touch.js');
app.click = require('../input/click.js');

// display damage percentage
DamageDisplay = function DamageDisplay(percentage) {

    this.setColor({ h: 0, s: 100, l: 50 });

    var position = app.hud.position();
    var exists = document.getElementById('damageDisplay');
    var damageDisp = document.createElement('div');
    var damageDiv = document.createElement('div');

    damageDisp.setAttribute('id', 'damageDisplay');
    damageDiv.setAttribute('id', 'damage');

    damageDiv.style.backgroundColor = this.color.format();

    var heading = document.createElement('h1');
    var percent = document.createElement('h2');

    heading.innerHTML = 'DAMAGE';
    percent.innerHTML = percentage + '%';

    damageDisp.appendChild(heading);
    damageDiv.appendChild(percent);
    damageDisp.appendChild(damageDiv);

    this.b = damageDiv;
    this.o = damageDisp;
    this.p = percent;

    this.setPosition(app.hud.position());

    this.fader = new Fader(damageDiv, this.color.get()).fadeBoth().transparentBorder().start();

    if (exists) exists.parentNode.replaceChild(damageDisp, exists);else document.body.insertBefore(damageDisp, app.dom.insertLocation);
};
DamageDisplay.prototype.setColor = function (color) {
    this.color = new Hsl(color);
};
DamageDisplay.prototype.setPosition = function (position) {
    this.outline().style.left = position.x - 7 + "px";
    return this;
};
DamageDisplay.prototype.background = function () {
    return this.b;
};
DamageDisplay.prototype.outline = function () {
    return this.o;
};
DamageDisplay.prototype.setPercentage = function (percent) {
    this.p.innerHTML = percent;
};
DamageDisplay.prototype.percentage = function () {
    return this.p.innerHTML;
};
DamageDisplay.prototype.remove = function () {
    this.outline().parentNode.removeChild(this.outline());
};
module.exports = DamageDisplay;

},{"../input/click.js":38,"../input/touch.js":41,"../settings/app.js":83,"../tools/dom.js":94}],81:[function(require,module,exports){
'use strict';

Position = function Position(x, y, relativePosition) {

    this.x = x;
    this.y = y;
    this.orientation = relativePosition;
};

Position.prototype.inMap = function (positions) {

    var dim = app.map.dimensions();

    return this.x >= 0 && this.y >= 0 && this.x < dim.x && this.y < dim.y;
};

Position.prototype.neighbors = function () {

    var x = this.x,
        y = this.y;
    var result = [];
    var positions = [new Position(x - 1, y, 'west'), new Position(x, y - 1, 'south'), new Position(x + 1, y, 'east'), new Position(x, y + 1, 'north')];

    return this.filter(positions);
};

Position.prototype.on = function (p) {

    return this.x === p.x && this.y === p.y;
};

Position.prototype.corners = function () {

    var x = this.x,
        y = this.y;

    var positions = [new Position(x - 1, y - 1, 'northWest'), new Position(x + 1, y - 1, 'southEast'), new Position(x + 1, y + 1, 'northEast'), new Position(x - 1, y + 1, 'southWest')];

    return this.filter(positions);
};

Position.prototype.filter = function (positions) {

    var result = [];

    for (var i = 0; i < positions.length; i += 1) {

        if (positions[i].inMap()) {

            result.push(positions[i]);
        }
    }

    return result;
};

Position.prototype.surrounding = function () {

    return this.neighbors().concat(this.corners());
};

Position.prototype.log = function () {

    console.log('{ x: ' + this.x + ', y: ' + this.y + ' }');
};

module.exports = Position;

},{}],82:[function(require,module,exports){
"use strict";

ScoreElement = function ScoreElement(name, worth) {
	this.name = name;
	this.worth = worth;
	this.amount = 0;
};

module.exports = ScoreElement;

},{}],83:[function(require,module,exports){
'use strict';

/* ---------------------------------------------------------------------------------------------------------*\
    
    App.js is a container and holds variables for all elements of the application 

\* ---------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');

module.exports = {

    testing: false,
    games: [],

    // return an hsl string from either manual settings or object containing hsl values
    hsl: function hsl(h, s, l) {
        var format = function format(hue, saturation, lightness) {
            return 'hsl(' + hue + ',' + saturation + '%,' + lightness + '%)';
        };
        if (!s && s !== 0) return format(h.h, h.s, h.l);
        return format(h, s, l);
    },

    // holds number of pixles to move elements on or off screen
    offScreen: 800,

    // holds temporary shared variables, usually info on game state changes that need to be accessed globally
    temp: {},

    // holds previously selected elements for resetting to defaults
    prev: {},

    // holds default shared variables, usually info on game state changes that need to be accessed globally
    def: {
        category: 0,
        menuOptionsActive: false,
        selectActive: false,
        cursorMoved: true,
        saturation: 0,
        scrollTime: 0,
        lightness: 50
    },

    // holds cache for drawings <-- move to draw?
    cache: {},

    // set custom animation repo if desired
    setAnimationRepo: function setAnimationRepo(repo) {
        this.animationRepo = repo;
        return this;
    }
};

},{"../settings/app.js":83}],84:[function(require,module,exports){
'use strict';

/* ------------------------------------------------------------------------------- *\

    Default values for game settings

\* ------------------------------------------------------------------------------- */

module.exports = function () {
    this.funds = 1000;
    this.fog = 'off';
    this.weather = 'random';
    this.turn = 'off';
    this.capt = 'off';
    this.power = 'on';
    this.visuals = 'off';
};

},{}],85:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    settings consolidates all the customizable options and rules for the game into
    an object for easy and dynamic manipulation
    
\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');

app.settings = {

    // speed at which color swell.. fading in and out, will cycle (lower is faster)
    colorSwellIncriment: 1.5,
    colorSwellSpeed: 2,

    // general swell speed
    swellIncriment: 3,
    swellSpeed: 1,

    //typing speed
    typingSpeed: 2.5,

    // colors of menus etc...
    colors: {
        design: { h: 216, s: 100, l: 50 },
        store: { h: 72, s: 100, l: 50 },
        game: { h: 0, s: 100, l: 50 },
        join: { h: 144, s: 100, l: 50 },
        logout: { h: 288, s: 100, l: 50 },
        white: { h: 360, s: 0, l: 100 },
        yellow: { h: 72, s: 100, l: 50 },
        green: { h: 144, s: 100, l: 50 },
        red: { h: 0, s: 100, l: 50 },
        blue: { h: 216, s: 100, l: 50 }
    },
    playerColor: {
        1: { h: 0, s: 100, l: 50 },
        2: { h: 216, s: 100, l: 50 },
        3: { h: 72, s: 100, l: 50 },
        4: { h: 144, s: 100, l: 50 }
    },

    // speed at which the screen will move to next hq at the changinf of turns
    scrollSpeed: 50,

    // types to look through when determining terrains effect on unit movement
    obsticleTypes: ['unit', 'terrain'],

    // list of the effects each obsticle has on each unit type
    obsticleStats: {

        infantry: {
            mountain: 2,
            wood: 1,
            plain: 1,
            unit: 1000
        },

        mountain: {
            infantry: 2,
            apc: 2
        },
        wood: {
            infantry: 1,
            apc: 2
        },
        plain: {
            infantry: 1,
            apc: 1
        },
        unit: {
            infantry: 1,
            apc: 1
        }
    },

    selectedModeHeight: 75,

    selectModeMenu: [{
        id: 'game',
        display: 'Game',
        type: 'setup',
        options: ['new', 'continue']
    }, {
        id: 'join',
        display: 'Join',
        type: 'join',
        color: 'yellow',
        options: ['new', 'continue']
    }, {
        id: 'design',
        display: 'Design',
        type: 'design',
        options: ['map', 'CO']

    }, {
        id: 'store',
        display: 'Store',
        type: 'store'
    }, {
        id: 'logout',
        display: 'Logout',
        type: 'exit'
    }],

    categories: {
        two: {
            type: '1 on 1'
        },
        three: {
            type: '3 Player'
        },
        four: {
            type: '4 Player'
        },
        five: {
            type: '5 Player'
        },
        six: {
            type: '6 Player'
        },
        seven: {
            type: '7 Player'
        },
        eight: {
            type: '8 Player'
        },
        preDeployed: {
            type: 'Pre-Deployed'
        }
    },

    capture: 20,

    combinableProperties: ['fuel', 'health', 'ammo'],

    // terrain each unit is allowed to walk on
    movable: {
        foot: ['plain', 'river', 'mountain', 'wood', 'road', 'building'],
        wheels: ['plain', 'wood', 'road', 'building'],
        flight: ['plain', 'river', 'mountain', 'wood', 'road', 'water', 'building'],
        boat: ['water', 'building']
    },

    optionsMenu: {
        co: {
            name: 'Co'
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

    playersDisplayElement: {},

    settingsDisplayElement: {
        fog: {
            description: 'Set ON to limit vision with fog of war.',
            on: 'ON',
            off: 'OFF'
        },
        weather: {
            description: 'RANDOM causes climate to change.',
            clear: 'Clear',
            rain: 'Rain',
            snow: 'Snow',
            random: 'Random'
        },
        funds: {
            description: 'Set funds recieved per allied base.',
            inc: 500,
            min: 1000,
            max: 9500
        },
        turn: {
            description: 'Set number of days to battle.',
            off: 'OFF',
            inc: 1,
            min: 5,
            max: 99
        },
        capt: {
            description: 'Set number of properties needed to win.',
            off: 'OFF',
            inc: 1,
            min: 7,
            max: 45
        },
        power: {
            description: 'Select ON to enamble CO powers.',
            on: 'ON',
            off: 'OFF'
        },
        visuals: {
            description: {
                off: 'No animation.',
                a: 'Battle and capture animation.',
                b: 'Battle animation only.',
                c: 'Battle animation for players only.'
            },
            off: 'OFF',
            a: 'Type A',
            b: 'Type B',
            c: 'Type C'
        }
    },

    // dimensions of diplay hud
    hudWidth: 120,
    hudHeight: 200,
    hudLeft: 1050,

    // spacing / positioning of mode menu selection elements
    modeMenuSpacing: 20,

    // which attributes of objects ( unit, buildings etc ) will be displayed in hud
    hoverInfo: ['ammo', 'showHealth', 'health', 'name', 'fuel', 'defense', 'canvas'],

    // which actions can be displayed
    actionsDisplay: ['attack', 'capture', 'wait', 'load', 'drop', 'join', 'name'],

    // unit info attributes for display
    unitInfoDisplay: ['movement', 'vision', 'fuel', 'weapon1', 'weapon2', 'property', 'value'],

    // options attributes for displ
    optionsMenuDisplay: ['options', 'unit', 'intel', 'save', 'end', 'name'],

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

},{"../settings/app.js":83}],86:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\

    handle socket connections

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.game = require('../controller/game.js');
app.chat = require('../controller/chat.js');
app.options = require('../menu/options/optionsMenu.js');
app.key = require('../input/keyboard.js');
app.maps = require('../controller/maps.js');
app.map = require('../controller/map.js');
app.players = require('../controller/players.js');
app.cursor = require('../controller/cursor.js');
app.background = require('../map/background.js');
app.units = require('../definitions/units.js');
app.confirm = require('../controller/confirmation.js');

Validator = require('../tools/validator.js');
Player = require('../user/player.js');
Unit = require('../map/unit.js');
Teams = require('../menu/teams.js');
unitController = require("../controller/unit.js");

module.exports = function (socket) {

    var validate = new Validator('sockets');

    // all in game commands
    socket.on('confirmSave', function (player) {

        app.confirm.save(app.players.get(player));
    });

    socket.on('confirmationResponse', function (response) {

        app.confirm.player(response.answer, app.players.get(response.sender));
    });

    socket.on('cursorMove', function (move) {

        app.key.press(move);

        app.cursor.move(true);
    });

    socket.on('background', function (type) {

        app.background.set(type);
    });

    socket.on('endTurn', function (id) {

        if (validate.turn(id)) {

            app.options.end();
        }
    });

    socket.on('addUnit', function (unit) {

        var player = app.players.get(unitController.player(unit));

        if (validate.build(unit)) {

            if (playerController.canPurchase(player, unitController.cost(unit))) {

                playerController.purchase(player, unit.cost());

                app.map.addUnit(unit);
            }
        }
    });

    socket.on('attack', function (action) {

        if (validate.attack(action)) {

            var attacker = app.map.getUnit(action.attacker);
            var attacked = app.map.getUnit(action.attacked);

            unitController.attack(attacker, attacked, action.damage);

            if (app.user.owns(attacked) && !unitController.attacked(attacked)) {

                unitController.attack(attacked, attacker);
            }
        }
    });

    socket.on('joinUnits', function (action) {

        if (validate.combine(action)) {

            var target = app.map.getUnit(action.unit);
            var selected = app.map.getUnit(action.selected);

            unitController.join(target, selected);
        }
    });

    socket.on('moveUnit', function (move) {

        var unit = app.map.getUnit(move);
        var target = move.position;

        if (validate.move(unit, target)) {

            unitController.move(target, move.moved, unit);

            app.animate("unit");
        }
    });

    socket.on('loadUnit', function (load) {

        var passanger = app.map.getUnit({ id: load.passanger });
        var transport = app.map.getUnit({ id: load.transport });

        if (validate.load(transport, passanger)) {

            unitController.load(passanger, transport);
        }
    });

    socket.on('delete', function (unit) {

        app.map.removeUnit(unit);
    });

    socket.on('unload', function (transport) {

        var unit = app.map.getUnit(transport);

        unitController.drop(transport.index, transport, unit);
    });

    socket.on('defeat', function (battle) {

        var player = app.players.get(battle.conqueror);
        var defeated = app.players.get(battle.defeated);

        playerController.defeat(player, defeated, battle.capturing);
    });

    // all setup and menu commands
    socket.on('setMap', function (map) {

        app.game.setMap(map);
    });

    socket.on('start', function (game) {

        app.game.start();
    });

    socket.on('userAdded', function (message) {

        app.chat.post(message);
    });

    socket.on('gameReadyMessage', function (message) {

        app.chat.post(message);
    });

    socket.on('propertyChange', function (properties) {

        app.players.changeProperty(properties);
    });

    socket.on('readyStateChange', function (player) {

        var player = app.players.get(player);

        playerController.isReady(player);

        app.players.checkReady();
    });

    socket.on('addPlayer', function (player) {

        app.players.add(player);
    });

    socket.on('addRoom', function (room) {

        app.maps.add(room);
    });

    socket.on('removeRoom', function (room) {

        app.maps.remove(room);
    });

    socket.on('disc', function (user) {

        app.chat.post({
            message: 'has been disconnected.',
            user: user.name.uc_first()
        });

        app.players.remove(user);
    });

    socket.on("userLeftRoom", function (game) {

        app.maps.removePlayer(game.room, game.player);
    });

    socket.on('userLeft', function (user) {

        app.chat.post({
            message: 'has left the game.',
            user: user.name.uc_first()
        });

        app.players.remove(user);
        app.players.checkReady();
    });

    socket.on('userRemoved', function (user) {

        app.chat.post({
            message: 'has been removed from the game.',
            user: user.name.uc_first()
        });

        app.players.remove(user);
    });

    socket.on('userJoined', function (user) {

        app.players.add(user);

        if (!playerController.isComputer(user)) {

            app.chat.post({
                message: 'has joined the game.',
                user: user.name.uc_first()
            });
        }
    });

    socket.on('joinedGame', function (joined) {

        app.game.load(joined);
    });

    socket.on('back', function () {

        Teams.boot();
    });

    socket.on('getPlayerStates', function () {

        socket.emit("ready", app.user.player());
    });

    return socket;
};

},{"../controller/chat.js":6,"../controller/confirmation.js":7,"../controller/cursor.js":8,"../controller/game.js":9,"../controller/map.js":10,"../controller/maps.js":11,"../controller/players.js":14,"../controller/unit.js":18,"../definitions/units.js":24,"../input/keyboard.js":40,"../map/background.js":43,"../map/unit.js":51,"../menu/options/optionsMenu.js":72,"../menu/teams.js":76,"../settings/app.js":83,"../tools/validator.js":104,"../user/player.js":108}],87:[function(require,module,exports){
"use strict";

/* --------------------------------------------------------------------------------------*\

    socket.js handles the socket connection and adds recieving methods

\* --------------------------------------------------------------------------------------*/

var addRecievers = require("../sockets/reciever.js");

module.exports = function (io) {

    var socket = io.connect("http://127.0.0.1:8080") || io.connect("http://jswars-jswars.rhcloud.com:8000");

    return addRecievers(socket);
}();

},{"../sockets/reciever.js":86}],88:[function(require,module,exports){
"use strict";

var _module$exports;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* --------------------------------------------------------------------------------------*\
    
    transmitter.js controls socket communication to the server

\* --------------------------------------------------------------------------------------*/

app.map = require("../controller/map.js");
playerController = require("../controller/player.js");
app.socket = require("../sockets/socket.js");

module.exports = (_module$exports = {
    captured: function captured(unit, building) {

        if (app.user.turn()) {

            app.socket.emit("captured", { unit: unit, building: building });
        }
    },


    attack: function attack(attacker, attacked, damage) {

        app.socket.emit("attack", { attacker: attacker, attacked: attacked, damage: damage });
    },

    move: function move(id, target, distance) {

        if (app.user.turn()) {

            app.socket.emit("moveUnit", { id: id, position: target, moved: distance });
        }
    },

    join: function join(unit1, unit2) {

        if (app.user.turn()) {

            app.socket.emit("joinUnits", { unit: unit2, selected: unit1 });
        }
    },

    load: function load(id1, id2) {

        app.socket.emit("loadUnit", { transport: id2, passanger: id1 });
    },

    unload: function unload(id, position, index) {

        app.socket.emit("unload", { id: id, pos: position, index: index });
    },

    cursor: function cursor(direction) {

        app.socket.emit("cursorMove", direction);
    },

    delete: function _delete(unit) {

        app.socket.emit("delete", unit);
    },

    createRoom: function createRoom(room) {

        app.socket.emit("newRoom", room);
    },

    removeRoom: function removeRoom(room) {

        app.socket.emit("removeRoom", room);
    },

    setUserProperty: function setUserProperty(player, property, value) {

        app.socket.emit("setUserProperties", { property: property, value: value, player: player });
    },

    aiTurn: function aiTurn(player) {

        app.socket.emit("aiTurn", { map: app.map.get(), player: player });
    },

    endTurn: function endTurn(player) {

        app.socket.emit("endTurn", playerController.id(player));
    },

    defeat: function defeat(conqueror, player, capturing) {

        app.socket.emit("defeat", { defeated: player, conqueror: conqueror, capturing: capturing });
    },

    removeAi: function removeAi(player) {

        app.socket.emit("removeAiPlayer", player);
    }

}, _defineProperty(_module$exports, "join", function join(game) {

    app.socket.emit("join", game);
}), _defineProperty(_module$exports, "ready", function ready(player) {

    app.socket.emit("ready", player);
}), _defineProperty(_module$exports, "exit", function exit(player) {

    app.socket.emit("exit", player);
}), _defineProperty(_module$exports, "boot", function boot(player) {

    app.socket.emit("boot", player);
}), _defineProperty(_module$exports, "getPlayerStates", function getPlayerStates(category, name, id) {

    app.socket.emit("getPlayerStates", {

        category: category,
        name: name,
        id: id
    });
}), _defineProperty(_module$exports, "addAi", function addAi(player) {

    app.socket.emit("addAiPlayer", player);
}), _defineProperty(_module$exports, "addUser", function addUser(user) {

    app.socket.emit("addUser", user);
}), _defineProperty(_module$exports, "message", function message(_message) {

    app.socket.emit("gameReadyChat", _message);
}), _defineProperty(_module$exports, "confirmationResponse", function confirmationResponse(response, sender) {

    app.socket.emit("confirmationResponse", {

        answer: response,
        to: playerController.id(sender)
    });
}), _defineProperty(_module$exports, "confirmSave", function confirmSave(player) {

    app.socket.emit('confirmSave', player);
}), _defineProperty(_module$exports, "cancelSave", function cancelSave(player) {

    app.socket.emit('saveCancelled', player);
}), _defineProperty(_module$exports, "background", function background(_background) {

    app.socket.emit('background', _background);
}), _defineProperty(_module$exports, "start", function start(game) {

    app.socket.emit("start", game);
}), _defineProperty(_module$exports, "addUnit", function addUnit(unit) {

    app.socket.emit("addUnit", unit);
}), _module$exports);

},{"../controller/map.js":10,"../controller/player.js":13,"../sockets/socket.js":87}],89:[function(require,module,exports){
"use strict";

function binaryHeap() {
    var getValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (number) {
        return number;
    };


    var heap = [],
        isMaxHeap = false;

    var valueAtIndex = function valueAtIndex(currentHeap, index) {
        return getValue(currentHeap[index - 1]);
    },
        parent = function parent(index) {
        return Math.floor(index / 2);
    },
        leftChild = function leftChild(index) {
        return index * 2;
    },
        rightChild = function rightChild(index) {
        return leftChild(index) + 1;
    },
        swapChildWithParent = function swapChildWithParent(currentHeap) {
        var child = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
        var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;


        var childIndex = child - 1,
            parentIndex = parent - 1,
            modifiedHeap = currentHeap.slice();

        modifiedHeap[childIndex] = currentHeap[parentIndex];
        modifiedHeap[parentIndex] = currentHeap[childIndex];

        return modifiedHeap;
    },
        inequality = function inequality(heap, leftChildIndex, rightChildIndex) {

        var valueOfLeftChild = valueAtIndex(heap, leftChildIndex),
            valueOfRightChild = valueAtIndex(heap, rightChildIndex);

        return isMaxHeap ? valueOfLeftChild > valueOfRightChild : valueOfLeftChild < valueOfRightChild;
    },
        moveElementToPositionInHeap = function moveElementToPositionInHeap(value, currentHeap, index) {

        var boundary = 1,
            childIndex = index,
            modifiedHeap = currentHeap.slice(),
            parentIndex = parent(childIndex),
            inBounds = function inBounds(index) {
            return index > boundary;
        };

        while (inBounds(childIndex) && inequality(modifiedHeap, childIndex, parentIndex)) {

            modifiedHeap = swapChildWithParent(modifiedHeap, childIndex, parentIndex);
            childIndex = parentIndex;
            parentIndex = parent(childIndex);
        }

        return modifiedHeap;
    },
        choseIndex = function choseIndex(currentHeap, rightChildIndex, leftChildIndex) {

        var isInBounds = currentHeap.length > rightChildIndex;

        if (isInBounds && inequality(currentHeap, leftChildIndex, rightChildIndex)) {

            return rightChildIndex;
        }

        return leftChildIndex;
    },
        sortHeap = function sortHeap(currentHeap, index) {

        var bounds = currentHeap.length;

        var parentIndex = index,
            childIndex = parentIndex,
            modifiedHeap = currentHeap.slice(),
            leftChildIndex = leftChild(parentIndex);

        while (leftChildIndex < bounds) {

            childIndex = choseIndex(modifiedHeap, leftChild(parentIndex), rightChild(parentIndex));
            modifiedHeap = swapChildWithParent(modifiedHeap, childIndex, parentIndex);
            parentIndex = childIndex;
        }

        if (childIndex <= bounds) {

            return modifiedHeap;
        }

        modifiedHeap = swapChildWithParent(modifiedHeap, childIndex, bounds);

        return moveElementToPositionInHeap(modifiedHeap[bounds], modifiedHeap, bounds);
    },
        removeAndReturnTopElement = function removeAndReturnTopElement() {
        return sortHeap(heap, 1).pop();
    },
        toSortedArray = function toSortedArray(heap) {

        var sortedArray = heap.map(function () {
            return removeAndReturnTopElement();
        });

        sortedArray.forEach(function (element) {
            return heap.push(element);
        });

        return sortedArray;
    };

    return {

        size: function size() {
            return heap.length;
        },
        top: function top() {
            return heap[0];
        },
        pop: function pop() {
            return removeAndReturnTopElement();
        },
        forEach: function forEach(callback) {
            return toSortedArray(heap).forEach(function (element) {
                return callback(element);
            });
        },
        map: function map(callback) {

            var newHeap = binaryHeap(getValue);

            heap.forEach(function (element) {
                return newHeap.push(callback(element));
            });

            return newHeap;
        },
        push: function push(value) {

            heap = moveElementToPositionInHeap(value, heap, heap.length);

            return this;
        },
        setToMax: function setToMax() {

            isMaxHeap = true;

            return this;
        },
        setToMin: function setToMin() {

            isMaxHeap = false;

            return this;
        },
        clear: function clear() {

            heap = [];

            return this;
        }
    };
}

module.exports = binaryHeap;

},{}],90:[function(require,module,exports){
'use strict';

/* ----------------------------------------------------------------------------------------------------------*\
    
    Calculate.js handles necessary game calculations 

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

    var rand = function rand() {
        return floor(random() * 9 + 1);
    };

    return {

        arrayDifferance: function arrayDifferance(array1, array2) {
            var array = [];
            for (var push, h = 0; h < array1.length; h += 1) {
                push = true;
                for (var l = 0; l < array2.length; l += 1) {
                    if (array1[h] === array2[l]) push = false;
                }if (push) array.push(array1[h]);
            }
            return array;
        },

        distance: function distance(a, b) {
            return abs(a.x - b.x) + abs(a.y - b.y);
        },

        numberOfBuildings: function numberOfBuildings(map) {

            // get selected maps building list
            var type,
                all = map.buildings,
                buildings = {};

            if (!all) return false;

            // add one for each building type found  to the building display list
            for (var n = 0; n < all.length; n += 1) {
                type = all[n].type;
                if (type !== 'hq') {
                    if (isNaN(buildings[type])) buildings[type] = 1;else buildings[type] += 1;
                }
            }
            return buildings;
        },

        longestLength: function longestLength(arrays) {
            var i,
                longest = arrays[0],
                length = arrays.length;
            if (length > 1) for (i = 1; i < length; i += 1) {
                if (arrays[i].length > longest.length) longest = arrays[i];
            }return longest.length;
        },

        damage: function damage(attacked, attacker) {

            var r = rand();
            var baseDamage = attacker.baseDamage()[attacked.name().toLowerCase()];
            var coAttack = attacker.player().co.attack(attacker);
            var coDefense = attacked.player().co.defense(attacked);
            var terrainDefense = attacked.occupies().defense() || 1;

            // return the health of the attacker, multiplied by
            return round(attacker.showHealth() / 10 *

            // absolute value of the amount of damage, multiplied by the co attack and a random number
            abs(baseDamage * coAttack / 100 + r)

            // absolute valye of the defense of co, plus the terrain defense bonus, 
            // plus the health of the unit, subtracted from 200, all divided by one hundred
            * abs((200 - (coDefense + terrainDefense * attacked.showHealth())) / 100));
        },

        random: function random(range) {
            return Math.floor(Math.random() * range);
        }
    };
}();

},{"../controller/map.js":10,"../controller/screen.js":15,"../settings/app.js":83,"../settings/game.js":85}],91:[function(require,module,exports){
"use strict";

/*------------------------------------------------------------------------------*\

	Composition, composes an array of objects or functions into a single object

\*------------------------------------------------------------------------------*/

module.exports = function () {

	var makeArray = function makeArray(elements) {

		return elements.constructor === Array ? elements : [elements];
	};

	// condenses a list of objects together into a single object
	var combine = function combine(objects) {

		var l = objects.length,
		    object = {};

		while (l--) {

			Object.assign(object, objects[l]);
		}

		return object;
	};

	var exclusive = function exclusive(exclusions, object1, object2) {

		var composed = Object.assign({}, object1);
		var keys = Object.keys(object2);
		var k,
		    l = keys.length;

		while (l--) {

			k = keys[l];

			if (!exclusions[k] && !composed[k]) {

				composed[k] = object2[k];
			}
		}

		return composed;
	};

	var inclusive = function inclusive(inclusions, object1, object2) {

		var composed = Object.assign({}, object1);
		var i,
		    l = inclusions.length;

		while (l--) {

			i = inclusions[l];

			if (!composed[i]) {

				composed[i] = object2[i];
			}
		}

		return composed;
	};

	return {

		include: function include(elements) {

			var including = makeArray(elements);

			return {

				excluding: this.excluding,
				including: including,
				include: this.include,
				compose: this.compose,
				functions: this.functions
			};
		},

		exclude: function exclude(elements) {

			var exclude = {};
			var list = makeArray(elements);
			var l = list.length;

			while (l--) {

				exclude[list[l]] = true;
			}

			return {

				excluding: exclude,
				including: this.including,
				include: this.include,
				compose: this.compose,
				functions: this.functions
			};
		},

		compose: function compose() {

			var args = [].slice.call(arguments);
			var length = args.length;

			if (length < 1) {

				throw new Error("compose must take at least one argument, found none.", "composition.js");
			}

			var object = Object.assign({}, args[0]);
			var objects = args.slice(1);

			if (objects.length < 1) {

				return object;
			}

			var combined = combine(objects);
			var composed = false;

			if (this.excluding) {

				composed = exclusive(this.excluding, object, combined);

				this.excluding = false;
			}

			if (this.including) {

				composed = inclusive(this.including, object, combined);

				this.including = false;
			}

			if (!composed) {

				composed = Object.assign(object, combined);
			}

			return composed;
		},

		/*
  	composes a list of functions (functions) together and returns the generated value, if no value is input for the
  	second argument (input), then a function is returned that will recieve the input and apply the functions to that
  	input when it is called.
  		@functions = [(a -> b)]
  	@input = a
  */

		functions: function functions(_functions, input) {

			var compose = function compose(input) {

				var l = _functions.length - 1;

				var value = _functions[l](input);

				while (l--) {

					value = _functions[l](value);
				}

				return value;
			};

			return input === undefined ? compose : compose(input);
		}
	};
}();

},{}],92:[function(require,module,exports){
"use strict";

Counter = function Counter(limit) {
	this.limit = limit;
	this.frames = 0;
};

Counter.prototype.incriment = function () {
	this.frames += 1;
};
Counter.prototype.reached = function (limit) {
	return this.frames > (limit ? limit : this.limit);
};
Counter.prototype.reset = function () {
	if (this.reached()) this.frames = 0;
};

module.exports = Counter;

},{}],93:[function(require,module,exports){
"use strict";

module.exports = function (input, context) {

    if (!isFunction(input)) {

        throw new Error("First argument of \"curry\" must be a function.", "tools/curry.js");
    }

    var inputs = input.length;

    return function f1() {

        var args = Array.prototype.slice.call(arguments, 0);

        if (args.length >= inputs) {

            return input.apply(context, args);
        } else {

            return function f2() {

                var args2 = Array.prototype.slice.call(arguments, 0);

                return f1.apply(context, args.concat(args2));
            };
        }
    };
};

},{}],94:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* ------------------------------------------------------------------------------------------------------*\
    
    list of functions used to assist manipulating the dom

\* ------------------------------------------------------------------------------------------------------*/

module.exports = {

    insertLocation: document.getElementById('before'),

    remove: function remove(element) {
        var remove = document.getElementById(element);
        if (remove) remove.parentNode.removeChild(remove);
        return this;
    },

    // create a canvas to display the hovered map element in the hud
    createCanvas: function createCanvas(id, object, dimensions) {

        var type = typeof object.type === 'function' ? object.type() : object.type;
        var clas = typeof object.class === 'function' ? object.class() : object.class;
        var canvas = document.createElement('canvas'); // create canvas
        var context = canvas.getContext(app.ctx); // get context

        // set width, height and id attributes
        canvas.setAttribute('width', dimensions.width);
        canvas.setAttribute('height', dimensions.height);
        canvas.setAttribute('id', type || id + 'Canvas');

        // return canvas info for further use
        return {
            canvas: canvas,
            context: context,
            type: type,
            class: clas
        };
    },

    createCanvasLi: function createCanvasLi(id, object, dimensions) {
        var li = this.createElement('li', false, 'canvas');
        li.appendChild(this.createCanvas(id, object, dimensions || { width: 128, height: 128 }).canvas);
        return li;
    },

    createElement: function createElement(tag, id, clas) {
        var element = document.createElement(tag);
        if (clas) element.setAttribute('class', clas);
        if (id) element.setAttribute('id', id);
        return element;
    },

    createList: function createList(object, id, displayedAttributes) {

        // get a list of property names
        var properties = Object.keys(object);
        var ul = this.createElement('ul', id);

        if (object.id) ul.setAttribute('itemNumber', object.id);

        // go through each property and create a list element for it, then add it to the ul;
        for (var ind = 0, i = 0; i < properties.length; i += 1) {

            // properties
            var props = properties[i];

            // only use properties specified in the displayed attributes array
            if (displayedAttributes === '*' || displayedAttributes.hasValue(props) || displayedAttributes.hasValue('num') && !isNaN(props)) {

                ind += 1;

                var property = typeof object[props] === 'function' ? object[props]() : object[props];

                if (property === undefined) continue;

                // create list element and give it a class defining its value
                var li = this.createElement('li', false, props);

                if (object.index) li.setAttribute(id + 'Index', ind);
                if (object.hide) li.style.display = 'none';

                // if the list is an object, then create another list with that object and append it to the li element
                if ((typeof property === 'undefined' ? 'undefined' : _typeof(property)) === 'object') li.appendChild(this.createList(property, props, displayedAttributes));

                // if the list element is text, add it to the innerHTML of the li element
                else li.innerHTML = property;

                // append the li to the ul
                ul.appendChild(li);
            }
        }
        return ul;
    },

    getDisplayedValue: function getDisplayedValue(id) {
        var element = document.getElementById(id);
        var children = element.childNodes;
        var len = children.length;
        for (c = 0; c < len; c += 1) {
            var child = children[c];
            if (child.style.display !== 'none') return child.getAttribute('class');
        }
    },

    // remove all children of dom element
    removeAllChildren: function removeAllChildren(element, keep) {
        while (element.firstChild) {
            var clear = element.firstChild;
            if (clear.id !== keep) {
                element.removeChild(clear);
            } else {
                var keeper = element.firstChild;
                element.removeChild(clear);
            }
        }
        if (keeper) element.appendChild(keeper);
    },

    // remove children of dom element
    removeChildren: function removeChildren(element, keep) {
        var remove = element.children;
        for (var c = 0; c < remove.length; c += 1) {
            var clear = remove[c];
            if (clear.id !== keep) {
                element.removeChild(clear);
            }
        }
    },

    // find each element by their tag name, get the element that matches the currently selected index and return it
    findElementByTag: function findElementByTag(tag, element, index) {

        var length = element.length;
        for (var e = 0; e < length; e += 1) {
            // element returns a string, so must cast the index to string for comparison
            // if the element tag value ( index ) is equal to the currently selected index then return it
            if (element[e].getAttribute(tag) === index.toString()) {
                return element[e];
            }
        }
    },

    getImmediateChildrenByTagName: function getImmediateChildrenByTagName(element, type) {
        var elements = [];
        if (element) {
            var children = element.childNodes;
            var name = type.toUpperCase();
            var len = children.length;
            for (var i = 0; i < len; i += 1) {
                var child = children[i];
                if (child.nodeType === 1 && child.tagName === name) elements.push(child);
            }
        }
        return elements;
    },

    show: function show(_show, list, display) {
        if (!display) var display = '';
        if (_show) {
            _show.style.display = display;
            _show.setAttribute('default', true);
            return _show.getAttribute('class');
        } else {
            list[0].style.display = display;
            list[0].setAttribute('default', true);
            return list[0].getAttribute('class');
        }
    },

    hide: function hide(name) {
        var element = document.getElementById(name);
        element.hidden.style.visibility = 'hidden';
    },

    changeDefault: function changeDefault(change, element) {

        var nodes = element.childNodes;

        for (var i = 0; i < nodes.length; i += 1) {

            if (nodes[i].getAttribute('default')) {
                nodes[i].style.display = 'none';
                nodes[i].removeAttribute('default');
            }

            if (nodes[i].getAttribute('class') === change) this.show(nodes[i]);
        }
    },

    getDefault: function getDefault(element) {
        if (element) {
            var i = 0,
                children = element.childNodes;
            if (children) while (child = children[i++]) {
                if (child.getAttribute('default')) return child.getAttribute('class');
            }
        }
        return false;
    },
    length: function length(children, min) {
        var i = min;
        while (children[i]) {
            i += 1;
        }return i + 1;
    },
    createMenu: function createMenu(properties, allowedProperties, elements, callback) {

        var inner = elements.div;
        var outer = elements.section;

        // build the outside screen container or use the existing element
        var display = document.getElementById(outer) || document.createElement('section');
        display.setAttribute('id', outer);

        // build inner select screen or use existing one
        var exists = document.getElementById(inner);
        var innerScreen = document.createElement('div');
        innerScreen.setAttribute('id', inner);

        // get each unit type for looping over
        var keys = Object.keys(properties);
        var len = keys.length;

        for (var u = 0; u < len; u += 1) {

            var key = keys[u];
            var props = properties[key];

            // create list for each unit with its cost
            var list = this.createList(props, key, allowedProperties);
            if (props.id || props.id === 0) list.setAttribute('id', props.id);
            if (inner) list.setAttribute('class', inner + 'Item');
            if (callback) callback(list, props);

            // add list to the select screen
            innerScreen.appendChild(list);
        }

        // add select screen to build screen container
        if (exists) exists.parentNode.replaceChild(innerScreen, exists);else document.body.insertBefore(display, this.insertLocation);

        display.appendChild(innerScreen);
        return display;
    }
};

},{}],95:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    Hsl.js creates an object for interaction with hsl color values

\* --------------------------------------------------------------------------------------*/

Hsl = function Hsl(h, s, l) {
	this.hue = !s ? h.h : h;
	this.saturation = s || h.s;
	this.lightness = l || h.l;
};
Hsl.prototype.get = function () {
	return { h: this.hue, s: this.saturation, l: this.lightness };
};
Hsl.prototype.format = function () {
	return 'hsl(' + this.hue + ',' + this.saturation + '%,' + this.lightness + '%)';
};
module.exports = Hsl;

},{}],96:[function(require,module,exports){
"use strict";

module.exports = function () {

	var _id = 0;

	return {

		id: function id() {

			_id += 1;return _id;
		}
	};
}();

},{}],97:[function(require,module,exports){
'use strict';

/* ------------------------------------------------------------------------------------------------------------*\
    
    app.init creates a new canvas instance, taking the name of the target canvas id and optionally the context
    as a second perameter, it defaults to a 2d context. init also provides methods for rendering, setting 
    animations and returning the screen dimensions

\* ------------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.draw = require('../animation/draw.js');

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
        var screenClear = function screenClear() {
            animate.clearRect(0, 0, screenWidth, screenHeight);
        };

        return {

            // set the context for the animation, defaults to 2d
            setContext: function setContext(context) {
                this.context = context;
                return this;
            },

            // insert animation into canvas
            setAnimations: function setAnimations(animations) {
                this.animations = animations;
                return this;
            },

            // draw to canvas
            render: function render(hide, gridSquareSize) {
                // pass a function to loop if you want it to loop, otherwise it will render only once, or on demand
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
            dimensions: function dimensions() {
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

},{"../animation/draw.js":3,"../settings/app.js":83}],98:[function(require,module,exports){
"use strict";

terrainController = require("../controller/terrain.js");
unitController = require("../controller/unit.js");
Terrain = require('../map/terrain.js');

/* ----------------------------------------------------------------------------------- *\

	Matrix holds map elements in a matrix for quick access during map analysis

\* ----------------------------------------------------------------------------------- */

module.exports = function (dimensions) {

	matrix = {};
	dummies = [];

	return {

		/*
  *	insert takes a map element and inserts it into the matrix 
  *	position representing its location on a grid
  */

		insert: function insert(element) {

			var p = terrainController.position(element);

			if (!matrix[p.x]) {

				matrix[p.x] = {};
			}

			matrix[p.x][p.y] = element;

			return matrix[p.x][p.y];
		},

		remove: function remove(element) {

			var existing = this.get(element);

			if (!terrainController.isBuilding(existing)) {

				if (terrainController.isUnit(element)) {

					if (unitController.isSame(existing, element)) {

						this.insert(unitController.occupies(element));
					}
				} else {

					this.insert(new Terrain('plain', terrainController.position(element)));
				}
			}

			return element;
		},

		position: function position(p, init) {

			var e,
			    d = dimensions,
			    x = matrix[p.x];

			if (p.x <= d.x && p.x >= 0 && p.y <= d.y && p.y >= 0) {

				if ((!x || !x[p.y]) && !init) {

					dummies.push(p);

					this.insert(new Terrain('plain', p));
				}

				return matrix[p.x][p.y];
			}

			return false;
		},

		clean: function clean() {

			var x,
			    p,
			    e,
			    l = dummies.length;

			while (l--) {

				p = dummies[l];
				x = matrix[p.x];
				e = x ? x[p.y] : false;

				if (e && !terrainController.isUnit(e) && !terrainController.isBuilding(e)) {

					delete matrix[p.x][p.y];
				}
			}

			dummies = [];
		},

		get: function get(element) {

			return this.position(terrainController.position(element));
		}
	};
};

},{"../controller/terrain.js":17,"../controller/unit.js":18,"../map/terrain.js":49}],99:[function(require,module,exports){
"use strict";

/* ------------------------------------------------------------------------------------------------------*\
   
    matrixTracking.js keeps track of visited indices within a matrix, for pathfinding etc..
   
\* ------------------------------------------------------------------------------------------------------*/

Position = require("../objects/position.js");
terrainController = require("../controller/terrain.js");
unitController = require("../controller/unit.js");

module.exports = function () {

    var tracking = {};

    var tracker = {

        close: function close(element) {

            this.add(unitController.position(element));

            return this;
        },

        add: function add(position) {

            var x = position.x;
            var y = position.y;

            if (!tracking[x]) {

                tracking[x] = {};
            }

            tracking[x][y] = {

                position: new Position(x, y)
            };

            return this;
        },

        element: function element(_element) {

            return this.position(terrainController.position(_element));
        },

        position: function position(_position) {

            var x = _position.x;

            return tracking[x] ? tracking[x][_position.y] : false;
        },

        setF: function setF(element, value) {

            set(element, value, 'f');

            return this;
        },

        setG: function setG(element, value) {

            set(element, value, 'g');

            return this;
        },

        setParent: function setParent(element, value) {

            set(element, value, 'p');

            return this;
        },

        getF: function getF(element) {

            return get(element, 'f');
        },

        getG: function getG(element) {

            return get(element, 'g');
        },

        getParent: function getParent(element) {

            return get(element, 'p');
        },

        clear: function clear() {

            tracking = {};

            return this;
        }
    };

    var set = function set(element, value, property) {

        var p = terrainController.position(element);
        var x = p.x;
        var y = p.y;

        if (tracking[x]) {

            if (tracking[x][y]) {

                tracking[x][y][property] = value;
            }
        }
    };

    var get = function (element, property) {

        var e = this.element(element);

        return e ? e[property] : false;
    }.bind(tracker);

    return tracker;
};

},{"../controller/terrain.js":17,"../controller/unit.js":18,"../objects/position.js":81}],100:[function(require,module,exports){
'use strict';

/* --------------------------------------------------------------------------------------*\
    
    Path.js controls pathfinding

\* --------------------------------------------------------------------------------------*/

Position = require('../objects/position.js');
matrixTracker = require("../tools/matrixTracking.js");
heap = require('../tools/binaryHeap.js');
unitController = require("../controller/unit.js");
terrainController = require("../controller/terrain.js");
composer = require("../tools/composition.js");
curry = require("../tools/curry.js");

module.exports = function (map) {

    var coordinates = [];
    var _visited = matrixTracker();

    var getNeighbors = function getNeighbors(position) {

        var x = position.x;
        var y = position.y;

        return [new Position(x - 1, y), new Position(x + 1, y), new Position(x, y - 1), new Position(x, y + 1)].reduce(function (neighbors, position) {

            var neighbor = app.map.top(position);

            if (neighbor && !_visited.element(neighbor)) {

                neighbors.push(neighbor);
            }

            return neighbors;
        }, []);
    };

    var distance = function distance(position, origin, target) {

        var dx1 = position.x - target.x;
        var dy1 = position.y - target.y;
        var dx2 = origin.x - target.x;
        var dy2 = origin.y - target.y;

        var cross = Math.abs(dx1 * dy2 - dx2 * dy1);
        var rand = Math.floor(Math.random() + 1) / 1000;

        return Math.abs(dx1) + Math.abs(dy1) + cross * rand;
    };

    var getF = function getF(element) {

        return _visited.getF(element);
    };

    return {

        show: function show(effect) {

            app.animate('effects');
        },

        size: function size() {

            return coordinates.length;
        },

        clear: function clear() {

            coordinates = [];

            return this;
        },

        set: function set(p) {

            return coordinates = coordinates.concat(p);
        },

        get: function get() {

            return coordinates;
        },

        reachable: function reachable(unit, movement) {

            var open = heap(getF);
            var reachable = [unit];
            var allowed = movement || unitController.movement(unit);
            var neighbor, neighbors, current, cost;

            _visited.close(unit);
            open.push(_visited.element(unit));

            while (current = open.pop()) {

                getNeighbors(unitController.position(current)).forEach(function (neighbor) {

                    cost = (_visited.getF(current) || 0) + unitController.moveCost(neighbor, unit);

                    if (cost <= allowed) {

                        _visited.close(neighbor).setF(neighbor, cost);

                        open.push(_visited.element(neighbor));

                        reachable.push(neighbor);
                    }
                });
            }

            return reachable;
        },

        find: function find(unit, target) {

            var open = heap(getF);
            var current, cost, neighbor, g;
            var position = unitController.position(unit);
            var allowed = unitController.movement(unit);
            var getElement = composer.functions([app.map.top, unitController.position]);
            var scope = this;

            _visited.close(unit).setF(unit, distance(position, position, target));
            open.push(_visited.close(unit).element(unit));

            while (current = open.pop()) {

                position = unitController.position(current);

                // if the targetination has been reached, return the array of values
                if (position.on(target)) {

                    var path = [getElement(current)];

                    while (current = _visited.getParent(current)) {

                        path.unshift(getElement(current));
                    }

                    _visited.clear();

                    return this.set(path);
                }

                getNeighbors(position).forEach(function (neighbor) {

                    var currentG = _visited.getG(current) || 0;
                    var moveCost = unitController.moveCost(neighbor, unit);

                    cost = currentG + moveCost;

                    g = _visited.getG(neighbor);

                    if (cost <= allowed && !g || g >= _visited.getG(current)) {

                        _visited.close(neighbor).setG(neighbor, cost).setF(neighbor, cost + distance(unitController.position(neighbor), unitController.position(unit), target)).setParent(neighbor, current);

                        open.push(_visited.element(neighbor));
                    }
                });
            }

            _visited.clear();

            return false;
        },

        visited: function visited() {

            return _visited;
        },

        clean: function clean() {

            _visited.clear();
        }
    };
};

},{"../controller/terrain.js":17,"../controller/unit.js":18,"../objects/position.js":81,"../tools/binaryHeap.js":89,"../tools/composition.js":91,"../tools/curry.js":93,"../tools/matrixTracking.js":99}],101:[function(require,module,exports){
"use strict";

/* ---------------------------------------------------------------------------------------------------------*\
    
    handle AJAJ calls
    
\* ---------------------------------------------------------------------------------------------------------*/

module.exports = function () {

    var ajaj = function ajaj(input, action, callback, url) {

        if (!url) throw new Error('No address specified for back end services');

        try {
            // Opera 8.0+, Firefox, Chrome, Safari
            var request = new XMLHttpRequest();
        } catch (e) {
            // Internet Explorer Browsers
            try {
                var request = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    var request = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {
                    // Something went wrong
                    alert("Your browser broke!");
                    return false;
                }
            }
        }

        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200 && request.responseText) return callback ? callback(JSON.parse(request.responseText)) : JSON.parse(request.responseText);
        };

        try {
            var ts = new Date().getTime();
            request.open(action, url + '?ts=' + ts, true);
            request.setRequestHeader("Content-type", "application/json;charset=UTF-8");
            request.send(JSON.stringify(input));
        } catch (e) {
            console.log(e);
            return false;
        }
    };
    return {
        post: function post(input, url, callback) {
            return ajaj(input, 'POST', callback, url);
        },
        get: function get(input, url, callback) {
            return ajaj(input, 'GET', callback, url + '/' + input);
        },
        del: function del(input, url, callback) {
            return ajaj(input, 'DELETE', callback, url + '/' + input);
        }
    };
}();

},{}],102:[function(require,module,exports){
"use strict";

module.exports = {

    describe: function describe(selected) {

        if (selected.description && selected.description()) {

            app.input.message(selected.description());
        }
    },

    getHorizontal: function getHorizontal() {

        return this.hElement;
    },

    getVerticle: function getVerticle() {

        return this.vElement;
    },

    verticle: function verticle(elements) {

        return this.move(elements, ["up", "down"]);
    },

    horizontal: function horizontal(elements) {

        return this.move(elements, ["left", "right"]);
    },

    move: function move(elements, keys) {

        return app.key.pressed(keys[1]) ? elements.next() : elements.prev();
    },

    setHorizontal: function setHorizontal(e) {

        var selected = e.current();
        this.describe(selected);
        this.hElement = selected;

        return this;
    },

    setVerticle: function setVerticle(e) {

        if (e.descriptions()) {

            this.describe(e);
        }

        this.vElement = e;

        return this;
    },

    touch: function touch(touched, elements) {

        var index = elements.indexOf(touched);

        if (isNaN(index)) {

            return false;
        }

        elements.current().hide();

        this.setHorizontal(elements.setIndex(index).show("inline-block"));
    },

    clear: function clear() {

        delete this.vElement;
        delete this.hElement;
    }
};

},{}],103:[function(require,module,exports){
"use strict";

Heap = require("./binaryHeap.js");
Sort = function Sort(list) {
	this.l = list;
	this.b = false;
	this.m = false;
	this.h = new Heap();
};
Sort.prototype.list = function (list) {
	return list ? this.l = list : list.l;
};
Sort.prototype.by = function (parameter) {
	console.log("sorting by: " + parameter);
	this.h.setProperty(this.b = parameter);return this;
};
Sort.prototype.max = function () {
	this.m = true;
	this.h.setToMax();
	return this;
};
Sort.prototype.min = function () {
	this.m = false;
	this.h.setToMin();
	return this;
};
Sort.prototype.insertion = function () {};
Sort.prototype.merge = function () {};
Sort.prototype.quick = function () {};
Sort.prototype.heap = function () {
	var sorted = [],
	    list = this.l;
	var l = list.length,
	    heap = this.h;
	heap.clear();
	while (l--) {
		heap.push(list[l]);
	}while (heap.size()) {
		sorted.push(heap.pop());
	}return sorted;
};
module.exports = Sort;

},{"./binaryHeap.js":89}],104:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* --------------------------------------------------------------------------- *\
    
    Validator.js is a tool to verify the correctness of data within the game

\* --------------------------------------------------------------------------- */

app = require("../settings/app.js");
app.players = require("../controller/players.js");
Building = require("../map/building.js");
composer = require("../tools/composition.js");

Validator = function Validator(fileName) {

	this.fileName = fileName;
};

Validator.prototype.defined = function (element, name) {

	if (!element) {

		return new Error(name.uc_first() + " undefined.", this.fileName);
	}
};

Validator.prototype.mapElementType = function (type) {

	var types = {
		unit: true,
		building: true,
		terrain: true
	};

	return types[type] ? false : this.mapElementName(type);
};

Validator.prototype.mapElementName = function (type) {

	var buildings = {

		hq: true,
		city: true,
		base: true,
		airport: true,
		seaport: true
	};

	var terrain = {

		wood: true,
		mountain: true,
		plain: true,
		snow: true,
		sea: true,
		reef: true,
		tallMountain: true,
		tree: true
	};

	var units = {

		infantry: true,
		mech: true,
		recon: true,
		apc: true,
		antiAir: true,
		tank: true,
		midTank: true,
		artillary: true,
		rockets: true,
		missles: true,
		neoTank: true,
		tCopter: true,
		bCopter: true,
		fighter: true,
		bomber: true,
		lander: true,
		cruiser: true,
		submarine: true,
		bShip: true
	};

	return composer.compose(buildings, terrain, units)[type] ? false : new Error("Invalid map element name found: " + type + ".", this.fileName);
};

Validator.prototype.hasElements = function (elements, needed) {

	var i = 0,
	    n,
	    length = needed.length;

	if (!elements) {

		return new Error("missing input", this.fileName);
	}

	while (i < length) {

		property = needed[i++];

		if (!elements[property]) {

			return new Error("Missing property: " + property + ".", this.fileName);
		}
	}

	return false;
};

Validator.prototype.isCoordinate = function (coordinate) {

	if (!coordinate) {

		return new Error("No coordinate found");
	}

	var x = coordinate.x,
	    y = coordinate.y;

	if (isNaN(x) || isNaN(y) || x < 0 || y < 0) {

		return new Error("Invalid coordinate detected: x:" + x + ", y:" + y, this.fileName);
	}
};

Validator.prototype.isString = function (string) {

	var type = typeof string === "undefined" ? "undefined" : _typeof(string);

	if (type !== "string") {

		return new Error("Invalid property found, expecting string, found: " + type + ".", this.fileName);
	}
};

Validator.prototype.inRange = function (array, dimensions) {

	this.isCoordinate(dimensions);

	var e,
	    i,
	    l = array.length;

	for (i = 0, e = array[i]; i < l; i += 1) {

		if (e.x > dimensions.x || e.y > dimensions.y || e.y < 0 || e.x < 0) {

			return new Error("Element at index: " + i + " is outside the specified dimensions.", this.fileName);
		}
	}
};

Validator.prototype.multiplePlayers = function (array) {

	for (var i = 1; i < array.length; i += 1) {

		if (array[i] && array[i].player() !== array[0].player()) {

			return new Error("More then one player requred in game", this.fileName);
		}
	}
};

Validator.prototype.building = function (object) {

	return object instanceof Building;
};

Validator.prototype.map = function (map) {

	this.defined(map, "map");

	this.isCoordinate(map.dimensions);

	for (element in map) {

		if (element !== "id") {

			this.defined(map[element], "map " + element);
		}
	}

	this.inRange(map.terrain, map.dimensions);
	this.inRange(map.buildings, map.dimensions);

	if (map.units) {

		this.inRange(map.units, map.dimensions);
	}

	if (typeof map.name !== "string") {

		return new Error("Map name must be a string", this.fileName);
	}

	if (typeof map.category !== "string" || app.settings.mapCatagories.indexOf(map.category) < 0) {

		return new Error("Map category name must be a string from the map catagory list", this.fileName);
	}

	if (!map.buildings.length || map.buildings.length < 2) {

		return new Error("There must be at least two buildings in a map", this.fileName);
	}

	if (isNaN(map.players) || map.players < 2 || map.players > 8) {

		return new Error("number of players must be numarical between 2 and 8, was set to: " + map.players + " players", this.fileName);
	}
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

	return player.owns(unit) && !player.owns(building) && unitController.canCapture(building, unit) && this.position(action.unit) && this.health(action.unit) && this.position(action.building) && this.health(action.building);
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

	return unitController.owns(passanger, passanger) && unitController.owns(transport, passanger) && unitController.canTransport(passanger, transport) && unitController.inMovementRange(transport, passanger);
};

Validator.prototype.build = function (unit) {

	return unit.player().turn() && unit.player().gold() >= unit.cost();
};

Validator.prototype.turn = function (player) {

	return app.players.get(isNaN(player) ? player : { id: player }).turn();
};

module.exports = Validator;

},{"../controller/players.js":14,"../map/building.js":44,"../settings/app.js":83,"../tools/composition.js":91}],105:[function(require,module,exports){
"use strict";

/* ------------------------------------------------------------------------------------------------------*\
   
    user/actions.js controls action execution
   
\* ------------------------------------------------------------------------------------------------------*/

unitController = require("../controller/unit.js");
app.target = require("../controller/target.js");
app.cursor = require("../controller/cursor.js");
app.coStatus = require("../huds/coStatusHud.js");
app.hud = require("../huds/hud.js");
app.dom = require("../tools/dom.js");

module.exports = {

    /*
        attack: performs an attack from the passed in unit on the unit contained 
        in the attack property of options 
         @unit = Object, unit
        @options = Object, {
    
            capture: Object (building) || Boolean,
            attack: Object (unit) || Boolean,
            join: Object (unit) || Boolean,
            load: Object (unit) || Boolean,
            drop: Integer || Boolean,
            wait: Bool,
        }
    */

    attack: function attack(options, unit) {

        app.hud.show();

        unitController.setTargets(options.attack, unit);

        app.target.attack();
    },

    /*
        
        wait: refreshes the screen back to a state of play, does nothing and leaves unit as is
     */

    wait: function wait() {

        app.dom.remove('actionHud');
        app.screen.reset();
        app.hud.show();
        app.cursor.show();
        app.coStatus.show();
        app.target.deactivate();
        app.hud.setElements(app.cursor.hovered());
    },

    /*
        drop: drops a unit from the loaded property of the passed in unit at the supplied index
         @index = Integer
        @unit = Object, unit
        @options = Object, {
    
            capture: Object (building) || Boolean,
            attack: Object (unit) || Boolean,
            join: Object (unit) || Boolean,
            load: Object (unit) || Boolean,
            drop: Integer || Boolean,
            wait: Bool,
        }
    */

    drop: function drop(options, unit, index) {

        if (isNaN(index)) {

            throw new Error("Invalid property \"index\" passed to \"drop\", index must be a number.", "user/actions.js");
        }

        app.target.drop();

        return unitController.unload(options.drop[index], unit);
    },

    /*
        capture: transfers ownership of a building to the passed in unit
         @unit = Object, unit
        @options = Object, {
    
            capture: Object (building) || Boolean,
            attack: Object (unit) || Boolean,
            join: Object (unit) || Boolean,
            load: Object (unit) || Boolean,
            drop: Integer || Boolean,
            wait: Bool,
        }
    */

    capture: function capture(options, unit) {

        return unitController.capture(options.capture, unit);
    },

    /*
        join: joins a selected unit with a passed in unit
         @unit = Object, unit
        @options = Object, {
    
            capture: Object (building) || Boolean,
            attack: Object (unit) || Boolean,
            join: Object (unit) || Boolean,
            load: Object (unit) || Boolean,
            drop: Integer || Boolean,
            wait: Bool,
        }
    */

    join: function join(options, unit) {

        return unitController.join(options.join, unit);
    },

    /*
        load: loads a selected unit into the passed in unit
         @unit = Object, unit
        @options = Object, {
    
            capture: Object (building) || Boolean,
            attack: Object (unit) || Boolean,
            join: Object (unit) || Boolean,
            load: Object (unit) || Boolean,
            drop: Integer || Boolean,
            wait: Bool,
        }
    */

    load: function load(options, unit) {

        return unitController.load(options.load, unit);
    }
};

},{"../controller/cursor.js":8,"../controller/target.js":16,"../controller/unit.js":18,"../huds/coStatusHud.js":35,"../huds/hud.js":37,"../tools/dom.js":94}],106:[function(require,module,exports){
"use strict";

createPlayer = require("../user/player.js");
Score = require("../definitions/score.js");
composer = require("../tools/composition.js");
transmit = require("../sockets/transmitter.js");

module.exports = function (number) {

    var player = composer.exclude("isComputer").compose({

        mode: "cp",
        isComputer: true

    }, createPlayer({

        first_name: "HAL #" + number,
        id: "AI#" + number,
        ready: true,
        number: number

    }));

    if (app.user.first()) {

        transmit.addAi(player);
    }

    return player;
};

},{"../definitions/score.js":23,"../sockets/transmitter.js":88,"../tools/composition.js":91,"../user/player.js":108}],107:[function(require,module,exports){
"use strict";

/* --------------------------------------------------------------------------------------*\
    
    holds all co"s, their skills and implimentation

\* --------------------------------------------------------------------------------------*/

app = require("../settings/app.js");

module.exports = function () {

    var percent = function percent(amount) {

        return amount / 100;
    };

    var addToEach = function addToEach(player, funk, property, amount, parameter1, parameter2, parameter3) {

        if (!parameter) {

            parameter = 100;
        }

        var units = app.map.unit;

        for (var u = 0; u < units.length; u += 1) {

            if (units[u].player === player.id) {

                app.map.unit[u][property] = funk(unit[u], property, amount, parameter1, parameter2, parameter);
            }
        }
    };

    var editProperty = function editProperty(unit, property, amount, parameter) {

        if (unit[property] + amount > parameter) {

            return parameter;
        } else {

            return unit[property] + amount;
        }
    };

    var filter = function filter(unit, property, amount, max, parameter1, parameter2) {

        if (unit[parameter1] === parameter2) {

            if (unit[property] + amount > max) {

                return max;
            } else {

                return unit[property] + amount;
            }
        }
    };

    var editRange = function editRange(unit, property, amount) {

        if (unit.damageType === "ranged") {

            unit.range.hi += amount;

            return unit.range;
        }
    };

    var editArray = function editArray(unit, property, amount, parameter1, parameter2) {

        var baseDamage = {};
        var damage = Object.keys(unit[property]);

        for (var d = 0; d < damage.length; d += 1) {

            // if there is no perameter then simply find the percentage added to all units
            if (!parameter1) {

                var dam = unit[property][damage[d]];

                // add the damage plus the percent of increase
                baseDamage[damage[d]] *= amount;

                // if there is a parameter then only add to the damage type specified in the perameter
            } else if (unit[parameter1] === parameter2) {

                var dam = unit[property][damage[d]];
                baseDamage[damage[d]] *= amount;
            }
        }
        return baseDamage;
    };

    return {

        andy: function andy(player) {

            var image = "red";
            var special = 100;
            var powerActive = false;
            var superPowerActive = false;
            var damage = 100;

            return {

                image: image,
                name: "Andy",

                power: function power() {

                    addToEach(player, editProperty(), "health", 2, 10);
                },

                superPower: function superPower() {

                    superPowerActive = true;
                    addToEach(player, editProperty(), "health", 5, 10);
                    addToEach(player, editProperty(), "movement", 1);
                    special = 130;
                },

                attack: function attack() {

                    return damage * percent(special);
                },

                defense: function defense() {

                    return 100;
                },

                endPower: function endPower() {

                    if (superPowerActive) {

                        addToEach(player, editProperty(), "movement", -1);
                        special = 100;
                        superPowerActive = false;
                    }
                }
            };
        },

        max: function max(player) {

            var image = "blue";
            var damage = 100;
            var special = 120;
            var powerActive = false;
            var superPowerActive = false;

            return {

                image: image,

                name: "Max",

                power: function power() {

                    powerActive = true;
                    special = 140;
                },

                superPower: function superPower() {

                    powerActive = true;
                    special = 170;
                },

                attack: function attack(unit) {

                    if (unit.damageType === "direct") {

                        return damage * percent(special);
                    } else {

                        return damage;
                    }
                },

                defense: function defense() {

                    return 100;
                },

                endPower: function endPower() {

                    if (powerActive) {
                        special = 120;
                        powerActive = false;
                    }
                },

                build: function build(unit) {
                    unit.range.hi -= 1;
                    return unit;
                }
            };
        },

        sami: function sami(player) {

            var image = "green";
            var damage = 100;
            var special = 120;
            var powerActive = false;
            var superPowerActive = false;
            var capSpecial = 150;
            var penalty = 90;

            return {

                image: image,
                name: "Sami",

                power: function power() {

                    powerActive = true;
                    addToEach(player, filter(), "movement", 1, 20, "transportaion", "foot");
                    special = 170;
                },

                superPower: function superPower() {

                    superPowerActive = true;
                    addToEach(player, filter(), "movement", 2, 20, "transportaion", "foot");
                    special = 200;
                    capSpecial = 2000;
                },

                attack: function attack(unit) {

                    if (unit.transportaion === "foot") {

                        return damage * percent(special);
                    } else if (unit.damageType === direct) {

                        return damage * percent(penalty);
                    }

                    return damage;
                },

                defense: function defense() {

                    return 100;
                },

                endPower: function endPower() {

                    if (powerActive) {

                        addToEach(player, filter(), "movement", -1, 20, "transportaion", "foot");
                    } else if (superPowerActive) {

                        addToEach(player, filter(), "movement", -2, 20, "transportaion", "foot");
                    }

                    special = 120;
                },

                capture: function capture(_capture) {

                    return _capture * percent(capSpecial);
                }
            };
        }
    };
}();

},{"../settings/app.js":83}],108:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

Score = require('../definitions/score.js');

module.exports = function (user) {
    var _ref;

    return _ref = {

        name: user.first_name,
        id: user.id,
        score: new Score(),
        co: user.co || null
    }, _defineProperty(_ref, 'id', user.id), _defineProperty(_ref, 'gold', 0), _defineProperty(_ref, 'special', 0), _defineProperty(_ref, 'ready', user.ready || false), _defineProperty(_ref, 'number', user.number), _defineProperty(_ref, 'isComputer', false), _ref;
};

},{"../definitions/score.js":23}],109:[function(require,module,exports){
'use strict';

app.request = require('../tools/request.js');
Score = require('../definitions/score.js');
playerController = require("../controller/player.js");
unitController = require("../controller/unit.js");

User = function User(info, origin) {

	this.score = new Score();
	this.l = {};
	this.setId(info.id);
	this.setName(info.name);
	this.setFirstName(info.first_name);
	this.setLastName(info.last_name);
	this.setGender(info.gender);
	this.setOrigin(origin);
	this.setEmail(info.email);
	this.setLink(info.link, origin);
};

User.prototype.setId = function (id) {

	this.i = id;
};

User.prototype.setName = function (name) {

	this.n = name;
};

User.prototype.setFirstName = function (first_name) {

	this.fn = first_name;
};

User.prototype.setLastName = function (last_name) {

	this.ln = last_name;
};

User.prototype.setOrigin = function (origin) {

	this.o = origin;
};

User.prototype.setEmail = function (email) {

	this.e = email;
};

User.prototype.setLink = function (link, origin) {

	this.l[origin] = link;
};

User.prototype.setGender = function (gender) {

	this.g = gender;
};

User.prototype.name = function () {

	return this.n;
};

User.prototype.first_name = function () {

	return this.fn;
};

User.prototype.last_name = function () {

	return this.ln;
};

User.prototype.email = function () {

	return this.e;
};

User.prototype.id = function () {

	return this.i;
};

User.prototype.gender = function () {

	return this.g;
};

User.prototype.link = function (origin) {

	return this.l[origin];
};

User.prototype.origin = function () {

	return this.o;
};

User.prototype.turn = function () {

	return playerController.isTurn(this.player());
};

User.prototype.player = function () {

	return app.players.get(this.raw());
};

User.prototype.first = function () {

	return !(player = this.player()) || player === app.players.first();
};

User.prototype.owns = function (object) {

	var o = playerController.owns(this.player(), object);

	return o;
};

User.prototype.number = function () {

	return playerController.number(this.player());
};

User.prototype.savedGames = function () {

	app.request.get(this.id(), "games/saved", function (games) {

		console.log('--- games retreived! ---');
		console.log(games);
	});
};

User.prototype.get = function () {

	this.getter("oauth");
};

User.prototype.save = function () {

	this.getter("save");
};

User.prototype.getter = function (path) {

	var scope = this;

	app.request.post(this.raw(), "users/" + path, function (user) {

		if (user && !user.error) {

			scope.setId(user.id);
			scope.setOrigin(false);
		} else if (user) {

			console.log(user.error);
		} else {

			console.log("Recieved: " + user);
		}
	});
};

User.prototype.info = function () {

	return playerController.displayedInfo(this.player());
};

User.prototype.raw = function () {

	return {
		id: this.id(),
		origin: this.origin(),
		email: this.email(),
		last_name: this.last_name(),
		first_name: this.first_name(),
		name: this.name(),
		gender: this.gender(),
		link: this.link(),
		isComputer: false
	};
};

module.exports = User;

},{"../controller/player.js":13,"../controller/unit.js":18,"../definitions/score.js":23,"../tools/request.js":101}]},{},[42]);
