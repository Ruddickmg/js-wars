/* --------------------------------------------------------------------------------------*\
    
    Menu.js is a generic object that contains methods common to all menus

\* --------------------------------------------------------------------------------------*/

app = require('../../settings/app.js');

module.exports = {
    // for co border color
    color: app.settings.colors,
    playerElement: [],
    playerColor: app.settings.playerColor,
    time: new Date(),
    bck: false,
    withArrows: function () { 
        if (!this.arrows && !app.players.saved()) 
            this.arrows = new Arrows(); 
        return this;
    },
    active: function () { return this.a; },
    activate: function () { this.a = true; },
    deactivate: function () { this.a = false; },
    goBack: function () { this.setBack(true); },
    back: function () {return this.bck ? this.setBack(false) : false;},
    setBack: function (bool) {
        this.bck = bool;
        return this;
    },
    exit: function (value, callback, exit) {
        if (app.key.pressed(app.key.enter()) || app.key.pressed(app.key.esc()) || this.boot) {
            if (callback) callback(value);
            if(app.key.pressed(app.key.esc()) || this.boot){
                app.key.undo();
                if(this.boot) this.boot = false;
                return exit ? exit : 'back';
            }
            app.key.undo();
        }
        return false;
    },
    moveElements: function (direction, callback, speed, index) {

        var elements = this.element.childNodes;
        var length = elements.length;
        var scope = this;
        var delay = speed || 5;
        var timeout = delay * 100;
        this.m = true;

        if(!index) index = 0;
        if (length > index) {
            var offScreen = Number(app.offScreen);
            setTimeout(function() { 
                var elem = elements[index];
                elem.style.transition = 'top .' + delay + 's ease';
                setTimeout(function(){elem.style.transition = null}, timeout);
                var position = Number(elem.style.top.replace('px',''));
                if (position) {
                    if (direction === 'up') target = position - offScreen;
                    else if (direction === 'down') target = position + offScreen;
                    else return false;
                    elem.style.top = target + 'px';
                }
                scope.moveElements(direction, callback, speed, index + 1);
            }, 30);
        } else { 
            this.m = false;
            if (callback) setTimeout(callback, 80);
        }
    },
    moving: function () {return this.m; },
    screen: function () {return this._s;},
    setScreen: function (s) {this._s = s;},
    createTitle: function (title) {
        var element = document.createElement('h1');
        element.setAttribute('id', 'title');
        element.innerHTML = title;
        this.screen().appendChild(element);
        return element;
    },
    percentage: function (height) {return Number(height.replace('%','')) / 100;},
    screenHeight: function () {return this.screen().offsetHeight;},
    removeScreen: function () {document.body.removeChild(this.screen());},
    createScreen: function (name) {
        var existing = document.getElementById(name);
        var screen = document.createElement('article');
        screen.setAttribute('id', name);
        existing ? document.body.replaceChild(screen, existing) : document.body.appendChild(screen);
        this.setScreen(screen);
        app.touch(screen).swipeScreen();
        app.click(screen).swipeScreen();
        return screen;
    },
    resetDefaults: function (type) {

        var element, previous, name, child, children, 
        childrenLength, length = app.players.length();

        for (var c, n = 1; n <= length; n += 1) {

            element = document.getElementById('player' + n + type);
            previous = app.players.number(n).property(type.toLowerCase());

            if ((name = previous.name ? previous.name : previous)) {

                children = element.childNodes;
                childrenLength = children.length;

                for (c = 0; c < childrenLength; c += 1)
                    if ((child = children[c]).getAttribute('class').toLowerCase() === name.toLowerCase())
                        child.setAttribute('default',true);
                    else if (child.getAttribute('default'))
                        child.removeAttribute('default');
            }
        }
    },
    changeTitle: function (name) {this.screen().firstChild.innerHTML = name;},
    rise: function (callback, speed) {this.moveElements('up', callback, speed);},
    fall: function (callback, speed) { this.moveElements('down', callback, speed);}
};