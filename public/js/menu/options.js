/* ----------------------------------------------------------------------------------------------------------*\
    
    app.options handles the in game options selection, end turn, save etc.
    
\* ----------------------------------------------------------------------------------------------------------*/
app = require('../settings/app.js');
app.game = require('../game/game.js');
app.players = require('../controller/players.js');
socket = require('../tools/sockets.js');

module.exports = function () {

    var active = false;

    return {
        unit: function () {
            alert('unit!');
        },

        intel: function () {
            alert('intel');
        },

        options: function () {
            alert('options');
        },

        save: function () {
            alert('save');
        },

        // end turn
        end: function () {
            var player = app.players.current();
            player.endTurn();
            if(app.user.player() === player){
                app.undo.all();
                app.animate(['cursor']);
                socket.emit('endTurn', player.id());
            }
            return this;
        },
        display: function () {
            app.key.undo(app.key.esc());
            active = true;
            app.display.info(app.settings.options, app.settings.optionsDisplay, 
                { section: 'optionsMenu', div: 'optionSelect' }, 'optionSelectionIndex', true);
            return this;
        },
        evaluate: function(){ 
            if((type = app.display.select('optionSelectionIndex', 'optionSelect', app.effect.highlightListItem, 'ul').id))
                return app.options[type]();
        },
        active:function(){return active;},
        activate:function(){active = true;},
        deactivate:function(){active = false;}
    };
}();