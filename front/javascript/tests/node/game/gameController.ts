/* ------------------------------------------------------------------------------------------------------*\

    Game.js controls the setting up and selection of games / game modes

\* ------------------------------------------------------------------------------------------------------*/

import {User} from "./users/user";

StatusHud = require("../huds/coStatusHud.js");
Counter = require("../tools/array/propertyValueCounter.js");
Hud = require("../huds/hud.js");
transmit = require("../sockets/transmitter.js");

app = require("../settings/app.js");
app.menu = require("../controller/menuController.js");
app.animate = require("../animation/animationHandler.js");
app.key = require("../input/keyboard.js");
app.target = require("../controller/target.js");
app.user = require("../user/user.js");
app.players = require("../controller/players.js");
app.cursor = require("../controller/cursor.js");
app.options = require("../menu/options/optionsMenu.js");
app.confirm = require("../controller/confirmation.js");
app.request = require("../tools/request.js");
app.coStatus = new StatusHud();
actions = require("../controller/actionsController.js");

playerController = require("../controller/players.js");
buildingController = require("../controller/building.js");


module.exports = function() {

  let game, saved, mode, name, joined, selected, settings, map, id, created;
  let end = false, started = false;

  const menus = ["optionsMenu", "options", "intel", "save", "exit", "yield"];

  // used for accessing the correct building array via what type of transportation the unit uses
  const ports = {

    air: "airport",
    foot: "base",
    wheels: "base",
    boat: "seaport",
  };

  const tick = new Counter(1000);

  const removeScreen = function() {

    const screen = document.getElementById("setupScreen");
    screen.parentNode.removeChild(screen);
  };

  return {

    tick: tick.reached,

    setId: function(i) {

      return id = i;
    },

    id: function() {

      return id;
    },

    raw: function() {

      return {
        name,
        map: app.map.raw(),
        settings,
        players: app.players.getAllPlayers(), // players.mapEditor(function (players) {return players.raw();})
      };
    },

    joined: function() {

      return joined;
    },

    setJoined: function(bool) {

      joined = bool;
    },

    started: function() {

      return started;
    },

    settings: function() {

      return settings;
    },

    map: function() {

      return map;
    },

    removeSaved: function() {

      saved = undefined;

      return this;
    },

    removeMap: function() {

      map = undefined;

      return this;
    },

    removeSettings: function() {

      settings = undefined;

      return this;
    },

    // removePlayers: function () {

    //     players = undefined;

    //     return this;
    // },

    // players: function () {

    //     return players;
    // },

    name: function() {

      return name;
    },

    category: function() {

      return map.category;
    },

    room: function() {

      return {

        name,
        category: map.category,
      };
    },

    screen: function() {

      return gameScreen;
    },

    clear: function() {

      // players = undefined;
      saved = undefined;
      settings = undefined;
      name = undefined;
      started = false;
      end = false;
    },

    logout: function() {

      // handle logout
      alert("logout!!");
    },

    create: function(name, id) {

      const room = {};

      room.map = app.map.getPlayer();
      room.name = this.setName(name);
      room.settings = this.setSettings(settings);
      room.max = app.map.players();
      room.saved = app.players.saved();
      room.category = app.map.category();
      room.id = this.setId(id);

      transmit.createRoom(room);
    },

    load: function(room) {

      this.setId(room.id);
      this.setCreated(room.created);

      if (app.players.length() > 1) {

        app.players.addPlayer(room.players);

        // players = app.players.all();
      }
    },

    setup: function(setupScreen) {

      if (!mode) {

        mode = app.menu.mode();
      }

      if (game) {

        removeScreen();

        return game === "editor" && app.editor.start() || started ? true : app.game.reset();

      } else if (mode) {

        mode === "logout" ? app.game.logout() : game = app.menu[mode]();
      }

      // loop
      window.requestAnimationFrame(app.game.setup);

      if (app.key.pressed()) {

        app.key.undo();
      }
    },

    reset: function() {

      game = false;
      mode = app.menu.mode();
      this.setup();
    },

    start: function(game) {

      if (app.players.length() !== app.map.players()) {

        return false;
      }

      // set up game mapEditor
      app.map.initialize();

      // make sure players are ready
      app.players.initialize();

      // get the players whos turn it is
      const player = app.players.currentPlayer();

      const hq = composer.functions([
        buildingController.position,
        playerController.hq,
      ], player);

      const gold = app.players.saved() ?
        playerController.gold(player) :
        playerController.income(player);

      playerController.score(player).income(gold);

      app.players.update(playerController.setGold(player, gold));

      // setup game huds
      app.hud = new Hud(app.map.occupantsOf(hq));

      // start game mechanics
      app.game.loop();

      // move the screen to the current players headquarters
      app.screen.moveTo(hq);

      // begin game animations
      app.animate(["background", "terrain", "building", "unit", "cursor"]);

      // mark the game as started
      return started = true;
    },

    /* --------------------------------------------------------------------------------------------------------*\

        app.game.loop consolidates all the game logic and runs it in a loop, coordinating animation calls and
        running the game

    \* ---------------------------------------------------------------------------------------------------------*/

    update: function() {

      return app.game.started() ? app.game.loop() : app.game.setup();
    },

    loop: function() {

      const confirmation = app.confirm.active();
      const selected = app.cursor.selected();
      let menu, options = app.options.active();

      // incriment frame counter
      // tick.increment();

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

        app.coStatus.display(app.players.currentPlayer(), app.cursor.side("x"));

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
          app.coStatus.hideCurrentElement();

        } else if (!app.options.subMenu()) {

          app.screen.reset();
        }
      }

      app.key.undo();
      app.key.undoKeyUp();

      tick.reset();

      return end || window.requestAnimationFrame(app.game.loop);
    },

    save: function() {

      app.request.post({user: app.user.raw(), game: this.raw()}, "games/save", function(response) {

        if (response && !response.error) {

          alert("ending game");
        }
      });
    },

    end: function(saved) {

      // create game screen
      alert("player " + playerController.getPlayerByNumber(app.players.moveToFirst()) + " wins!  with a score of " + playerController.score(app.players.moveToFirst()).calculate() + "!");
      end = true;
    },

    removePlayer: function(saved) {

      // transmit.removeRoom(name, id, created, saved);
      app.input.deactivate();
      app.maps.removePlayer(app.map.getPlayer());
      app.players.removeSaved();
      this.clear();
    },
  };
}();
