Menu = require('../objects/menu.js');
BuildingsDisplay = require('../objects/buildingsDisplay.js');
Ulist = require('../menu/elements/ul.js');
app.select = require('../tools/selection.js');

Join = Object.create(Menu);
Join.map = function () { 
    this.h = true;
    return this.chose('map'); 
};
Join.game = function () { 
    this.h = false;
    return this.chose('game'); 
};
Join.host = function () { return this.h; };
Join.update = function (type) {
    var elements = app.display.info(app.maps.all(), ['name'], this.element);
    var replace = document.getElementById(this.element.section);
    replace.parentNode.replaceChild(elements, replace);
    this.buildings.set(app.maps.info());
    this.maps.setElement(elements.firstChild);
    this.maps.highlight();
};
Join.chose = function (type) {
    var map;
    if (!this.active()) this.init(type);
    if (app.key.pressed(['left','right']) && app.key.undo()) this.selectCategory();
    if (app.maps.updated()) this.update(type);
    if (app.key.pressed(['up','down']) && app.key.undo()) {
        // needs testing
        var haha = app.select.verticle(this.maps.deHighlight()).highlight().current();
        console.log(haha);
        this.buildings.set(haha);
    }
    if (app.key.pressed(app.key.enter()) && (map = app.maps.byId(this.maps.id())) || app.key.pressed(app.key.esc())) {
        app.key.undo();
        this.remove();
        return map ? this.setup(map) : this.goBack();
    }
};
Join.selectCategory = function () {
    var categories = this.categories.hide();
    app.select.horizontal(categories).show().prepHorizontal();
    app.maps.setCategory(categories.id());
    this.buildings.set(this.maps.current());
};
Join.add = function (map) {
    app.game.name(map.name);
    map.players.push(app.user.raw());
    app.players.add(map.players);
    socket.emit('join', map);
};
Join.setup = function (map) {
    app.map.set(map.map ? map.map : map);
    if (!this.host()) this.add(map);
    return map;
};
Join.init = function (type) {
    this.activate();
    this.element = app.maps.type(type).screen();
    this.display(type);
};
Join.display = function (type) {

    var screen = this.createScreen('setupScreen');
    this.createTitle('Select*'+type);

    var categories, maps = app.display.info(app.maps.all(), ['name'], this.element, function (list) {
        var element = list.childNodes[0];
        app.touch(element).mapOrGame().doubleTap();
        app.click(element).mapOrGame().doubleClick();
    });

    this.category = categories = app.display.info(app.settings.categories, '*', {
        section: 'categorySelectScreen',
        div:'selectCategoryScreen'
    });
    
    this.maps = (new UList(maps.firstChild)).highlight();
    this.buildings = new BuildingsDisplay();
    this.categories = (new UList(categories.firstChild)).hideAll().show();

    // handle touch events for swiping through categories
    app.touch(categories).swipe();
    app.click(categories).swipe();

    // add elements to the screen
    screen.appendChild(this.buildings.element());
    screen.appendChild(maps);
    screen.appendChild(categories);
    
    app.maps.setCategory(this.categories.id());

    //return the modified screen element
    return screen;
};
Join.remove = function () {
    this.deactivate();
    var select = document.getElementById(this.element.section);
    var buildings = document.getElementById('buildingsDisplay');
    var categories = document.getElementById('categorySelectScreen');
    var screen = this.screen();
    screen.removeChild(select);
    screen.removeChild(buildings);
    screen.removeChild(categories);
    app.key.undo();
    app.maps.clear();
    app.undo.tempAndPrev();
    this.clear();
};
module.exports = Join;