/* --------------------------------------------------------------------------------------*\
    
    Element.js defines a generic menu element with methods common to all game menus

\* --------------------------------------------------------------------------------------*/

UList = require('../../menu/elements/ul.js');
Element = Object.create(UList.prototype);
Element.p = {};
Element.isComputer = function () {return this.value() === 'cp';};
Element.addProperty = function (index, value){ this.p[index] = value; };
Element.properties = function () {return this.p;};
Element.property = function (index) {return this.p[index];};
Element.setDescription = function (description) {this.d = description;};
Element.description = function () {return this.descriptions() ? this.d[this.indexOf(this.current())] : this.d;};
Element.descriptions = function () {return !(typeof(this.d) === "string");};
Element.element = function () { return this.e; };
Element.setType = function (type) {this.t = type; return this;};
Element.setHeight = function (height) {this.element().style.height = height + 'px';};
Element.setTop = function (top) {this.element().style.top = top + 'px';};
Element.setWidth = function (width) { return this.e.style.width = width + 'px'; };
Element.setColor = function (color) { this.color = new Hsl(color); };
Element.type = function(){ return this.t; };
Element.index = function () { return this.number() - 1; };
Element.add = function (element) { this.element().appendChild(element);};
Element.id = function () {return 'player' + this.number() + this.type();};
Element.setNumber = function (number) {this.n = number;};
Element.number = function () {return this.n};
Element.getStyle = function (parameter) {return Number(this.element().style[parameter].replace('px',''));};
Element.position = function () {return {x:this.left(), y:this.top()};};
Element.dimensions = function () {return {x:this.width(), y:this.height()};};
Element.top = function () {return this.getStyle('top');};
Element.left = function () {return this.getStyle('left');};
Element.height = function () {return this.getStyle('height') || this.element().offsetHeight;};
Element.width = function () {return this.getStyle('width') || this.element().offsetWidth;};
Element.setBorder = function (border) {this.b = border; return this};
Element.border = function () {return this.b; };
module.exports = Element;