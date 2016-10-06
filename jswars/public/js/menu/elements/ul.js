/* --------------------------------------------------------------------------------------*\
    
    Ul.js creates an interface for iterating over ul list items
    
\* --------------------------------------------------------------------------------------*/

List = require('../../menu/elements/list.js');
Ul = function (ul, init) {
    this.setElement(ul = ul || document.createElement('ul'));
    this.setCurrent(init);
};
Ul.prototype = Object.create(List.prototype);
Ul.prototype.changeCurrent = function (value) {return this.hide().setCurrent(value).show();};
Ul.prototype.element = function () { return this.e; };
Ul.prototype.setElement = function (element) {
    this.e = element;
    this.setElements(element.childNodes);
};
Ul.prototype.hideAll = function () {
    var elements = this.elements(), i = elements.length;
    while (i--) elements[i].style.display = 'none';
    return this;
};
Ul.prototype.display = function (display) {
    this.current().style.display = display || null;
    return this;
};
Ul.prototype.indexOf = function (property) {
	var scope = this;
    return this.find(function (element, index) {
        return property && property.toString() === element.className;
    });
};
Ul.prototype.setLeft = function (left) {this.element().style.left = left + 'px';};
Ul.prototype.setBackgroundColor = function (color) {if (this.current()) this.current().style.backgroundColor = color || null;};
Ul.prototype.highlight = function () {this.setBackgroundColor('tan'); return this;};
Ul.prototype.deHighlight = function () {this.setBackgroundColor(null); return this;};
Ul.prototype.show = function (property, display) {
    if (property) this.hide().setCurrent(property);
    this.display(display || 'block');
    return this;
};
Ul.prototype.hide = function () {return this.display('none');};
Ul.prototype.value = function () {return this.current().innerHTML.toLowerCase(); };
Ul.prototype.setId = function (id) {this.element().setAttribute('id', id);};
Ul.prototype.id = function (element) {return element ? element.id : this.current() ? this.current().id : false; };
Ul.prototype.class = function (element) {return element ? element.className : this.current().className;};
Ul.prototype.setClass = function (c) { this.element().setAttribute('class', c); };
Ul.prototype.sizeFont = function (s) { this.element() }; 
Ul.prototype.add = function (element) { this.element().appendChild(element); };
Ul.prototype.prepHorizontal = function () {
    for  (var index = 0, ind = this.index(), i = ind - 1; i < ind + 1; i +=1)
        this.getElement(this.wrap(i)).setAttribute('pos', ['left','center','right'][index++]);
};
Ul.prototype.constructor = Ul;
module.exports = Ul;