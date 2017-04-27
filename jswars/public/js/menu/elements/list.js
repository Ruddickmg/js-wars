/* --------------------------------------------------------------------------------------*\
    
    List.js creates an interface for iterating over a list of dom elements

\* --------------------------------------------------------------------------------------*/

List = function (elements, init) {

    this.setElements(elements || []);
    
    this.setCurrent(init);
};

List.prototype.setIndex = function (index) {

    this.i = index && index > 0 ? index : 0;

    return this;
};

List.prototype.setCurrent = function (property) {

    return this.setIndex(isNaN(property) ? this.indexOf(property) : (property || 0));
};

List.prototype.reset = function () {

    return this.setIndex(0);
},

List.prototype.index = function () { 

    return this.i; 
},

List.prototype.wrap = function (number) {

    var elements = this.limited || this.elements(), length = elements.length;

    return !number ? 0 : number >= length ? number - length : number < 0 ? length + number : number;
};

List.prototype.move = function (index) { 

    return this.setIndex(this.wrap(index)); 
};

List.prototype.next = function () { 

    return this.move(this.i + 1); 
};

List.prototype.prev = function () { 

    return this.move(this.i - 1); 
};

List.prototype.indexOf = function (property) { 

    return this.find(function (element, index) { 

        if (property === element) {

            return index; 
        }
    });
};

List.prototype.add = function (element) {

    this.elements().push(element);
};

List.prototype.find = function (callback) {

    var elements = this.limited || this.elements();

    for (var i = 0, len = elements.length; i < len; i += 1) {

        if (callback(elements[i], i)) {

            return i;
        }
    }
};

List.prototype.elements = function () { 

    return this.li; 
};

List.prototype.setElements = function (elements) {

    this.li = elements; return this;
};

List.prototype.current = function () {

    var limit = this.limited, index = this.i;

    return limit ? limit[index < limit.length ? index : 0] : this.getElement(index);
};

List.prototype.getElement = function (index) {

    return this.elements()[index];
};

List.prototype.limit = function (callback) {

    var elements = this.elements();
    var current = this.current();
    var limited = elements.filter(callback);

    this.setIndex(limited.indexOf(current));

    this.limited = limited;

    return this;
};

List.prototype.describe = function (selected) {

    if (selected.description && selected.description()) {

        app.input.message(selected.description());
    }
};

List.prototype.getHorizontal = function () { 

    return this.hElement; 
};

List.prototype.getVerticle = function () { 

    return this.vElement; 
};

List.prototype.verticle = function (elements) { 

    return this.changeElement(elements, ["up", "down"]); 
};

List.prototype.horizontal = function (elements) { 

    return this.changeElement(elements, ["left","right"]);
};

List.prototype.changeElement = function (elements, keys) { 

    return app.key.pressed(keys[1]) ? elements.next() : elements.prev(); 
};

List.prototype.setHorizontal = function (e) {

    var selected = e.current();

    this.describe(selected);
    this.hElement = selected;

    return this;
};

List.prototype.setVerticle = function (e) {

    if (e.descriptions()) {

        this.describe(e);
    }

    this.vElement = e;

    return this;   
};

List.prototype.clear = function () {

    delete this.vElement;
    delete this.hElement;
};

module.exports = List;