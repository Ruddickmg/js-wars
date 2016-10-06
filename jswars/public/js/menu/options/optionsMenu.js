/* ----------------------------------------------------------------------------------------------------------*\
    
    app.options handles the in game options selection, end turn, save etc.
    
\* ----------------------------------------------------------------------------------------------------------*/

app = require('../../settings/app.js');
app.game = require('../../game/game.js');
app.players = require('../../controller/players.js');
app.key = require('../../tools/keyboard.js');
socket = require('../../tools/sockets.js');
app.intel = require('./intel.js');
app.options = require('./options.js');
app.save = require('./save.js');

// Element = require('../elements/element.js');

// OptionsMenu = Object.create(Element);
// OptionsMenu.co = function () { app.undo.all(); };
// OptionsMenu.intel = function () { app.intel.display(); };
// OptionsMenu.options = function () { app.options.display(); };
// OptionsMenu.save = function () { 
//     app.undo.all();
//     app.save.display(); 
// };

// // end turn
// OptionsMenu.end = function () {
//     var player = app.players.current();
//     player.endTurn();
//     if (app.user.player() === player) {
//         app.undo.all();
//         app.animate(['cursor']);
//         socket.emit('endTurn', player.id());
//     }
//     return this;
// };
// OptionsMenu.display = function () {
//     app.key.undo(app.key.esc());
//     active = true;
//     app.display.info(app.settings.optionsMenu, app.settings.optionsMenuDisplay, { section: 'optionsMenu', div: 'optionSelect' });
//     return this;
// };
// OptionsMenu.evaluate = function() { 
//     if (app.key.pressed(['up', 'down'])) Select.verticle(this.list());
//     if (app.key.pressed(app.key.enter())) {
//         this.deactivate();
//         app.optionsMenu[Select.getVerticle()]();
//     }
// };
// OptionsMenu.coordinate = function (options) {
//     for (var i = 0; i < options.length; i += 1){
//         if (app[options[i]].active()) {
//             app[options[i]].evaluate();
//             return true;
//         }
//     }
// };
// OptionsMenu.active = function()   { return active; };
// OptionsMenu.activate = function() { active = true; };
// OptionsMenu.deactivate = function(all){
//     if (all) for (var i = 0; i < all.length; i += 1)
//         app[all[i]].deactivate();
//     active = false;
// };
// OptionsMenu.remove =function(){
//     var menu = this.screen();
//     menu.parentNode.removeChild(menu);
//     app.display.clear();
// };
// OptionsMenu.screen = function () { return document.getElementById('optionsMenu'); };
// OptionsMenu.list = function () { return document.getElementById('optionSelect'); };


module.exports = function () {

    var active = false;

    return {

        co: function () { app.undo.all(); },
        intel: function () { app.intel.display(); },
        options: function () { app.options.display(); },
        save: function () { 
            app.undo.all();
            app.save.display(); 
        },

        // end turn
        end: function () {
            var player = app.players.current();
            player.endTurn();
            if (app.user.player() === player) {
                app.undo.all();
                app.animate(['cursor']);
                socket.emit('endTurn', player.id());
            }
            return this;
        },
        display: function () {
            app.key.undo(app.key.esc());
            active = true;
            app.display.info(app.settings.optionsMenu, app.settings.optionsMenuDisplay, { section: 'optionsMenu', div: 'optionSelect' });
            return this;
        },
        evaluate: function() { 
            if (app.key.pressed(['up', 'down'])) Select.verticle(this.list());
            if (app.key.pressed(app.key.enter())) {
                this.deactivate();
                app.optionsMenu[Select.getVerticle()]();
            }
        },
        coordinate: function (options) {
            for (var i = 0; i < options.length; i += 1){
                if (app[options[i]].active()) {
                    app[options[i]].evaluate();
                    return true;
                }
            }
        },
        active:function()   { return active; },
        activate:function() { active = true; },
        deactivate:function(all){
            if (all) for (var i = 0; i < all.length; i += 1)
                app[all[i]].deactivate();
            active = false;
        },

        remove:function(){
            var menu = this.screen();
            menu.parentNode.removeChild(menu);
            app.display.clear();
        },
        screen: function () { return document.getElementById('optionsMenu'); },
        list: function () { return document.getElementById('optionSelect'); }
    };
}();