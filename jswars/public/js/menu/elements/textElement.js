/* --------------------------------------------------------------------------------------*\
    
    TextElement.js controls the text element on the mode screen

\* --------------------------------------------------------------------------------------*/

TextElement = function (text) {
	this.createBackground('textBackground').setText(text);
	this.createElement('text').add(this.background());
};
TextElement.prototype.createBackground = function (c) {
	var span = document.createElement('span');
    span.setAttribute('class', c);
    this.setBackground(span);
    return this;
};
TextElement.prototype.setBackground = function (background) {this.b = background;};
TextElement.prototype.background = function () {return this.b;};
TextElement.prototype.setText = function(text) {
    this.t = text;
    this.background().innerHTML = text;
};
TextElement.prototype.text = function () {return this.t;};
TextElement.prototype.length = function () {return this.t.length;};
TextElement.prototype.width = function () {return this.element().clientWidth;};
TextElement.prototype.backgroundWidth = function () {return this.background().offsetWidth;};
TextElement.prototype.setElement = function (element) {this.e = element;};
TextElement.prototype.setColor = function (color) {
    this.element().style.borderColor = typeof(color) === "string" ? color : color.format();
    this.color = color;
};
TextElement.prototype.setClass = function (c) {this.element().setAttribute('class',c);};
TextElement.prototype.add = function (element){this.element().appendChild(element);};
TextElement.prototype.createElement = function (c) {
	var text = document.createElement('h1');
    this.setElement(text);
    this.setClass(c);
    return this;
};
TextElement.prototype.element = function () {return this.e;};
TextElement.prototype.setSpacing = function (spacing) {this.element().style.letterSpacing = spacing ? spacing + 'px' : null;};
TextElement.prototype.setBackgroundColor = function (color) {this.background().style.backgroundColor = color;};
TextElement.prototype.hideBackground = function () {this.setBackgroundColor('transparent');};
TextElement.prototype.showBackground = function () {this.setBackgroundColor(null);};
TextElement.prototype.setTransform = function (transform) {this.background().style.transform = transform;};
TextElement.prototype.select = function () {

    var letters = this.length();
    var parentWidth = this.width();
    var bgWidth = this.backgroundWidth();

    // devide the text width by the width of the parent element and divide it by 4 to split between letter spacing and stretching
    var diff = (bgWidth / parentWidth ) / 4;
    
    // find the amount of spacing between letters to fill the parent
    var spacing = (diff * bgWidth) / letters;
    
    this.setTransform(diff + 1); // find the amount of stretch to fill the parent
    this.setSpacing(spacing);
    this.hideBackground();
};
TextElement.prototype.deselect = function () {
    this.setTransform(null);
    this.setSpacing(null);
    this.setBackgroundColor('white');
};
module.exports = TextElement;