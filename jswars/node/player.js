Player = function (user) {
    this.id = user.id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.name = user.screenName ? user.screenName : user.first_name;
    this.ready = false;
};

Player.prototype.clear = function () {
	this.ready = false;
};

module.exports = Player