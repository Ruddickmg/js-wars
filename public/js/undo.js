/* ---------------------------------------------------------------------------------------------------------*\
    
    app.undo handles the cleanup and disposal of elements that are no longer needed or need to be removed
\* ---------------------------------------------------------------------------------------------------------*/

app.undo = function () {

    // show undoes a hide of an element
    var show = function (hiddenElement) {

        // get hidden element
        var hidden = document.getElementById(hiddenElement);

        // show element
        if (hidden) hidden.style.display = '';
    };

    return {

        // remove a pressed key from the keys array
        keyPress: function (key) {
            if (app.keys.splice(key, 1)) return true;
            return false;
        },

        // undo the selection of map elements
        selectElement: function () {
            if (app.temp.range) app.temp.range.splice(0, app.temp.range.length);
            app.temp.selectActive = false;
            if (app.temp.selectedBuilding) delete app.temp.selectedBuilding;
        },

        hudHilight:function(){
            app.temp.selectionIndex = 1;
            if(app.temp.prevIndex) delete app.temp.prevIndex;
            if (app.temp.optionsActive) {
                show('coStatusHud');
                delete app.temp.optionsActive;
            }
        },

        selectUnit:function(){
            if (app.temp.selectedUnit) {
                delete app.temp.selectedUnit;
                window.requestAnimationFrame(app.animateUnit);
            }
        },

        actionsSelect: function (){
            if(app.temp.actionsActive){
                app.actions.unset();
                delete app.settings.target;
                delete app.temp.prevActionIndex;
                delete app.temp.attackableArray;
                this.display('actionHud');
                this.display('damageDisplay');
                app.temp.cursorMoved = true;
                app.settings.hideCursor = false;
                app.temp.actionsActive = false;
                window.requestAnimationFrame(app.animateCursor);
            }
        },

        effect: function (effect) {
            if (app.effect[effect]) {
                app.effect[effect].splice(0, app.effect[effect].length);
                window.requestAnimationFrame(app.animateEffects);
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
            for (r = 0; r < removeArray.length; r += 1) {
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
            this.keyPress(app.settings.keyMap.select);
            this.buildUnitScreen();
            this.effect('highlight').effect('path');
            app.temp.cursorMoved = true; // refreshes the hud system to detect new unit on map
            return this;
        }
    };
}();