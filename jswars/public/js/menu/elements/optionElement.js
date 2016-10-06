UList = require('../../menu/elements/ul.js');
OptionElement = function (c) {
    this.setElement(document.createElement('ul'));
    this.setIndex(0);
    this.setClass(c);
};
OptionElement.prototype = Object.create(UList.prototype);
OptionElement.prototype.constructor = OptionElement;
OptionElement.prototype.setOpacity = function (opacity) {
    this.element().style.opacity = opacity;
    return this;
};
OptionElement.prototype.show = function () {return this.setOpacity(1);};
OptionElement.prototype.hide = function () {return this.setOpacity(0);};
OptionElement.prototype.active = function () {return this.a;};
OptionElement.prototype.activate = function () {this.a = true;};
OptionElement.prototype.deactivate = function () {
	this.setIndex(0)
	this.a = false;
};
module.exports = OptionElement;