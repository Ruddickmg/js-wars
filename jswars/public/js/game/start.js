/* ---------------------------------------------------------------------------------------------------------*\
    
    app.start sets up the game with the players and other info necessary for the new game
    
    initiate game by getting all the players, creating objects for them and assigning player one for first turn

\* ---------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.animate = require('../game/animate.js');
app.game = require('../menu/game.js');

module.exports = function () {

    var players = app.game.players();
    var map = app.game.map();
    var settings = app.game.settings();

    for (var p = 0; p < players.length; p += 1) {

        // add each player to the players array
        app.game.loadPlayers(
            app.game.newPlayer(
                players[p].fbid,
                players[p].co, 
                players[p].screenName, 
                p + 1
            )
        );
    }

    // assign the first player as the current player
    app.game.setCurrentPlayer(app.game.players()[0]);

    // check whose turn it is
    app.game.turn();

    // set inital gold amount
    app.game.setCurrentPlayerGold(app.calculate.income(app.game.currentPlayer()));

    // begin game animations
    app.animate(['background', 'terrain', 'buildings', 'unit', 'cursor']);

    // if the current player has been assigned return true
    if (app.game.currentPlayer()){
        app.game.start(true);
        return true;
    } 
    return false;
};