/* ------------------------------------------------------------------------------------------------------*\
   
   handles all the display screens and the users interaction with them
   
\* ------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
var scrollText = require('../tools/scrollText.js');
socket = require('../tools/sockets.js');
app.game = require('../menu/game.js');
app.actions = require('../game/actions.js');
app.options = require('../game/options.js');
app.settings = require('../settings/game.js');
app.animate = require('../game/animate.js');
app.effect = require('../game/effects.js');
app.scroll = require('../menu/scroll.js');
app.buildings = require('../objects/buildings.js');
app.modes = require('../menu/modes.js');
app.dom = require('../tools/dom.js');
app.undo = require('../tools/undo.js');
app.calculate = require('../game/calculate.js');
app.draw = require('../game/draw.js');
app.co = require('../objects/co.js');

module.exports = function () {

    var sideX, sideY, selectionIndex = 1, previousList, previousListLength, selectedElement, hide, len, prevX, prev = {}, temp = {}, selectable = true, prevIndex = undefined,
    optionsActive, unitSelectionActive = false, loop = false, modeChildElement, parentIndex, prevElement, selectedElementId;

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

    // format is where the login is coming from, allowing different actions for different login sources
    var loginToSetup = function (user, format){

        if(user && user.id) {
    
            app.user = user;
            console.log(socket);
            socket.emit('addUser', user);

            if(!app.testing){
                // remove login screen
                var loginScreen = document.getElementById('login');
                    loginScreen.parentNode.removeChild(loginScreen);
            }

            // display the game selection menu
            selectMode();
            return true;
        }
    };

    var selectMode = function () { 

        // height of each mode element
        var height = app.settings.selectedModeHeight;

        // menu layout
        var menu = app.settings.selectModeMenu;

        // (war room, campaign) eventually integrate ai opponents?
        var setupScreen = document.createElement('article');
        setupScreen.setAttribute('id','setupScreen');

        // create title to display on page
        var title = document.createElement('h1');
        title.setAttribute('id', 'title');
        title.innerHTML = 'Select*Mode';
        setupScreen.appendChild(title);

        // create list of selectable modes
        var selectMenu = document.createElement('ul');
        selectMenu.setAttribute('id', 'selectModeMenu');

        // create footer for game info and chat
        var footer = document.createElement('footer');
        var info = document.createElement('p');
        var footSpan = document.createElement('span');
        footSpan.setAttribute('id','footerText');
        info.appendChild(footSpan);
        info.setAttribute('id', 'scrollingInfo');
        footer.setAttribute('id','footer');
        footer.appendChild(info);

        // create and insert information for each mode
        for( var m = 0; m < menu.length; m += 1){

            var mi = menu[m];
            var color = app.hsl(app.settings.colors[mi.id]);

            // block is the background bar
            var block = document.createElement('div');
            block.setAttribute('class', 'block');
            block.style.backgroundColor = color;

            var background = document.createElement('div');
            background.setAttribute('class', 'modeBackground');

            // span is to make a background around the text
            var span = document.createElement('span');
            span.setAttribute('class', 'textBackground');
            span.innerHTML = mi.display;

            // set displayed text for mode selection
            var text = document.createElement('h1');
            text.setAttribute('class', 'text');
            text.style.borderColor = color;
            text.appendChild(span);

            // create li item for each mode
            var item = document.createElement('li');
            item.setAttribute('class','modeItem');
            item.setAttribute('modeItemIndex', m + 1);
            item.setAttribute('id', mi.id);
            item.style.height = height;
            item.style.color = color;
            item.appendChild(background);
            item.appendChild(block);
            item.appendChild(text);

            // if there are further options for the mode
            if(mi.options){

                // create list of options
                var options = document.createElement('ul');
                var length = mi.options.length;
                options.setAttribute('class', 'modeOptions');

                // default to not showing options (hide them when not selected)
                options.style.opacity = 0;

                for(var o = 0; o < length; o += 1){

                    // create li item for each option
                    var option = document.createElement('li');
                    option.setAttribute('class', 'modeOption');
                    option.setAttribute('modeOptionIndex', o + 1);
                    option.setAttribute('id', mi.options[o] + mi.id);

                    // create id and display name for each option
                    option.innerHTML = mi.options[o];

                    // add each option to options list
                    options.appendChild(option);
                }
                // add options to the item
                item.appendChild(options);
            }
            // add items to select menu
            selectMenu.appendChild(item);
        }
        // add select menu to select mode screen
        setupScreen.appendChild(selectMenu);
        setupScreen.appendChild(footer);

        // insert select mode screen into dom
        var ss = document.getElementById('setupScreen');
        if(ss) {
            ss.parentNode.replaceChild(setupScreen, ss);
        }else{
            document.body.insertBefore(setupScreen, app.domInsertLocation);
        }
    };

    var login = function () {

        if(!app.testing) {

            // create login screen
            var loginScreen = document.createElement('article');
            loginScreen.setAttribute('id', 'login');

            // create button for fb login
            var fbButton = document.createElement('fb:login-button');
            fbButton.setAttribute('scope', 'public_profile, email');
            fbButton.setAttribute('onLogin', 'app.display.checkLoginState();');
            fbButton.setAttribute('id', 'fbButton');

            // create a holder for the login status
            var fbStatus = document.createElement('div');
            fbStatus.setAttribute('id', 'status');

            loginScreen.appendChild(fbButton);
            loginScreen.appendChild(fbStatus);

            document.body.insertBefore(loginScreen, app.domInsertLocation);

            window.fbAsyncInit = function() {
                FB.init({
                    appId      : '1481194978837888',
                    cookie     : true,  // enable cookies to allow the server to access 
                    xfbml      : true,  // parse social plugins on this page
                    version    : 'v2.3' // use version 2.2
                });

                FB.getLoginStatus(function(response) {
                    statusChangeCallback(response);
                });
            };

            // Load the SDK asynchronously
            (function(d, s, id) {

                var js, fjs = d.getElementsByTagName(s)[0];

                if (d.getElementById(id)) return;

                js = d.createElement(s); js.id = id;
                js.src = "//connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);

            }(document, 'script', 'facebook-jssdk'));
        }else{
            loginToSetup({
                email: "testUser@test.com",
                first_name: "Testy",
                gender: "male",
                id: "10152784238931286",
                last_name: "McTesterson",
                link: "https://www.facebook.com/app_scoped_user_id/10156284235761286/",
                locale: "en_US",
                name: "Testy McTesterson"
            });
        }

        // move to game setup
        app.game.setup();
    };

    // Here we run a very simple test of the Graph API after login is
    // successful.  See statusChangeCallback() for when this call is made.
    var testAPI = function () {
        FB.api('/me', function(response) {
            return loginToSetup(response, 'facebook');
        });
    };

    // allow login through fb ---- fb sdk
    // This is called with the results from from FB.getLoginStatus().
    var statusChangeCallback = function (response) {
        // if connected then return response
        if (response.status === 'connected') {
            return testAPI();
        } else if (response.status === 'not_authorized') {
            document.getElementById('status').innerHTML = 'Log in to play JS-WARS!';
        } else {
            document.getElementById('status').innerHTML = 'Please log in to facebook if you want to use fb login credentials';
        }
    };

    var optionsHud = function () {
        var elements = {
            section: 'optionsMenu',
            div: 'optionSelect'
        };
        var element = displayInfo(app.settings.options, app.settings.optionsDisplay, elements, 'optionSelectionIndex', true);
        if (element) {
            optionsActive = true;
            return element;
        }
        return false;
    };

    // display damage percentage
    var damageDisplay = function (percentage){

        var exists = document.getElementById('damageDisplay');
        var damageDisp = document.createElement('div');
        var damageDiv = document.createElement('div');

        damageDisp.setAttribute('id', 'damageDisplay'); 
        damageDiv.setAttribute('id', 'damage');

        var heading = document.createElement('h1');
        var percent = document.createElement('h2');

        heading.innerHTML = 'DAMAGE';
        percent.innerHTML = percentage + '%';

        damageDisp.appendChild(heading);
        damageDiv.appendChild(percent);
        damageDisp.appendChild(damageDiv);
        if(exists){
            exists.parentNode.replaceChild(damageDisp, exists);
        }else{
            document.body.insertBefore(damageDisp, app.domInsertLocation);
        }
    };

    var coStatus = function (player) {

        if (sideX !== temp.side || unitSelectionActive) {

            temp.side = sideX;

            var coHud = document.getElementById('coStatusHud');

            // create container section, for the whole hud
            var hud = document.createElement('section');
            hud.setAttribute('id', 'coStatusHud');
            if (sideX === 'left' && !unitSelectionActive) hud.style.left = '864px';
            unitSelectionActive = false;

            // create a ul, to be the gold display
            var gold = document.createElement('ul');
            gold.setAttribute('id', 'gold');

            // create a canvas to animate the special level 
            var power = document.createElement('canvas');
            var context = power.getContext(app.ctx);
            power.setAttribute('id', 'coPowerBar');
            power.setAttribute('width', 310);
            power.setAttribute('height', 128);

            // create the g for  gold
            var g = document.createElement('li');
            g.setAttribute('id', 'g');
            g.innerHTML = 'G.';
            gold.appendChild(g);

            // add the amount of gold the player currently has
            var playerGold = document.createElement('li');
            playerGold.setAttribute('id', 'currentGold');
            playerGold.innerHTML = player.gold;
            gold.appendChild(playerGold);

            // put it all together and insert it into the dom
            hud.appendChild(gold);
            hud.appendChild(power);

            if (coHud) {
                coHud.parentNode.replaceChild(hud, coHud);
            } else {
                document.body.insertBefore(hud, app.domInsertLocation);
            }

            // return the context for animation of the power bar
            return context;
        }
        return false;
    };

    var action = function (actions) {
        app.actions.activate();
        unitSelectionActive = true;
        var elements = {
            section: 'actionHud',
            div: 'actions'
        };
        displayInfo(actions, app.settings.actionsDisplay, elements, 'actionSelectionIndex', true);
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

        for (var n = 0; n < propName.length; n += 1) {
            if (allowed.hasValue(propName[n])) {
                properties[propName[n]] = {
                    property: propName[n].uc_first(),
                    value: props[propName[n]]
                };
            }
        }

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
            var list = createList(props, key, allowedProperties, tag);

            if(props.id || props.id === 0) list.ul.setAttribute('id', props.id);

            if (tag) list.ul.setAttribute(tag, u + 1);

            if(inner) list.ul.setAttribute('class', inner + 'Item');  

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
        if (!prevIndex || prevIndex !== selectionIndex || app.key.pressed('left') || app.key.pressed('right') || loop) {
        
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
            key = app.key;
            undo = app.undo.keyPress;

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
            if (selectedElement || loop){
                selectable = display(selectedElement, tag, selectionIndex, prevElement, elements);
            } 

            // store the last index for future comparison
            prevIndex = selectionIndex;
            prevElement = selectedElement;
        }

        // if the select key has been pressed and an element is available for selection then return its id
        if (key.pressed('enter') && selectedElement && selectable) {

            selectionIndex = 1
            app.modes.deactivate();
            parentIndex = undefined;
            modeChildElement = undefined;
            prevIndex = undefined;
            hide = undefined;
            undo(key.select);

            return selectedElement.getAttribute('id');
            // if the down key has been pressed then move to the next index ( element ) down
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
        
        // if a specific display value hasnt been set then default to an empty string
        var display = elements.display ? elements.display : '';

        // get properties from the object being displayed and use them to retrieve indexes, descriptions etc
        var properties = elements.properties;

        // create list of property names accessable to the player (object keys)
        if(player){
            var co = app.game.coSelection(properties, previousList, prev.items);
            var list = co.list;
            var ind = co.ind;
        }else{
            var list = Object.keys(properties);
        }

        var listLength = list.length;

        // keep track of what is selected in the list for recall
        if(previousListLength !== listLength && prev.items && player) prev.items = list.indexOf(ind);
        
        // get the currently selected index, start with 0 if one has not yet been defined
        var index = app.scroll.horizontal().infinite(prev.items || 0, 0, list.length - 1);

        // get the property name of the currently selected index for use in retrieving elements of the same name
        var property = list[index];

        // get the element that displays the text: descriptions, chat etc...
        if(!temp.text) temp.text = document.getElementById(elements.text);

        // if there arent any previous indexes (we have just started) or the last index is not
        // the same as the current index then manipulate the newly selected element
        if(prev.items === undefined || prev.items !== index || previousListLength !== listLength){
            
            previousList = list;
            previousListLength = listLength;

            // if the description for the current element is text then print it
            if(!properties[property].description) console.log(properties);
            if ( typeof (properties[property].description) === 'string' ){
                app.effect.typeLetters(temp.text, properties[property].description);
            }
            
            // indicate that we have changed elements
            var change = true;

            // callback that handles what to do with horizontally scrolled elements
            var selected = callback(property);

            // get all the list items from the currently selected element
            temp.items = app.dom.getImmediateChildrenByTagName(selected, 'li');

            // save the currently selected index as a comparison to possibly changed indexes in the future
            prev.items = index;

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
            element.style.display = display;

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
        return false;
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
            var buildings = displayInfo(num, app.settings.buildingDisplay, buildingElements, 'building');

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

    // get information on terrain and return an object with required information for display
    var terrainInfo = function (info) {
        
        var list;
        
        // if there is a selectable element then return its info
        if (info !== undefined && info.stat !== false) {

            // get information from the map to return on the currently hovered over map square
            var object = app.map[info.objectClass][info.ind];

            // create a ul with the information
            list = createList(object, info.objectClass, app.settings.hoverInfo, 'hud');

            // return the list of information
            return {
                ul: list.ul,
                ind: info.ind,
                canvas: list.canvas,
                type: object.type
            };

            // if there is nothing found it means that it is plains, return the default of the plain object
        } else if (info.objectClass === 'terrain') {

            // make a list with info on plains
            list = createList(app.map.plain, info.objectClass, app.settings.hoverInfo, 'hud');

            // return the list
            return {
                ul: list.ul,
                ind: false,
                canvas: list.canvas,
                type: 'plain'
            };
        }
        return false;
    };

    // create a canvas to display the hovered map element in the hud
    var createCanvas = function (canvasId, type, dimensions, objectClass) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                

        var canvas = document.createElement('canvas'); // create canvas
        var context = canvas.getContext(app.ctx); // get context

        // set width, height and id attributes
        canvas.setAttribute('width', dimensions.width);
        canvas.setAttribute('height', dimensions.height);
        canvas.setAttribute('id', type + canvasId + 'Canvas');

        // return canvas info for further use
        return {
            canvas: canvas,
            context: context,
            type: type,
            objectClass: objectClass
        };
    };

    var createList = function (object, id, displayedAttributes, canvasId) {
        
        if (canvasId && displayedAttributes !== '*' && displayedAttributes.hasValue('canvas')) {
            // create canvas and add it to the object
            var canvas = createCanvas(canvasId, object.type, {width:128, height:128}, id);
            object.canvas = canvas.canvas;
        }

        // get a list of property names
        var properties = Object.keys(object);

        // create an unordered list and give it the specified id
        var ul = document.createElement('ul');
        ul.setAttribute("id", id);
        if(object.id) ul.setAttribute('itemNumber', object.id);

        var ind = 0;

        // go through each property and create a list element for ivart, then add it to the ul;
        for (var i = 0; i < properties.length; i += 1) {

            // properties
            var props = properties[i];

            // only use properties specified in the displayed attributes array
            if (displayedAttributes === '*' || displayedAttributes.hasValue(props) || displayedAttributes.hasValue('num') && !isNaN(props)) {

                ind += 1;

                // create list element and give it a class defining its value
                var li = document.createElement('li');
                li.setAttribute('class', props);
                if (object.ind){
                    li.setAttribute( id + 'Index', ind);
                }

                if(object.hide) li.style.display = 'none';
                
                // if the list element is a canvas then append it to the list element
                if (props === 'canvas') {
                    li.appendChild(object[props]);

                    // if the list is an object, then create another list with that object and append it to the li element
                } else if( typeof (object[props]) === 'object') {
                    var list = createList(object[props], props, displayedAttributes);
                    li.appendChild(list.ul);

                    // if the list element is text, add it to the innerHTML of the li element
                } else {
                    li.innerHTML = object[props];
                }
                // append the li to the ul
                ul.appendChild(li);
            }
        }
        // return the ul and canvas info
        return {
            ul: ul,
            canvas: canvas
        };
    };

    // display informavartion on currently selected square, and return selectable objects that are being hovered over
    var displayHUD = function () {

        // unset cursor move
        app.def.cursorMoved = false;

        sideX = app.calculate.side('x');
        sideY = app.calculate.side('y');

        // create hud element or remove the existing element
        var exists = document.getElementById('hud');
        var display = document.createElement('div');
        display.setAttribute('id', 'hud');
        var object;
        // array holds what properties should exist in hud
        // array of map elements, ordered by which will be selected and displayed over the other
        var canvas = [];
        var properties = [];
        var selected = ['unit', 'building', 'terrain'];

        // move through each possible map element, display informavartion to 
        // the dom and return info on selectable map elements
        for (var x = 0; x < selected.length; x += 1) {

            // check if the currsor is over the map element type, 
            // if so get the coordinates and info on the map element
            var hovering = terrainInfo(app.select.hovered(selected[x]));

            // if the cursor is over the current map element...
            if (hovering) {

                // add canvas image to its array if exists
                if (hovering.canvas) canvas.push(hovering.canvas);

                // push the map element type into the props array so that
                // a diff can be performevard between it and the current dom
                properties.push(selected[x]);

                // if the map element needs to be added to the dom then do so
                if (hovering.ul) {
                    display.appendChild(hovering.ul);
                }

                // if the return value has not been set, ( meaning the previous map element is not being hovered over)
                // then set it for tvarhe current map element ( which is being hovered over )
                if (selected[x] === 'unit' || properties[0] !== 'unit') {
                    object = {
                        objectClass: selected[x],
                        ind: hovering.ind
                    };
                }
                if (selected[x] === 'building') break;
            }
        }

        // apply proper width to element 
        var displayWidth = app.settings.hudWidth * properties.length;
        var hudLeft = app.settings.hudLeft - 120;

        // if there is more then one element to display then double the width of the hud to accomidate the difference
        display.style.left = properties.length > 1 ? hudLeft.toString() + 'px' : app.settings.hudLeft.toString() + 'px';
        display.style.width = displayWidth.toString() + 'px';
        display.style.height = app.settings.hudHeight.toString() + 'px';

        // if the element already exists then replace it
        if (exists) {
            exists.parentNode.replaceChild(display, exists);

            // otherwise insert it into the dom
        } else {
            document.body.insertBefore(display, document.getElementById("before"));
        }

        // if there was a canvas elemnt added for display, then render it
        if (canvas) {
            for (var c = 0; c < canvas.length; c += 1) {
                if (canvas[c].objectClass !== 'unit' && canvas.length > 1) canvas[c].canvas.setAttribute('class', 'secondHudCanvas');
                app.draw(canvas[c].context).hudCanvas(canvas[c].type, canvas[c].objectClass);
            }
        }
        return object;
    };

    // hide an element
    var hideElement = function (hideElement) {
        // get  element
        var hidden = document.getElementById(hideElement);

        // hide element
        hidden.style.display = 'none';
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

    var settingsOrTeamsDisplay = function (elements, element, back) {

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

        var display = app.display[elements.type](element, textField, back);

        return display;
    };

    var arrow = {
        up: function () {

            var exists = document.getElementById('upArrowOutline');

            var upArrowBackground = document.createElement('div');
            upArrowBackground.setAttribute('id','upArrowBackground');
            upArrowBackground.setAttribute('class','upArrow');

            var upArrowOutline = document.createElement('div');
            upArrowOutline.setAttribute('id','upArrowOutline');
            upArrowOutline.setAttribute('class','upArrow');

            upArrowOutline.appendChild(upArrowBackground);

            if(exists){
                //exists.parentNode.replaceChild(upArrowOutline, exists);
                //return false;
                return upArrowOutline;
            }else{
                return upArrowOutline;
            }
        },
        down: function () {

            var exists = document.getElementById('downArrowOutline');

            var downArrowBackground = document.createElement('div');
            downArrowBackground.setAttribute('id','downArrowBackground');
            downArrowBackground.setAttribute('class','downArrow');

            var downArrowOutline = document.createElement('div');
            downArrowOutline.setAttribute('id','downArrowOutline');
            downArrowOutline.setAttribute('class','downArrow');

            downArrowOutline.appendChild(downArrowBackground);

            if(exists){
                //exists.parentNode.replaceChild(downArrowOutline, exists);
                //return false;
                return downArrowOutline;
            }else{
                return downArrowOutline;
            }        
        }
    };

    var inputForm = function (name, element, placeHolder) {

        var input = document.createElement('p');
        input.setAttribute('class', 'inputForm');
        input.setAttribute('id', name + 'Form');
        var text = document.createElement('input');

        text.setAttribute('id', name + 'Input');
        text.setAttribute('class','textInput');
        text.setAttribute('autocomplete','off');
        text.setAttribute('type','text');

        if (placeHolder) text.setAttribute('placeholder', placeHolder);

        text.style.width = element.offsetWidth;
        input.appendChild(text);

        return input;
    };

    var settings = function (element, textField, back) {

        var allowed = ['on', 'off', 'num', 'clear', 'rain', 'snow', 'random', 'a', 'b', 'c']
        var settings = app.game.settings();
        var rules = app.settings.settingsDisplayElement;
        var keys = Object.keys(rules);
        var len = keys.length;
        var offScreen = Number(app.offScreen);

        var cont = document.createElement('section');
        cont.setAttribute('id', 'settings');

        var width = element.offsetWidth;
        var height = element.offsetHeight;

        var left = width * .05;
        var middle = height * .5;
        var top = back ? middle - offScreen : middle + offScreen;
        var id = 0;

        var nameInput = inputForm('name', textField, 'Enter name here.');
        textField.appendChild(nameInput);

        for (var i = 0; i < len; i += 1){

            var div = document.createElement('div');
            var stable = document.createElement('div');

            var property = keys[i];
            var rule = rules[property];
            rule.hide = true;
            rule.ind = true;

            if (rule.inc){
                for (var n = rule.min; n <= rule.max; n += rule.inc){
                    rule[n] = n;
                }
            }

            var heading =document.createElement('h1');
            heading.innerHTML = property;

            var ul = createList(rule, property + 'Settings', allowed).ul;

            div.setAttribute('id', property + 'Background');
            div.setAttribute('class', 'rules');

            stable.setAttribute('id', property + 'Container');
            stable.setAttribute('class', 'stable');

            stable.appendChild(heading);

            div.style.left = left + 'px';
            div.style.top = top + 'px';

            stable.style.left = left + 'px';
            stable.style.top = top + 'px';

            left += .13 * width;
            top -= .06 * height;

            var list = app.dom.getImmediateChildrenByTagName(ul, 'li');
            var show = app.dom.findElementByTag('class', list, settings[property]);

            app.dom.show(show, list, 'inline-block');

            stable.appendChild(ul);
            cont.appendChild(stable);
            cont.appendChild(div);
        }

        var up = arrow.up();
        var down = arrow.down();
        if (up) cont.appendChild(up);
        if (down) cont.appendChild(down);
        element.appendChild(cont);

        return cont;
    };

    var teams = function (element, textField) {

        var cos = app.co;
        var coList = Object.keys(cos);
        var len = coList.length;
        var elem = {};
        var obj = {};
        var teamElements = {};
        var height = element.offsetHeight;
        var width = element.offsetWidth;
        var size = 200;
        var fontSize = size / 4;
        var nop = app.game.numOfPlayers();
        var top = (height * .3) + app.offScreen;
        var exists = document.getElementById('teams');
        var teams = document.createElement('article');
        teams.setAttribute('id','teams');

        var chatScreen = document.getElementById('descriptionOrChatScreen');
        var chat = inputForm('chat', chatScreen, 'type here to chat with other players');

        chatScreen.appendChild(chat);

        if(nop > 2) {
            var teamProperties = {
                ind: true,
                hide: true,
                description:'Set alliances by selecting the same team.'
            };
            var allowed = [];
            var teamArr = ['a','b','c','d'];
            for(var i = 0; i < nop; i += 1){
                var t = teamArr[i];
                allowed[i] = t;
                teamProperties[t] = t.toUpperCase() + 'Team';
            }
            var teamSelect = true;
        }

        for (var p = 1; p <= nop; p += 1){

            var ind = p - 1;
            var playa = 'player' + p;
            var pName = p+'p';
            var modes = {
                ind: true, 
                hide:true, 
                Cp:'Cp',
                description: 'Chose Player or Computer.'
            };

            var modeAllow = ['Cp', pName];
            var sections =  width / nop;
            var position = (sections * ind) + ((sections - size) / 2);

            var player = document.createElement('section');

            player.setAttribute('id','player' + p);
            player.setAttribute('class','players');
            player.style.width = size + 'px';
            player.style.height = size + 'px';
            player.style.left = position + 'px';
            player.style.top = top + 'px';

            var coId = playa +'co';
            var modeId = playa + 'mode';

            elem[coId] = {description: 'Chose a CO.'};

            for(var i = 0; i < len; i += 1){
                var name = coList[i];
                var co = cos[name];
                elem[coId][name] = {
                    name:co.name,
                    image:co.image
                }
                obj[name] = name;
            }

            modes[pName] = pName;

            elem[modeId] = modes;

            obj.ind = true;
            obj.hide = true;

            var modeUl = createList(modes, modeId, modeAllow).ul;
            modeUl.setAttribute('class','playerMode');
            modeUl.style.fontSize = fontSize + 'px';
            modeUl.style.left = size - (fontSize / 2) + 'px';

            var coUl = createList(obj, coId, coList).ul;
            coUl.setAttribute('class','coList');

            var users = app.game.players()[ind];

            if(users && users.mode) pName = users.mode;

            var modeList = app.dom.getImmediateChildrenByTagName(modeUl, 'li');
            var list = app.dom.getImmediateChildrenByTagName(coUl, 'li');

            if(users && users.co){
                var co = app.dom.show(app.dom.findElementByTag('class', list, users.co), list);
            }else{
                var co = app.dom.show(app.dom.findElementByTag(coId + 'Index', list, p), list);
            }

            var mode = app.dom.show(app.dom.findElementByTag('class', modeList, pName), modeList);

            if(teamSelect){
                teamElements[ playa + 'Team'] = teamProperties;
                var id = playa + 'Team';
                var teamsElement = createList(teamProperties, id, allowed).ul;
                teamsElement.setAttribute('class', 'team');
                teamsElement.style.width = size + 'px';
                teamsElement.style.top = size * 4 + 'px';
                var teamList = app.dom.getImmediateChildrenByTagName(teamsElement, 'li');
                var def = users && users.team ? users.team : teamArr[ind];
                var team = app.dom.show(app.dom.findElementByTag('class', teamList, def), teamList);
            }

            if(!users){
                app.game.setUserProperties(modeId, mode);
                app.game.setUserProperties(coId, co);
                if (teamSelect){
                    app.game.setUserProperties(id, team);
                }
            }

            player.appendChild(modeUl);
            player.appendChild(coUl);
            if (teamSelect) player.appendChild(teamsElement);

            teams.appendChild(player);
        }

        var up = arrow.up();
        var down = arrow.down();

        if (up) teams.appendChild(up);
        if (down) teams.appendChild(down);

        app.settings.playersDisplayElement = elem;
        if(teamSelect) app.settings.teamsDisplayElement = teamElements;

        if(exists){
            element.replaceChild(teams, exists);
        }else{
            element.appendChild(teams);
        }
        return teams;
    };

    return {

        info: displayInfo,
        selectModeMenu:selectMode,
        selectionInterface: selectionInterface,
        select: select,
        damage: damageDisplay,
        mapInfo: selectedMap,
        settingsOrTeamsDisplay:settingsOrTeamsDisplay,
        complexSelect:complexSelect,
        rules:settings,
        teams:teams,
        login:login,
        clear: function () {temp = {}; prev = {};},
        clearLastItem: function () { delete prev.items; },
        reset: function () {selectionIndex = 1},
        index: function () {return selectionIndex},
        previousIndex: function () {return prevIndex;},
        resetPreviousIndex: function () {prevIndex = undefined;},
        loop: function () {loop=true},
        through: function (){loop=false},
        menuItemOptions: function ( selectedElement, menu ) {
            var previous = prev.horizon;
            var horizon = app.scroll.horizontal().finite(previous || 1, 1, 2);
            if(menu) menu.style.opacity = 1;

            // display the menu options
            if(horizon && previous !== horizon){

                var modeOptionsActive = app.modes.active();

                if(horizon === 1 && modeOptionsActive){
                    app.modes.deactivate();
                    modeChildElement = undefined;
                }else if(horizon === 2 && !modeOptionsActive){
                    app.modes.activate();
                    modeChildElement = {
                        element:menu,
                        tag:'modeOptionIndex',
                        index:1
                    }
                }
                app.effect.clear();
                prev.horizon = horizon;
                loop = true;
            }
        },
        mapOrGame:function(type, items) {
            return mapOrGameDisplay(type, items);
        },

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
            var actions = Object.keys(options);
            var actionsObj = {};
            for (var a = 0; a < actions.length; a += 1) {
                actionsObj[actions[a]] = { name: actions[a] };
            }
            hideElement('coStatusHud'); // hide co status hud
            action(actionsObj);
            return this;
        },

        listen: function () {

            var selection;

            // if the options hud has been activated 
            if (app.actions.active() && app.select.active()) {

                // make the options huds list items selectable
                selection = select('actionSelectionIndex', 'actions', app.effect.highlightListItem, 'ul');
            }else if(app.options.active()){
                selection = select('optionSelectionIndex', 'optionsMenu', app.effect.highlightListItem, 'ul');
            }

            // if one has been selected activate the corresponding method from the options class
            if (selection) {
                if(app.actions.active()){
                    app.actions[selection]();
                    app.undo.hudHilight();
                    app.undo.display('actionHud');
                    app.select.deselect();
                    app.def.cursorMoved = true;
                } if(app.options.active() && !app.actions.active() ){
                    app.options[selection]();
                    app.undo.all(); // remove display
                }
            }
            return this;
        },

        // display terrain info
        hud: function () {
            // if the cursor has been moved, and a selection is active then get the display info for the new square
            if (app.def.cursorMoved && !app.select.active()) app.select.display(displayHUD());
            return this; 
        },

        options: function () {

            var exit = app.key.esc;

            // if nothing is selected and the user presses the exit key, show them the options menu
            if (exit in app.keys && !app.select.active() && !app.actions.active() ) {
                app.undo.keyPress(exit);
                app.options.activate(); // set options hud to active
                app.select.activate(); // set select as active
                optionsHud(); // display options hud
                hideElement('coStatusHud'); // hide co status hud
            }
            return this;
        },

        coStatus: function () {
            if (!app.options.active() && !app.actions.active()) coStatus(app.game.currentPlayer());
            return this;
        },

        path: function (cursor) {
            // get the range
            var grid = app.select.range().slice(0);

            // calculate the path to the cursor
            var p = app.calculate.path(app.select.unit(), cursor, grid);

            // if there is a path then set it to the path highlight effect for rendering
            if (p) app.effect.path = app.effect.path.concat(p);

            // animate changes
            window.requestAnimationFrame(app.animate('effects'));
        },

        range: function () {
            // set the range highlight to the calculated range
            app.effect.highlight = app.effect.highlight.concat(app.select.range());

            // animate changes
            window.requestAnimationFrame(app.animate('effects'));
        }
    };
}();