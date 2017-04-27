/* --------------------------------------------------------------------------------------*\
    
    CoElement.js defines the element that holds co selection information

\* --------------------------------------------------------------------------------------*/

Element = require('../../menu/elements/element.js');

CoElement = function (number, init) {

	this.setType('co');
	this.setNumber(number);
	this.setColor(app.settings.playerColor[number]);

	var list = Object.keys(app.co);
	var allowed = {index:true, hide:true};

	for (var name, i = 0, len = list.length; i < len; i += 1) {

        var name = list[i], co = app.co[name];

        this.addProperty(name, { name:co.name, image:co.image });
        allowed[name] = name;
    }

    this.setElement(app.dom.createList(allowed, this.id(), list));
    this.setClass('coList');
    this.setCurrent(init);
    this.setDescription('Chose a CO.');
    this.setBorder(this.element().clientLeft);
    this.fader = new Fader(this.element(), this.color.get());

	app.touch(this.element()).element().scroll().doubleTap().esc();
	app.click(this.element()).element().scroll().doubleClick().esc();
};

CoElement.prototype = Object.create(Element);

CoElement.prototype.constructor = CoElement;

CoElement.prototype.name = function () {

    return this.current().className;
};

CoElement.prototype.getStyle = function (parameter) {

    return Number(this.element().parentNode.style[parameter].replace('px',''));
};

module.exports = CoElement;