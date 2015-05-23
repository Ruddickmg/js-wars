/* ----------------------------------------------------------------------------------------------------------*\
    
    app.options handles the in game options selection, end turn, save etc.
\* ----------------------------------------------------------------------------------------------------------*/

app.options = function () {

    // move to next player on turn change
    var nextPlayer = function () {

        // if the player is the last in the array return the first player
        if (app.temp.player.id === app.players.length) return app.players[0];

        // return the next player
        return app.players[app.temp.player.id];
    };

    var endTurn = function () {
        // get the next player
        var player = nextPlayer();

        // end power if it is active
        player.co.endPower();

        // assign the next player as the current player
        app.temp.player = player;

        // move the screen to the next players headquarters
        app.move.screenToHQ(player);

        // refresh the movement points of the players units
        app.move.refresh(player);

        // add this turns income
        app.temp.player.gold += app.calculate.income(player);
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
            return this;
        }
    };
}();
