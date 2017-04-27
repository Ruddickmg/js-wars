/* ------------------------------------------------------------------------------------------------------*\
   
    controller/player.js modifies and returns properties of player objects in game
   
\* ------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.game = require('../controller/game.js')
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

        update: function (player, update) {

            player.id = update.id;
            player.gold = update.gold;
            player.special = update.special;
            player.ready = app.game.started() || app.players.saved() !== undefined;
            player.number = update.number;
            player.co = app.co[update.co.toLowerCase()](player);
            player.score = new Score(update.score);

            return player;
        },

        id: function (player) {

            return player.id;
        },

        setProperty: function (player, property, value) {

            player[property] = value;

            if (app.user.number() === this.number(player)) {

                transmit.setUserProperty(player, property, value);
            }

            return player;
        },

        getProperty: function (player, property) {

            return player[property];
        },

        setCo: function (player, co) {
           
            return this.setProperty(player, "co", app.co[co](player)); 
        },

        color: function (player) {

            // figure out color system

            return this.number(player);
        },

        index: function (player) {

            // may need to change this to account for copies

            return app.players.indexOf(player);
        },

        setNumber: function (player, number) {

            player.number = number;

            return player;
        },

        number: function (player) {

            return player.number;
        },

        endTurn: function () {

            // update score
            if ((current = app.players.current()) === app.user.player()) {

                app.user.score.update(this.score(current));
            }

            app.map.clean();

            current.isTurn = false;

            // get the next player
            var player = composer.functions([

                this.collectIncome, 
                this.recover,
                this.endPower,
                this.resetScore

            ], app.players.next());

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

        setScore: function (player, score) {

            player.score = score;

            return player;
        },

        resetScore: function (player) {

            player.score = new Score();

            return player;
        },

        endPower: function (player) {

            player.co.endPower();

            return player;
        },

        recover: function (player) {

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

        isComputer: function (player) {

            var isComputer = player.isComputer;

            if (!isBoolean(isComputer)) {

                throw new Error("isComputer must be boolean value, found: " + isComputer, "controller/player.js");
            }

            return isComputer;
        },

        isReady: function (player, state) { // check this out for functionality

            player.ready = state; 

            app.players.checkReady();

            return player;
        },

        displayedInfo: function (player) {

            var info = this.score(player).display();
            
            info.bases = this.buildings(player).length;
            info.income = this.income(player);
            info.funds = this.gold(player);
            info.player = this.number(player);

            return info;
        },

        ready: function (player) { 

            return player.ready; 
        },

        income: function (player) {

            var scope = this, funds = app.game.settings().funds;

            var income = app.map.buildings().reduce(function (money, building) {

                return money + (scope.owns(player, building) ? funds : 0);

            }, 0);

            return income;
        },

        collectIncome: function (player) {

            var income = playerController.income(player);

            player.score.income(income);
            player.gold += income;

            return player;
        },

        defeat: function (player1, player2, capturing) {

            if (app.user.owns(player1)) { 

                transmit.defeat(player1, player2, capturing);
            }

            this.score(player1).conquer();
            this.score(player2).defeat();

            app.players.defeat(player2);

            var buildings = app.map.buildings();
            var building, l = buildings.length;

            capturing = capturing ? player1 : capturing;

            // assign all the buildings belonging to the owner of the captured hq to the capturing player
            while (l--) {

                if (this.owns(player, (building = buildings[l]))) {

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

        score: function (player) {

            return player.score;
        },

        get: function (player) { 

            return app.players.get(player); 
        },

        isTurn: function (player) { // change this outside of object 

            return this.id(player) === this.id(app.players.current()); 
        },

        first: function (player) { 

            return this.id(player) === this.id(app.players.first()); 
        },

        special: function (player) { 

            return player.special; 
        },

        gold: function (player) { 

            return player.gold; 
        },

        canPurchase: function (player, cost) { 

            return this.gold(player) - cost >= 0; 
        },

        purchase: function (player, cost) {

            this.score(player).expenses(cost);

            return this.setGold(player, this.gold(player) - cost);
        },

        setGold: function (player, gold) {

            return gold >= 0 ? (player.gold = gold) + 1 : false; 
        },

        owns: function (player, object) { // could modify game parameters to add a dimension to the game like territory

            return this.id(this.get(player)) === buildingController.playerId(object); 
        },

        co: function (player) {

            if (player) {

                return player.co;
            }

            return player;
        },

        units: function (player) {

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

        buildings: function (player) {

            var scope = this;

            return app.map.buildings().filter(function (building) {

                return scope.owns(player, building);
            });
        },

        confirm: function (player) {

            player.confirmation = true;

            return player; 
        },

        confirmed: function (player) { 

            return player.confirmation;
        },

        unconfirm: function (player) { 

            delete player.confirmation; 

            return player;
        },

        hq: function (player) {

            var buildings = app.map.buildings();
            var building, l = buildings.length;

            while (l--) {

                building = buildings[l];

                if (buildingController.isHQ(building) && buildingController.owns(player, building)) {

                    return building;
                }
            }
        }
    };
}();