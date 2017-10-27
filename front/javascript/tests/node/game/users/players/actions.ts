unitController = require("../controller/unit");
app.target = require("../../browser/controller/target");
app.cursor = require("../../browser/controller/cursorController");
app.coStatus = require("../../browser/huds/coStatusHud");
app.hud = require("../../browser/huds/mapInfoHud");
app.dom = require("../../browser/dom/dom");

module.exports = {
  attack(options, unit) {

    app.hud.show();

    unitController.setTargets(options.attack, unit);

    app.target.attack();
  },
  wait() {

    app.dom.removePlayer('actionHud');
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
  load({load}, unit) {

    return unitController.load(load, unit);
  },
};
