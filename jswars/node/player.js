Player = function (user) {
    this.id = user.id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.name = user.screenName ? user.screenName : user.first_name;
    this.ready = false;
};
Player.prototype.setRoomName = function (name) {this.roomName = name;};
Player.prototype.clear = function () {this.ready = false;};
Player.prototype.toRoom = function (socket, action, value) {socket.broadcast.to(socket.room.name).emit(action, value);};
Player.prototype.addUnit = function (unit, socket) {this.toRoom(socket, 'addUnit', unit);};
Player.prototype.moveUnit = function (move, socket) {this.toRoom(socket, 'moveUnit', move);};
Player.prototype.attack = function (attack, socket) {this.toRoom(socket, 'attack', attack);};
Player.prototype.join = function (joinedUnits, socket) {this.toRoom(socket, 'joinUnits', joinedUnits);};
Player.prototype.load = function (load, socket) {this.toRoom(socket, 'loadUnit', load);};
Player.prototype.unload = function (transport, socket) {this.toRoom(socket, 'unload', transport);};
Player.prototype.capture = function (capture, socket) {this.toRoom(socket, 'capture', capture);};
Player.prototype.endTurn = function (end, socket) {this.toRoom(socket, 'endTurn', end);};
Player.prototype.del = function (unit, socket) { this.toRoom(socket, 'delete', unit);};
Player.prototype.defeat = function (battle, socket) {this.toRoom(socket, 'defeat', battle);};
Player.prototype.moveCursor = function (moved, socket) {this.toRoom(socket, 'cursorMove', moved);};
Player.prototype.save = function () {this.toRoom(socket, 'confirmSave', this.raw());}; 
Player.prototype.confirm = function (response, socket) {this.toRoom(socket, 'confirmationResponse', {answer:response.answer, sender:this});};
module.exports = Player