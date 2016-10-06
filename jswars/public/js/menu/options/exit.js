Exit = function (callback) {
	this.leave = callback || function () {
		this.game.end(); 
		this.a = false;
		socket.emit('exit', false);
	};
};

Exit.prototype.prompt = function (message) { 
	app.undo.all();
    app.hud.hide();
    app.coStatus.hide();
    app.cursor.hide();
	this.a = true;
	app.confirm.display(message, true); 
};

Exit.prototype.evaluate = function () {
	var answer = app.input.response();
	if (answer) {
		this.a = false;
		app.input.remove();
		if (answer === 'yes')
			return this.leave();
	}
};

Exit.prototype.active = function () { return this.a };
Exit.prototype.deactivate = function () {this.a = false;};

module.exports = Exit;