DamageDisplay = require('../objects/damageDisplay.js');
actions = require("./actions.js");
terrainController = require("./terrain.js");
unitController = require("./unit.js");
Fader = require('../effects/fade.js');

module.exports = function() {

	var position, action, target, setElement, damage, active, newTarget = true, index = 0, 
	damageDisplay, keys = ['left', 'right', 'up', 'down'], cursors = {attack:'target', drop:'pointer'};

	var refresh = function () {

		app.animate(['cursor']);
	};

	var removeDamageDisplay = function () {

		if (damageDisplay) {

    		damageDisplay.remove();
    	}
	};

	return {

		deactivate: function () { 

			active = false; 
			app.animate(['cursor']);
		},

		set: function (element) { 

			setElement = element; 
		},

		activate: function (acting) { 

			if (!acting) {

				throw new Error ('no action input for target');
			}

			action = acting;
			active = true; 
		},

		drop: function () {

			this.activate("drop");
		},

		attack: function () {

			this.activate("attack");
		},

		active: function () { 

			return active; 
		},

		position: function () { 

			return position; 
		},

		cursor: function () { 

			return cursors[action]; 
		},

		chose: function (element) {

			if (app.key.pressed(app.key.esc()) && app.key.undo(app.key.esc())) {

				removeDamageDisplay();

				newTarget = true;
	        	active = false;
	        	action = false;	
	        	actions.type(element).displayActions();
	        	app.hud.hide();

				return refresh();
			}

	        var targets = unitController.targets(element); // <--- dunno, fix this
	        var k, pressed, length = targets.length;

	        // move to  and from targets units
	        if (length > 1) {

	        	for (var i = 0; i < length; i += 1) {

	            	if ((k = keys[i]) && app.key.pressed(k) && app.key.undo(k) && (pressed = true)) {

	               		index += k === 'left' || k === 'down' ? -1 : 1;
	            	}
	        	}
	        }

	        if (pressed || newTarget) {

	        	newTarget = false;
	        	index = index < 0 ? length - 1 : index = index >= length ? 0 : index;
	            target = targets[index];
		        var p = terrainController.position(target);

	            if (action === 'attack') {

		            damage = unitController.target(index, element);

		            // calcualte damage percentage for each targets unit
		            damageDisplay = new DamageDisplay(Math.round(damage));
	        	}

	            // create target for rendering at specified coordinates
	            position = new Position(p.x, p.y);

	            refresh();
	        }

	        // if the target has been selected return it
	        if (app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter())){

	        	unitController[action](target, damage, true, element);

	        	removeDamageDisplay();

	        	newTarget = true;
	        	active = false;
	        	action = false;
	        	
	        	return target;
	        }

	        return false;
	    }
	};
}();