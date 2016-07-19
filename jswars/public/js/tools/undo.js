/* ---------------------------------------------------------------------------------------------------------*\
    
    handles the cleanup and disposal of elements that are no longer needed or need to be removed

\* ---------------------------------------------------------------------------------------------------------*/
app = require('../settings/app.js');
app.game = require('../game/game.js');
app.options = require('../menu/options.js');
app.settings = require('../settings/game.js');
app.animate = require('../game/animate.js');
app.effect = require('../game/effects.js');
app.display = require('../tools/display.js');
app.key = require('../tools/keyboard.js');
app.cursor = require('../controller/cursor.js');

module.exports = function () {

    // show undoes a hide of an element
    var show = function (hiddenElement) {

        // get hidden element
        var hidden = document.getElementById(hiddenElement);

        // show element
        if (hidden) hidden.style.display = '';
    };

    return {

        // undo the selection of map elements
        selectElement: function () {
            app.cursor.deselect();
        },

        hudHilight:function(){
            app.display.reset();
            if(app.display.index()) app.display.resetPreviousIndex();
            if (app.options.active()) {
                show('coStatusHud');
                app.options.deactivate();
            }
        },

        selectUnit:function(){
            if (app.cursor.selected() && app.cursor.selected().type() === 'unit') {
                app.cursor.deselect();
                app.animate('unit');
            }
        },

        actionsSelect: function (){
            this.display('actionHud');
            this.display('damageDisplay');
            app.animate('cursor');
        },

        effect: function (effect) {
            if (app.effect.undo[effect]) {
                app.effect.undo[effect]();
                app.animate('effects');
            }
            return this;
        },

        display: function (element) {
            var remove = document.getElementById(element);
            if (remove) remove.parentNode.removeChild(remove);
            return this;
        },

        buildUnitScreen: function () {
            var removeArray = ['buildUnitScreen', 'unitInfoScreen', 'optionsMenu'];
            for (var r = 0; r < removeArray.length; r += 1) {
                var remove = document.getElementById(removeArray[r]);
                if (remove) remove.parentNode.removeChild(remove);
            }
            return this;
        },

        all: function () {
            this.selectUnit();
            this.selectElement();
            this.actionsSelect();
            this.hudHilight();
            app.key.undo(app.key.enter());
            this.buildUnitScreen();
            this.effect('highlight').effect('path');
            app.cursor.show();
            return this;
        },

        tempAndPrev: function () {
            app.display.clear();
            app.cursor.clear();
            app.effect.clear();
            app.temp = {};
            app.prev = {};
        }
    };
}();