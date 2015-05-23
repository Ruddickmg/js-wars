/* ---------------------------------------------------------------------------------------------------------*\
	
	app.start sets up the game with the players and other info necessary for the new game
\* ---------------------------------------------------------------------------------------------------------*/

// initiate game by getting all the players, creating objects for them and assigning player one for first turn
app.start = function (players) {
    for (var p = 0; p < players.length; p += 1) {

        // add each player to the players array
        app.players.push(app.player(players[p].co, players[p].name, p + 1));
    }

    // assign the first player as the current player 
    app.temp.player = app.players[0];

    // set inital gold amount
    app.temp.player.gold = app.calculate.income(app.temp.player);

    // if the current player has been assigned return true
    if (app.temp.player) return true;
    return false;
};

exports app.start;