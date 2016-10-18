app = require('../settings/app.js');
app.key = require('../input/keyboard.js');
app.scroll = require('../menu/scroll.js');
app.user = require('../objects/user.js');
app.menu = require('../controller/menu.js');

module.exports = function (element) {

	var timer = new Date();
	var x, y, down = false;

	var doubleClick = function () {
		var now = new Date();
		var tappedTwice = now - timer < 300 ? true : false;
		timer = now;
		return tappedTwice;
	};

	var input = function (input) { return input ? input : element; };

	return {
		scroll: function (elem) {

			var e = input(elem);

			e.addEventListener('mousedown', function () { down = true; });
		    e.addEventListener('mouseup', function(){ down = false; });
		    e.addEventListener('mouseleave', function (element) {
		    	if (down) {
			        //  get the position of the mouse
			        var position = parseFloat(element.clientY) - 70;

			        // if the position is above the top, move the element up, 
			        // otherwise move it down if it is below the bottom
			        if (position < e.offsetTop) app.scroll.wheel(1, new Date());
			        else app.scroll.wheel(-1, new Date());
			        //app.game.update();
			        down = false;
		    	}
		    });

		    return this;
		},
		swipe: function (elem) {

			var e = input(elem);

			// scroll via touch
			e.addEventListener('mousedown', function () { down = true; });
		    e.addEventListener('mouseup', function(element){

		    	if (down) {

			    	var width = e.offsetWidth / 3;

			    	var offset = width / 3;

			        // get the left boundry of the element
			        var left = e.offsetLeft + offset + 10;

			        // get the bottom boundry
			        var right = e.offsetLeft + width - offset;

			        //  get the position of the element
			        var position = parseFloat(element.clientX) - 200;

			        // if the position is above the top, move the element up, 
			        // otherwise move it down if it is below the bottom
			        if (position < left){
			            app.scroll.swipe(-1, new Date());
			        }else if (position > right){
			            app.scroll.swipe(1, new Date());
			        }
			        down = false;
			        //app.game.update();
		    	}
		    });
		    return this;
		},
		swipeScreen: function (elem) {

			var e = input(elem), start;

			// get the start location of the finger press
			e.addEventListener('mousedown', function(element){
				start = element.clientX;
				down = true;
			});

			// scroll via touch
		    e.addEventListener('mouseup', function(element){

		    	if (down) {
	 		        //  get the position of the end of element
			        var end = element.clientX;

			        // make the length needed to swipe the width of the page divided by three and a half
			        var swipeLength = e.offsetWidth / 3.5;

			        // go back if swiping right
			        if (start < end && end - start > swipeLength){
			        	app.key.press(app.key.esc());

			        // go forward if swiping left
			        } else if (start > end && start - end > swipeLength) {
			        	app.key.press(app.key.enter());
			        }
			    }
			    start = undefined;
			    down = false;
		    });

		    return this;
		},
		// may need to change to eliminate less useful select method
		mapOrGame: function (elem){

			var e = input(elem);

			e.addEventListener('click', function(){
				var label = 'SelectionIndex';
				var clicked = e.id.indexOf(label) > -1 ? e: e.parentNode;
				var type = clicked.id.indexOf('map') ? 'map' : 'game';
	        	var index = clicked.attributes[type + label].value;
	        	// app.display.setIndex(index);
	        	//app.game.update();
	        });

			return this;
		},
		modeOptions: function (elem) {

			var e = input(elem);

			e.addEventListener('click', function(){

	        	// get the index
	        	var index = e.attributes.modeOptionIndex.value;

	        	// if the mode options are already under selection, then change the index
	        	if(app.modes.active()){
					// app.display.setIndex(index);
					//app.game.update();

				// otherwise simulate selecting them with the key right push
				// and set the default index to the selected option
	        	}else{
	        		// app.display.setOptionIndex(index);
		        	app.key.press(app.key.right());
	        	}
	        });
	        return this;
		},
		changeMode: function (elem) {
			input (elem).addEventListener('click', function () {if (app.modes.active()) app.key.press(app.key.left());});
			return this;
		},
		doubleClick: function (elem) {
			input (elem).addEventListener('click', function() {if (doubleClick()) return app.key.press(app.key.enter());});
			return this;
		},
		element: function (elem) {
			var e = input(elem);

			e.addEventListener('click', function (){
				var name = e.parentNode.id == 'settings' ? e.id : e.parentNode.id;
				var setting = name.replace('Settings','').replace('Container','');
				// app.display.setIndex(setting);
				//app.game.update();
			});
			return this;
		},
		esc: function (elem) {
			input(elem).addEventListener('click', function() {if(app.user.player().ready()) return app.key.press(app.key.esc());});
			return this;
		}
	};
};