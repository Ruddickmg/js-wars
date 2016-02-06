/* --------------------------------------------------------------------------------------------------------*\
    app.gameLoop consolidates all the game logic and runs it in a loop, coordinating animation calls and 
    running the game
\*---------------------------------------------------------------------------------------------------------*/

app.gameLoop = function () {
    app.move.cursor(); // controls cursor and screen movement
    app.display.hud() // display terrain info
        .coStatus() // display co status hud
        .options() // listen for options activation
        .listen();  // listen for active huds and activate selection ability for their lists
    app.select.move(); // controls selection and interaction with map elements
    app.build.units(); // controls building of units
    app.select.exit(); // controls the ability to escape display menus 
    window.requestAnimationFrame(app.gameLoop);
    if ( app.keys.length > 0 ) app.keys.splice(0,app.keys.length);
};