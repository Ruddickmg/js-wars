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
List.prototype.setCurrent = function (property) {return this.setIndex(property ? this.indexOf(property) : 0);};
List.prototype.reset = function () {return this.setIndex(0);},
List.prototype.index = function () { return this.i; },
List.prototype.wrap = function (number) {
    var elements = this.limited || this.elements(), length = elements.length;
    return !number ? 0 : number >= length ? number - length : number < 0 ? length + number : number;
};
List.prototype.move = function (index) { return this.setIndex(this.wrap(index)); };
List.prototype.next = function () { return this.move(this.i + 1); };
List.prototype.prev = function () { return this.move(this.i - 1); };
List.prototype.indexOf = function (property) { return this.find(function (element, index) { if (property === element) return index; }); };
List.prototype.add = function (element) {this.elements().push(element);};
List.prototype.find = function (callback) {
    var elements = this.limited || this.elements();
    for (var i = 0, len = elements.length; i < len; i += 1)
        if (callback(elements[i], i))
            return i;
};
List.prototype.elements = function () { return this.li; };
List.prototype.setElements = function (elements) {this.li = elements; return this;};
List.prototype.current = function () {
    var limit = this.limited, index = this.i;
    return limit ? limit[index < limit.length ? index : 0] : this.getElement(index);
};
List.prototype.getElement = function (index) {return this.elements()[index];};
List.prototype.limit = function (callback) {
    var elements = this.elements(), current = this.current();
    this.limited = elements.filter(callback);
    this.setIndex(this.limited.indexOf(current));
    return this;
};
module.exports = List;