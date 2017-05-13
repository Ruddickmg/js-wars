unitController = require("../controller/unit.js");
app.target = require("../../browser/controller/target.js");
app.cursor = require("../../browser/controller/cursorController.js");
app.coStatus = require("../../browser/huds/coStatusHud.js");
app.hud = require("../../browser/huds/hud.js");
app.dom = require("../../browser/tools/dom.js");

module.exports = {
    attack(options, unit) {

        app.hud.show();

        unitController.setTargets(options.attack, unit);

        app.target.attack();
    },
    wait() {

        app.dom.remove('actionHud');
        app.screen.reset();
        app.hud.show();
        app.cursor.show();
        app.coStatus.show();
        app.target.deactivate();
        app.hud.setElements(app.cursor.hovered());
    },
    drop(options, unit, index) {

        if (isNaN(index)) {

            throw new Error("Invalid property \"index\" passed to \"drop\", index must be a number.", "user/actionsController.js");
        }

        app.target.drop();

        return unitController.unload(options.drop[index], unit);
    },
    capture(options, unit) {

        return unitController.capture(options.capture, unit);
    },
    join(options, unit) {

        return unitController.join(options.join, unit);
    },
    load(options, unit) {

        return unitController.load(options.load, unit);
    },
};
