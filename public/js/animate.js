/* --------------------------------------------------------------------------------------------------------*\
    The animate functions insert the draw methods into the specified canvas for rendering and then make a 
    call to the canvas to render those drawings with the render method. Calling the render method of an
    initialized canvas object will render the animations once. If a loop is wanted ( for changing animations 
    for example ), you may pass the parent function into the render function to be called recursively.
\*---------------------------------------------------------------------------------------------------------*/

app.animateBuildings = function () {
    app.buildingCanvas.setAnimations(app.drawBuildings).render();
};

app.animateUnit = function () {
    app.unitCanvas.setAnimations(app.drawUnits).render();
};

app.animateBackground = function () {
    app.backgroundCanvas.setAnimations(app.drawBackground).render();
};

app.animateTerrain = function () {
    app.terrainCanvas.setAnimations(app.drawTerrain).render();
};

app.animateCursor = function () {
    app.cursorCanvas.setAnimations(app.drawCursor).render();
};

app.animateEffects = function () {
    app.effectsCanvas.setAnimations(app.drawEffects).render();
};
