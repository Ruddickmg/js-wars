/* ------------------------------------------------------------------------------------------------------*\
    
    app.hud handles all the display screens and the users interaction with them
\* ------------------------------------------------------------------------------------------------------*/

app.display = function () {

    var sideX, sideY, selectionIndex, selectedElement, hide, len, prevX;
    var optionsActive, unitSelectionActive = false;

    var optionsHud = function () {
        var elements = {
            section: 'optionsMenu',
            div: 'optionSelect'
        };
        var element = displayInfo(app.settings.options, app.settings.optionsDisplay, elements, 'optionSelectionIndex');
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
            document.body.insertBefore(damageDisp, document.getElementById('before'));
        }
    };

    var coStatus = function (player) {

        if (sideX !== app.temp.side || unitSelectionActive) {

            app.temp.side = sideX;

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
                document.body.insertBefore(hud, document.getElementById('before'));
            }

            // return the context for animation of the power bar
            return context;
        }
        return false;
    };

    var action = function (actions) {
        app.temp.actionsActive = true;
        unitSelectionActive = true;
        var elements = {
            section: 'actionHud',
            div: 'actions'
        };
        displayInfo(actions, app.settings.actionsDisplay, elements, 'actionSelectionIndex');
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
        displayInfo(properties, allowed, elements);
    };

    var selectionInterface = function (building) {
        // get the selectable unit types for the selected building
        unitSelectionActive = true;
        var units = app.buildings[building];
        var elements = {
            section: 'buildUnitScreen',
            div: 'selectUnitScreen'
        };
        displayInfo(units, app.settings.unitSelectionDisplay, elements, 'unitSelectionIndex', 7);
    };

    var displayInfo = function (properties, allowedProperties, elements, tag) {

        // build the outside screen container or use the existing element
        var display = document.createElement('section');
        display.setAttribute('id', elements.section);

        // build inner select screen or use existing one
        var exists = document.getElementById(elements.div);
        var innerScreen = document.createElement('div');
        innerScreen.setAttribute('id', elements.div);

        // get each unit type for looping over
        var keys = Object.keys(properties);

        for (u = 0; u < keys.length; u += 1) {

            // create list for each unit with its cost
            var list = createList(properties[keys[u]], keys[u], allowedProperties, tag);
            if (tag) list.ul.setAttribute(tag, u + 1);

            // add list to the select screen
            innerScreen.appendChild(list.ul);
        }

        if (exists) {
            exists.parentNode.replaceChild(innerScreen, exists);
        } else {
            // add select screen to build screen container
            display.appendChild(innerScreen);

            // insert build screen into dom
            document.body.insertBefore(display, document.getElementById('before'));
        }
        return true;
    };

    var select = function (tag, id, selected, max) {

        // if the index is not the same as it was prior, then highlight the new index ( new element )
        if ( app.temp.prevIndex !== app.temp.selectionIndex ) {

            // all the ul children from the selected element for highlighting
            var hudElement = document.getElementById(id);
            var elements = hudElement.getElementsByTagName('ul');
            var prev = app.temp.prevIndex;
            selectionIndex = app.temp.selectionIndex;
            len = elements.length;
            key = app.settings.keyMap;
            undo = app.undo.keyPress;

            // if there is no max set then set max to the length of he array
            if (!max) max = len;

            // hide elements to create scrolling effect
            if (selectionIndex > max) {
                hide = selectionIndex - max;
                for (var h = 1; h <= hide; h += 1) {

                    // find each element that needs to be hidden and hide it
                    var hideElement = findElementByTag(tag, h, elements);
                    hideElement.style.display = 'none';
                }
            } else if (selectionIndex <= len - max && hide) {

                // show hidden elements as they are hovered over
                var showElement = findElementByTag(tag, selectionIndex, elements);
                showElement.style.display = '';
            }

            selectedElement = findElementByTag(tag, selectionIndex, elements);

            if (selectedElement) {

                // apply highlighting 
                selectedElement.style.backgroundColor = 'tan';

                // display info on the currently hovered over element
                if (id === 'selectUnitScreen') unitInfo(selected, selectedElement.id);

                // check if there was a previous element that was hovered over
                if (prev) {

                    // if there is then remove its highlighting
                    var prevElement = findElementByTag( tag, prev, elements);
                    prevElement.style.backgroundColor = '';
                }
            }
            // store the last index for future comparison
           app.temp.prevIndex = selectionIndex;
        }

        // if the select key has been pressed and an element is available for selection then return its id
        if (key.select in app.keys && selectedElement) {
            undo(key.select);
            app.temp.selectionIndex = 1;
            delete app.temp.prevIndex;
            delete selectedElement;
            delete selectionIndex;
            delete prev;
            delete hide;
            return selectedElement.getAttribute('id');

            // if the down key has been pressed then move to the next index ( element ) down
        } else if (key.down in app.keys) {

            // only movement if the index is less then the length ( do not move to non existant index )
            if (selectionIndex < len) {

                // increment to next index
                app.temp.selectionIndex += 1;
            }
            undo(key.down);

            // same as above, but up
        } else if (key.up in app.keys) {

            if (selectionIndex > 1) app.temp.selectionIndex -= 1;
            undo(key.up);
        }

        return false;
    };

    // find each element by their tag name, get the element that matches the currently selected index and return it
    var findElementByTag = function (tag, index, element) {
        for (var e = 0; e < len; e += 1) {
            // element returns a string, so must cast the index to string for comparison
            // if the element tag value ( index ) is equal to the currently selected index then return it
            if (element[e].getAttribute(tag) === index.toString()) {
                return element[e];
            }
        }
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
    var hudCanvas = function (canvasId, type, objectClass) {

        var canvas = document.createElement('canvas'); // create canvas
        var context = canvas.getContext(app.ctx); // get context

        // set width, height and id attributes
        canvas.setAttribute('width', 128);
        canvas.setAttribute('height', 128);
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
        var canvas;
        if (canvasId) {
            // create canvas and add it to the object
            canvas = hudCanvas(canvasId, object.type, id);
            object.canvas = canvas.canvas;
        }

        // get a list of property names
        var properties = Object.keys(object);

        // create an unordered list and give it the specified id
        var ul = document.createElement('ul');
        ul.setAttribute("id", id);

        // go through each property and create a list element for ivart, then add it to the ul;
        for (var i = 0; i < properties.length; i += 1) {

            // properties
            var props = properties[i];

            // only use properties specified in the displayed attributes array
            if (displayedAttributes === '*' || displayedAttributes.hasValue(props)) {

                // create list element and give it a class defining its value
                var li = document.createElement('li');
                li.setAttribute('class', props);

                // if the list element is a canvas then append it to the list element
                if (props === 'canvas') {
                    li.appendChild(object[props]);

                    // if the list is an object, then create another list with that object and append it to the li element
                } else if (typeof (object[props]) === 'object') {
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
        app.temp.cursorMoved = false;

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

    return {

        // 
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

        selectionInterface: function (building, tag) {
            return selectionInterface(building, tag);
        },

        select: function (tag, id, selected, max) {
            return select(tag, id, selected, max);
        },

        listen: function () {
            var selection;
            // if the options hud has been activated 
            if (app.temp.actionsActive && app.temp.selectActive) {
                // make the options huds list items selectable
                selection = select('actionSelectionIndex', 'actions');
            }else if(app.temp.optionsActive){
                selection = select('optionSelectionIndex', 'optionsMenu');
            }

            // if one has been selected activate the corresponding method from the options class
            if (selection) {
                if(app.temp.actionsActive){
                    app.actions[selection]();
                    app.undo.hudHilight();
                    app.undo.display('actionHud');
                    app.temp.selectActive = false;
                    app.temp.cursorMoved = true;
                } if(app.temp.optionsActive && !app.temp.actionsActive ){
                    app.options[selection]();
                    app.undo.all(); // remove display
                }
            }
            return this;
        },

        // display terrain info
        hud: function () {

            // if the cursor has been moved, and a selection is active then get the display info for the new square
            if (app.temp.cursorMoved && !app.temp.selectActive) app.temp.hovered = displayHUD();
            return this; 
        },

        options: function () {
            // if nothing is selected and the user presses the exit key, show them the options menu
            if (app.settings.keyMap.exit in app.keys && !app.temp.selectActive && !app.temp.actionsActive ) {
                app.undo.keyPress(app.settings.keyMap.exit);
                app.temp.optionsActive = true; // set options hud to active
                app.temp.selectActive = true; // set select as active
                optionsHud(); // display options hud
                hideElement('coStatusHud'); // hide co status hud
            }
            return this;
        },

        coStatus: function () {
            if (!app.temp.optionsActive && !app.temp.actionsActive) coStatus(app.temp.player);
            return this;
        },

        damage: function (damage) {
            return damageDisplay(damage);
        },

        path: function (cursor) {
            // get the range
            var grid = app.temp.range.slice(0);

            // calculate the path to the cursor
            var p = app.calculate.path(app.temp.selectedUnit, cursor, grid);

            // if there is a path then set it to the path highlight effect for rendering
            if (p) app.effect.path = app.effect.path.concat(p);

            // animate changes
            window.requestAnimationFrame(app.animateEffects);
        },

        range: function () {
            // set the range highlight to the calculated range
            app.effect.highlight = app.effect.highlight.concat(app.temp.range);

            // animate changes
            window.requestAnimationFrame(app.animateEffects);
        }
    };
}();
