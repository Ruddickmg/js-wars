/* ---------------------------------------------------------------------------------------------------------*\
    
    handles the cleanup and disposal of elements that are no longer needed or need to be removed

\* ---------------------------------------------------------------------------------------------------------*/
app = require('../settings/app.js');
app.game = require('../menu/game.js');
app.actions = require('../game/actions.js');
app.options = require('../game/options.js');
app.settings = require('../settings/game.js');
app.animate = require('../game/animate.js');
app.effect = require('../game/effects.js');
app.display = require('../tools/display.js');

module.exports = function () {

    // show undoes a hide of an element
    var show = function (hiddenElement) {

        // get hidden element
        var hidden = document.getElementById(hiddenElement);

        // show element
        if (hidden) hidden.style.display = '';
    };

    return {

        // remove a pressed key from the keys array
        keyPress: function (key) {return app.keys.splice(key, 1);},
        keys: function () {if(app.keys.length)app.keys.splice(0,app.keys.length);},

        // undo the selection of map elements
        selectElement: function () {
            var range = app.select.range();
            if (range) range.splice(0, range.length);
            app.select.deselect();
            if (app.select.building()) app.select.deselect();
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
            if (app.select.unit()) {
                app.select.deselect();
                window.requestAnimationFrame(app.animate('unit'));
            }
        },

        actionsSelect: function (){
            if(app.actions.active()){
                app.actions.unset();
                app.actions.clear();
                delete app.settings.target;
                this.display('actionHud');
                this.display('damageDisplay');
                app.def.cursorMoved = true;
                app.settings.hideCursor = false;
                app.actions.deactivate();
                window.requestAnimationFrame(app.animate('cursor'));
            }
        },

        effect: function (effect) {
            if (app.effect[effect]) {
                app.effect[effect].splice(0, app.effect[effect].length);
                window.requestAnimationFrame(app.animate('effects'));
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
            this.keyPress(app.key.enter);
            this.buildUnitScreen();
            this.effect('highlight').effect('path');
            app.def.cursorMoved = true; // refreshes the hud system to detect new unit on map
            return this;
        },

        tempAndPrev: function () {
            app.display.clear();
            app.actions.clear();
            //app.move.clear();
            app.effect.clear();
            app.temp = {};
            app.prev = {};
        }
    };
}();