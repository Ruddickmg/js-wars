Element = require('../../menu/elements/element.js');
SettingElement = function (property, parameters) {
    var def, list = app.dom.createList(this.rule(property), property + 'Settings', this.allowed);
    this.setType(property);
    this.createOutline(list);
    this.createBackground();
    this.setElements(list.childNodes);
    this.setHeading(property);
    (def = this.settings[property].def) ? this.setDefault(def) : this.setIndex(0);
    app.touch(this.background()).element().scroll(list);
    app.click(this.background()).element().scroll(list);
    this.show();
};
SettingElement.prototype = Object.create(Element);
SettingElement.prototype.constructor = SettingElement;
SettingElement.prototype.setDefault = function (def) {
    this.setIndex(this.find (function (element) {return element.className === def.toLowerCase();}));
};
SettingElement.prototype.createBackground = function () {
    var background = document.createElement('div');
    background.setAttribute('id', this.type() + 'Background');
    background.setAttribute('class', 'rules');
    return this.b = background;
};
SettingElement.prototype.createOutline = function (list) {
    var outline = document.createElement('div');
    outline.setAttribute('id', this.type() + 'Container');
    outline.setAttribute('class', 'stable');
    outline.appendChild(this.createHeading());
    outline.appendChild(list);
    return this.setElement(outline);
};
SettingElement.prototype.createHeading = function () { 
    this.heading = document.createElement('h1'); 
    return this.heading;
};
SettingElement.prototype.setHeading = function (text) { return this.heading.innerHTML = text; };
SettingElement.prototype.indexOf = function (property) {
    var elements = this.elements();
    for (var i = 0, len = elements.length; i < len; i += 1)
        if (property === elements[i])
            return i;
};
SettingElement.prototype.setHeight = function (top) {
    this.h = top;
    this.background().style.top = top + 'px';
    this.outline().style.top = top + 'px';
};
SettingElement.prototype.setLeft = function (left) {
    this.l = left;
    this.background().style.left = left + 'px';
    this.outline().style.left = left + 'px';
};
SettingElement.prototype.setPosition = function (left, top) {
    this.setHeight(top);
    this.setLeft(left);
};
SettingElement.prototype.allowed = ['on', 'off', 'num', 'clear', 'rain', 'snow', 'random', 'a', 'b', 'c'];
SettingElement.prototype.addNumbers = function (object, inc, min, max) {
    for (var n = min; n <= max; n += inc)
        object[n] = n;
    return object;
};
SettingElement.prototype.outline = function () {return this.e;}; 
SettingElement.prototype.background = function () {return this.b;}
SettingElement.prototype.rule = function (property) {
    var rule = this.settings[property];
    rule.hide = true;
    rule.index = true;
    if (rule.description) this.setDescription(rule.description);
    return rule.inc ? this.addNumbers(rule, rule.inc, rule.min, rule.max): rule;
};
SettingElement.prototype.rules = app.settings.settingsDisplayElement;
SettingElement.prototype.settings = {
    fog:{
        description:'Set ON to limit vision with fog of war.',
        on:'ON',
        off:'OFF'
    },
    weather:{
        description:'RANDOM causes climate to change.',
        clear:'Clear',
        rain:'Rain',
        snow:'Snow',
        random:'Random'
    },
    funds:{
        description:'Set funds recieved per allied base.',
        inc:500,
        min:1000,
        max:9500
    },
    turn:{
        description:'Set number of days to battle.',
        off:'OFF',
        def:'OFF',
        inc:1,
        min:5,
        max:99
    },
    capt:{
        description:'Set number of properties needed to win.',
        off:'OFF',
        def:'OFF',
        inc:1,
        min:7,
        max:45
    },
    power:{
        description:'Select ON to enamble CO powers.',
        on:'ON',
        off:'OFF'
    },
    visuals:{
        description:[
            'No animation.',
            'Battle and capture animation.',
            'Battle animation only.',
            'Battle animation for players only.'
        ],
        off:'OFF',
        a:'Type A',
        b:'Type B',
        c:'Type C'
    }
};
module.exports = SettingElement;