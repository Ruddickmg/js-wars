/* --------------------------------------------------------------------------------------------------------*\
    app.run starts the main game loop and calls all the animate functions
\*---------------------------------------------------------------------------------------------------------*/

app.run = function () {
    app.start(app.users);
    app.gameLoop();
    app.animateBackground();
    app.animateTerrain();
    app.animateBuildings();
    app.animateUnit();
    app.animateCursor();
};