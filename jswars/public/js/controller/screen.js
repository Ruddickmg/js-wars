app = require('../settings/app.js');
app.settings = require('../settings/game.js');
app.animate = require('../animation/animate.js');
app.map = require('../controller/map.js');
app.cursor = require('../controller/cursor.js');

module.exports = function () {

	var screenDimensions, dimensions, position = { x:0, y:0 }, axis = ['x','y'];

	var scale = function (dimension) { return (dimension / 64) - 1; };

	// screenRefresh the postions on the screen of all the units/terrain/buildings/etc
    var screenRefresh = function () { app.animate(['terrain', 'cursor', 'building', 'unit', 'effects']); };

    var move = function (distance, view, limit, sign, axis) {

        setTimeout(function () { // set delay time
            if (distance > -1 && view * sign + sign < limit){ 
                view += sign; // <--- keep track of screen edge as it moves
                position[axis] += sign; // <---- move screen
                screenRefresh(); // <-- animate screen movement
                move (distance - 1, view, limit, sign, axis); //<--- call self and decriment the distance to target
            }
        }, app.settings.scrollSpeed); // <--- delay time
    };

	return {
		setDimensions: function (dim) { 
			screenDimensions = dim;
			dimensions = { x: scale(dim.width), y: scale(dim.height) }; 
		},
		width: function () { return screenDimensions.width; },
		dimensions: function () { return dimensions; },
		position: function () { return position; },
		top: function () { return position.y; },
		bottom: function (){ return position.y + dimensions.y; },
		left: function () { return position.x; },
		right: function () { return position.x + dimensions.x; },


		// deactivate all menus/selections and display screen in its initial state
		reset: function () {
            ['actionHud', 'damageDisplay', 'buildUnitScreen', 'unitInfoScreen', 'optionsMenu']
                .forEach(function (screen) { app.dom.remove(screen); });

            app.coStatus.show();
            app.hud.show();
            app.options.deactivate();
            app.cursor.deselect();
            app.path.clear();
            app.range.clear();
            app.cursor.show();
            app.animate(['cursor', 'unit','effects']);
            return this;
        },

		// creates scrolling effect allowing movement and map dimensions beyond screen dimensions
    	scroll: function () {
	        var mapDimensions = app.map.dimensions();
	        var a, cursor = app.cursor.position();

	        for (var p, i = 0; i < 2; i += 1){
	        	a = axis[i];

		        if(cursor[a] >= 0 && cursor[a] < (p = position[a]) + 2 && p > 0) {
		        	position[a] -= 1;
		        }

		        if(cursor[a] < mapDimensions[a] && cursor[a] > (p = position[a] + dimensions[a]) - 2 && p < mapDimensions[a] - 1) 
		        	position[a] += 1;
		    }
	        screenRefresh();
	    },

	    // move screen to target position
        to: function (coordinates) {

       		app.cursor.setPosition(coordinates);

	        var mapDimensions = app.map.dimensions();
	        var a, target, limit, distance, view, sign,
	        beginning, end, middle;

			for (var i = 0; i < 2; i += 1) {

				a = axis[i], target = coordinates[a];

		        // beginning of screen view
		        beginning = position[a];

		        // end / edge of screen view
		        end = position[a] + dimensions[a];

		        // middle of screen view
		        middle = end - Math.ceil(dimensions[a] / 2);

		        // if the hq is located to the right or below the center of the screen then move there
		        if(target > middle){
		            sign = 1;
		            distance = target - middle;
		            limit = mapDimensions[a];
		            view = end;
		        }else{
		            sign = -1;
		            distance = middle - target;
		            limit = -1;
		            view = beginning;
		        }

		        // create the effect of moving the screen rather then immediately jumping to the hq
		        move (distance, view, limit, sign, a);
		    }
	    }
    };
}();