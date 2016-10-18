module.exports = function() {

	var position, action, target, setElement, damage, active, newTarget = true, index = 0, 
	keys = ['left', 'right', 'up', 'down'], cursors = {attack:'target', drop:'pointer'};
	var refresh = function () {app.animate(['cursor']);};
	
	return {
		deactivate: function () { 
			active = false; 
			app.animate(['cursor']);
		},
		set: function (element) { setElement = element; },
		activate: function (a) { 
			if(!a) throw new Error ('no action input for target');
			action = a;
			active = true; 
		},
		active: function () { return active; },
		position: function () { return position; },
		cursor: function () { return cursors[action]; },
		chose: function (element) {

			if(app.key.pressed(app.key.esc()) && app.key.undo(app.key.esc())) {
				newTarget = true;
	        	active = false;
	        	action = false;				
	        	element.displayActions();
				return refresh();
			}

	        var i, k, pressed, length = element.targets().length;

	        // move to  and from targets units
	        if (length > 1)
	        	for (i = 0; i < length; i += 1)
	            	if ((k = keys[i]) && app.key.pressed(k) && app.key.undo(k) && (pressed = true)) 
	               		index += k === 'left' || k === 'down' ? -1 : 1;

	        if (pressed || newTarget) {

	        	newTarget = false;
	        	index = index < 0 ? length - 1 : index = index >= length ? 0 : index;
	            target = element.targets(index);
		        var pos = target.position();

	            if (action === 'attack') {

		            damage = element.target(index);

		            // calcualte damage percentage for each targets unit
		            app.screens.damage(Math.round(damage));
	        	}
	            // create target for rendering at specified coordinates
	            position = {x:pos.x, y:pos.y};
	            refresh();
	        }

	        // if the target has been selected return it
	        if (app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter())){
	        	element[action](target, damage, true);
	        	newTarget = true;
	        	active = false;
	        	action = false;
	        	return target;
	        }
	        return false;
	    }
	};
}();