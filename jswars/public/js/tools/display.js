/* ------------------------------------------------------------------------------------------------------*\
   
   handles all the display screens and the users interaction with them
   
\* ------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
var scrollText = require('../effects/scrollText.js');
socket = require('../tools/sockets.js');
app.game = require('../game/game.js');
app.settings = require('../settings/game.js');
app.animate = require('../game/animate.js');
app.effect = require('../game/effects.js');
app.scroll = require('../menu/scroll.js');
app.buildings = require('../definitions/buildings.js');
app.menu = require('../controller/menu.js');
app.dom = require('../tools/dom.js');
app.undo = require('../tools/undo.js');
app.calculate = require('../game/calculate.js');
app.draw = require('../game/draw.js');
app.co = require('../objects/co.js');
app.screens = require('../objects/screens.js');
app.key = require('../tools/keyboard.js');
app.players = require('../controller/players.js');
app.cursor = require('../controller/cursor.js');
app.click = require('../tools/click.js');
app.touch = require('../tools/touch.js');
app.type = require('../effects/typing.js');

module.exports = function () {

    var selectionIndex = 0, previousList, touched, previousListLength, parentIndex, prevElement,
    selectedElement, hide, len, listLength, prevSelection, prev = {}, temp = {}, selectable = true, 
    prevIndex = undefined, loop = false, modeOptionIndex = false, modeChildElement;

    var displayInfo = function (properties, allowedProperties, elements, callback) {
        
        var inner = elements.div;

        // build the outside screen container or use the existing element
        var display = document.createElement('section');
        display.setAttribute('id', elements.section);

        // build inner select screen or use existing one
        var exists = document.getElementById(elements.div);
        var innerScreen = document.createElement('div');
        innerScreen.setAttribute('id', inner);

        // get each unit type for looping over
        var keys = Object.keys(properties);
        var len = keys.length;

        for (var u = 0; u < len; u += 1) {

            var key = keys[u];
            var props = properties[key];

            // create list for each unit with its cost
            var list = app.dom.createList(props, key, allowedProperties);
            if (props.id || props.id === 0) list.setAttribute('id', props.id);
            if (inner) list.setAttribute('class', inner + 'Item');
            if (callback) callback(list, props);

            // add list to the select screen
            innerScreen.appendChild(list);
        }

        // add select screen to build screen container
        if (exists) exists.parentNode.replaceChild(innerScreen, exists);
        else document.body.insertBefore(display, app.domInsertLocation);

        display.appendChild(innerScreen);
        return display;
    };

    var coSelection = function (properties, prevList, prevSelection) {

        // initialize a list to load properties the current user can edit
        var list = [];

        // detect which player so that they can only edit their respective charector settings
        var number = app.user.number();

        // get the keys to the properties that can be edited by the user (co selection, teams etc)
        var keys = Object.keys(properties);

        // number of properties
        var keysLength = keys.length;

        var getValue = app.dom.getDisplayedValue;

        // if there are previous items 
        if (prevSelection !== undefined) 
            var ind = prevList[prevSelection];

        for(var k = 0; k < keysLength; k += 1){

            var key = keys[k];
            var mode = getValue(key);
            var pNumber = key.getNumber();

            if(key.indexOf('mode') > -1 && number === 1){
                if(pNumber != 1){
                    var i = pNumber - 1;
                    var p = app.user.player();
                    if(mode === 'Cp'){
                        var property = 'player'+pNumber+'co';
                        if(p && !p.cp){
                            var value = getValue(property);
                            var cp = aiPlayer(number, p);
                            socket.emit('boot', {player:p, cp:cp});
                            app.players.remove(i, cp);
                            app.players.setProperty(property, value);
                        }
                        list.push(property);
                    }else if(p && p.cp){
                        socket.emit('boot', {player:false, cp:p});
                        app.players.remove(i);
                    }
                }
                list.push(key);
            }else if(key.indexOf('Team') > -1 && (number == pNumber || mode === 'Cp' && number == 1) || key.indexOf(number+'co') > -1){
                list.push(key);
            }
        }
        return {list:list, ind:ind};
    };

    return {
        info: displayInfo,
        setOptionIndex: function (index){modeOptionIndex = index;},
        index: function () {return selectionIndex},
        previousIndex: function () {return prevIndex;},
        setPreviousIndex: function (index) {prevIndex = index;},
        resetPreviousIndex: function () {prevIndex = undefined;},
        loop: function () {loop=true},
        through: function (){loop=false},
        clear: function () {temp = {}; prev = {};},
        reset: function () {selectionIndex = 0},
        setIndex: function (index) {
            selectionIndex = index;
            touched = index;
        },
        mapOrGameSelection: function (id, elements) {
            var replace = document.getElementById(id);
            replace.parentNode.replaceChild(elements, replace);
        },
        clearOld: function () {
            prevSelection = undefined; 
            previousList = undefined; 
            temp.text = undefined;
        },
        previous: function () {
            return {
                selection: prevSelection,
                list: previousList
            }
        },
        actions: function (options) {

            if (!options) return false;

            var actions = Object.keys(options);
            var action, array;
            var actionsObj = {};

            for (var i, a = 0; a < actions.length; a += 1)
                if (typeof((array = options[(action = actions[a])])) === 'array')
                    for (i = 0; i < array.length; i += 1)
                        actionsObj[i] = { name: action };
                else actionsObj[action] = { name: action };
            
            app.coStatus.hide();

            return displayInfo(actionsObj, app.settings.actionsDisplay, {section: 'actionHud',div: 'actions'});
        },
        menuItemOptions: function (menu) {

            var previous = prev.horizon;
            var horizon = app.scroll.horizontal().finite(previous || 0, 0, 1);

            if (menu) menu.style.opacity = 1;

            // display the menu options
            if (horizon !== undefined && previous !== horizon) {

                var moa = app.menu.active();
                index = modeOptionIndex ? modeOptionIndex : 0;

                if (horizon === 0 && moa) {

                    app.menu.deactivate();
                    modeChildElement = undefined;

                } else if(horizon === 1 && !moa) {

                    app.menu.activate();
                    modeChildElement = {
                        element:menu,
                        tag:'modeOptionIndex',
                        index: index
                    }
                }
                app.effect.clear();
                prev.horizon = horizon;
                modeOptionIndex = false;
                loop = true;
            }
        },
        complexSelect: function (elements, callback, player) {

            /*
                complexSelect is for complex selection of items displayed in the dom, it keeps track of 
                which element is currently being scrolled through, the list item that is currently selected
                and the last selected list item for each element if it is nolonger being scrolled through.
                it also broadcasts the descriptions of each selected element, or scrolled through list 
                items to any element of the name specified in the "text" attribute of the "elements" object
                the first argument "elements" is an object which contains the names of the elements being 
                selected in their various positions within the dom. they are as follows:
                        
                type: defines what page will be loaded
                element: name of the element that is parent to the list
                
                index: name of the index, comes after the property name i.e. (property + index)
                attribute: name of the tag being retrieved as a value from the selected element,
                 
                text: name of the element that holds the chat and description etc, displayed text,
                properties: the object that defines all that will be scrolled through
                the second is a callback to handle what to do while scrolling and what elements to effect
                the third is an optional parameter that allows you to assign a display type to the currently 
                selected list item that is unhidden for display 
                (all list items are hidden by default and displayed as selected)
                it returns an object containing the current;y selected property and its value
            */

            var properties = elements.properties;

            // create list of property names accessable to the player (object keys)
            // needed for restricting selection options (only player 2 can edit player 2's settings etc..)
            if ((app.key.pressed() || !temp.list) && player && !app.players.empty()) {
                var co = coSelection(properties, previousList, prevSelection);
                temp.list = co.list;
                var ind = co.ind;
            } else if (!temp.list) {
                list = Object.keys(properties);
            }

            var list = temp.list ? temp.list : list, 
            listLength = list.length;

            // keep track of what is selected in the list for recall
            if(previousListLength !== listLength && prevSelection && player) 
                prevSelection = list.indexOf(ind);

            // get the index of an element if it has been touched
            touched = list.indexOf(touched);
            
            // get the currently selected index, start with 0 if one has not yet been defined
            var index = touched > -1 ? touched : app.scroll.horizontal().infinite(prevSelection || 0, 0, list.length - 1);

            // get the property name of the currently selected index for use in retrieving elements of the same name
            var property = list[index];

            // get the element that displays the text: descriptions, chat etc...
            if(!temp.text) temp.text = document.getElementById(elements.text);

            // if there arent any previous indexes (we have just started) or the last index is not
            // the same as the current index then manipulate the newly selected element
            if(prevSelection === undefined || prevSelection !== index || previousListLength !== listLength){
                
                previousList = list;
                previousListLength = listLength;

                // if the description for the current element is text then print it
                if (property !== undefined && typeof (properties[property].description) === 'string' ) {
                    app.type.letters(temp.text, properties[property].description);
                }
                
                // indicate that we have changed elements
                var change = true;

                // callback that handles what to do with horizontally scrolled elements
                var selected = callback(property);

                // get all the list items from the currently selected element
                temp.items = app.dom.getImmediateChildrenByTagName(selected, 'li');

                // save the currently selected index as a comparison to possibly changed indexes in the future
                prevSelection = index;

                // if we have visited this element before, get the last selected index for it and display that
                // rather then the currently selected list item index
                if (prev[property]) var itemIndex = prev[property].getAttribute(property + elements.index);
            }

            // if there wasnt a previously selected item index for the current element 
            if(!itemIndex){
                
                // get the length of the array of list items in the currently selected element
                var len = temp.items.length;

                // then find the position of scroll that we are currently at for the newly selected element
                // use the length as a boundry marker in the scroll function
                var itemIndex = app.scroll.verticle().infinite(prev.itemIndex || 1, 1, len);
            }

            // if there has been a change, or if the previous item index is not the same as the current
            if(change || itemIndex && prev.itemIndex !== itemIndex){

                // if there has been a change but there is no previously selected list item for the
                // currently selected element
                if(change && !prev[property]){

                    // get the element listed as the default value for selection
                    var element = app.dom.findElementByTag('default', temp.items, true);

                }else{

                    // get the element at the currently selected list items index
                    var element = app.dom.findElementByTag(property + elements.index, temp.items, itemIndex);
                }

                // hide the previously selected list item for the currently selected element
                if(prev[property] && !change) prev[property].style.display = 'none';

                // display the currently selected list item
                element.style.display = elements.display ? elements.display : '';

                // save the currently selected list item for use as the last selected item
                // in the currently selected element in case we need to move back to it
                prev[property] = element;

                // save the currently selected index as a comparison to possibly changed indexes in the future
                prev.itemIndex = Number(itemIndex);

                // get the value of the selected attribute
                var value = element.getAttribute(elements.attribute);

                // if the description from properties is an object then use the current value as a key 
                // for that object in order to display a description for each list item, rather then its 
                // parent element as a whole
                if ( typeof (properties[property].description) === 'object' )
                    app.type.letters(temp.text, properties[property].description[value]);

                // return the selected property and its value
                return {
                    property:property, 
                    value:value
                };
            }
            touched = undefined;
            return property;
        },

        select: function (element, display, max, infiniteScroll, min) {

            var index, min = (min || 0), horizon, modeOptionsActive = app.menu.active();
            var limit = infiniteScroll && !modeOptionsActive ? 'infinite' : 'finite';

            // if the index is not the same as it was prior, then highlight the new index ( new element )
            if (prevIndex === undefined || prevIndex !== selectionIndex && prevIndex !== false || app.key.pressed(app.key.left()) || app.key.pressed(app.key.right()) || loop) {

                // if there is a sub menu activated then select from the sub menu element instead of its parent
                if (modeChildElement) {
                    // keep track of selected parent element
                    parentIndex = parentIndex || selectionIndex;
                    element = modeChildElement.element;
                    if(!modeOptionsActive || loop)
                        selectionIndex = modeChildElement.index;

                } else if (!modeOptionsActive && loop){
                    selectionIndex = parentIndex || selectionIndex;
                    prevIndex = parentIndex;
                    loop = false;
                    parentIndex = undefined;
                }

                if (selectionIndex < min) 
                    selectionIndex = min;

                // get the children
                var children = element.childNodes;
                if (!children) console.log(element);
                len = app.dom.length(children, min) - 1;

                // hide elements to create scrolling effect
                app.effect.hideOffScreenElements(children, selectionIndex, min, max || len);

                // scroll information about the selected element in the footer
                if ((selectedElement = children[selectionIndex]))
                    scrollText('footerText', app.settings.scrollMessages[selectedElement.getAttribute('id')]);

                // callback that defines how to display the selected element ( functions located in app.effect )
                if (selectedElement || loop) selectable = display(selectedElement, selectionIndex, prevElement, children); 
                
                // store the last index for future comparison
                prevIndex = selectionIndex;
                prevElement = selectedElement;
            }

            // if the select key has been pressed and an element is available for selection then return its id
            if (app.key.pressed(app.key.enter()) && selectedElement && selectable) {

                selectionIndex = min;
                app.menu.deactivate();
                parentIndex = undefined;
                modeChildElement = undefined;
                prevIndex = undefined;
                hide = undefined;
                app.key.undo(app.key.enter());
                return {
                    action: selectedElement.childNodes[0] ? selectedElement.childNodes[0].innerHTML : selectedElement.innerHTML,
                    id : selectedElement.getAttribute('id')
                };

            } else {
                index = app.scroll[this.direction || 'verticle']()[limit](selectionIndex, min, len);
                if (index || index === min) selectionIndex = index;
            }
            return false;
        },
        horizontal: function () {
            this.direction = 'horizontal';
            return this;
        },
        verticle: function () {
            this.direction = 'verticle';
            return this;
        }
    };
}();