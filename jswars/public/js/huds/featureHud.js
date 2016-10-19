Feature = function (selected) {
    this.element = document.createElement('div');
    this.element.setAttribute('id', 'hud');
    this.element.style.backgroundColor = 'yellow';
    if (selected) this.set(selected);
};

Feature.prototype.clear = function () { while (this.element.firstChild) this.element.removeChild(this.element.firstChild); };
Feature.prototype.hidden = function () { return this.element.style.display === 'none';};
Feature.prototype.show = function () {
    this.element.style.display = null;
    this.setElement(app.cursor.selected());
};

Feature.prototype.hide = function () { this.element.style.display = 'none';};
Feature.prototype.size = function (canvas) {
    var screenWidth = app.screen.width();
    var width = app.settings.hudWidth + 20;
    var left = app.settings.hudLeft + 150 - width;
    if (app.cursor.side('x') === 'right')
        left = screenWidth - (screenWidth - width) + 100;
    this.element.style.height = (app.settings.hudHeight + 20).toString() + 'px';
    this.element.style.left = left.toString() + 'px';
    this.element.style.width = width.toString() + 'px';
    canvas.setAttribute('class', 'hudCanvas');
    canvas.style.left = ((120 * (this.number - 1)) - 4).toString() + 'px';
};

Feature.prototype.addElement = function (element, type, attributes) {
    var c = app.dom.createCanvas('hud', element, {width:128, height:128});
    var canvas = app.dom.createElement('li', false, 'canvas');
    canvas.appendChild(c.canvas);

    var exists, list = app.dom.createList(element, element.type(), attributes ? attributes : app.settings.hoverInfo);
    list.appendChild(canvas);
    this.size(canvas);
    app.draw(c.context).hudCanvas(element.draw(), element.class());
    this.element.appendChild(list);
    return list;
};

Feature.prototype.set = function (element) {

    this.clear();

    var exists, e, show = ['name', 'canvas'];

    // display unit and any unit being transported by that unit
    if ((e = element.type()) === 'unit') 
        this.addElement(e, 'unit', show);
    else if (e === 'building') this.addElement(element, 'building', show);
    else this.addElement (element, 'terrain', show);

    if ((exists = document.getElementById('hud'))) 
        exists.parentNode.replaceChild(this.element, exists);
    else document.body.insertBefore(this.element, document.getElementById("before"));
};

module.exports = Feature;