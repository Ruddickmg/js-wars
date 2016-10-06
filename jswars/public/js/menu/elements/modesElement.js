/* --------------------------------------------------------------------------------------*\
    
    ModesElement.js defines the element that is used in game mode selection

\* --------------------------------------------------------------------------------------*/

UList = require('../../menu/elements/ul.js');
TextElement = require('../../menu/elements/textElement.js');
ModeElement = require('../../menu/elements/modeElement.js');
Hsl = require('../../tools/hsl.js');
OptionElement = require('../../menu/elements/optionElement.js');

ModesElement = function (element, index) {

    var background, text, outline, li, id = element.id;
    this.setOutline((outline = this.createOutline('block')));
    this.setBackground((background = this.createBackground('modeBackground')));
    this.setText(new TextElement(id));
    this.setElement((li = new ModeElement('modeItem', id)));
    this.setIndex(index);
    var text = this.text.element();
    this.setColor(new Hsl(app.settings.colors[id]));
    li.add(background).add(outline).add(text).setColor(this.color.format());

    app.touch(text).changeMode().doubleTap();
    app.touch(background).changeMode().doubleTap();
    app.touch(li.element()).scroll();

    app.click(text).changeMode().doubleClick();
    app.click(background).changeMode().doubleClick();
    app.click(li.element()).scroll();

    if (element.options) {
        var options = (new OptionElement('modeOptions')).hide();
        for (var i = 0, len = element.options.length; i < length; i += 1) {
            options.add((option = this.createOption(element.options[i], element.id, i)));
            app.touch(option).modeOptions().doubleTap();
            app.click(option).modeOptions().doubleClick();
        }
        li.add(options.element());
        this.options = options;
    }
};
ModesElement.prototype.background = function () {return this.b;};
ModesElement.prototype.element = function () {return this.e.element();};
ModesElement.prototype.object = function () {return this.e;};
ModesElement.prototype.setBackground = function (background) {this.b = background;};
ModesElement.prototype.setText = function (text) {this.text = text;};
ModesElement.prototype.setElement = function (element) {this.e = element;};
ModesElement.prototype.setOptions = function (options) {this.options = options;};
ModesElement.prototype.setPosition = function (position) {
    this.element().setAttribute('pos', position);
    this.p = position;
};
ModesElement.prototype.position = function () {return this.p;};
ModesElement.prototype.setOutline = function (outline) { this.o = outline; };
ModesElement.prototype.outline = function () {return this.o;};
ModesElement.prototype.setColor = function (color) {
    this.outline().style.backgroundColor = color.format();
    this.color = color;
    this.text.setColor(color);
};
ModesElement.prototype.createBackground = function (c) {
    var background = document.createElement('div');
    background.setAttribute('class', c);
    return background;
};
ModesElement.prototype.createOutline = function (c) {
    var outline = document.createElement('div');
    outline.setAttribute('class', c);
    return outline;
};
ModesElement.prototype.createOption = function (option, id, index) {
    var element = document.createElement('li');
    element.setAttribute('class', 'modeOption');
    element.setAttribute('modeOptionIndex', index + 1);
    element.setAttribute('id', option + id);
    element.innerHTML = option;
    return element;
};
ModesElement.prototype.id = function () {return this.element().id;};
ModesElement.prototype.outlineDisplay = function (type) {this.outline().style.display = type;};
ModesElement.prototype.hideOutline = function () {this.outlineDisplay('none');};
ModesElement.prototype.showOutline = function () {this.outlineDisplay(null);};
ModesElement.prototype.setIndex = function (index) {this.i = index;};
ModesElement.prototype.index = function (){return this.i;};
ModesElement.prototype.select = function () {
    if (this.options) this.options.show();
    this.text.select();
    this.hideOutline();
    return this;
};
ModesElement.prototype.deselect = function () {
    if (this.options) this.options.hide();
    this.text.deselect();
    this.showOutline();
    return this;
};
module.exports = ModesElement;