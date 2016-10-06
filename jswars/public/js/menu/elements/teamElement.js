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

    //this.id = function () {return 'player'+this.number+'Team'; };
    this.setNumber(number);
    this.setElement(app.dom.createList(this.p, this.id(), this.teams));
    this.setClass('team');
    this.setHeight(size * 4); // may be setTop
    this.setWidth(size);
    this.setDescription('Set alliances by selecting the same team.');
    app.touch(this.element()).element().scroll().doubleTap();
    app.click(this.element()).element().scroll().doubleClick();        
};
TeamElement.prototype = Object.create(Element);
TeamElement.prototype.constructor = TeamElement;
module.exports = TeamElement;