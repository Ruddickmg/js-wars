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

    var key, undo, block, prev = {}, temp = {};
    var highlight = app.range;
    var path = app.path;
    var attackRange = app.attackRange;
    var refresh = function () {app.animate('effects');};
    var findElementsByClass = function (element, className) {
        for (var i = 0, elements = []; i < element.childNodes.length; i += 1)
            if (element.childNodes[i].className === className)
                elements.push(element.childNodes[i]);
        return elements;
    };

    var highlightListItem = function (selectedElement, index, previous, elements) {

        // apply highlighting 
        selectedElement.style.backgroundColor = 'tan';

        // display info on the currently hovered over element
        if (selectedElement.id === 'selectUnitScreen') unitInfo (selected, selectedElement.id); /// selected unnacounted for

        // if there is then remove its highlighting
        if (previous) previous.style.backgroundColor = '';
        return true;
    };

    return {

        highlightListItem:highlightListItem,
        refresh:refresh,

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
        setAttackRange: function (range) {attackRange.set(range);},
        clear: function () {temp = {};prev = {};},
        hideOffScreenElements: function (elements, index, min, max) {
            var hide = index - max;
            if (hide >= min){
                if (index > max)
                    for (var h = 0; h < hide; h += 1)
                        elements[h].style.display = 'none';
                else if (index < elements.length - max)
                    elements[index].style.display = '';
            }
        }
    };
}();