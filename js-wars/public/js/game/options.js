/* ----------------------------------------------------------------------------------------------------------*\
    
    app.options handles the in game options selection, end turn, save etc.
    
\* ----------------------------------------------------------------------------------------------------------*/
app = require('../settings/app.js');
//app.game = require('../menu/game.js');

module.exports = function () {

    var active = false;

    // move to next player on turn change
    var nextPlayer = function () {

        var players = app.game.players();

        // if the player is the last in the array return the first player
        if (app.game.currentPlayer().id === players.length) return players[0];

        // return the next player
        return app.game.players()[app.game.currentPlayer().id];
    };

    var endTurn = function () {
        // get the next player
        var player = nextPlayer();

        // end power if it is active
        player.co.endPower();

        // assign the next player as the current player
        app.game.setCurrentPlayer(player);

        // make note of whose turn it is
        app.game.turn();

        // move the screen to the next players headquarters
        app.move.screenToHQ(player);

        // refresh the movement points of the players units
        app.move.refresh(player);

        // add this turns income
        app.game.setCurrentPlayerGold(player.gold + app.calculate.income(player));
    };

    return {
        unit: function () {
            alert('unit!');
        },

        intel: function () {
            alert('intel');
        },

        options: function () {
            alert('options');
        },

        save: function () {
            alert('save');
        },

        // end turn
        end: function () {
            endTurn();
            if(app.usersTurn) socket.emit('endTurn', 'end');
            return this;
        },
        active:function(){return active;},
        activate:function(){active = true;},
        deactivate:function(){active = false;}
    };
}();