/* --------------------------------------------------------------------------------------*\
    
    Background.js controls the weather

\* --------------------------------------------------------------------------------------*/

app.calcualte = require('../game/calculate.js');
Terrain = require('../objects/terrain.js');

module.exports = {
	pos:{x:0, y:0},
	rand: false,
	cat:'random',
	background: new Terrain('plain', {x:0, y:0}),
	category: function () { return this.cat; },
	type: function () { return this.background.type(); },
	defense: function () { return this.background.defense(); },
	name: function () { return this.background.name(); },
	alias: function (name) {
		// var alias = {
		// 	clear:'plain',
		// 	rain:'plain',
		// 	snow:'snow'
		// } [name];
		return name === 'snow' ? 'snow' : 'plain'; 
	},
	set: function (type) {
		console.log(type);

		this.cat = type;

		if (type === 'random') {
			this.rand = true;
			return this.change();
		}

		if (!app.game.started())
			this.rand = false;

		if (type === 'rain') {

			// app.effects.rain();
			return this.background = new Terrain('plain', this.pos);
		}
		return this.background = new Terrain(this.alias(type) || type, this.pos); 
	},
	random: function () { return this.rand; },
	weighted: function (chance) { 
		var calculated = app.calculate.random(chance);
		console.log('uncomment this when weather graphics are set up and ready');
		// if(calculated < 4)
		// 	return 'snow';
		// else if(calculated < 6)
		// 	return 'rain';
		return 'plain';
	},
	change: function () {
		if(!app.game.started() && app.user.first() || app.user.turn()) {
			var type = this.weighted(20);
			if(app.game.started() && app.user.turn())
				socket.emit('background', type);
			if(type === 'rain') {
				//app.effects.rain();
				return background = new Terrain('plain', this.pos);
			}
			return this.background = new Terrain(this.alias(type), this.pos);
		}
	}
};