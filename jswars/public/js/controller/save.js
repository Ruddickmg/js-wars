// save
app.key = require('../../input/keyboard.js');
app.cursor = require('../../controller/cursor.js');
app.input = require('../../objects/input.js');

module.exports = {
    display: function () {  
        current = 'save';
        app.hud.hide();
        app.coStatus.hide();
        app.cursor.hide();
        app.input.name(app.game.screen(), 'Enter name for save game.');
        this.a = true;
    },
    evaluate: function () {
    	if (app.key.pressed(app.key.enter()) || app.key.pressed(app.key.esc())){
    	 	if (app.input.entry()) app.confirm.save(app.input.value());
        	app.input.remove();
        	app.screen.reset();
        	this.a = false;
    	}
    },
    active: function () { return this.a; }
};