/* --------------------------------------------------------------------------------------*\
    
    TeamElement.js defines the element that is used in team selection

\* --------------------------------------------------------------------------------------*/

Element = require('../../menu/elements/element.js');
TeamElement = function (number, size) {

    this.teams = ['a','b','c','d', 'e', 'f', 'g', 'h'].slice(0, app.map.players());
    var properties = {
        ind: true,
        hide: true
    };
    for (var t, i = 0; i < this.teams.length; i += 1)
        properties[(t = this.teams[i])] = t.toUpperCase() + 'Team';

    this.setNumber(number);
    this.setType('team');
    this.setElement(app.dom.createList(properties, this.id(), this.teams));
    this.setClass('team');
    this.setTop(size * 4); // may be setTop
    this.setWidth(size);
    this.setCurrent(number - 1);
    this.setDescription('Set alliances by selecting the same team.');
    app.touch(this.element()).element().scroll().doubleTap();
    app.click(this.element()).element().scroll().doubleClick();        
};
TeamElement.prototype = Object.create(Element);
TeamElement.prototype.getStyle = function (parameter) {
    var parent = Number(this.element().parentNode.style[parameter].replace('px',''));
    var element = Number(this.element().style[parameter].replace('px',''));
    if (parameter === 'top') return parent + element + 10;
    else return parameter === 'left' ? parent + element : element;
}
TeamElement.prototype.constructor = TeamElement;
module.exports = TeamElement;