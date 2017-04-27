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