app.settings = require('../settings/game.js');
Origin = require('../effects/elements/origin.js');
Sweller = function (element, min, max, speed) {
    this.setElement(element);
    this.setMin(min);
    this.setMax(max);
    this.setIncriment(app.settings.swellIncriment);
    this.setSpeed(speed || 2);
};

Sweller.prototype.setMin = function (min) {this.min = min;};
Sweller.prototype.setMax = function (max) {this.max = max;};
Sweller.prototype.swell = function (callback) {
    var scope = this;
    var size = this.size();
    var inc = this.incriment();
    var prev = this.previous();

    if (this.swelling()) {
        if (size + inc <= this.max && prev < size || size - inc < this.min)
            this.setPrevious(size).increase();

        else if(size - inc >= this.min && prev > size || size + inc > this.min)
            this.setPrevious(size).decrease();

        callback ? callback(this.element(), this.size(), this.position()) : this.resize();
        this.sweller = setTimeout(function() {scope.swell(callback);}, 15);
    } else this.clear();
};
Sweller.prototype.swelling = function () {return this.a;};
Sweller.prototype.start = function (callback) {
    this.a = true;
    this.init();
    this.swell(callback);
    return this;
};
Sweller.prototype.stop = function () {
    this.a = false;
    this.clear();
    return this;
};
Sweller.prototype.clear = function () {
    if (!this.origin) 
        throw new Error('origin has not been set');
    clearTimeout(this.sweller);
    this.setLeft(this.origin.x);
    this.setTop(this.origin.y);
    this.setSize(this.origin.size);
    this.resize();
};
Sweller.prototype.centerElement = function (center) {
    this.setLeft(this.left() + center);
    this.setTop(this.top() + center);
};
Sweller.prototype.setLeft = function (position) {this.l = position;};
Sweller.prototype.left = function () {return this.l;};
Sweller.prototype.setTop = function (position) {this.t = position; return this;};
Sweller.prototype.top = function () {return this.t;};
Sweller.prototype.center = function () {return this.incriment() / 2;};
Sweller.prototype.incriment = function () {return this.i;};
Sweller.prototype.setIncriment = function (incriment) {this.i = incriment;};
Sweller.prototype.setSize = function (size) {this.s = size; return this;};
Sweller.prototype.resize = function () {
    var size = this.size();
    this.element().style.width = size + 'px';
    this.element().style.height = size + 'px';
    this.element().style.top = this.top() + 'px';
    this.element().style.left = this.left() + 'px';
    return this;
};
Sweller.prototype.size = function () {return this.s;};
Sweller.prototype.incSize = function (incriment) {this.setSize(this.size() + incriment);};
Sweller.prototype.increase = function () {
    this.incSize(this.incriment());
    this.centerElement(-this.center());
    return this;
};
Sweller.prototype.decrease = function () {
    this.incSize(-this.incriment());
    this.centerElement(this.center());
    return this;
};
Sweller.prototype.position = function () {return {x:this.left(), y:this.top()};};
Sweller.prototype.setPrevious = function (p) {this.p = p; return this;};
Sweller.prototype.previous = function () {return this.p;};
Sweller.prototype.setElement = function (element) {
    this.e = element;
    return this;
};
Sweller.prototype.init = function () {
    var element = this.element();
    var size = element.offsetWidth;
    var left = Number(element.style.left.replace('px','')); 
    var top = Number(element.style.top.replace('px',''));
    this.setSize(size);
    this.setLeft(left);
    this.setTop(top);
    this.origin = new Origin(left, top, 80);
};
Sweller.prototype.setSpeed = function (speed) {this.s = speed;};
Sweller.prototype.speed = function () {return this.s; };
Sweller.prototype.element = function () {return this.e;};
module.exports = Sweller;