/* ------------------------------------------------------------------------------------------------------*\
   
   handles all the display screens and the users interaction with them
   
\* ------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.settings = require('../settings/game.js');
app.dom = require('../tools/dom.js');

module.exports = {
    info: function (properties, allowedProperties, elements, callback) {
        
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

        return this.info(actionsObj, app.settings.actionsDisplay, {section: 'actionHud',div: 'actions'});
    }
};