/* --------------------------------------------------------------------------------------*\
    
    handles scrolling of menu elements etc..
    
\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.undo = require('../tools/undo.js');

module.exports = function () {

    var undo = app.undo.keyPress;
    var key = app.key;

    var scroll = function (neg, pos){
        if (app.key.pressed(neg)){
            app.undo.keyPress(app.key[neg]);
            return -1;
        } else if (app.key.pressed(pos)) {
            app.undo.keyPress(app.key[pos]);
            return 1;
        }
        return 0;
    };

    return {
        horizontal:function (){
            this.scroll = scroll('left','right');
            return this;
        },
        verticle:function(){
            this.scroll = scroll('up','down');
            return this;
        },
        infinite: function (index, min, max) {
            var point = index + this.scroll;
            var def = this.scroll < 0 ? max : min;
            return point > max || point < min ? def : point;
        },
        finite: function (index, min, max) {
            if(this.scroll){
                var point = index + this.scroll;
                if (point <= max && point >= min) return point;
            }
            return false;
        }
    };
}();