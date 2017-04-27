/* ------------------------------------------------------------------------------------------------------------*\
    
    app.init creates a new canvas instance, taking the name of the target canvas id and optionally the context
    as a second perameter, it defaults to a 2d context. init also provides methods for rendering, setting 
    animations and returning the screen dimensions

\* ------------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.draw = require('../animation/draw.js');

module.exports = function (element, context) {

	// get canvas element
    var canvas = document.getElementById(element);

    // check if browser supports canvas
    if (canvas.getContext) {

        // if the context is not set, default to 2d
        app.ctx = !context ? '2d' : context;

        // get the canvas context and put canvas in screen
        var animate = canvas.getContext(app.ctx);

        // get width and height
        var sty = window.getComputedStyle(canvas);
        var padding = parseFloat(sty.paddingLeft) + parseFloat(sty.paddingRight);
        var screenWidth = canvas.clientWidth - padding;
        var screenHeight = canvas.clientHeight - padding;

        // animate.clearRect( element.positionX, element.positionY, element.width, element.height );
        var screenClear = function () { animate.clearRect(0, 0, screenWidth, screenHeight); };

        return {

            // set the context for the animation, defaults to 2d
            setContext: function (context) {
                this.context = context;
                return this;
            },

            // insert animation into canvas
            setAnimations: function (animations) {
                this.animations = animations;
                return this;
            },

            // draw to canvas
            render: function (hide, gridSquareSize) { // pass a function to loop if you want it to loop, otherwise it will render only once, or on demand
                // throw error if there are no animations
                if (!this.animations) throw new Error('No animations were specified');

                screenClear();

                var drawings = app.draw(animate, {
                    width: screenWidth,
                    height: screenHeight
                }, gridSquareSize);

                if (hide) drawings.hide();
                this.animations(drawings);
            },

            // return the dimensions of the canvas screen
            dimensions: function () {
                return {
                    width: screenWidth,
                    height: screenHeight
                };
            }
        };
    } else {
        // if canvas not supported then throw an error
        throw new Error("browser does not support canvas element. canvas support required for animations");
    }
};