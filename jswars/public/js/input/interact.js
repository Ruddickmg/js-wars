app = require('../settings/app.js');
app.key = require('../input/keyboard.js');
app.scroll = require('../menu/scroll.js');
app.user = require('../objects/user.js');
app.menu = require('../controller/menu.js');

module.exports = function (element) {

	var timer = new Date();

	var doubleClick = function () {
		var now = new Date();
		var tappedTwice = now - timer < 300 ? true : false;
		timer = now;
		return tappedTwice;
	};

	var input = function (input) { return input ? input : element; };

	return {
		// may need to change to eliminate less useful select method
		mapOrGame: function (elem){

			var e = input(elem);

			console.log(' --- mapOrGame ---');
			console.log(e);

			e.addEventListener('onclick', function(){
				var label = 'SelectionIndex';
				var clicked = e.id.indexOf(label) > -1 ? target: target.parentNode;
				var type = clicked.id.indexOf('map') ? 'map' : 'game';
	        	var index = clicked.attributes[type + label].value;
	        	// app.display.setIndex(index);
	        });

			return this;
		},
		modeOptions: function (elem) {

			var e = input(elem);

			e.addEventListener('onclick', function(){

	        	// get the index
	        	var index = e.attributes.modeOptionIndex.value;

	        	// if the mode options are already under selection, then change the index
	        	if(app.menu.active()){
					// app.display.setIndex(index);

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
			input (elem).addEventListener('onclick', function () {if (app.menu.active()) app.key.press(app.key.left());});
			return this;
		},
		doubleClick: function (elem) {
			input (elem).addEventListener('onclick', function() {if (doubleClick()) return app.key.press(app.key.enter());});
			return this;
		},
		element: function (elem) {
			var e = input(elem);
			console.log(' --- element ---');
			console.log(e);

			e.addEventListener('onclick', function (){
				var name = e.parentNode.id == 'settings' ? e.id : e.parentNode.id;
				var setting = name.replace('Settings','').replace('Container','');
				// app.display.setIndex(setting);
			});
			return this;
		},
	};
};