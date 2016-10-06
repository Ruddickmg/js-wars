Player = require('../player.js');
AiPlayer = function (id, player) {
    this.id = player._current.id;
    this.number = player._current.number;
    this.roomId = player.roomId;
    this.roomName = 
    this.identity = id;
    this.ready = true;
    this.isComputer = true;
};
AiPlayer.prototype = Object.create(Player);
AiPlayer.prototype.constructor = AiPlayer;
AiPlayer.prototype.setRoomId = function (id) {this.roomId = id; return this;};
AiPlayer.prototype.setRoomName = function (name) {this.roomName = name;};
AiPlayer.prototype.index = function () {return this.number - 1;};
AiPlayer.prototype.toRoom = function (io, action, value) { io.in(this.room.name).emit(action, value); };
module.exports = AiPlayer;