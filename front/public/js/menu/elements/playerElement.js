/* --------------------------------------------------------------------------------------*\
    
    PlayerElement.js creates an element and interface for interacting with co selection

\* --------------------------------------------------------------------------------------*/

Element = require('../../menu/elements/element.js');

PlayerElement = function (number, size, height) {

	var screen = document.getElementById('setupScreen');
	var width = screen.offsetWidth;
	var sections = width / app.map.players();

    this.setNumber(number);
    this.setElement(document.createElement('section'));
    this.setId('player' + number);
    this.setClass('players');
    this.setWidth(size);
    this.setHeight(size);
    this.setLeft(((sections * this.index()) + ((sections - size) / 2)));
    this.setTop(height);
};

PlayerElement.prototype = Object.create(Element);

PlayerElement.prototype.list = function () {

    return this.element().childNodes;
};

PlayerElement.prototype.setMode = function  (mode) {

    this.m = mode
}; 

PlayerElement.prototype.mode = function () { 

    return this.m; 
};

PlayerElement.prototype.setCo = function (co) {

    this.c = co;
};

PlayerElement.prototype.co = function () {

    return this.c;
};

PlayerElement.prototype.coName = function () {

    return this.co().name();
};

PlayerElement.prototype.setTeam = function (team) {

    this.t = team;
};

PlayerElement.prototype.team = function () {

    return this.t;
};

PlayerElement.prototype.fade = function () {

    return this.co().fader.start(); 
};

PlayerElement.prototype.fading = function () { 

    return this.co().fader.fading(); 
};

PlayerElement.prototype.stopFading = function () {

    return this.co().fader.stop();
};

PlayerElement.prototype.bottom = function () {

    return this.top() + this.height() + 10; 
};

PlayerElement.prototype.toSolid = function () {

    return this.co().fader.stop().toSolid();
};

PlayerElement.prototype.toWhite = function () {

    return this.co().fader.stop().toWhite();
};

PlayerElement.prototype.show = function () {

    this.co().show();
    this.mode().show();
};

PlayerElement.prototype.constructor = PlayerElement;

module.exports = PlayerElement;