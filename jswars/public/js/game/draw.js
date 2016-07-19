/* --------------------------------------------------------------------------------------------------------*\

    app.draw provides a set of methods for interacting with, scaling, caching, coordinating  
    and displaying the drawings/animations provided in the app.animations

\*---------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.animations = require('../objects/animations.js');
app.settings = require('../settings/game.js');
app.screen = require('../controller/screen.js');
app.map = require('../controller/map.js');
app.background = require('../controller/background.js');
app.effect = require('../game/effects.js');

module.exports = function (canvas, dimensions, base) {
    
    var w, h, width, height;
    var temp = {}; // holds temporary persistant variables that can be passed between functions ( similar to static variables / functions )

    // base is the amount of pixles in each grid square, used to scale canvas elements if needed
    base = base === null || base === undefined ? 64 : base;

    // set/get width and height dimensions for the game map
    if (dimensions === null || dimensions === undefined) {
        w = 64;
        h = 64;
    } else {
        width = dimensions.width;
        height = dimensions.height;
        w = width / 15;
        h = height / 10;
    }

    var animationObjects = app.animations(width, height);

    // creates a small canvas
    var smallCanvas = function () {
        var smallCanvas = document.createElement('canvas');
        smallCanvas.width = w * 2;
        smallCanvas.height = h * 2;
        return smallCanvas;
    };

    // caches drawings so they can be recalled without redrawing ( performance boost in certain situations )
    var cacheDrawing = function (name) {

        // create a canvas
        var canvas = smallCanvas();

        // get context  
        var cacheCanvas = canvas.getContext(app.ctx);

        // set the position of the image to the center of the cached canvas                         
        var position = setPosition((w / 2), (h / 2));

        // draw image to cache to canvas
        animationObjects[name](cacheCanvas, position);

        // cache the canvas with drawing on it ( drawings cached by their class name )
        app.cache[name] = canvas;
    };

    // calculates the base for scaling
    var calcBase = function (d) {
        return d / base;
    };

    // scales items by calculating their base size multplied by 
    var scale = function (type, value) {
        var multiple = type === 'w' ? calcBase(w) : calcBase(h);
        return value === null || value === undefined ? multiple : multiple * value;
    };

    // creates a friendlier interface for drawing and automatically scales drawings etc for screen size
    var setPosition = function (x, yAxis) {

        var y = yAxis + h;

        return {
            
            // u = right, will move right the amonut of pixles specified
            r: function (number) {
                return x + scale('w', number);
            },
            // u = left, will move left the amonut of pixles specified
            l: function (number) {
                return x - scale('w', number);
            },
            // u = down, will move down the amonut of pixles specified
            d: function (number) {
                return y + scale('h', number);
            },
            // u = up, will move up the amonut of pixles specified
            u: function (number) {
                return y - scale('h', number);
            },
            // x is the x axis
            x: x,
            // y is the y axis
            y: y,
            // width
            w: w,
            // height
            h: h,
            // random number generator, used for grass background texture
            random: function (min, max) {
                return (Math.random() * (max - min)) + min;
            }
        };
    };

    // offset of small canvas drawing ( since the drawing is larger then single grid square it needs to be centered )
    var smallX = w / 2;
    var smallY = h / 2;

    return {

        // cache all images for performant display ( one drawing to rule them all )
        cache: function () {
            this.cached = true;
            return this;
        },
        hide: function () { animationObjects.hide(); },
        // place drawings where they belong on board based on coorinates
        coordinate: function (objectClass, object, coordinet) {

            var s = {}; // holder for scroll coordinates
            var name; // holder for the name of an object to be drawn
            var position = app.screen.position(); // scroll positoion ( map relative to display area )
            var wid = (w * 16); // display range
            var len = (h * 11);

            // get the coordinates for objects to be drawn
            var coordinate, coordinates = !coordinet ? app[objectClass][object]() : coordinet;

            // for each coordinates
            for (var i = 0; i < coordinates.length; i += 1) {

                coordinate = coordinates[i].position ? coordinates[i].position() : coordinates[i];

                // var s modifys the coordinates of the drawn objects to allow scrolling behavior
                // subtract the amount that the cursor has moved beyond the screen width from the 
                // coordinates x and y axis, making them appear to move in the opposite directon
                s.x = (coordinate.x * w) - (position.x * w);
                s.y = (coordinate.y * h) - (position.y * h);

                // only display coordinates that are withing the visable screen
                if (s.x >= 0 && s.y >= 0 && s.x <= wid && s.y <= len) {

                    // get the name of the object to be drawn on the screen
                    name = objectClass === 'map' && coordinet === undefined ? coordinates[i].draw() : object;

                    // if it is specified to be cached
                    if (this.cached) {

                        // check if it has already been cached and cache the drawing if it has not yet been cached
                        if (app.cache[name] === undefined) cacheDrawing(name);

                        // draw the cached image to the canvas at the coordinates minus 
                        // its offset to make sure its centered in the correct position
                        canvas.drawImage(app.cache[name], s.x - smallX, s.y - smallY);

                    } else {

                        // if it is not cached then draw the image normally at its specified coordinates
                        animationObjects[name](canvas, setPosition(s.x, s.y));
                    }
                }
            }
        },

        // fills background
        background: function () {
            var dimensions = app.map.dimensions();
            var type = app.background.type();
            for (var x = 0; x < dimensions.x; x += 1)
                for (var y = 0; y < dimensions.y; y += 1)
                    animationObjects[type](canvas, setPosition(x * w, y * h))
        },

        hudCanvas: function (object, objectClass) {

            // draw a background behind terrain and building elements
            if (objectClass !== 'unit') animationObjects.plain(canvas, setPosition(smallX, smallY));

            if (app.cache[object]) // use cached drawing if available
                canvas.drawImage(app.cache[object], 0, 0);
            else if(animationObjects[object])
                animationObjects[object](canvas, setPosition(smallX, smallY));
        }
    };
};