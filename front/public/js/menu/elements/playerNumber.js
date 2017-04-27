Element = require('../../menu/elements/element.js');
PlayerNumber = function (number, size, init) {
	var fontSize = size / 4, properties = {
        index: true,
        hide: true,
    };
    this.name = number+'p';
    properties[this.name] = this.name;
    if (number !== 1 || app.game.started()) 
    	properties.Cp = 'Cp';
    var props = [this.name, 'Cp'];
	this.setNumber(number);
    this.setType('mode');
	this.setElement(app.dom.createList(properties, this.id(), props));
	this.setClass('playerMode');
	this.sizeFont(fontSize);
	this.setLeft(size - (fontSize / 2));
	this.setIndex(init ? props.indexOf(init.uc_first()) : 0);
	this.setDescription('Chose Player or Computer.');
	app.touch(this.element()).element().scroll();
	app.click(this.element()).element().scroll();
};
PlayerNumber.prototype = Object.create(Element);
PlayerNumber.prototype.constructor = PlayerNumber;
PlayerNumber.prototype.getStyle = function (parameter) {
	var parent = Number(this.element().parentNode.style[parameter].replace('px',''));
	var element = Number(this.element().style[parameter].replace('px',''));
	return parameter === 'top' || parameter === 'left' ? parent + element : element;
};
module.exports = PlayerNumber;