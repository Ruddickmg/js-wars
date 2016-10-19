Score = require('../definitions/score.js');

module.exports = function (info) {
	this.name = function () { return info.name; };
	this.first_name = function () { return info.first_name; };
	this.last_name = function () { return info.last_name; };
	this.email = function () { return info.email; };
	this.id = function () { return info.id; };
	this.gender = function () { return info.gender; };
	this.link = function () { return info.link; };
	this.location = function () { return info.locale; };
	this.turn = function () { return this.player().turn(); };
	this.player = function () { return app.players.get(this); };
	this.first = function () { return !(player = this.player()) || player === app.players.first(); };
	this.owns = function (object) { return this.player().owns(object); };
	this.number = function () { return this.player().number(); };
	this.raw = function () { return info };
	this.score = new Score();
};