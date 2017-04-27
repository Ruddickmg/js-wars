/* --------------------------------------------------------------------------------------*\
    
    Fader.js creates an object that controls color fading

\* --------------------------------------------------------------------------------------*/

Fader = function (element, color, speed) {
	this.fadeBorder();
	this.setElement(element);
	if (color) this.setColor(color);
	this.setSpeed(speed || 10);
	this.setIncriment(app.settings.colorSwellIncriment);
	this.setTime(new Date());
};
Fader.prototype.element = function () {return this.e;};
Fader.prototype.colors = app.settings.colors;
Fader.prototype.setElement = function (element) {
	this.e = element;
	return this;
};
Fader.prototype.fadeBackground = function () {
	this.fadingName = "Background";
	return this;
};
Fader.prototype.fadeBorder = function () {
	this.fadingName = "Border";
	return this;
};
Fader.prototype.fadeBoth = function () {
	this.fadingName = "Both";
	return this;
};
Fader.prototype.fadingElement = function () {return "set" + this.fadingName + "Color";};
Fader.prototype.setDefault = function (color) {this.d = color;};
Fader.prototype.setColor = function (color) {
	this.setDefault(color);
	this.color = new Hsl(color);
	return this;
};
Fader.prototype.setSpeed = function (speed) {this.s = speed;};
Fader.prototype.setTime = function (time) {this.t = time;};
Fader.prototype.time = function () {return this.t;};
Fader.prototype.setLightness = function (lightness) {this.color.lightness = lightness;};
Fader.prototype.element = function () {return this.e;};
Fader.prototype.speed = function () {return this.s;};
Fader.prototype.fading = function () {return this.f;};
Fader.prototype.setIncriment = function (incriment) { this.i = incriment; };
Fader.prototype.incriment = function () {return this.i;};
Fader.prototype.stop = function () {
	this.f = false;
	clearTimeout(this.fada);
	this.clear();
	return this;
};
Fader.prototype.transparentBorder = function () { 
	this.transparent = true; 
	return this;
};
Fader.prototype.clear = function () {this.callback ? this.callback(null, this.element()) : this[this.fadingElement()](null);};
Fader.prototype.toWhite = function () {this[this.fadingElement()](new Hsl(this.colors.white).format());};
Fader.prototype.toSolid = function () {this[this.fadingElement()](this.setColor(this.defaultColor()).color.format());};
Fader.prototype.defaultColor = function () {return this.d; };
Fader.prototype.lightness = function () {return this.color.lightness;};
Fader.prototype.increase = function () {this.setLightness(this.lightness() + this.incriment());};
Fader.prototype.decrease = function () {this.setLightness(this.lightness() - this.incriment());};
Fader.prototype.start = function (callback) {
	this.f = true;
	this.fade(callback);
	return this;
};
Fader.prototype.changeElement = function (element) {return this.stop().setElement(element).start();};
Fader.prototype.previous = function () {return this.p;};
Fader.prototype.setPrevious = function (previous) {this.p = previous;};
Fader.prototype.setBorderColor = function (color) {
	this.element().style.borderColor = this.transparent ? (color + " transparent") : color;
};
Fader.prototype.setBackgroundColor = function (color) {this.element().style.backgroundColor = color;};
Fader.prototype.setBothColor = function (color) {
	this.setBackgroundColor(color);
	this.setBorderColor(color);
};
Fader.prototype.fade = function (callback) {
	this.callback = callback;
	var scope = this;
	this.fada = setTimeout(function () {
        var prev = scope.previous();
		var lightness = scope.lightness();
        var color = scope.color;
        var inc = scope.incriment();
        scope.setPrevious(lightness);
        callback ? callback(color.format(), scope.element()) : scope[scope.fadingElement()](color.format());
        if (lightness + inc <= 100 + inc && prev < lightness || lightness - inc < 50) 
        	scope.increase();
        else if (lightness - inc >= scope.defaultColor().l && prev > lightness || lightness + inc > 50) 
        	scope.decrease();
		return scope.fading() ? scope.fade(callback) : scope.clear();
	}, scope.speed());
};
module.exports = Fader;