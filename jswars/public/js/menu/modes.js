/* --------------------------------------------------------------------------------------*\
    
    Modes.js controls game mode selection 

\* --------------------------------------------------------------------------------------*/

ModesElement = require('../menu/elements/modesElement.js');
ScrollText = require('../effects/scrollText.js');
Menu = require('../menu/elements/menu.js');
List = require('../menu/elements/list.js');
Ulist = require('../menu/elements/ul.js');
Fader = require('../effects/fade.js');

Modes = Object.create(Menu);
Modes.positions = ['twoAbove','oneAbove','selected','oneBelow','twoBelow'];
Modes.messages = {
    logout:'select to log out of the game',
    game:'Create or continue a saved game',
    newgame:'Set up a new game',
    continuegame:'Resume a saved game',
    join:'Join a new or saved game',
    newjoin:'Find and join a new game',
    continuejoin:'Re-Join a saved game started at an earlier time',
    COdesign:'Customize the look of your CO',
    mapdesign:'Create your own custom maps',
    design:'Design maps or edit CO appearance',
    store:'Purchase maps, CO\'s, and other game goods' 
};
Modes.setList = function (elements) {this.l = elements;};
Modes.list = function () {return this.l;};
Modes.setElement =function (element) {this.e = element;};
Modes.element = function () {return this.e; };
Modes.setHeight = function (height) {this.h = height;};
Modes.height = function () {return this.h;};
Modes.properties = function () { return app.settings.selectModeMenu; };
Modes.message = function (id) {return this.messages[id];};
Modes.insert = function (screen) {document.body.insertBefore(screen, app.dom.insertLocation);};
Modes.remove = function () {
    app.dom.removeChildren(this.screen(), 'title');
    app.footer.remove();
    this.deactivate();
    this.fader.stop();
    return this;
};
Modes.init = function () {
    this.activate();
    this.display();
};
Modes.select = function () {
    if (!this.active()) this.init();
    var options = this.options();
    return options && options.active() ? this.selectOption() : this.selectMode();
};
Modes.options = function () {return this.mode().options;};
Modes.mode = function () {return this.list().current();};
Modes.option = function () {return this.options().current();};
Modes.setMode = function (name) { this.mode = name; };
Modes.selectMode = function () {

    if (app.key.pressed(['up','down'])) {
        this.mode().deselect();
        this.fader.changeElement(
            app.select.verticle(this.list()).current().select().background()
        ).setColor(this.mode().color.get());
        app.footer.scroll(this.message(this.mode().id()));
        this.rotate();
    }

    var options = this.options();

    if (!options && app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter()))
        return this.remove().mode().id();

    if (options && app.key.pressed(app.key.right()) && app.key.undo(app.key.right())) {
        options.activate();
        this.fader.changeElement(this.option());
        app.footer.scroll(this.message(this.option().id));
    }
};
Modes.selectOption = function () {
    if (app.key.pressed(['up','down'])) {
        this.fader.changeElement(
            app.select.verticle(this.options()).current());
        app.footer.scroll(this.message(this.option().id));
    }

    if (app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter()))
        return this.remove().option().id;
    
    if (app.key.pressed(app.key.left()) && app.key.undo(app.key.left())) {
        this.fader.changeElement(this.mode().background());
        app.footer.scroll(this.message(this.mode().id()));
        this.options().deactivate();
    }
};

// rotation stuff
Modes.getPosition = function (index) { return this.positions[this.list().wrap(index)] || 'hidden'; };
Modes.getElement = function (index) { 
    var list = this.list();
    return list.elements()[list.wrap(index)];
};
Modes.setPosition = function (element, index) {this.getElement(element).setPosition(this.getPosition(index));};
Modes.rotate = function () {
    for (var index = 0, ind = this.mode().index(), i = ind - 2; i <= ind + 2; i += 1)
        this.setPosition(i, index++);
};

// initialize screen
Modes.display = function () { 

    this.setHeight(app.settings.selectedModeHeight);
    var screen = this.createScreen('setupScreen');
    var properties = this.properties(), items = [];
    this.createTitle('Select*Mode');

    // create list of selectable modes
    var menu = document.createElement('ul');
    menu.setAttribute('id', 'selectModeMenu');

    // create footer for game info and chat
    var footer = app.footer.scrolling();

    for (var i = 0, len = properties.length; i < len; i += 1) {
        var item = new ModesElement(properties[i], i);
        menu.appendChild(item.element());
        items.push(item);
    }

    // add select menu to select mode screen
    screen.appendChild(menu);
    screen.appendChild(footer);
    this.setList(new List(items));
    this.setElement(new UList(menu));
    var mode = this.mode();
    this.rotate(this.list().indexOf(mode));
    this.insert(screen);
    this.fader = (new Fader(mode.select().background(), mode.color.get())).start();
    app.footer.scroll(this.message(this.mode().id()));
    return screen;
};
module.exports = Modes;