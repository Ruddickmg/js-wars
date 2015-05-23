/* --------------------------------------------------------------------------------------------------------*\
    app.init sets up a working canvas instance to the specified canvas dom element id, it is passed the id
    of a canvas element that exists in the dom and takes care of initialization of that canvas element
\*---------------------------------------------------------------------------------------------------------*/

app.backgroundCanvas = app.init('background');
app.terrainCanvas = app.init('landforms');
app.buildingCanvas = app.init('buildings');
app.effectsCanvas = app.init('effects');
app.unitCanvas = app.init('units');
app.weatherCanvas = app.init('weather');
app.cursorCanvas = app.init('cursor');