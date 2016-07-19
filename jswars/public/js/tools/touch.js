app = require('../settings/app.js');
app.key = require('../tools/keyboard.js');
app.scroll = require('../menu/scroll.js');
app.user = require('../objects/user.js');
app.display = require('../tools/display.js');
app.modes = require('../menu/modes.js');

module.exports = function (element) {

	var timer = new Date();

	var doubleTap = function () {
		var now = new Date();
		var tappedTwice = now - timer < 300 ? true : false;
		timer = now;
		return tappedTwice;
	};

	var input = function (input) { return input ? input : element; };

	return {
		scroll: function (elem) {

			var e = input(elem);

			// scroll via touch
		    e.addEventListener('touchmove', function(touch){

		        // get the top  boundry of the element
		        var top = e.offsetTop - 50;

		        // get the bottom boundry
		        var bottom = top + e.offsetHeight + 50;

		        //  get the position of the touch
		        var position = parseFloat(touch.changedTouches[0].pageY ) - 50;

		        // if the position is above the top, move the element up, 
		        // otherwise move it down if it is below the bottom
		        if (position < top){
		            app.scroll.wheel(1, new Date());
		        }else if (position > bottom){
		            app.scroll.wheel(-1, new Date());
		        }
		    });
		    return this;
		},
		swipe: function (elem) {

			var e = input(elem);

			// scroll via touch
		    e.addEventListener('touchmove', function(touch){

		    	touch.preventDefault();

		    	var width = e.offsetWidth / 3;

		    	var offset = width / 3;

		        // get the left boundry of the element
		        var left = e.offsetLeft + offset;

		        // get the bottom boundry
		        var right = e.offsetLeft + width - offset;

		        //  get the position of the touch
		        var position = parseFloat(touch.changedTouches[0].pageX );

		        // if the position is above the top, move the element up, 
		        // otherwise move it down if it is below the bottom
		        if (position < left){
		            app.scroll.swipe(-1, new Date());
		        }else if (position > right){
		            app.scroll.swipe(1, new Date());
		        }
		    });
		    return this;
		},
		swipeScreen: function (elem) {

			var e = input(elem), start;

			// get the start location of the finger press
			e.addEventListener('touchstart', function(touch){
				touch.preventDefault();
				start = touch.changedTouches[0].pageX;
			});

			// scroll via touch
		    e.addEventListener('touchend', function(touch){
		    	touch.preventDefault();

		        //  get the position of the end of touch
		        var end = touch.changedTouches[0].pageX;

		        // make the length needed to swipe the width of the page divided by three and a half
		        var swipeLength = e.offsetWidth / 3.5;

		        // go back if swiping right
		        if (start < end && end - start > swipeLength){
		        	app.key.press(app.key.esc());

		        // go forward if swiping left
		        }else if (start > end && start - end > swipeLength){
		        	app.key.press(app.key.enter());
		        }
		        start = undefined;
		    });

		    return this;
		},
		// may need to change to eliminate less useful select method
		mapOrGame: function (elem){
			var e = input(elem);
			e.addEventListener('touchstart', function(touch){
				var label = 'SelectionIndex';
				var target = touch.target;
				var touched = target.id.indexOf(label) > -1 ? target: target.parentNode;
				var type = touched.id.indexOf('map') ? 'map' : 'game';
	        	var index = touched.attributes[type + label].value;
	        	app.display.setIndex(index);
	        });
			return this;
		},
		modeOptions: function (elem) {

			var e = input(elem);

			e.addEventListener('touchstart', function(){

	        	// get the index
	        	var index = e.attributes.modeOptionIndex.value;

	        	// if the mode options are already under selection, then change the index
	        	if(app.modes.active()){
					app.display.setIndex(index);

				// otherwise simulate selecting them with the key right push
				// and set the default index to the selected option
	        	}else{
	        		app.display.setOptionIndex(index);
		        	app.key.press(app.key.right());
	        	}
	        });
	        return this;
		},
		changeMode: function (elem) {
			input(elem).addEventListener('touchstart', function () {if(app.modes.active()) app.key.press(app.key.left());});
			return this;
		},
		doubleTap: function (elem) {
			input(elem).addEventListener('touchstart', function() {if(doubleTap()) return app.key.press(app.key.enter());});
			return this;
		},
		element: function (elem) {
			input(elem).addEventListener('touchstart', function (touch){
				var touched = touch.target;
				var name = touched.parentNode.id == 'settings' ? touched.id : touched.parentNode.id;
				var setting = name.replace('Settings','').replace('Container','');
				app.display.setIndex(setting);
			});
			return this;
		},
		esc: function (elem) {
			input(elem).addEventListener('touchstart', function() {if(app.user.player().ready()) return app.key.press(app.key.esc());});
			return this;
		},
	};
};