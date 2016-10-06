
// ------------------------------------------ settings -----------------------------------------------------------------

app = require('../settings/app.js'); // app holds all elements of the application 
app.settings = require('../settings/game.js'); // app.settings holds application settings

// ------------------------------------------- tools --------------------------------------------------------------------

app.init = require('../tools/init.js'); // app.init creates a new canvas instance
app.touch = require('../tools/touch.js'); // handle touch screen operations
app.chat = require('../tools/chat.js'); // handle chat interactions
app.key = require('../tools/keyboard.js'); // handles keyboard input
app.request = require('../tools/request.js'); //handles AJAJ calls where needed
app.dom = require('../tools/dom.js'); // app.dom is a list of functions used to assist manipulating the dom
app.undo = require('../tools/undo.js'); // app.undo handles the cleanup of elements that are no longer needed
app.increment = require('../tools/increment.js');


// -------------------------------------------- menu --------------------------------------------------------------------

app.login = require('../menu/login.js'); // login control
app.modes = require('../menu/modes.js'); // app.modes holds functions for the selection of game modes / logout etc..
app.optionsMenu = require('../menu/options/optionsMenu.js'); // app.options handles the in game options selection, end turn, save etc.
app.scroll = require('../menu/scroll.js'); // app.game.settings consolidates holds settings for the game

// ----------------------------------------- definitions ----------------------------------------------------------------

app.units = require('../definitions/units.js'); // app.units is a repo for the units that may be created on the map and their stats
app.buildings = require('../definitions/buildings.js'); // holds building blueprints
app.obsticles = require('../definitions/obsticles.js'); // holds obsticles
app.properties = require('../definitions/properties.js'); // holds properties

// ------------------------------------------- game ---------------------------------------------------------------------

app.animate = require('../game/animate.js'); // app.animate triggers game animations
app.draw = require('../game/draw.js'); // app.draw controls drawing of animations
app.game = require('../game/game.js'); //controls the setting up and selection of games / game modes 
app.effect = require('../game/effects.js'); // app.effect is holds the coordinates for effects
app.calculate = require('../game/calculate.js'); //app.calculate handles calculations like pathfinding etc
app.display = require('../tools/display.js'); // app.display handles all the display screens and the users interaction with them

// ------------------------------------------ objects -------------------------------------------------------------------

app.animations = require('../objects/animations.js'); // app.animations is a collection of animations used in the game
app.screens = require('../objects/screens.js'); // menu screen setups
app.co = require('../objects/co.js'); // app.co holds all the co's, their skills and implimentation
app.target = require('../objects/target.js');
app.property = require('../objects/property.js');
app.obsticle = require('../objects/obsticle.js');
app.hud = require('../objects/hud.js');
app.user = require('../objects/user.js');

// ---------------------------------------- controllers -----------------------------------------------------------------

app.players = require('../controller/players.js');
app.map = require('../controller/map.js');
app.maps = require('../controller/maps.js');
app.cursor = require('../controller/cursor.js');
app.screen = require('../controller/screen.js');

module.exports = app;