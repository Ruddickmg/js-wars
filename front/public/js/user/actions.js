/* ------------------------------------------------------------------------------------------------------*\
   
    user/actions.js controls action execution
   
\* ------------------------------------------------------------------------------------------------------*/

unitController = require("../controller/unit.js");
app.target = require("../controller/target.js");
app.cursor = require("../controller/cursor.js");
app.coStatus = require("../huds/coStatusHud.js");
app.hud = require("../huds/hud.js");
app.dom = require("../tools/dom.js");

module.exports = {

    /*
        attack: performs an attack from the passed in unit on the unit contained 
        in the attack property of options 

        @unit = Object, unit
        @options = Object, {
    
            capture: Object (building) || Boolean,
            attack: Object (unit) || Boolean,
            join: Object (unit) || Boolean,
            load: Object (unit) || Boolean,
            drop: Integer || Boolean,
            wait: Bool,
        }
    */

    attack: function (options, unit) {

        app.hud.show();

        unitController.setTargets(options.attack, unit);

        app.target.attack();
    },

    /*
        
        wait: refreshes the screen back to a state of play, does nothing and leaves unit as is

    */

    wait: function () {

        app.dom.remove('actionHud');
        app.screen.reset();
        app.hud.show();
        app.cursor.show();
        app.coStatus.show();
        app.target.deactivate();
        app.hud.setElements(app.cursor.hovered());    
    },

    /*
        drop: drops a unit from the loaded property of the passed in unit at the supplied index

        @index = Integer
        @unit = Object, unit
        @options = Object, {
    
            capture: Object (building) || Boolean,
            attack: Object (unit) || Boolean,
            join: Object (unit) || Boolean,
            load: Object (unit) || Boolean,
            drop: Integer || Boolean,
            wait: Bool,
        }
    */

    drop: function (options, unit, index) {

        if (isNaN(index)) {

            throw new Error("Invalid property \"index\" passed to \"drop\", index must be a number.", "user/actions.js");
        }

        app.target.drop();

        return unitController.unload(options.drop[index], unit);
    },

    /*
        capture: transfers ownership of a building to the passed in unit

        @unit = Object, unit
        @options = Object, {
    
            capture: Object (building) || Boolean,
            attack: Object (unit) || Boolean,
            join: Object (unit) || Boolean,
            load: Object (unit) || Boolean,
            drop: Integer || Boolean,
            wait: Bool,
        }
    */

    capture: function (options, unit) {

        return unitController.capture(options.capture, unit);
    },

    /*
        join: joins a selected unit with a passed in unit

        @unit = Object, unit
        @options = Object, {
    
            capture: Object (building) || Boolean,
            attack: Object (unit) || Boolean,
            join: Object (unit) || Boolean,
            load: Object (unit) || Boolean,
            drop: Integer || Boolean,
            wait: Bool,
        }
    */

    join: function (options, unit) {

        return unitController.join(options.join, unit);
    },

    /*
        load: loads a selected unit into the passed in unit

        @unit = Object, unit
        @options = Object, {
    
            capture: Object (building) || Boolean,
            attack: Object (unit) || Boolean,
            join: Object (unit) || Boolean,
            load: Object (unit) || Boolean,
            drop: Integer || Boolean,
            wait: Bool,
        }
    */

    load: function (options, unit) {

        return unitController.load(options.load, unit);
    }
};