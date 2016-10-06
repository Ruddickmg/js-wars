app.maps = require ('../controller/maps.js');
app.effect = require('../game/effects.js');
app.click = require('../tools/click.js');
app.touch = require('../tools/touch.js');
app.type = require('../effects/typing.js');

module.exports = {

	active: function () { return this.a; },
	activate: function () { this.a = true; },
	deactivate: function () {this.a = false;},
	save: function (player) { 
		this.sender = player;
		this.display(player.name().uc_first() + ' wants to save the game and continue later, is that ok? '); 
	},
	evaluate: function () {
		var answer = app.input.response();
		if (answer) {
			app.input.remove();
			this.a = false;
			socket.emit('confirmationResponse', {answer:(answer === 'yes'), to:this.sender.id()});
		}
	},

	display: function (message, inactive) {

		console.log('displaying..');

		var text = app.footer.display(), description = app.input.descriptions();
		app.game.screen().appendChild(text.parentNode);
		app.input.activate();
		app.type.letters(description, message, function (element) {
			var yes = document.createElement('span'); 
			var no = document.createElement('span');
			yes.innerHTML = ' Yes ';
			no.innerHTML = ' No ';
			yes.setAttribute('id','yes');
			no.setAttribute('id','no');
			app.touch(yes).element();
			app.click(no).element();
			description.appendChild(yes);
			description.appendChild(no);
			if (!inactive) app.confirm.activate();
		});
	},

	player: function (answer, player) {
		var i, message, players = app.players.other(), waiting = [];

		if (answer) {
			player.confirm();
			message = player.name().uc_first() + ' agrees to continue later. ';
		} else return this.no(player);

		for (i = 0; i < players.length; i += 1)
			if (!players[i].confirmed())
				waiting.push(players[i]);
		
		app.input.message(message);
		return waiting.length ? this.waiting(waiting, message) : this.yes();                                   
	},

	yes: function () { 
		alert('Save the game!!: '+app.input.value()); 
		app.game.end(true);
	},
	no: function (player) { 
		app.input.message(player.name().uc_first() + 'wants to finish the game.');
		app.players.unconfirm(); 
		app.save.recieved();
	},
	waiting: function (players) { app.input.message('Waiting for a response from ' + app.players.names(players)); }
};