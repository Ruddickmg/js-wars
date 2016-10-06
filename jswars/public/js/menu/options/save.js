// save
app.key = require('../../tools/keyboard.js');
app.cursor = require('../../controller/cursor.js');
app.input = require('../../objects/input.js');
app.undo = require('../../tools/undo.js');
app.confirm = require('../../controller/confirmation.js');

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
    	if (!this.sent() && app.key.pressed(app.key.enter())) {
            if(app.input.entry()){
                this.s = true;
                socket.emit('confirmSave', app.user.player());
                app.input.removeInput();
                app.confirm.waiting(app.players.other());
            }
    	} else if (app.key.pressed(app.key.esc())) 
            this.remove();
    },
    active: function () { return this.a; },
    sent: function () { return this.s; },
    recieved: function () { this.s = false; },
    remove: function () {
        app.input.remove();
        app.hud.show();
        app.coStatus.show();
        app.cursor.show();
        app.undo.all();
        this.a = false;
        this.s = false;
    },
    deactivate: function () {this.a = false;}
};