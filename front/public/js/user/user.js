app.request = require('../tools/request.js');
Score = require('../definitions/score.js');
playerController = require("../controller/player.js");
unitController = require("../controller/unit.js");

User = function (info, origin) {

	this.score = new Score();
	this.l = {};
	this.setId(info.id);
	this.setName(info.name);
	this.setFirstName(info.first_name);
	this.setLastName(info.last_name);
	this.setGender(info.gender);
	this.setOrigin(origin);
	this.setEmail(info.email);
	this.setLink(info.link, origin);
};

User.prototype.setId = function (id) {

	this.i = id;
};

User.prototype.setName = function (name) {

	this.n = name;
};

User.prototype.setFirstName = function (first_name) {

	this.fn = first_name;
};

User.prototype.setLastName = function (last_name) {

	this.ln = last_name;
};

User.prototype.setOrigin = function (origin) {

	this.o = origin;
};

User.prototype.setEmail = function (email) {

	this.e = email;
};

User.prototype.setLink = function (link, origin) {

	this.l[origin] = link;
};

User.prototype.setGender = function (gender) {

	this.g = gender;
};

User.prototype.name = function () { 

	return this.n; 
};

User.prototype.first_name = function () { 

	return this.fn; 
};

User.prototype.last_name = function () { 

	return this.ln; 
};

User.prototype.email = function () { 

	return this.e; 
};

User.prototype.id = function () { 

	return this.i; 
};

User.prototype.gender = function () { 

	return this.g; 
};

User.prototype.link = function (origin) { 

	return this.l[origin]; 
};

User.prototype.origin = function () {

	return this.o;
};

User.prototype.turn = function () { 

	return playerController.isTurn(this.player()); 
};

User.prototype.player = function () { 

	return app.players.get(this.raw()); 
};

User.prototype.first = function () { 

	return !(player = this.player()) || player === app.players.first(); 
};

User.prototype.owns = function (object) { 

	var o = playerController.owns(this.player(), object); 

	return o;
};

User.prototype.number = function () {

	return playerController.number(this.player()); 
};

User.prototype.savedGames = function () {

	app.request.get(this.id(), "games/saved", function (games) {

		console.log('--- games retreived! ---');
		console.log(games);
	});
};

User.prototype.get = function () {

	this.getter("oauth");
};

User.prototype.save = function () {

	this.getter("save");
};

User.prototype.getter = function (path) {

	var scope = this;

	app.request.post(this.raw(), "users/"+path, function (user) {

		if (user && !user.error) {

			scope.setId(user.id);
			scope.setOrigin(false);

		} else if (user) {

			console.log(user.error);

		} else {

			console.log("Recieved: "+user);
		}
	});
};

User.prototype.info = function () {

	return playerController.displayedInfo(this.player());
};

User.prototype.raw = function () { 

	return {
		id: this.id(),
		origin: this.origin(),
		email: this.email(),
		last_name: this.last_name(),
		first_name: this.first_name(),
		name: this.name(),
		gender: this.gender(),
		link: this.link(),
		isComputer: false
	};
};

module.exports = User;