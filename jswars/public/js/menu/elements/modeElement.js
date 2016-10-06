/* --------------------------------------------------------------------------------------*\
    
    ModeElement.js defines the element used for option selection on the mode menu

\* --------------------------------------------------------------------------------------*/

ModeElement = function (c, id) {
    this.createElement().setClass(c).setId(id);
   	this.setName(c);
};
ModeElement.prototype.setName = function (name) { this.c = name };
ModeElement.prototype.setClass = function (c) { 
    this.element().setAttribute('class', c);
    return this;
};
ModeElement.prototype.element = function () {return this.e;};
ModeElement.prototype.setIndex = function (index) { this.element().setAttribute(this.name()+'Index', index); };
ModeElement.prototype.setId = function (id) { this.element().setAttribute('id',id); };
ModeElement.prototype.setHeight = function (height) { this.element().style.height = height; };
ModeElement.prototype.setColor = function (color) { this.element().style.color = color; };
ModeElement.prototype.createElement = function () {
	this.e = document.createElement('li');
	return this;
};
ModeElement.prototype.add = function (element) {
	this.element().appendChild(element);
	return this;
};
ModeElement.prototype.clearHeight = function () {this.current().style.height = '';};
module.exports = ModeElement;