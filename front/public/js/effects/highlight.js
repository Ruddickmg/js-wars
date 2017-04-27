/* --------------------------------------------------------------------------------------*\

    Effect.js holds the coordinates for effects

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
Path = require('../tools/path.js');
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
        clear: function () {
            path.clear();
            highlight.clear();
            attackRange.clear();
            return this;
        },
        movementRange: function () { return highlight.get(); },
        path: function () { return path.get(); },
        attackRange: function () {return attackRange.get(); },
        setMovementRange: function (range) {highlight.set(range);},
        setPath: function (path) {path.set(path);},
        setAttackRange: function (range) {attackRange.set(range);}
    };
}();