/* ----------------------------------------------------------------------------------------------------------*\
    The draw functions are passed into the setAnimations method of an initialized game canvas. 
    In the initialization they are passed the 'draw' variable, which is a repo of objects/drawings.
    The repo can be set with the 'setAnimationRepo' method of app.init, the default repo is app.objects
    setting a new repo for a canvas will overwrite the app.objects repo with its replacement for that canvas ( not all canvases will be effected if you are using multiple canvases ).
    The methods of draw, used to access the repo are as follows:
    coordinate: can take specific coordinates, or you can specify a coordinate object containing an array
    or multiple arrays of objects with x and y coordinate properties and a type the specifies what to
    draw at those coordinates. for example "draw.coordinate('map', 'unit');" will look at app.map.unit where 
    app.map.unit is an array of object coordinates with a type property. Within the coordinates, while looping, 
    the coordinate method will look at the coordinate objects type property, find a drawing in the specified or
    default repo by the same name, and draw the matching image at the specified coordinates. this allows multiple
    coordinates to be specified for a specific type of drawing, unit, terrain, whatever and also allows them to 
    be added, removed or updated dynamically by adding or removing objects to the arrays.
    background: background will simply fill the entire background with a specified drawing from the repo
    cache: can be chained in the draw command and specifies that you want the objects being drawn to be cached 
    and drawn as a whole image, rather then drawn repeatedly for each coordinate, can improve performance when
    objects that dont need to change their appearance must be moved around allot ( scrolling for example will be
    faster with cached terrain elements )
\*-----------------------------------------------------------------------------------------------------------*/

app.drawEffects = function (draw) {
    draw.coordinate('effect', 'highlight'); // highlighting of movement range
    draw.coordinate('effect', 'path'); // highlighting current path
};

app.drawWeather = function (draw) {
    // weather stuff animated here
};

app.drawBuildings = function (draw) {
    draw.coordinate('map', 'building');
};

app.drawUnits = function (draw) {
    draw.coordinate('map', 'unit');
};

app.drawCursor = function (draw) {
    if (!app.settings.hideCursor) draw.coordinate('map', 'cursor', [app.settings.cursor]);
    if (app.settings.target) draw.coordinate('map', 'target', [app.settings.target]);
};

app.drawBackground = function (draw) {
    draw.background('background');
};

app.drawTerrain = function (draw) {
    draw.cache().coordinate('map', 'terrain');
};