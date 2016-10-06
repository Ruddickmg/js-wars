/* --------------------------------------------------------------------------------------*\
    
    MapEditor.js controls map creation

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.settings = require('../settings/game.js');
app.players = require('../controller/players.js');
app.units = require('../definitions/units.js');
app.animate = require('../game/animate.js');
app.optionsMenu = require('../menu/options/optionsMenu.js');

Validator = require('../tools/validator.js');
Matrix = require('../tools/matrix.js');
Terrain = require('../objects/terrain.js');
Building = require('../objects/building.js');
Unit = require('../objects/unit.js');
Position = require('../objects/position.js');
Counter = require('../tools/counter.js');
Build = require('../objects/build.js');
Feature = require('../objects/featureHud.js');

module.exports = function () {

	var started = false, end = false, tick = new Counter(1000);

	return {

		active: function () { return started; },
		start: function () {

            // set up game map
            app.map.initialize(true);

            // get map dimensions
            var dim = app.map.dimensions();
            var position = new Position(dim.x / 2, dim.y / 2);

            app.cursor.setSelected(new Building('hq', position, app.map.buildings().length, 1));
            app.feature = new Feature(app.cursor.selected());
            app.build = new Build();

            // move the screen to the current players headquarters
            app.screen.to(position);

            // begin game animations
            app.animate(['background', 'terrain', 'building', 'unit', 'cursor']);

             // start map editor
            app.editor.loop();
            
            // mark the game as started
            return started = true;
        },

        end: function () {  end = true;  },

        /* --------------------------------------------------------------------------------------------------------*\
            
            app.game.loop consolidates all the game logic and runs it in a loop, coordinating animation calls and 
            running the game

        \* ---------------------------------------------------------------------------------------------------------*/

        loop: function () {

            // incriment frame counter
            tick.incriment();

            // move cursor
            app.cursor.move();
            app.cursor.copy();
            app.cursor.build();

            if (!app.build.active()) {
            	app.cursor.displayPosition();
            	if(app.feature.hidden())
            		app.feature.show();
            };

            // exit menus when esc key is pressed
            if(app.key.pressed(app.key.esc()))
                if(!app.optionsMenu.active())
                    app.optionsMenu.display();
                else app.undo.all();

            app.key.undo();
            app.key.undoKeyUp();

            tick.reset();

            if (end) {
             	started = false;
             	return true;
            } else window.requestAnimationFrame(app.editor.loop);
        }
	};
}();