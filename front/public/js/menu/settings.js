Menu = require('../menu/elements/menu.js');
Arrows = require('../objects/arrows.js');
Teams = require('../menu/teams.js');
Select = require('../tools/selection.js');
SettingElement = require('../menu/elements/settingElement.js');
DefaultSettings = require('../settings/default.js');
Sweller = require('../effects/swell.js');
transmit = require("../sockets/transmitter.js");

Settings = Object.create(Menu);
Settings.parameters = new DefaultSettings();
Settings.swelling = false;
Settings.properties = [];
Settings.elements = [];

Settings.rules = {

    // optional parameter defines what display type will be displayed when revealing an element
    display:'inline-block',

    // type defines what page will be loaded
    type:'rules',

    // name of the element that is parent to the list
    element:'Settings',

    // name of the index, comes after the property name: property + index
    index:'SettingsIndex',

    // holds the name of the tag being retrieved as a value from the selected element
    attribute:'class',

    // holds the name of the element used for chat and description etc, displayed text
    text:'descriptions',

    // holds the object that defines all that will be scrolled through
    properties: app.settings.settingsDisplayElement
};

Settings.init = function () {

    var scope = this;
    this.now = new Date();
    this.element = this.display();
    this.activate();

    if (this.arrows) {

            app.input.back() ? 
                this.fall(function () {scope.sweller.start();}) : 
                this.rise(function () {scope.sweller.start();});
    } else {

        this.sweller.start();
    }
    
    Select.setHorizontal(this.elements);
};

Settings.selected = function () { 

    return this.elements.current(); 
};

Settings.select = function (selected) {

    if (!this.active()) {

        this.init();
    }

    if (!app.input.active() || app.input.back()) {

        if (app.key.pressed(['left','right'])){

            selected = Select.setHorizontal(Select.horizontal(this.elements)).getHorizontal();
            
            this.sweller.stop().setElement(selected.background()).start();
            
            if (this.arrows) {

                this.arrows.setPosition(selected);
            }
        }

        if(app.key.pressed(['up','down']) && !app.game.started()) {

            selected = Select.setVerticle(Select.verticle(Select.getHorizontal().hide()))
                .getHorizontal().show();
        }
        
        if (selected && !app.game.started()) {

            this.set(selected.type(), selected.value());
        }
    }
    
    if (!app.game.started()) {

        if (app.key.pressed(app.key.enter()) || app.input.active()) {
            
            return this.input();
        
        } else return this.exit(this, function (scope) { 

            scope.m = false;
            scope.goBack();
            scope.remove();
        });
    }
};

Settings.set = function (setting, value) { 

    return this.parameters[setting] = value; 
};

Settings.input = function () {

    if (!app.input.active() || app.input.back()) {
        app.input.undoBack();
        app.input.name(this.screen());
        if (this.arrows) this.arrows.hide();
        app.key.undo();
    }
    
    if (app.key.pressed(app.key.enter())) {

        var weather, name = app.input.value(), scope = this;

        if (name) {

            app.players.add(app.user.raw());
            app.game.setSettings(this.parameters);
            app.game.create(name);

            if ((weather = this.parameters.weather)) {

                app.background.set(weather);
                transmit.background(weather);
            }

            this.remove();

            this.rise(function(){scope.element.parentNode.removeChild(scope.element);}, 5);

            return this.parameters;
        }

    } else if(app.key.pressed(app.key.esc())) {

        app.key.undo(app.key.esc());
        app.input.clear();
        this.arrows.show();
    }
};

Settings.remove = function () {

    app.footer.remove();

    if (this.arrows) {

        this.arrows.remove();
    }

    this.deactivate();
    this.swelling = false;

    delete this.elements;

    Select.clear();

    if (app.key.pressed(app.key.esc())) {

        this.screen().removeChild(this.element);
    }

    app.key.undo();
};

Settings.display = function () {
    
    var screen = this.createScreen('setupScreen');
    var keys = Object.keys(app.settings.settingsDisplayElement);
    var offScreen = Number(app.offScreen);
    var elements = [];

    this.createTitle('rules');

    var element = document.createElement('section');

    element.setAttribute('id', 'settings');

    var width = screen.offsetWidth;
    var height = screen.offsetHeight;
    var left = width * .05;
    var middle = height * .5;
    var top = this.arrows ? (app.input.back() ? middle - offScreen : middle + offScreen) : middle;

    var footer = app.footer.display(screen, this.rules);
    var nameInput = app.input.form('name', footer, 'Enter name here.');

    footer.appendChild(nameInput);

    screen.appendChild(footer.parentNode);

    for (var setting, i = 0, len = keys.length; i < len; i += 1) {

        setting = new SettingElement(keys[i], this.parameters);
        setting.setPosition(left, top);

        left += .13 * width;
        top -= .06 * height;

        element.appendChild(setting.outline());
        element.appendChild(setting.background());
        elements.push(setting);
    }

    this.parameters = app.game.settings() || new DefaultSettings();
    this.sweller = new Sweller(elements[0].background(), 50, 100);
    this.elements = new List(elements);

    screen.appendChild(element);

    if (this.arrows) {

        this.arrows.insert(element).setSpace(40)
            .setPosition(this.elements.current()).fade();
    }

    return element;
};

module.exports = Settings;