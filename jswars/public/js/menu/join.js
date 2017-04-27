Menu = require("../menu/elements/menu.js");
BuildingsDisplay = require("../menu/elements/buildingsDisplay.js");
Ulist = require("../menu/elements/ul.js");
Select = require("../tools/selection.js");
transmit = require("../sockets/transmitter.js");

Join = Object.create(Menu);

Join.map = function (category) { 

    this.h = true;

    return this.chose("map", category); 
};

Join.game = function (category) { 

    this.h = false;

    return this.chose("game", category); 
};

Join.host = function () { 

    return this.h; 
};

Join.init = function (type, category) {

    this.activate();

    if (category) {

        this.category = category;
    }

    if (type) {

        this.type = type;
    }

    this.element = app.maps[this.category]().type(this.type).screen();

    this.display(type);
};

Join.display = function (type) {

    var screen = this.createScreen("setupScreen");

    this.createTitle("Select*"+type);

    var categories, maps = app.dom.createMenu(app.maps.all(), ["name"], this.element, function (list) {
        var element = list.childNodes[0];
        app.touch(element).mapOrGame().doubleTap();
        app.click(element).mapOrGame().doubleClick();
    });

    this.category = categories = app.dom.createMenu(app.settings.categories, "*", {
        section: "categorySelectScreen",
        div:"selectCategoryScreen"
    });
    
    this.maps = (new UList(maps.firstChild)).setScroll(0, 4).highlight();
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

Join.chose = function (type, category) {

    var map;

    if (!this.active()) {

        this.init(type, category);
    }

    if (app.key.pressed(["left","right"])) {

        this.selectCategory();
    }

    if (app.maps.updated()) {

        this.update(type);
    }

    if (app.key.pressed(["up","down"])) {

        this.buildings.set(Select.verticle(this.maps.deHighlight()).highlight().current());
    }

    if (app.key.pressed(app.key.enter()) && (map = app.maps.byId(this.maps.id())) || app.key.pressed(app.key.esc())) {
        
        app.key.undo();
        
        return map ? this.setup(map) : this.goBack();
    }
};

Join.selectCategory = function () {

    var categories = this.categories.hide();

    Select.horizontal(categories).show().prepHorizontal();

    app.maps.setCategory(categories.id());

    this.buildings.set(this.maps.current());
};

Join.update = function (type) {

    var elements = app.dom.createMenu(app.maps.all(), ["name"], this.element);
    var replace = document.getElementById(this.element.section);

    replace.parentNode.replaceChild(elements, replace);

    this.buildings.set(app.maps.info());

    this.maps.setElement(elements.firstChild);
    this.maps.highlight();
};

Join.setup = function (game) {

    app.map.set(game.map ? game.map : game);
    app.players.saved(game.saved);

    if (!this.host()) {

        game.players.push(app.user.raw());

        app.players.add(game.players);

        app.game.setSettings(game.settings);

        app.game.setName(game.name);

        app.game.setJoined(true);

        if (game.loaded) {

            transmit.join(game);
        
        } else if (game.saved) {

            app.game.create(game.name, game.id);
        }
    }

    this.remove();

    return game;
};

Join.goBack = function () {

    app.maps.clear();
    app.game.clear();
    app.game.removeMap();
    this.setBack(true);
    this.remove();
};

Join.remove = function () {

    this.deactivate();

    var select = document.getElementById(this.element.section);
    var buildings = document.getElementById("buildingsDisplay");
    var categories = document.getElementById("categorySelectScreen");

    var screen = this.screen();

    screen.removeChild(select);
    screen.removeChild(buildings);
    screen.removeChild(categories);

    app.key.undo();
};

module.exports = Join;