/* ------------------------------------------------------------------------------------------------------*\
   
   handles all the display screens and the users interaction with them
   
\* ------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
var scrollText = require('../tools/scrollText.js');
socket = require('../tools/sockets.js');
app.game = require('../game/game.js');
app.options = require('../menu/options.js');
app.settings = require('../settings/game.js');
app.animate = require('../game/animate.js');
app.effect = require('../game/effects.js');
app.scroll = require('../menu/scroll.js');
app.buildings = require('../definitions/buildings.js');
app.modes = require('../menu/modes.js');
app.dom = require('../tools/dom.js');
app.undo = require('../tools/undo.js');
app.calculate = require('../game/calculate.js');
app.draw = require('../game/draw.js');
app.co = require('../objects/co.js');
app.menu = require('../menu/menu.js');
app.screens = require('../objects/screens.js');
app.key = require('../tools/keyboard.js');
app.players = require('../controller/players.js');
app.cursor = require('../controller/cursor.js');


module.exports = function () {

    var sideX, sideY, selectionIndex = 1, previousList, touched, previousListLength, 
    selectedElement, hide, len, prevX, prevSelection, prev = {}, temp = {}, selectable = true, 
    prevIndex = undefined, unitSelectionActive = false, loop = false, 
    modeOptionIndex = false, modeChildElement, parentIndex, prevElement, selectedElementId;

    var catElements = {
        section: 'categorySelectScreen',
        div:'selectCategoryScreen'
    };

    var buildingElements = {
        section:'buildingsDisplay',
        div:'numberOfBuildings'
    };

    var chatOrDesc = {
        section:'descriptionOrChatScreen',
        div:'descriptionOrChat',
    };

    var unitInfo = function (building, unit, tag) {

        var elements = {
            section: 'unitInfoScreen',
            div: 'unitInfo'
        };

        var props = app.buildings[building][unit].properties;
        var allowed = app.settings.unitInfoDisplay;
        var properties = {};
        var propName = Object.keys(props);

        for (var n = 0; n < propName.length; n += 1)
            if (allowed.hasValue(propName[n]))
                properties[propName[n]] = {
                    property: propName[n].uc_first(),
                    value: props[propName[n]]
                };

        displayInfo(properties, allowed, elements, false, true);
    };

    var selectionInterface = function (building) {

        // get the selectable unit types for the selected building
        unitSelectionActive = true;
        var units = app.buildings[building];

        var elements = {
            section: 'buildUnitScreen',
            div: 'selectUnitScreen'
        };

        displayInfo(units, app.settings.unitSelectionDisplay, elements, 'unitSelectionIndex', true);
    };

    var displayInfo = function (properties, allowedProperties, elements, tag, insert) {
        
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
            var list = app.dom.createList(props, key, allowedProperties, tag);

            if(props.id || props.id === 0) list.ul.setAttribute('id', props.id);

            if (tag) list.ul.setAttribute(tag, u + 1);

            if(inner) list.ul.setAttribute('class', inner + 'Item');  

            if(tag === 'mapSelectionIndex' || tag === 'gameSelectionIndex') {
                app.touch(list.ul.childNodes[0]).mapOrGame().doubleTap();
            };

            // add list to the select screen
            innerScreen.appendChild(list.ul);
        }

        // add select screen to build screen container
        display.appendChild(innerScreen);

        if(insert){
            if (exists) {
                exists.parentNode.replaceChild(innerScreen, exists);
            } else {
                // insert build screen into dom
                document.body.insertBefore(display, app.domInsertLocation);
            }
        }
        return display;
    };

    var select = function (tag, id, display, elementType, max, infiniteScroll) {

        var index, horizon, modeOptionsActive = app.modes.active();
        var limit = infiniteScroll && !modeOptionsActive ? 'infinite' : 'finite';

        // if the index is not the same as it was prior, then highlight the new index ( new element )
        if (!prevIndex || prevIndex !== selectionIndex || app.key.pressed(app.key.left()) || app.key.pressed(app.key.right()) || loop) {

            // if there is a sub menu activated then select from the sub menu element instead of its parent
            if(modeChildElement){

                var hudElement = modeChildElement.element;

                // keep track of selected parent element
                parentIndex = parentIndex || selectionIndex;

                if(!modeOptionsActive || loop) selectionIndex = modeChildElement.index;

                tag = modeChildElement.tag;

            }else if(!modeOptionsActive){
                
                if(loop){
                    selectionIndex = parentIndex;
                    prevIndex = parentIndex;
                    loop = false;
                    parentIndex = undefined;
                }
                var hudElement = document.getElementById(id);
            }

            // get the children
            var elements = app.dom.getImmediateChildrenByTagName(hudElement, elementType);

            len = elements.length;

            // if there is no max set then set max to the length of he array
            if (!max) max = len;

            // hide elements to create scrolling effect
            if (selectionIndex > max) {
                hide = selectionIndex - max;

                for (var h = 1; h <= hide; h += 1) {

                    // find each element that needs to be hidden and hide it
                    var hideElement = app.dom.findElementByTag(tag, elements, h);
                    hideElement.style.display = 'none';
                }
            } else if (selectionIndex <= len - max && hide) {
                // show hidden elements as they are hovered over
                var showElement = app.dom.findElementByTag(tag, elements, selectionIndex);
                showElement.style.display = '';
            }

            selectedElement = app.dom.findElementByTag(tag, elements, selectionIndex);

            // scroll information about the selected element in the footer
            if(selectedElement) scrollText( 
                'footerText',
                app.settings.scrollMessages[selectedElement.getAttribute('id')]
            );

            // callback that defines how to display the selected element ( functions located in app.effect )
            if (selectedElement || loop)
                selectable = display( selectedElement, tag, selectionIndex, prevElement, elements); 
            
            // store the last index for future comparison
            prevIndex = selectionIndex;
            prevElement = selectedElement;
        }

        // if the select key has been pressed and an element is available for selection then return its id
        if (app.key.pressed(app.key.enter()) && selectedElement && selectable) {
            selectionIndex = 1
            app.modes.deactivate();
            parentIndex = undefined;
            modeChildElement = undefined;
            prevIndex = undefined;
            hide = undefined;
            app.key.undo(app.key.enter());
            return {
                action: selectedElement.childNodes[0].innerHTML,
                id : selectedElement.getAttribute('id')
            };
        }else{
            index = app.scroll.verticle()[limit](selectionIndex, 1, len);
            if(index) selectionIndex = index;
        }
        return false;
    };

    var complexSelect = function (elements, callback, player) {

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
        if((app.key.pressed() || !temp.list) && player && !app.players.empty()){
            var co = app.menu.coSelection(properties, previousList, prevSelection);
            temp.list = co.list;
            var ind = co.ind;
        }else if(!temp.list){
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
            if (property !== undefined && typeof (properties[property].description) === 'string' ){
                app.effect.typeLetters(temp.text, properties[property].description);
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

            if ( typeof (properties[property].description) === 'object' ){
                app.effect.typeLetters(temp.text, properties[property].description[value]);
            }

            // return the selected property and its value
            return {
                property:property, 
                value:value
            };
        }
        touched = undefined;
        return property;
    };

    var elementExists = function (id, element, parent){
        var exists = document.getElementById(id);
        if(exists){
            parent.replaceChild(element, exists);
        }else{
            parent.appendChild(element);
        }
    };

    var selectedMap = function (maps){

        // get setup screen
        var selector = document.getElementById('setupScreen');

        if(maps && maps.buildings){
            var map = maps;
        }else{
            var id = selectedElementId;
            var len = maps ? maps.length : 0;

            // get map
            for(var i = 0; i < len; i += 1){
                if(maps && maps[i].id == id){
                    var map = maps[i];
                    break;
                }
            }
        }

        if(map){
            // display number of buildings on the map
            var num = app.calculate.numberOfBuildings(map);
            var buildings = displayInfo(num, app.settings.buildingDisplay, buildingElements, 'buildings');

            elementExists(buildingElements.section, buildings, selector);

            /*var dimensions = {width:500, height:500};
            //display small version of map
            var canvas = createCanvas('Map', 'preview', dimensions);
            canvas.canvas.style.backgroundColor = 'white';
            var cid = canvas.canvas.getAttribute('id');
            // check if elements exist and replace them if they do, append them if they dont
            elementExists(cid, canvas.canvas);
            // draw map preview
            app.draw(canvas.context).mapPreview();*/
        }
        // return screen
        return selector;
    };

    // create page for selecting map or game to join/create
    var mapOrGameDisplay = function (elements, items) {

        // get the screen
        var selector = document.getElementById('setupScreen');

        // get the title and change it to select whatever type we are selecting
        title = selector.children[0];
        title.innerHTML = 'Select*'+ elements.type;

        // create elements
        var item = displayInfo(items, ['name'], elements, 'mapSelectionIndex');

        // display buildings and how many are on each map
        var buildings = displayInfo(app.settings.buildingDisplayElement, app.settings.buildingDisplay, buildingElements, 'building');

        // display catagories 2p, 3p, 4p, etc...
        var categories = displayInfo(app.settings.categories, '*', catElements, 'categorySelectionIndex');
        var cats = categories.children[0].children;

        // handle touch events for swiping through categories
        app.touch(categories).swipe();

        // hide categories for displaying only one at a time
        var len = cats.length;
        for(var c = 0; c < len; c += 1){
            cats[c].style.display = 'none';
        }

        // add elements to the screen
        selector.appendChild(buildings);
        selector.appendChild(item);
        selector.appendChild(categories);

        //return the modified screen element
        return selector;
    };

    return {
        info: displayInfo,
        selectionInterface: selectionInterface,
        select: select,
        mapInfo: selectedMap,
        complexSelect:complexSelect,
        setup: function (elements, element, back) {

            var chatOrDescription = displayInfo([], [], chatOrDesc, false, true);
            var textField = chatOrDescription.children[0];

            var chat = document.createElement('ul');
            var description = document.createElement('h1');

            chat.setAttribute('id','chat');
            description.setAttribute('id','descriptions');

            textField.appendChild(chat);
            textField.appendChild(description);

            // get the title and change it to select whatever type we are selecting
            title = element.children[0];
            title.innerHTML = elements.type;

            element.appendChild(chatOrDescription);

            var display = app.screens[elements.type](element, textField, back);

            return display;
        },
        clear: function () {temp = {}; prev = {};},
        clearOld: function () {
            prevSelection = undefined; 
            previousList = undefined; 
        },
        previous: function () {
            return {
                selection: prevSelection,
                list: previousList
            }
        },
        reset: function () {selectionIndex = 1},
        setIndex: function (index) {
            selectionIndex = index;
            touched = index;
        },
        setOptionIndex: function (index){modeOptionIndex = index;},
        index: function () {return selectionIndex},
        previousIndex: function () {return prevIndex;},
        setPreviousIndex: function (index) {prevIndex = index;},
        resetPreviousIndex: function () {prevIndex = undefined;},
        loop: function () {loop=true},
        through: function (){loop=false},
        menuItemOptions: function ( menu ) {

            var previous = prev.horizon;
            var horizon = app.scroll.horizontal().finite(previous || 1, 1, 2);

            if(menu) menu.style.opacity = 1;

            // display the menu options
            if(horizon && previous !== horizon){

                var modeOptionsActive = app.modes.active();
                index = modeOptionIndex ? modeOptionIndex : 1;

                if(horizon === 1 && modeOptionsActive){
                    app.modes.deactivate();
                    modeChildElement = undefined;
                }else if(horizon === 2 && !modeOptionsActive){

                    app.modes.activate();
                    modeChildElement = {
                        element:menu,
                        tag:'modeOptionIndex',
                        index:index
                    }
                }
                app.effect.clear();
                prev.horizon = horizon;
                modeOptionIndex = false;
                loop = true;
            }
        },
        mapOrGame:function(type, items) { return mapOrGameDisplay(type, items); },
        mapOrGameSelection: function (id, elements) {
            var replace = document.getElementById(id);
            replace.parentNode.replaceChild(elements, replace);
        },  
        checkLoginState: function () {
            FB.getLoginStatus(function(response) {
                statusChangeCallback(response);
            });
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

            unitSelectionActive = true;

            return displayInfo(
                actionsObj, 
                app.settings.actionsDisplay, 
                {
                    section: 'actionHud',
                    div: 'actions'
                }, 
                'actionSelectionIndex', 
                true
            );
        },

        gameNameInput:function(){

            var nameInput = document.getElementById('nameForm');
            var description = document.getElementById('descriptions');
            var upArrow = document.getElementById('upArrowOutline');
            var downArrow = document.getElementById('downArrowOutline');
            var name = document.getElementById('nameInput');

            description.style.paddingTop = '2%';
            description.style.paddingBottom = '1.5%';
            description.parentNode.style.overflow = 'hidden';

            nameInput.style.display = 'block';
            nameInput.style.height = '30%';

            name.focus();

            upArrow.style.display = 'none';
            downArrow.style.display = 'none';

            return {
                input: nameInput,
                description: description,
                upArrow:upArrow,
                downArrow:downArrow,
                name:name
            };
        }
    };
}();