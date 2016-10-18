/* --------------------------------------------------------------------------------------*\

    Effect.js holds the coordinates for effects

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
Path = require('../effects/path.js');
app.confirm = require('../controller/confirmation.js');
app.path = new Path();
app.range = new Path();
app.attackRange = new Path();

module.exports = function () {

    var highlight = app.range;
    var path = app.path;
    var attackRange = app.attackRange;

    return {

        refresh: function () {app.animate('effects');},

        undo: {
            path: function () {path.clear();},
            highlight: function () {highlight.clear();},
            attackRange:function(){attackRange.clear();}
        },

        highlight: function () { return highlight.get(); },
        path: function () { return path.get(); },
        attackRange: function () {return attackRange.get(); },

        setHighlight: function (range) {highlight.set(range);},
        setPath: function (path) {path.set(path);},
        setAttackRange: function (range) {attackRange.set(range);}
    };
}();