/* --------------------------------------------------------------------------------------*\

    app.effect is holds the coordinates for effects

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.touch = require('../tools/touch.js');
Path = require('../effects/path.js');
app.path = new Path();
app.range = new Path();
app.attackRange = new Path();

module.exports = function () {

    var key, undo, block, 
    prev = {}, temp = {}, 
    positions = ['oneAbove','twoAbove','oneBelow','twoBelow'];

    var highlight = app.range;
    var path = app.path;
    var attackRange = app.attackRange;
    var refresh = function () {app.animate('effects');};
    var findElementsByClass = function (element, className){
        for (var i = 0, elements = []; i < element.childNodes.length; i += 1)
            if (element.childNodes[i].className === className)
                elements.push(element.childNodes[i]);
        return elements;
    };

    var fade = function (element, id) {
        app.temp.swell = element;
        app.temp.swellingColor = app.settings.colors[id];
    };

    var stopFading = function (){delete app.temp.swell;};

    var highlightListItem = function (selectedElement, tag, index, previous, elements) {

        // apply highlighting 
        selectedElement.style.backgroundColor = 'tan';

        // display info on the currently hovered over element
        if (id === 'selectUnitScreen') unitInfo(selected, selectedElement.id); /// selected unnacounted for

        // if there is then remove its highlighting
        if (previous) previous.style.backgroundColor = '';
        return true;
    };

    var type = function (element, sentance, index) {

        setTimeout(function () {

            if (sentance[index] && app.temp.typing === sentance) { 
                element.innerHTML += sentance[index];
                index += 1;
                type(element, sentance, index);
            }else{
                return false;
            }
        }, app.settings.typingSpeed * 10);
    };

    return {

        highlightListItem:highlightListItem,
        fade:fade,
        stopFading:stopFading,
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
        arrow: function (type, x, y, size) {

            var arrow = document.getElementById(type + 'ArrowOutline');
            var background = document.getElementById(type + 'ArrowBackground');
            var top = arrow.style.top = y + 'px';
            var left = arrow.style.left = x + 'px';

            if(size){
                var border = size / 4;
                background.style.left = border - size + 'px'; 
                if(type === 'up'){
                    arrow.style.borderLeftWidth = size + 'px';
                    arrow.style.borderRightWidth = size + 'px';
                    arrow.style.borderTopWidth = size + 'px';
                    background.style.borderLeftWidth = size - border + 'px';
                    background.style.borderRightWidth = size - border + 'px';
                    background.style.borderTopWidth = size - border + 'px';
                }else if(type === 'down'){
                    arrow.style.borderLeftWidth = size + 'px';
                    arrow.style.borderRightWidth = size + 'px';
                    arrow.style.borderBottomWidth = size + 'px';
                    background.style.borderLeftWidth = size - border + 'px';
                    background.style.borderRightWidth = size - border + 'px';
                    background.style.borderBottomWidth = size -2 + 'px';
                }else if(type === 'left'){
                    arrow.style.borderLeftWidth = size + 'px';
                    arrow.style.borderBottomWidth = size + 'px';
                    arrow.style.borderTopWidth = size + 'px';
                    background.style.borderLeftWidth = size - border + 'px';
                    background.style.borderBottomWidth = size - border + 'px';
                    background.style.borderTopWidth = size - border + 'px';
                }else if(type === 'right'){
                    arrow.style.borderBottomWidth = size + 'px';
                    arrow.style.borderRightWidth = size + 'px';
                    arrow.style.borderTopWidth = size + 'px';
                    background.style.borderBottomWidth = size - border + 'px';
                    background.style.borderRightWidth = size - border + 'px';
                    background.style.borderTopWidth = size - border + 'px';
                }
            }

            return {
                outline: arrow,
                background: background
            };
        },

        horizontalScroll:function (parent) {

            var previous = prev.category;

            if(previous !== undefined) previous.style.display = 'none';

            var categories = parent.children;
            var len = categories.length - 1;

            var category = app.def.category = app.scroll.horizontal().infinite(app.def.category, 0 , len);

            // get the elements to the left and right of the selected category and position them as such
            var neg = category - 1;
            var pos = category + 1;
            var left = categories[ neg < 0 ? len : neg ];
            var right = categories[ pos < len ? pos : 0 ];

            // get the category for display
            var show = categories[category];

            // display selected
            show.style.display = '';
            show.setAttribute('pos', 'center');

            //position left and right
            left.setAttribute('pos', 'left');
            right.setAttribute('pos', 'right');

            if(previous === undefined || show.id !== previous.id){
                prev.category = show;
                return show.id;
            }
            return false;
        },

        setupMenuMovement:function (selectedElement, tag, index, previous, elements){

            // if the item being hovered over has changed, remove the effects of being hovered over
            if(previous){
                stopFading();
                var background = findElementsByClass(previous, 'modeBackground')[0] || false;
                if(background){
                    background.style.height = '';
                    background.style.borderColor = '';
                }else{
                    previous.style.height = '';
                    previous.style.borderColor = '';
                }
                if(!app.modes.active()){
                    if(prev.textBackground){
                        var tbg = prev.textBackground;
                        tbg.style.transform = '';
                        tbg.style.backgroundColor = 'white';
                    }
                    if(prev.text) prev.text.style.letterSpacing = '';
                    block = findElementsByClass(previous, 'block')[0] || false;
                    if(block) block.style.display = '';
                    var prevOptions = findElementsByClass(previous, 'modeOptions')[0] || false;
                    if(prevOptions) prevOptions.style.opacity = 0;
                }
            }

            app.display.through();

            if(!app.modes.active()){

                var elements = findElementsByClass(selectedElement.parentNode, 'modeItem');
                var menu = findElementsByClass(selectedElement, 'modeOptions')[0] || false;
                var length = elements.length;

                // calculate the positions of the surrounding elements by index
                var pos = {oneAbove: index - 1 < 1 ? length : index - 1};
                pos.twoAbove = pos.oneAbove - 1 < 1 ? length : pos.oneAbove - 1; 
                pos.oneBelow = index + 1 > length ? 1 : index + 1; 
                pos.twoBelow = pos.oneBelow + 1 > length ? 1 : pos.oneBelow + 1;

                // assign position values for each positon
                for( var p = 0; p < positions.length; p += 1){
                    var position = positions[p];
                    var posIndex = pos[position];
                    var element = app.dom.findElementByTag(tag, elements, posIndex);
                    element.setAttribute('pos', position);
                }

                selectedElement.setAttribute('pos', 'selected');
                app.touch(selectedElement).scroll();

                // get the h1 text element of the selected mode and its background span
                var text = findElementsByClass(selectedElement, 'text')[0] || false;
                var background = selectedElement.getElementsByTagName('span')[0] || false;

                if(text && background){
                    // save the background and text for resetting on new selection
                    prev.textBackground = background;
                    prev.text = text;

                    //  get the length of the id (same as inner html);
                    var letters = selectedElement.id.length;

                    // get the width of the text and the width of its parent
                    var parentWidth = selectedElement.clientWidth;
                    var bgWidth = background.offsetWidth;

                    // devide the text width by the width of the parent element and divide it by 4 to split between letter spacing and stretching
                    var diff = (bgWidth / parentWidth ) / 4;
                    var transform = diff + 1; // find the amount of stretch to fill the parent
                    var spacing = (diff * bgWidth) / letters; // find the amount of spacing between letters to fill the parent

                    // set spacing
                    text.style.letterSpacing = spacing + 'px';

                    // stretch letters
                    //background.style.transform = 'scale('+transform+',1)';

                    // remove background
                    background.style.backgroundColor = 'transparent';
                };
                
                // hide the background bar
                block = findElementsByClass(selectedElement, 'block')[0] || false;
                if (block) block.style.display = 'none';
            }

            if(selectedElement.getAttribute('class') === 'modeOption'){
                id = selectedElement.parentNode.parentNode.id;
            }else{
                id = selectedElement.id;
            }

            // get border of background div            
            var border = findElementsByClass(selectedElement, 'modeBackground')[0] || false;
            var element = selectedElement;
            
            // fade the selected element from color to white
            if (border) element = border;

            fade(element, id || 'game');

            // toggle sub menu selections
            if (menu || app.modes.active()){
                app.display.menuItemOptions(menu);
                if(menu){
                    app.def.menuOptionsActive = true;
                    return false; // tells select that it is not selectable since it has further options
                }else if(!app.modes.active()){
                    app.def.menuOptionsActive = false;
                }
            }
            return true;
        },

        swell: {
            color: function (now, element, color, inc, callback, id) { 

                if(app.temp.swell || element){

                    // note that color swell is active
                    if(!app.temp.colorSwellActive) app.temp.colorSwellActive = true;

                    if(id && !app.prev[id]) app.prev[id] = {};
                    var time = app.prev[id] ? app.prev[id].swellTime : app.prev.swellTime;

                    if(!time || now - time > app.settings.colorSwellSpeed){
                        
                        var inc = inc ? inc : app.settings.colorSwellIncriment;
                        var element = element ? element : app.temp.swell;
                        var prev = app.prev[id] ? app.prev[id].lightness : app.prev.lightness;

                        if(id){
                            if(!app.temp[id]) app.temp[id] = {lightness:app.def.lightness};
                            app.prev[id].swellTime = now;
                        }else{
                            app.prev.swellTime = now;
                            if(!app.temp.lightness) app.temp.lightness = app.def.lightness;
                        }

                        var lightness = app.temp[id] ? app.temp[id].lightness : app.temp.lightness;
                        var color = color ? color : app.temp.swellingColor;

                        if(callback) {
                            callback(app.hsl(color.h, color.s, lightness), element);
                        }else{
                            element.style.borderColor = app.hsl(color.h, color.s, lightness);
                        }

                        if( lightness + inc <= 100 + inc && prev < lightness || lightness - inc < 50){
                            if(app.temp[id] && app.prev[id]){
                                app.temp[id].lightness += inc;
                                app.prev[id].lightness = lightness;
                            }else{
                                app.temp.lightness += inc;
                                app.prev.lightness = lightness;
                            }
                        }else if(lightness - inc >= color.l && prev > lightness || lightness + inc > 50){ 
                            if(app.temp[id] && app.prev[id]){
                                app.temp[id].lightness -= inc;
                                app.prev[id].lightness = lightness;
                            }else{
                                app.temp.lightness -= inc;
                                app.prev.lightness = lightness;
                            }
                        };
                    }
                // if there is no app.temp.swell, but colorswell is active then delete every
                }else if(app.temp.colorSwellActive){
                    //delete app.temp.lightness;
                    delete app.temp.colorSwellActive;
                    delete app.temp.swellingColor;
                }
            },
            size: function (element, min, max) {

                if(app.prev.swellElement && app.prev.swellElement.id !== element.id){

                    app.prev.swellElement.style.width = '';
                    app.prev.swellElement.style.height = '';
                    app.prev.swellElement.style.left = app.prev.left + 'px';
                    app.prev.swellElement.style.top = app.prev.top + 'px';

                    delete app.prev.left;
                    delete app.prev.top;
                    delete app.temp.size;
                    delete app.temp.left;
                    delete app.temp.top;
                }

                if(!app.settings.swellIncriment && inc) app.settings.swellIncriment = inc;
                if(!app.settings.swellSpeed && swellSpeed) app.settings.swellSpeed = swellSpeed;
                if(!app.temp.size) app.temp.size = element.offsetWidth;
                if(!app.temp.left) app.temp.left = app.prev.left = Number(element.style.left.replace('px',''));
                if(!app.temp.top) app.temp.top = app.prev.top = Number(element.style.top.replace('px',''));
 
                var size = app.temp.size;
                var now = new Date();
                var time = app.prev.sizeSwellTime;
                var inc = app.settings.swellIncriment;
                var swellSpeed = app.settings.swellSpeed;
                var prev = app.prev.size;

                if(!time || now - time > swellSpeed){

                    app.prev.sizeSwellTime = now;

                    app.prev.swellElement = element;

                    var center = inc / 2;

                    if( size + inc <= max && prev < size || size - inc < min){
                        app.temp.size += inc;
                        app.temp.left -= center;
                        app.temp.top -= center;
                        app.prev.size = size;
                    }else if(size - inc >= min && prev > size || size + inc > min){ 
                        app.temp.size -= inc;
                        app.temp.left += center;
                        app.temp.top += center;
                        app.prev.size = size;
                    };

                    var newSize = app.temp.size + 'px';
                    var newLeft = app.temp.left + 'px';
                    var newTop = app.temp.top + 'px';

                    element.style.width = newSize;
                    element.style.height = newSize;
                    element.style.left = newLeft;
                    element.style.top = newTop;
                };
            }
        },

        typeLetters: function (element, sentance) {
            var prevDesc = app.prev.description;
            if(!prevDesc || prevDesc !== sentance){
                app.prev.description = sentance;
                element.innerHTML = '';
                app.temp.typing = sentance;
                return type(element, sentance, 0);
            }
            return false;
        }
    };
}();