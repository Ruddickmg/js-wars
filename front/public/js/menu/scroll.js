/* --------------------------------------------------------------------------------------*\
    
    handles scrolling of menu elements etc..
    
\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.key = require('../input/keyboard.js');

module.exports = function () {

    var undo = app.key.undo, 
    direction, then = new Date(),

    scroll = function (neg, pos) {
        if (app.key.pressed(neg) || neg == direction) {
            direction = false;
            app.key.undo(app.key[neg]());
            return -1;
        } else if (app.key.pressed(pos) || pos == direction) {
            direction = false;
            app.key.undo(app.key[pos]());
            return 1;
        }
        return 0;
    };

    return {
        horizontal: function () {
            this.scroll = scroll('left','right');
            return this;
        },
        verticle: function() {
            this.scroll = scroll('up','down');
            return this;
        },
        infinite: function (index, min, max) {
            var point = index + this.scroll;
            var def = this.scroll < 0 ? max : min;
            return point > max || point < min ? def : point;
        },
        finite: function (index, min, max) {
            if(this.scroll !== undefined){
                var point = index + this.scroll;
                if (point <= max && point >= min) 
                    return point;
            }
            return false;
        },
        wheel: function (dir, now) {
            if(now - then > 200){
                direction = dir < 0 ? 'up' : 'down'; 
                then = now;
            }
        },
        swipe: function (dir, now) {
            if(now - then > 200){
                direction = dir < 0 ? 'left' : 'right'; 
                then = now;
            }
        }
    };
}();