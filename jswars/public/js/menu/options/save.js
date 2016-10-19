// save
app.key = require('../../input/keyboard.js');
app.cursor = require('../../controller/cursor.js');
app.input = require('../../input/input.js');
app.confirm = require('../../controller/confirmation.js');

module.exports = {
    display: function () {  
        app.hud.hide();
        app.coStatus.hide();
        app.cursor.hide();
        app.input.name(app.game.screen(), 'Enter name for save game.');
        this.a = true;
    },
    evaluate: function () {
    	if (!this.sent() && app.key.pressed(app.key.enter()) && app.input.entry()) {
            this.s = true;
            socket.emit('confirmSave', app.user.player());
            app.input.removeInput();
            app.confirm.waiting(app.players.other());
    	} else if ((this.r && app.key.pressed(app.key.enter())) || app.key.pressed(app.key.esc())) {
            this.remove();
            return true;
        }
    },
    recieved: function () {this.r = true;},
    active: function () { return this.a; },
    sent: function () { return this.s; },
    remove: function () {
        app.input.remove();
        app.screen.reset();
        this.a = false;
        this.s = false;
        this.r = false;
    },
    deactivate: function () {this.a = false;}
};