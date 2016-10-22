app.maps = require ("../controller/maps.js");
app.click = require("../input/click.js");
app.touch = require("../input/touch.js");
app.type = require("../effects/typing.js");

module.exports = {

	active: function () { return this.a; },
	activate: function () { this.a = true; },
	deactivate: function () {this.a = false;},
	save: function (player) {
		this.sender = player;
		player.confirm();
		this.display(player.name().uc_first() + " wants to save the game and continue later, is that ok? "); 
	},
	evaluate: function () {
		var response = this.response;
		if (response) {

			if (app.key.pressed(["left","right"]))
				Select.horizontal(response.deHighlight()).highlight();

			if (app.key.pressed(["enter","esc"])) {
				var answer = app.key.pressed(app.key.esc()) ? false : (response.id() === "yes");
				app.input.remove();
				this.a = false;
				socket.emit("confirmationResponse", {
					answer: answer, 
					to: this.sender.id()
				});
				if (!answer) app.players.unconfirm();
			}
		}
	},
	display: function (message, inactive) {
		var scope = this;
		var text = app.footer.display(), description = app.input.descriptions();
		app.game.screen().appendChild(text.parentNode);
		app.input.activate();
		app.type.letters(description, message, function (element) {
			var yes = document.createElement("span"); 
			var no = document.createElement("span");
			yes.innerHTML = " Yes ";
			no.innerHTML = " No ";
			yes.setAttribute("id","yes");
			no.setAttribute("id","no");
			app.touch(yes).element();
			app.click(no).element();
			description.appendChild(yes);
			description.appendChild(no);
			scope.response = new UList(description).setElements([yes, no]).highlight();
			if (!inactive) app.confirm.activate();
		});
	},
	player: function (answer, player) {
		var i, message, players = app.players.other();

		if (answer) {
			player.confirm();
			message = player.name().uc_first() + " agrees to continue later. ";
		} else return this.no(player);

		var waiting = players.filter(function (p) {return !p.confirmed();});

		app.input.message(message);

		return waiting.length ? this.waiting(waiting, message) : this.yes();                                   
	},
	yes: function () { 
		app.players.unconfirm();
		app.save.recieved(true);
	},
	no: function (player) { 
		app.input.message(player.name().uc_first() + " wants to finish the game.");
		app.players.unconfirm(); 
		app.save.recieved(false);
	},
	waiting: function (players) { app.input.message("Waiting for a response from " + app.players.names(players)); }
};