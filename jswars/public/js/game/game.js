/* ------------------------------------------------------------------------------------------------------*\
   
    controls the setting up and selection of games / game modes 
   
\* ------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.animate = require('../game/animate.js')
app.effect = require('../game/effects.js');
app.display = require('../tools/display.js');
app.undo = require('../tools/undo.js');
app.key = require('../tools/keyboard.js');
app.target = require('../objects/target.js');
app.hud = require('../objects/hud.js');
app.user = require('../objects/user.js');
app.players = require('../controller/players.js');
app.cursor = require('../controller/cursor.js');
app.background = require('../controller/background.js');

StatusHud = require('../objects/coStatusHud.js');
Score = require('../definitions/score.js');
Counter = require('../tools/counter.js');

app.coStatus = new StatusHud();

module.exports = function () {

    var name, selected, actions, end = false, started = false, settings = require('../settings/default.js');

    // used for accessing the correct building array via what type of transportation the unit uses
    var ports = { air: 'airport', foot: 'base', wheels: 'base', boat: 'seaport' };

    var tick = new Counter(1000);

    return {
        tick:tick.reached,
        started: function () {return started;},
        settings: function () {return settings;},
        load: function (room) { settings = room.settings; },
        name: function (n) {
            if (n) name = n;
            return name;
        },
        
        clear: function () { name = undefined; },

        set: function (setting, value) {
            settings[setting] = value;
            return settings[setting];
        },

        start: function (game) {

            if (app.players.length() !== app.map.players()) 
                return false;

            // set up game map
            app.map.initialize();

            // get the first player
            var player = app.players.first();
            var hq = player.hq().position();

            // set inital gold amount
            player.setGold(player.income());
            player.score.income(player.income());

            // setup game huds
            app.hud = new app.hud(app.map.occupantsOf(hq));

            // start game mechanics
            app.game.loop();

            // clear selection indices
            app.display.reset();

            // move the screen to the current players headquarters
            app.screen.to(hq);

            // begin game animations
            app.animate(['background', 'terrain', 'building', 'unit', 'cursor']);
            
            // mark the game as started
            return started = true;
        },

        end: function () { 
            alert('player ' + app.players.first().number() + ' wins!  with a score of ' + app.players.first().score.calculate() + '!');
            end = true; 
        },

        /* --------------------------------------------------------------------------------------------------------*\
            
            app.game.loop consolidates all the game logic and runs it in a loop, coordinating animation calls and 
            running the game

        \* ---------------------------------------------------------------------------------------------------------*/

        loop: function () {

            var h;

            // incriment frame counter
            tick.incriment();

            // move cursor
            app.cursor.move();

            // if target is active, enabel target selection
            if(app.target.active()) 
                app.target.chose(app.cursor.selected());

            // listen for options activation and selection
            if(app.options.active() && app.options.evaluate())
                app.undo.all(); 

            // handle selection of objects
            if((selected = app.cursor.selected()) && selected.evaluate(app.cursor.position()))
                app.undo.all();

            // display co status hud
            else if (!app.options.active()){
                app.coStatus.display(app.players.current(), app.cursor.side('x'));
                app.map.focus();
            }

            // controls cursor and screen movement/selection
            if(!app.options.active())
                app.cursor.select();

            // control map info hud
            if(!app.cursor.selected()){
                if(app.user.turn()) {
                    if (app.hud.hidden() && !app.map.focused()) 
                        app.hud.show();
                    if (app.cursor.moved()) 
                        app.hud.setElements(app.cursor.hovered());
                }else if(!app.hud.hidden())
                    app.hud.hide();
            }

            //app.effect.swell.color(); // listen for fading colors in and out on selection

            // exit menus when esc key is pressed
            if(app.key.pressed(app.key.esc()))
                if(!app.options.active() && !selected){
                    app.options.display();
                    app.coStatus.hide();
                } else app.undo.all();

            // undo any lingering key presses <---- not really necessary
            app.key.undo();
            app.key.undoKeyUp();
            tick.reset(); // reset counter if necessary
            if (end) return true;
            else window.requestAnimationFrame(app.game.loop);
        }
    };
}();