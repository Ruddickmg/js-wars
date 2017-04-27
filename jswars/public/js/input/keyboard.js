app.options = require('../menu/options/optionsMenu.js');
app.game = require('../controller/game.js');

module.exports = function () {

    var pressed = [], up = [],

    keys = {
        esc: 27,
        enter: 13,
        copy: 67,
        up: 38,
        down: 40,
        left: 37,
        right: 39,
        range: 82,
        map: 77,
        info: 73
    },

    key = function (k) { return isNaN(k) ? keys[k] : k; },
    undo = function (array) { return array.splice(0, array.length); };
    press = function (k) { 
        //app.game.update();
        return pressing(k) ? true : pressed.push(key(k));
    },
    pressing = function (k) { return k ? pressed.indexOf(key(k)) > -1 : pressed.length; };

    window.addEventListener("keydown", function (e) {
        if(!app.game.started() || app.user.turn() || e.keyCode === app.key.esc() || app.options.active() || app.confirm.active())
            press(e.keyCode);
    }, false);

    window.addEventListener("keyup", function (e) { 
        up.push(e.keyCode);
        undo(pressed);
        //app.game.update();
    }, false);

    return {
        press:press,
        pressed:function (k) {
            if (k && k.isArray()) {
                var i = k.length;
                while (i--)
                    if (pressing([k[i]]))
                        return true;
            } else return pressing(k);
        },
        keyUp: function (k) { return k ? up.indexOf(key(k)) > -1 : up.length; },
        undo: function (k) { return k ? pressed.splice(pressed.indexOf(key(k)), 1) : undo(pressed); },
        undoKeyUp: function (k) {return k ? up.splice(up.indexOf(key(k)), 1) : undo(up); },
        set: function (key, newKey) { keys[key] = newKey; },
        esc: function(){ return keys.esc; },
        enter: function(){ return keys.enter; },
        up: function(){ return keys.up; },
        down: function(){ return keys.down; },
        left: function(){ return keys.left; },
        right: function(){ return keys.right; },
        range: function(){ return keys.range; },
        map: function(){ return keys.map; },
        info: function(){ return keys.info; },
        copy: function(){ return keys.copy; }
    }
}();