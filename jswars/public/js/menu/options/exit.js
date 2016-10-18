//Select = require("../");
Exit = function (callback) {
	this.leave = callback || function () {
		this.game.end(); 
		this.a = false;
		socket.emit("exit", app.user.player());
		return this;
	};
};

Exit.prototype.prompt = function (message) { 
    app.hud.hide();
    app.coStatus.hide();
    app.cursor.hide();
	this.a = true;
	app.confirm.display(message, true);
	return this; 
};

Exit.prototype.evaluate = function () {

	var response = app.confirm.response;

	if (response) {

		if (app.key.pressed(["left","right"]))
			Select.horizontal(response.deHighlight()).highlight();

		if (app.key.pressed(['enter', 'esc'])) {

			this.deactivate();
			app.confirm.deactivate();
			app.input.remove();

			if (app.key.pressed(app.key.enter()) && response.id() === "yes")
				this.leave();

			delete app.confirm.response;
			delete this.selected;
			return true;
		}
	}
};

Exit.prototype.active = function () { return this.a };
Exit.prototype.deactivate = function () {this.a = false;};

module.exports = Exit;