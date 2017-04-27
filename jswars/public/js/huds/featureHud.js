terrainController = require("../controller/terrain.js");

Feature = function (selected) {

    this.element = document.createElement("div");
    this.element.setAttribute("id", "hud");
    this.element.style.backgroundColor = "yellow";

    if (selected) {

        this.set(selected);
    }
};

Feature.prototype.clear = function () { 

    while (this.element.firstChild) {

        this.element.removeChild(this.element.firstChild); 
    }
};

Feature.prototype.hidden = function () { 

    return this.element.style.display === "none";
};

Feature.prototype.show = function () {

    this.element.style.display = null;

    this.setElement(app.cursor.selected());
};

Feature.prototype.hide = function () { 

    this.element.style.display = "none";
};

Feature.prototype.size = function (canvas) {

    var screenWidth = app.screen.width();
    var width = app.settings.hudWidth + 20;
    var left = app.settings.hudLeft + 150 - width;

    if (app.cursor.side("x") === "right") {

        left = screenWidth - (screenWidth - width) + 100;
    }

    this.element.style.height = (app.settings.hudHeight + 20).toString() + "px";
    this.element.style.left = left.toString() + "px";
    this.element.style.width = width.toString() + "px";

    canvas.setAttribute("class", "hudCanvas");
    canvas.style.left = ((120 * (this.number - 1)) - 4).toString() + "px";
};

Feature.prototype.addElement = function (element, type, attributes) {

    var feature = app.dom.createCanvas("hud", element, {width:128, height:128});
    var exists, canvas = app.dom.createElement("li", false, "canvas");
    var type = terrain.type(element);

    canvas.appendChild(feature.canvas);

    var list = app.dom.createList(element, type, attributes ? attributes : app.settings.hoverInfo);

    list.appendChild(canvas);

    this.size(canvas);

    app.draw(feature.context).hudCanvas(terrain.draw(element), type);

    this.element.appendChild(list);

    return list;
};

Feature.prototype.set = function (element) {

    this.clear();

    var exists = document.getElementById("hud");

    // display unit and any unit being transported by that unit
    this.addElement(element, terrainController.type(element), ["name", "canvas"]);

    if (exists) {

        exists.parentNode.replaceChild(this.element, exists);
    
    } else {

        document.body.insertBefore(this.element, document.getElementById("before"));
    }
};

module.exports = Feature;