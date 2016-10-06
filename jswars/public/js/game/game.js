/* ------------------------------------------------------------------------------------------------------*\
   
    Game.js controls the setting up and selection of games / game modes 
   
\* ------------------------------------------------------------------------------------------------------*/

StatusHud = require('../objects/coStatusHud.js');
Score = require('../definitions/score.js');
Counter = require('../tools/counter.js');
Exit = require('../menu/options/exit.js');
Hud = require('../objects/hud.js');

app = require('../settings/app.js');
app.menu = require('../controller/menu.js');
app.animate = require('../game/animate.js');
app.effect = require('../game/effects.js');
app.display = require('../tools/display.js');
app.undo = require('../tools/undo.js');
app.key = require('../tools/keyboard.js');
app.target = require('../objects/target.js');
app.user = require('../objects/user.js');
app.players = require('../controller/players.js');
app.cursor = require('../controller/cursor.js');
app.background = require('../controller/background.js');
app.optionsMenu = require('../menu/options/optionsMenu.js');
app.confirm = require('../controller/confirmation.js');
app.exit = new Exit();
app.yield = new Exit(function(){
    app.game.end();
    var player = app.user.player();
    socket.emit('defeat', {defeated:player, conqueror:player, capturing:false});
});

app.coStatus = new StatusHud();

module.exports = function () {

    var game, mode, name, joined, selected, actions, end = false, started = false, settings, 
    players, map, menus = ['optionsMenu', 'options', 'intel', 'save', 'exit', 'yield'];

    // used for accessing the correct building array via what type of transportation the unit uses
    var ports = { 
        air: 'airport', 
        foot: 'base', 
        wheels: 'base', 
        boat: 'seaport' 
    };

    var tick = new Counter(1000);

    var removeScreen = function () {
        var screen = document.getElementById('setupScreen');
        screen.parentNode.removeChild(screen);
    };

    return {
        tick:tick.reached,
        joined: function () {return joined;},
        started: function () {return started;},
        settings: function () {return settings;},
        map: function () {return map;},
        removeMap: function () {
            map = undefined;
            return this;
        },
        removeSettings: function () {
            settings = undefined;
            return this;
        },
        removePlayers: function () {
            players = undefined;
            return this;
        },
        players: function () {return players;},
        load: function (room) { 
            console.log(room);
            app.background.set(room.map.background);
            console.log(map);
            settings = room.settings;
            console.log(settings);
            app.players.add(room.players);
            players = app.players.all();
            console.log(app.game.players);
        },
        name: function () { return name; },
        category: function () {return map.category;},
        room: function () {return {name:name, category:map.category};},
        screen: function () { return gameScreen; },
        clear: function () { name = undefined; },
        setSettings: function (s) {settings = s;},
        setPlayers: function (p) {players = p;},
        setMap: function (m) {return map = m;},
        logout: function () {
            // handle logout
            alert('logout!!');
        },
        create: function (n) {
            var room = {};
            room.map = app.map.get();
            room.name = name = n;
            room.settings = settings;
            room.max = app.map.players();
            room.category = app.map.category();
            socket.emit('newRoom', room);
        },
        setup: function (setupScreen){

            // select game mode
            if(app.user.id() && !mode) 
                mode = app.menu.mode();

            // if a game has been set 
            if (game) {               
                removeScreen();
                return game === 'editor' && app.editor.start() || started ? true : app.game.reset();

            // set up the game based on what mode is being selected
            } else if (mode) mode === 'logout' ? app.game.logout() : game = app.menu[mode]();

            // loop
            window.requestAnimationFrame(app.game.setup);
            if(app.key.pressed()) app.key.undo();        
        },
        reset: function () {
            game = mode = false;
            app.display.clear();
            app.screens.modeMenu();
            this.setup();
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
            app.hud = new Hud(app.map.occupantsOf(hq));

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

        /* --------------------------------------------------------------------------------------------------------*\
            
            app.game.loop consolidates all the game logic and runs it in a loop, coordinating animation calls and 
            running the game

        \* ---------------------------------------------------------------------------------------------------------*/

        update: function () { return app.game.started() ? app.game.loop() : app.game.setup(); },
        loop: function () {

            var confirmation, options;

            // incriment frame counter
            tick.incriment();

            if ((confirmation = app.confirm.active())) app.confirm.evaluate();
            if (app.cursor.deleting()) 
                app.cursor.deleteUnit();

            // if target is active, enabel target selection
            if (app.target.active()) 
                app.target.chose(app.cursor.selected());

            // listen for options activation and selection
            options = app.optionsMenu.coordinate(menus);

            // move cursor
            if (!options && !confirmation) app.cursor.move();

            // handle selection of objects
            if ((selected = app.cursor.selected()) && selected.evaluate(app.cursor.position()))
                app.undo.all();

            // display co status hud
            else if (!app.optionsMenu.active()) {
                app.coStatus.display(app.players.current(), app.cursor.side('x'));
                app.map.focus();
            }

            // controls cursor selection
            if (!options && !confirmation)
                app.cursor.select();

            // control map info hud
            if (!app.cursor.selected()) {
                if (app.user.turn()) {
                    if (app.hud.hidden() && !app.map.focused() && !app.input.active())
                        app.hud.show();
                    if (app.cursor.moved()) 
                        app.hud.setElements(app.cursor.hovered());
                } else if (!app.hud.hidden())
                    app.hud.hide();
            }

            // exit menus when esc key is pressed
            if (app.key.pressed(app.key.esc())){
                if (app.cursor.deleting()) { 
                    app.cursor.selectMode();
                } else if(!app.optionsMenu.active() && !options && !selected && !confirmation){
                    app.optionsMenu.display();
                    app.coStatus.hide();
                } else {
                    app.optionsMenu.deactivate(menus);
                    app.hud.show();
                    app.coStatus.show();
                    app.undo.all();
                }
            }

            app.key.undo();
            app.key.undoKeyUp();
            tick.reset(); // reset counter if necessary
            if (end) return true;
            else window.requestAnimationFrame(app.game.loop);
        },
        end: function (saved) { 
            if (!saved) alert('player ' + app.players.first().number() + ' wins!  with a score of ' + app.players.first().score.calculate() + '!');
            else alert('ending game');
            end = true; 
        }
    };
}();