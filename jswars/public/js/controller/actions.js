/* ------------------------------------------------------------------------------------------------------*\
   
    controller/actions.js controls action selection
   
\* ------------------------------------------------------------------------------------------------------*/

buildingController = require("../controller/building.js");
terrainController = require("../controller/terrain.js");
unitController = require("../controller/unit.js");
createDefaults = require("../definitions/defaults.js");
terrainDefaults = require("../definitions/properties.js");
buildingDefaults = require("../definitions/buildings.js");
unitDefaults = require("../definitions/units.js");
userActions = require("../user/actions.js");

module.exports = function () {

    var defaults = createDefaults(unitDefaults, buildingDefaults, terrainDefaults);

    return {

        unit: {

            select: function (unit) {

                if (!unitController.selectable(unit)) {

                    return false;
                }

                // set the range highlight to the calculated range
                app.highlight.setMovementRange(unitController.movementRange(false, unit));

                // animate changes
                app.animate("effects");

                return true;
            },

            displayActions: function (target, unit) {

                var options = unitController.actions(target, unit);
                var actions = {};

                Object.keys(options).forEach(function (action) {

                    if (action === "drop" && isArray(options.drop)) {

                        options.drop.forEach(function (unit, index) {

                            actions[index] = { name: action };
                        });

                    } else if (options[action]) {

                        actions[action] = { name: action };
                    }
                });

                app.coStatus.hide();

                var menu = app.dom.createMenu(

                    actions,
                    app.settings.actionsDisplay, 
                    {section: "actionHud", div: "actions"}

                ).firstChild;

                unit = unitController.setActions(new UList(menu).highlight(), unit);

                var actions = unitController.getActions(unit);

                this.setActions(options);
                this.setSelected(actions.id());

                return this.getSelected(); 
            },

            setActions: function (actions) {

                this.actions = actions;
            },

            getActions: function () {

                return this.actions;
            },

            setSelected: function (selected) {

                this.selected = selected;
            },

            getSelected: function () {

                return this.selected;
            },

            refresh: function () {

                app.animate("unit");
            },

            execute: function (target, unit) {

                var position = terrainController.position(target);
                var moved = unitController.moved(terrainController.position(unit), app.path.get(), unit);

                // and remove the range and path highlights
                unit = unitController.move(new Position(position.x, position.y), moved, unit);

                if (app.user.turn()) {

                    transmit.move(unitController.id(unit), position, moved);
                }

                // display path to cursor
                app.path.clear();
                app.range.clear();

                // if there are actions that can be taken then display the necessary options
                if (!this.displayActions(target, unit)) {

                    app.screen.reset();
                }

                app.cursor.hide();
                this.refresh();
            },

            deselect: function () {

                app.screen.reset();
                app.hud.show();
                app.cursor.show();
                app.coStatus.show();
                app.target.deactivate();
                app.hud.setElements(app.cursor.hovered());
            },

            escape: function () {

                app.key.undo();
                app.coStatus.show();
                
                delete this.selected;
                delete this.actions;

                // app.options.deactivate();
                app.dom.remove("actionHud");
            },

            evaluate: function (unit) {

                if (app.cursor.hidden() && !app.target.active()) {

                    var action = this.getSelected();
                    var actions = this.getActions();
                    
                    if (app.key.pressed(app.key.esc())) {

                        unitController.moveBack(unit);
                        this.refresh();
                        this.escape();
                        this.deselect();

                    } else if (actions && action) {

                        if (app.key.pressed(["up","down"])) {

                            this.setSelected(Select.verticle(this.getActions()
                                .deHighlight()).highlight().id());
                        }

                        if (app.key.pressed(app.key.enter())) {

                            action = (isNaN(action) ? userActions[action] : userActions.drop)(actions, unit, action);
                            
                            this.escape();

                            return action;
                        }
                    }
                }
            }
        },

        building: {

            setScreen: function (screen) {

                this.screen = screen;

                return this;
            },

            getScreen: function () {

                return this.screen;
            },

            select: function (building) {

                this.setScreen(new UList(app.dom.createMenu(

                    app.buildings[buildingController.name(building)], ["name", "cost"],
                    {
                        section: "buildUnitScreen",
                        div: "selectUnitScreen"
                    }

                ).firstChild).setScroll(0, 6).highlight());

                this.setSelected(this.getScreen().id());

                return this;
            },

            execute: function () {

                app.hud.setElements(app.cursor.hovered());

                app.screen.reset();

                return true;
            },

            setSelected: function (selected) {

                this.selectedElement = selected;

                return this;
            },

            selected: function () {

                return this.selectedElement;
            },

            evaluate: function (building) {

                if (!app.cursor.hidden()) {

                    app.cursor.hide();
                }

                if (app.key.pressed(["up","down"])) {

                    this.setSelected(Select.verticle(this.screen.deHighlight()).highlight().id());
                }

                if (app.key.pressed(app.key.enter())) {

                    var unit = buildingController.build(this.selected(), building);
                    var cost = defaults.cost(unit);
                    var player = app.user.player();

                    if (playerController.canPurchase(player, cost)) {

                        playerController.purchase(player, cost);

                        app.map.addUnit(unit);
                        transmit.addUnit(unit);
                        app.hud.show();

                        return unit;
                    }
                }
            }
        },

        type: function (element) {

            var type = terrainController.type(element);

            if (!this[type]) {

                throw new Error("Invalid element type input.", "actions.js");
            }

            return this[type];
        }
    };
}();