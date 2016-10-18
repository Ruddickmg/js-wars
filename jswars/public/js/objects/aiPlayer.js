Player = require('../objects/player.js');
Score = require('../definitions/score.js');
AiPlayer = function (number) {
	this._current = {
        id: 'AI#'+number,
        gold: 0,
        special: 0,
        ready: true,
        number:number
    };
	this.name = function () { return 'HAL #'+ this.number();};
    this.fullName = function () { return 'Mr. Robot'; };
    this.lastName = function () { return 'Robot'; };
    this.id = function () { return this._current.id; };
    this.score = new Score(true);
    this.co = null;
    this.mode = 'cp';
    this.isComputer = true;
    if (app.user.first()) socket.emit('addAiPlayer', this);
};
AiPlayer.prototype = Object.create(Player.prototype);
AiPlayer.prototype.constructor = AiPlayer;
AiPlayer.prototype.setNumber = function (number) {this._current.number = number;};
module.exports = AiPlayer;