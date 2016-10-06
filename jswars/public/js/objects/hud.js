Hud = function (elements) {
    this.element = document.createElement('div');
    this.element.setAttribute('id', 'hud');
    if (elements) this.setElements(elements);
};

Hud.prototype.clear = function () { while (this.element.firstChild) this.element.removeChild(this.element.firstChild); };
Hud.prototype.hidden = function () { return this.element.style.display === 'none';};
Hud.prototype.show = function () {
    this.element.style.display = null;
    this.setElements(app.cursor.hovered());
};
Hud.prototype.hide = function () { this.element.style.display = 'none'; };
Hud.prototype.resize = function (canvas) {
    var screenWidth = app.screen.width();
    var width = app.settings.hudWidth * this.number;
    var left = app.settings.hudLeft + 120 - width;
    if (app.cursor.side('x') === 'right' && app.cursor.side('y') === 'bottom')
        left = screenWidth - (screenWidth - app.settings.hudWidth) + 150;
    this.element.style.height = app.settings.hudHeight.toString() + 'px';
    this.element.style.left = left.toString() + 'px';
    this.element.style.width = width.toString() + 'px';
    canvas.setAttribute('class', 'hudCanvas');
    canvas.style.left = ((120 * (this.number - 1)) - 4).toString() + 'px';
};

Hud.prototype.addElement = function (element, type, attributes) {

    var c = app.dom.createCanvas('hud', element, {width:128, height:128});
    var canvas = app.dom.createElement('li', false, 'canvas');
    canvas.appendChild(c.canvas);

    var exists, list = app.dom.createList(element, element.type(), attributes ? attributes : app.settings.hoverInfo);
    list.appendChild(canvas);
    this.resize(canvas);
    app.draw(c.context).hudCanvas(element.draw(), element.class());
    this.element.appendChild(list);

    if(type === 'unit') 
        this.number += 1;
    return list;
};


Hud.prototype.setElements = function (elements) {

    this.clear();
    this.number = 1;

    var i, e, element, exists, loaded, unit, building, passanger;

    // display unit and any unit being transported by that unit
    if ((unit = elements.unit)) {
        if ((loaded = unit.loaded())){
            for (i = 0; i < loaded.length; i += 1)
                this.addElement(loaded[i], 'unit', ['canvas'])
                    .setAttribute('loaded', true);
        }
        this.addElement(unit, 'unit', ['ammo', 'showHealth', 'name', 'fuel', 'canvas']);
    }

    if (elements.building) this.addElement(elements.building, 'building');
    else this.addElement (elements.terrain, 'terrain');

    if ((exists = document.getElementById('hud'))) 
        exists.parentNode.replaceChild(this.element, exists);
    else document.body.insertBefore(this.element, document.getElementById("before"));
};

module.exports = Hud;