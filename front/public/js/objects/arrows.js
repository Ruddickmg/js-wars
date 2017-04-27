arrow = require('../objects/arrow.js');
Fader = require('../effects/fade.js');

Arrows = function (screen, space, over, under) {
	this.setDown(new Arrow('down'));
	this.setUp(new Arrow('up'));
    this.fader = new Fader(this.list(), this.color);
    this.over = over || 0;
    this.under = under || 0;
    this.space = space || 0;
	this.setScreen(screen);
};
Arrows.prototype.setSeperation = function (seperation) {
    this.seperation = seperation;
    return this;
};
Arrows.prototype.setDown = function (arrow) {this.d = arrow;};
Arrows.prototype.setUp = function (arrow) {this.u = arrow};
Arrows.prototype.list = function () {return [this.up(), this.down()];};
Arrows.prototype.setScreen = function (screen) { this.s = screen;};
Arrows.prototype.color = app.settings.colors.white;
Arrows.prototype.hide = function () {this.display('none');};
Arrows.prototype.show = function () {this.display(null);};
Arrows.prototype.display = function (display) {
    this.list().map(function(arrow){arrow.outline().style.display = display;});
};
Arrows.prototype.remove = function () {
    if (this.fader.fading()) this.fader.stop();
    this.list().map(function(arrow){arrow.remove();});
};
Arrows.prototype.setSize = function (size) {
    this.setWidth(size);
    this.list().map(function (arrow){arrow.setSize(size);});
    return this;
};
Arrows.prototype.setSpace = function (space) {this.space = space; return this;};
Arrows.prototype.setOver = function (over) {this.over = over; return this;};
Arrows.prototype.setUnder = function (under) {this.under = under; return this;};
Arrows.prototype.setWidth = function (width) {this.w = width; return this;};
Arrows.prototype.width = function () {return this.w || 30;};
Arrows.prototype.setPosition = function(element) {

    var b, border = element.border && !isNaN((b = element.border())) ? b : 0;

    var position = element.position();
    var dimension = element.dimensions();
    var arrow = this.width() / 2;
    var top = position.y - arrow - border;
    var left = position.x;
    var width = dimension.x - (border * 2);
    var bottom = top + dimension.y + arrow + (border * 3);
    var center = (width / 2) - arrow;

    this.up().setPosition(left + center, top - this.space - this.over);
    this.down().setPosition(left + center, bottom + this.space + this.under);

    return this;
};
Arrows.prototype.fade = function (speed, swell) {
    this.fader.start(function (color, arrows) {
        for (var i = 0, len = arrows.length; i < len; i += 1)
            arrows[i].setColor(color);
    });
};
Arrows.prototype.insert = function (element) {
    this.setScreen(element);
    element.appendChild(this.u.outline());
    element.appendChild(this.d.outline()); 
    return this;
};
Arrows.prototype.screen = function () { return this.s;};
Arrows.prototype.up = function () { return this.u; };
Arrows.prototype.down = function () { return this.d; };

module.exports = Arrows;