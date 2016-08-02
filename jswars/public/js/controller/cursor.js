app = require('../settings/app.js');
app.map = require('../controller/map.js');
app.options = require('../menu/options.js');
app.calculate = require('../game/calculate.js');
app.effect = require('../game/effects.js');
app.undo = require('../tools/undo.js');
app.animate = require('../game/animate.js');
app.key = require('../tools/keyboard.js');
//app.user = require('../objects/user.js');
app.game = require('../game/game.js');
app.display = require('../tools/display.js');
app.feature = require('../objects/featureHud.js');

module.exports = function () {

    var editing, selected, moved, active, enter, hidden = false, position = {x:7, y:5}, key = app.key;

    var allowed = function (range) {
        if (!range) range = app.range.get();
        for (var pos, o = 0; o < range.length; o += 1)
            if ((pos = range[o].position()).x == position.x && pos.y == position.y)
                return true;
        return false;
    };
    
    var canMove = function (axis, comparison, operation) {
        var target, range, move = position[axis] + operation;
        if (comparison <= 0 ? move >= 0 : move < comparison){
            position[axis] += operation;
            if(selected && allowed()){
                app.undo.effect('path');
                selected.movementRange(app.calculate.distance(selected.position(), position))
                app.path.find(selected, position);
                app.animate('effects');
            }
            return position;
        }
        return false;
    };

    // check which side of the screen the cursor is on
    var checkSide = function (axis) {
        var dimensions = app.screen.dimensions()[axis]; // screen dimensions
        var screenPosition = app.screen.position()[axis]; // position of the screen
        if (position[axis] > screenPosition + (dimensions / 2))
            return true;
        return false;
    };

    return {
        editing: function () { editing = true; },
        clear: function () {selected = false, hidden = false, moved = false;},
        hide: function () { 
            hidden = true; 
            app.animate('cursor');
        },
        show: function () { 
            hidden = false; 
            app.animate('cursor');
        },
        active: function () {return active; },
        hidden: function () { return hidden; },

        // returns cursor location ( left or right side of screen )
        side: function (axis) {
            if (checkSide(axis))
                return axis === 'x' ? 'right' : 'bottom';
            return axis === 'x' ? 'left' : 'top';
        },
        setSelected: function (s) { selected = s; },
        hovered: function () { return app.map.occupantsOf(position); },
        setPosition: function (p) { 
            if(!isNaN(p.x + p.y)) position = {x:p.x, y:p.y}; 
            else throw new Error('Position must have an x and a y axis that are both numeric', 'cursor');
        },
        position: function () { return {x:position.x, y:position.y}; },
        moved: function () { return moved; },
        deselect: function () { selected = false; },
        selected: function () { return selected; },
        select: function (element) {

            // set selection
            if (element) return selected = element;

            // if its the users turn and theyve pressed enter
            if ((key.pressed(key.enter()) || key.pressed(key.range()) || key.keyUp(key.range())) && app.user.turn() && !app.target.active()) {

                var a, hovered = app.map.top(position);

                if (!active && key.pressed(key.enter()) && key.undo(key.enter())) {

                    // if something was selected
                    if (selected && allowed() && (hovered.type() !== 'unit' || selected.canCombine(hovered) || hovered === selected)){

                        // if selection is finished then continue
                        if(selected.execute(position))

                            // deselect
                            return selected = false;

                    // if there is nothing selected
                    } else if (!selected && !app.options.active() && app.user.owns(hovered)){
                        
                        selected = hovered;

                        // save the selected element and then select it
                        if(selected.select())

                            app.hud.hide();
                        
                        else selected = false;
                    }

                } else if (!selected && (hovered.type() === 'unit' || key.keyUp(key.range()))) {
                    if (!active) active = hovered;
                    if (hovered === active)
                        active = active.showAttackRange();
                    else {
                        active = active.displayingRange = false;
                        app.attackRange.clear();
                        app.effect.refresh(); 
                    }
                }
            }
            // handle attack range display
            return this;
        },
        displayPosition: function () { return true; },
        copy: function () {
            if (editing && key.pressed(key.copy()) && !app.build.active())
                app.feature.set((selected = app.map.top(position))); 
        },
        build: function () { 
            if (key.pressed(key.enter()) && !app.build.active() && app.map.build(selected, position))
                app.animate(['unit', 'building', 'terrain']);
        },
        move: function (emitted) {

            moved = false;

            if ((!selected || selected.type() !== 'building' ||  app.editor.active()) && !app.options.active() && !hidden && app.user.turn() || emitted) {

                var d = app.map.dimensions(), pressed;

                if (key.pressed(key.up()) && canMove('y', 0, -1)) 
                    pressed = key.up();

                if (key.pressed(key.down()) && canMove('y', d.y, 1)) 
                    pressed = key.down();

                // player holding left
                if (key.pressed(key.left()) && canMove('x', 0, -1)) 
                    pressed = key.left();

                // Player holding right
                if (key.pressed(key.right()) && canMove('x', d.x, 1))
                    pressed = key.right();

                if(pressed){
                    if (editing) app.feature.set(selected);
                    if (app.user.turn()) socket.emit('cursorMove', pressed);
                    moved = true;
                    app.screen.scroll();
                    app.animate('cursor');
                };
            }
            return this;
        }
    };
}();