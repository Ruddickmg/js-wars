/* ------------------------------------------------------------------------------------------------------*\
   
    cursor.js controls cursor movement and map element selection
   
\* ------------------------------------------------------------------------------------------------------*/

app = require("../settings/app.js");
app.map = require("../controller/map.js");
app.options = require("../menu/options/optionsMenu.js");
app.calculate = require("../tools/calculate.js");
app.animate = require("../animation/animate.js");
app.key = require("../input/keyboard.js");
app.highlight = require("../effects/highlight.js");
app.game = require("../controller/game.js");
app.feature = require("../huds/featureHud.js");
transmit = require("../sockets/transmitter.js");
terrainController = require("../controller/terrain.js");
unitController = require("../controller/unit.js");
actions = require("../controller/actions.js");

module.exports = function () {

    var editing, selected, deleting, moved, active, enter, hidden, position = {x:7, y:5};

    var allowed = function (range) {

        if (!range) {

            range = app.range.get();
        }

        var p, l = range.length;

        while (l--) {

            p = terrainController.position(range[l]);

            if (p.on(position)) {

                return true;
            }
        }

        return false;
    };
    
    var canMove = function (axis, comparison, operation) {

        var move = position[axis] + operation; // distance

        if (comparison <= 0 ? move >= 0 : move < comparison) {

            position[axis] += operation;

            if (selected && allowed()) {

                app.path.clear().find(selected, position);

                app.animate("effects");
            }

            return position;
        }
        return false;
    };

    // check which side of the screen the cursor is on
    var checkSide = function (axis) {

        var dimensions = app.screen.dimensions()[axis]; // screen dimensions
        var screenPosition = app.screen.position()[axis]; // position of the screen

        if (position[axis] > screenPosition + (dimensions / 2)) {

            return true;
        }
        return false;
    };

    return {

        editing: function () { 

            editing = true; 
        },

        clear: function () {

            selected = false, 
            hidden = false, 
            moved = false;
        },

        hide: function () { 

            hidden = true;

            app.animate("cursor");
        },

        show: function () { 

            hidden = false;

            app.animate("cursor");
        },

        active: function () {

            return active; 
        },

        hidden: function () { 

            return hidden; 
        },

        // returns cursor location ( left or right side of screen )
        side: function (axis) {

            if (checkSide(axis)) {

                return axis === 'x' ? "right" : "bottom";
            }

            return axis === 'x' ? "left" : "top";
        },

        setSelected: function (s) { 

            selected = s;
        },

        hovered: function () { 

            return app.map.occupantsOf(position); 
        },

        setPosition: function (p) { 

            if (!isNaN(p.x + p.y)) {

                position = {x:p.x, y:p.y}; 

            } else {

                throw new Error("Position must have an x and a y axis that are both numeric", "cursor");
            }
        },

        position: function () { 

            return { x: position.x, y: position.y }; 
        },

        moved: function () { 

            return moved; 
        },

        deselect: function () { 

            selected = false; 
        },

        selected: function () { 

            return selected;
        },

        select: function (element) {

            if (hidden || deleting) {

                return false;
            }

            // set selection
            if (element) {

                return selected = element;
            }

            var range = app.key.range();
            var enter = app.key.enter();

            // if its the users turn and theyve pressed enter
            if ((app.key.pressed(enter) || app.key.pressed(range) || app.key.keyUp(range)) && app.user.turn() && !app.target.active()) {

                var hovered = app.map.top(position);
                var isUnit = terrainController.isUnit(hovered);

                if (!active && app.key.pressed(enter) && app.key.undo(enter)) {

                    // if something was selected
                    if (selected && (allowed() && !isUnit || unitController.canCombine(hovered, selected) || hovered === selected)) {

                        // if selection is finished then continue
                        if (actions.type(selected).execute(hovered, selected)) {

                            // deselect
                            return selected = false;
                        }

                    // if there is nothing selected
                    } else if (!selected && !app.options.active() && app.user.owns(hovered)) {
                        
                        // save the selected element and select it
                        if (actions.type((selected = hovered)).select(selected)) {

                            app.hud.hide();
                        
                        } else {

                            selected = false;
                        }
                    }

                } else if (!selected && (terrainController.isUnit(hovered) || app.key.keyUp(range))) {

                    if (app.key.keyUp(range)) {
                        
                        active = false;

                        app.highlight.clear(); 

                    } else if (!active) {

                        app.key.undo(app.key.range());

                        active = unitController.showAttackRange(hovered);
                    }

                    app.highlight.refresh();
                }
            }

            // handle attack range display
            return this;
        },

        displayPosition: function () { 

            return true; 
        },

        copy: function () {

            if (editing && app.key.pressed(app.key.copy()) && !app.build.active()) {

                app.feature.set((selected = app.map.top(position))); 
            }
        },

        build: function () { 

            if (app.key.pressed(app.key.enter()) && !app.build.active() && app.map.build(selected, position)) {

                app.animate(["unit", "building", "terrain"]);
            }
        },

        selectMode: function () { 

            deleting = false; 
        },

        deleteMode: function () {

            deleting = true; 
        },

        deleting: function () { 

            return deleting; 
        },

        deleteUnit: function () {

            if (app.key.pressed(app.key.enter())) {

                app.key.undo(app.key.enter());

                var hovered = app.map.top(position);

                if (terrainController.isUnit(hovered)) {

                    app.map.removeUnit(hovered);
                    transmit.delete(hovered);
                }
            }
        },

        move: function (emitted) {

            moved = false;

            if ((!selected || !terrainController.isBuilding(selected)) && !app.options.active() && !hidden && app.user.turn() || emitted) { //  ||  app.editor.active() after isBuilding

                var d = app.map.dimensions(), pressed;

                if (app.key.pressed(app.key.up()) && canMove('y', 0, -1)) {

                    pressed = app.key.up();
                }

                if (app.key.pressed(app.key.down()) && canMove('y', d.y, 1)) {

                    pressed = app.key.down();
                }

                if (app.key.pressed(app.key.left()) && canMove('x', 0, -1)) {

                    pressed = app.key.left();
                }

                if (app.key.pressed(app.key.right()) && canMove('x', d.x, 1)) {

                    pressed = app.key.right();
                }

                if (pressed) {

                    if (editing) {

                        app.feature.set(selected);
                    }

                    if (app.user.turn()) {

                        transmit.cursor(pressed);
                    }

                    moved = true;
                    app.screen.scroll();
                    app.animate("cursor");
                };
            }
            
            return this;
        }
    };
}();