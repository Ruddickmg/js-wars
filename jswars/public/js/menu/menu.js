app = require('../settings/app.js');
socket = require('../tools/sockets.js');
app.key = require('../tools/keyboard.js');
app.maps = require('../controller/maps.js'); 
app.screens = require('../objects/screens.js');
app.background = require("../controller/background.js");

module.exports = function () {

    var temp = {}, prev = {}, now = new Date(), mode, game, nameInput, setupScreenElement, roomChange, speed = 1.5, boot = false, gameName = false,
    color = app.settings.colors, playerColor = app.settings.playerColor, ready = false;

    // holds parameters necessary for selection and manipulation of displayed settings elements
    var settingsElements = {

        // optional parameter defines what display type will be displayed when revealing an element
        display:'inline-block',

        // type defines what page will be loaded
        type:'rules',

        // name of the element that is parent to the list
        element:'Settings',

        // name of the index, comes after the property name: property + index
        index:'SettingsIndex',

        // holds the name of the tag being retrieved as a value from the selected element
        attribute:'class',

        // holds the name of the element used for chat and description etc, displayed text
        text:'descriptions',

        // holds the object that defines all that will be scrolled through
        properties:app.settings.settingsDisplayElement
    }

    // holds parameters necessary for selection and manipulation of displayed teams elements
    var playerElements = {

        // type defines what page will be loaded
        type:'teams',

        // name of the element that is parent to the list
        element:'',

        // name of the index, comes after the property name: property + index
        index:'Index',

        // holds the name of the tag being retrieved as a value from the selected element
        attribute:'class',

        // holds the name of the element used for chat and description etc, displayed text
        text:'descriptions',
    };

    var teamElements = {

        display:'',

        // name of the element that is parent to the list
        element:'',

        // name of the index, comes after the property name: property + index
        index:'Index',

        // holds the name of the tag being retrieved as a value from the selected element
        attribute:'class',

        // holds the name of the element used for chat and description etc, displayed text
        text:'descriptions',

        properties:{}
    };

    var exit = function (value, callback, exit) {
        if (app.key.pressed(app.key.enter()) || app.key.pressed(app.key.esc()) || boot){
            if(callback) callback();
            if(app.key.pressed(app.key.esc()) || boot){
                app.key.undo();
                if(boot) boot = false;
                return exit ? exit : 'back';
            }
            app.key.undo();
            return value;
        }
        return false;
    };

    var swell = function (color, element) {

        var direction = function (id) {
            var dir = {
                up:'Bottom',
                down:'Top',
                left:'Left',
                right:'Right'
            };
            return 'border' + dir[id] + 'Color';
        };

        var id, i, len = element.length;

        if(len){
            for(i = 0; i < len; i += 1){
                id = element[i].id.replace('ArrowBackground','');
                element[i].style[direction(id)] = color;
            }
        }else{
            id = element.id.replace('ArrowBackground','');
            element.style[direction(id)] = color;
        }
    };

    var moveElements = function (direction, element, callback, neg, index) {

        if(!callback) callback = false;
        var elements = element.childNodes;
        var length = elements.length;
        var delay = 5;
        var timeout = delay * 100;

        if(!index && index !== 0){
            if(neg === true){
                index = length - 1;
            }else{
                index = 0;
            }
        }

        if(neg === true || neg === -1){
            neg = -1;
        }else{
            neg = 1;
        }

        if(neg === 1 && length > index || neg === -1 && index >= 0){
            var offScreen = Number(app.offScreen);
            setTimeout(function(){ 
                var elem = elements[index];
                elem.style.transition = 'top .'+delay+'s ease';
                setTimeout(function(){elem.style.transition = null}, timeout);
                var position = Number(elem.style.top.replace('px',''));
                if(position){
                    if(direction === 'up'){
                        var target = position - offScreen;
                    }else if(direction === 'down'){
                        var target = position + offScreen;
                    }else{
                        return false;
                    }
                    elem.style.top = target + 'px';
                }
                index += neg;
                moveElements(direction, element, callback, neg, index);
            }, 30);
        }else if(callback){
            setTimeout(callback(element), 1000);
        }
    };

    var changeTeamElementHeight = function (height, len) {
        if(!len) var len = app.map.players();
        var screenHeight = setupScreenElement.offsetHeight;
        var h = Number(height.replace('%','')) / 100;
        var newHeight = h * screenHeight;
        for (var p = 1; p <= len; p += 1){
            var element = document.getElementById('player' + p);
            element.style.top = newHeight + 'px';
        }
    };

    var changeSelectTeamHeight = function (height) {
        var len = app.players.length();
        for(var t = 1; t <= len; t += 1){
            var element = document.getElementById('player'+t+'Team');
            element.style.top = height + 'px';
        }
    };

    var createArrows = function (element, top, bottom, size) {

        if (!size) size = 30;

        var offset = 192;

        var left = Number(element.parentNode.style.left.replace('px',''));

        var height = element.offsetHeight;
        var width = (element.offsetWidth - (size * 1.25)) / 2;

        var x = element.style.left ? Number(element.style.left.replace('px','')) + left + width : left + width;
        var y = setupScreenElement.offsetHeight * .3 - 10;

        var up =  y - 15 - offset + top;
        var down = y - offset + height + bottom;

        return {
            up: app.effect.arrow('up', x, y - 15 - offset + top, size).background,
            down: app.effect.arrow('down', x, y - offset + height + bottom, size).background
        };
    };

    var coBorderColor = function (resetColor) {

        now = new Date();

        // max allowed players in the game
        var potential = app.map.players();

        // move through the spaces and check the status of the players, change their border color
        // to indicate whether they are ready to go or not
        for(var number = 1; number <= potential; number += 1){

            var ind = number - 1;

            // if there is not player element create an array to store it
            if(!temp.playerElement) temp.playerElement = [];

            // get the player element if we havent already
            if(!temp.playerElement[ind]) temp.playerElement[ind] = document.getElementById('player'+number+'co');

            // loa the player element
            var playerElement = temp.playerElement[ind];

            // check the mode, if it is cp then it should display a solid border color
            var mode = document.getElementById('player'+number+'mode')
                .getElementsByClassName('Cp')[0].style.display;

            if(number > app.players.length() && mode){

                // if the  space is not occupied then make the background white
                playerElement.style.borderColor = app.hsl(color['white']);

            }else if(!mode || app.players.number(number).ready() && playerElement){

                // if the player is ready or set to computer then make the border color solid
                playerElement.style.borderColor = app.hsl(playerColor[number]);

            }else if(playerElement){

                // if the player is not ready yet, but present then fade the color in and out
                app.effect.swell.color(now, playerElement, playerColor[number], speed - .5, false, playerElement.id.replace('co','swell'));
            }
        }
    };

    var clearTempAndPrev = function () {
        temp = {};
        prev = {};
        app.display.clearOld();
        app.display.resetPreviousIndex();
    };

    var resetDefaults = function (type) {

        var length = app.players.length();

        for(var t = 1; t <= length; t += 1){

            var element = document.getElementById('player'+t+type);

            var previous = app.players.number(t)[type.toLowerCase()];

            if(previous){

                var children = element.childNodes;
                var childrenLength = children.length;

                for(var c = 0; c < childrenLength; c += 1){
                    var child = children[c];
                    if(child.getAttribute('class') === previous){
                        child.setAttribute('default',true);
                    }else if(child.getAttribute('default')){
                        child.removeAttribute('default');
                    }
                }
            }
        }
    };

    var moveElements = function (direction, element, callback, neg, index) {

        if(!callback) callback = false;
        var elements = element.childNodes;
        var length = elements.length;
        var delay = 5;
        var timeout = delay * 100;

        if(!index && index !== 0) index = neg === true ? length - 1 : 0;
        neg = neg === true || neg === -1 ? -1 : 1;

        if(neg === 1 && length > index || neg === -1 && index >= 0){
            var offScreen = Number(app.offScreen);
            setTimeout(function(){ 
                var elem = elements[index];
                elem.style.transition = 'top .'+delay+'s ease';
                setTimeout(function(){elem.style.transition = null}, timeout);
                var position = Number(elem.style.top.replace('px',''));
                if(position){
                    if(direction === 'up'){
                        var target = position - offScreen;
                    }else if(direction === 'down'){
                        var target = position + offScreen;
                    }else{
                        return false;
                    }
                    elem.style.top = target + 'px';
                }
                index += neg;
                moveElements(direction, element, callback, neg, index);
            }, 30);
        }else if(callback){
            setTimeout(callback(element), 1000);
        }
    };

    var choseCo = function (from) {

        if(!temp.joinCreate){

            var teamsElement = temp.teamsElement = app.display.setup(playerElements, setupScreenElement);

            playerElements.properties = app.settings.playersDisplayElement;

            if (from === 'choseGame') moveElements('up', teamsElement);

            temp.joinCreate = true;
        }
        
        var team = app.display.complexSelect(playerElements, function(property){
            var element = temp.selectedContainer = document.getElementById(property);
            var top = Number(element.parentNode.style.top.replace('px',''));
            var arrows = createArrows(element, top, top + 25);
            temp.up = arrows.up;
            temp.down = arrows.down;
            return element;
        }, true);
        
        if (team && !app.players.empty()) app.players.setProperty(team.property, team.value);

        app.effect.swell.color(now, [temp.up, temp.down], color['white'], speed, swell);
        coBorderColor();

        if (app.key.pressed(app.key.enter())) {

            clearTempAndPrev();
            app.undo.tempAndPrev();
            app.key.undo();
            resetDefaults('co');
            resetDefaults('mode');

            var player = app.user.player();
            player.isReady(true);
            socket.emit('ready', player);

            if(app.map.players() > 2){
                temp.selectTeams = true;
            }else{
                temp.ready = true;
                temp.selectTeams = true;
                var upArr = document.getElementById('upArrowOutline');
                var downArr = document.getElementById('downArrowOutline');
                upArr.style.display = 'none';
                downArr.style.display = 'none';
                changeTeamElementHeight('20%');
            }
            return false;
        }else{
            return exit(false, function () {
                var teams = document.getElementById('teams');
                teams.removeChild(document.getElementById('upArrowOutline'));
                teams.removeChild(document.getElementById('downArrowOutline'));
                if (from !== 'choseGame'){
                    moveElements('down', teams);
                }else{
                    setupScreenElement.removeChild(teams);
                }
                app.undo.tempAndPrev();
                clearTempAndPrev();
                app.players.reset();
                temp.back = true;
                nameInput = true;
                setupScreenElement.removeChild(document.getElementById('descriptionOrChatScreen'));
            });
        }
    };

    var choseTeam = function (from) {

        if(!temp.selectingTeams){

            teamElements.properties = app.settings.teamsDisplayElement;

            var element = document.getElementById('player1Team');
            var num = prev.top = Number(element.style.top.replace('px',''));
            var top = num / 4;

            changeSelectTeamHeight(top + (top / 6));

            temp.selectingTeams = true;
            changeTeamElementHeight('20%');    
        }

        var team = app.display.complexSelect(teamElements, function (property) {

            var element = document.getElementById(property);

            var tops = prev.top / 5;
            var top = tops + (tops / 6);
            top *= 2.02;

            var arrows = createArrows(element, top + 5, top);

            temp.up = arrows.up;
            temp.down = arrows.down;

            return element;

        }, true);

        if (team && !app.players.empty()) 
            app.players.setProperty(team.property, team.value);

        app.effect.swell.color(now, [temp.up, temp.down], color['white'], speed, swell);
        coBorderColor();

        if (app.key.pressed(app.key.esc()) || app.key.pressed(app.key.enter()) || boot){

            var top = prev.top;
            changeSelectTeamHeight(top);
            resetDefaults('Team');
            app.undo.tempAndPrev();
            clearTempAndPrev();

            if(app.key.pressed(app.key.enter())){
                var upArr = document.getElementById('upArrowOutline');
                var downArr = document.getElementById('downArrowOutline');
                upArr.style.top = top + 'px';
                downArr.style.top = top + 'px';
                upArr.style.display = 'none';
                downArr.style.display = 'none';
                temp.ready = true;
                temp.selectTeams = true;
                return false;
            }
            app.key.undo();
            changeTeamElementHeight('30%');
            temp.joinCreate = true;
        }
    };

    var playerReady = function (from) {

        if(!temp.readyScreenChanged){

            temp.sButton = app.screens.startButton('setupScreen');

            var bb = 5;
            var chatScreen = temp.chatScreen = document.getElementById('descriptionOrChatScreen');
            chatScreen.style.height = chatScreen.offsetHeight * 1.8 + 'px';

            var chat = temp.descOrChat = document.getElementById('descriptionOrChat');
            chat.style.height = '77%';
            chat.style.borderBottomWidth = bb + 'px';

            var description = document.getElementById('descriptions');
            description.innerHTML = '';

            var mockForm = temp.MForm = document.getElementById('chatForm');
            mockForm.style.display = 'block';
            mockForm.style.height = '15%';
            mockForm.style.borderBottomWidth = bb + 'px';
            temp.readyScreenChanged = true;

            var c = temp.chat = document.getElementById('chat');
            c.style.display = 'block';

            temp.input = document.getElementById('chatInput');
            temp.input.focus();
        }

        coBorderColor();

        var sButton = temp.sButton;

        app.players.ready() && app.user.first() ? sButton.show() : sButton.hide();

        if(ready) return app.players.all();

        if(app.key.pressed(app.key.enter())) 
            app.chat.display(app.chat.message(temp.input));

        if(app.key.pressed(app.key.esc()) || boot) {

            var player = app.user.player();
            player.isReady(false);
            socket.emit('ready', player);
            resetDefaults('co');
            resetDefaults('mode');

            temp.chatScreen.style.height = '20%';

            var descOrChat = temp.descOrChat;
            descOrChat.style.height = '83%';
            descOrChat.style.borderBottomWidth = '12px';

            temp.chat.style.display = 'none';

            var MForm = temp.MForm;
            MForm.style.height = '0px';
            MForm.style.display = 'none';

            app.key.undo();
            var upArr = document.getElementById('upArrowOutline');
            var downArr = document.getElementById('downArrowOutline');
            upArr.style.display = '';
            downArr.style.display = '';
            temp.ready = false;
            sButton.remove();

            if(app.map.players() > 2){
                temp.selectTeams = true;
            }else{
                changeTeamElementHeight('30%');
                temp.selectTeams = false;
                temp.joinCreate = true;
            }
        }
    };  

    return {
        back: function(){ boot = true; },

        choseMapOrGame: function (type) {

            var map, maps = app.maps, element = maps.type(type).screen(), allMaps = maps.all();

            var clearSelect = function (setupScreenElement) { 
                var select = document.getElementById(element.section);
                var buildings = document.getElementById('buildingsDisplay');
                var categories = document.getElementById('categorySelectScreen');
                setupScreenElement.removeChild(select);
                setupScreenElement.removeChild(buildings);
                setupScreenElement.removeChild(categories);
                app.display.resetPreviousIndex();
                app.key.undo();
                maps.clear();
                clearTempAndPrev();
                app.undo.tempAndPrev();
            };

            if(!temp.select) temp.select = app.display.mapOrGame(element, allMaps);
            if(!temp.category) temp.category = document.getElementById('selectCategoryScreen');

            // send a request to the server for a list of maps if one has not been returned yet
            maps.setCategory(app.effect.horizontalScroll(temp.category));

            if(maps.updated()){
                var elements = app.display.info(allMaps, ['name'], element, element.li);
                app.display.mapOrGameSelection(element.section, elements);
                if(maps.index() === false) app.display.resetPreviousIndex(); // reset index
            }

             // enable selection of maps and keep track of which map is being highlighted for selection
            var id = app.display.select(element.li, element.div, app.effect.highlightListItem, 'ul', 5).id;
            var index = app.display.index();

            // display information on each map in their appropriate locations on the setup screen as they are scrolled over
            if(index && maps.index() + 1 !== index) app.display.mapInfo(maps.byIndex(index - 1));
            
            // if a map has been selected, return it for use in the game.
            if(id && (map = maps.byId(id))){

                map.category = maps.category();
                app.map.set(map.map ? map.map : map);

                if (type === 'game'){
                    map.players.push(app.user.raw());
                    app.players.add(map.players);
                    socket.emit('join', map);
                }
                
                clearSelect(setupScreenElement);
                return true;
            }

            if (app.key.pressed(app.key.esc())) {
                clearSelect(setupScreenElement);
                return 'back';
            }
            return false;
        },

        choseSettings: function () {

            if(!temp.settings){

                temp.swell = false;

                settingsElement = app.display.setup(settingsElements, setupScreenElement, temp.back);

                if(temp.back){
                    moveElements('down', settingsElement, function(){ temp.swell = true; });
                }else{
                    moveElements('up', settingsElement, function(){ temp.swell = true; });
                }

                temp.settings = true;
            }

            if( !nameInput || temp.back ){

                delete temp.back;

                // handle selection of the elements on display
                var selected = app.display.complexSelect(settingsElements, function(property) {

                    var seperation = 85;
                    var position = 30;

                    // get the background of the currently selected element for swelling
                    var setting = temp.selectedContainer = document.getElementById(property + 'Background');

                    var y = Number(setting.style.top.replace('px','')) + position;
                    var x = Number(setting.style.left.replace('px','')) + position;

                    temp.up = app.effect.arrow('up', x, y - seperation).background;
                    temp.down = app.effect.arrow('down', x, y + seperation).background;

                    return document.getElementById(property + 'Settings');
                });

                if( selected ) app.game.set(selected.property, selected.value);
            }

            // make background swell
            if(temp.swell) app.effect.swell.size(temp.selectedContainer, 50, 100);
            app.effect.swell.color(new Date(), [temp.up, temp.down], color.white, speed, swell);

            if(app.key.pressed(app.key.enter()) || nameInput){

                if(typeof(nameInput) !== "object"){
                    app.key.undo();
                    nameInput = app.display.gameNameInput();
                    app.effect.typeLetters(nameInput.description, 'Enter name for game room.');
                }
                
                if(app.key.pressed(app.key.enter())){

                    var weather, name = nameInput.name.value;

                    if(!name){
                        app.effect.typeLetters(nameInput.description, 'A name must be entered for the game.');

                    }else if(name.length < 3){
                        app.effect.typeLetters(nameInput.description, 'Name must be at least three letters long.');

                    }else{
                        app.players.add(app.user.raw());
                        app.menu.setupRoom(name);

                        if((weather = app.game.settings().weather)){
                            app.background.set(weather);
                            socket.emit('background', weather);
                        }

                        app.key.undo();

                        var settingsElem = document.getElementById('settings');
                        settingsElem.removeChild(nameInput.upArrow);
                        settingsElem.removeChild(nameInput.downArrow);

                        clearTempAndPrev();
                        app.undo.tempAndPrev();

                        app.display.clearOld();

                        moveElements('up', settingsElem, function(settings){
                            setupScreenElement.removeChild(settings);
                            moveElements('up', temp.teamsElement);
                        }, true);

                        setupScreenElement.removeChild(document.getElementById('descriptionOrChatScreen'));

                        return settings;
                    }
                }else if(app.key.pressed(app.key.esc())){
                    app.key.undo(app.key.esc());
                    nameInput.description.style.paddingTop = null;
                    nameInput.description.style.paddingBottom = null;
                    nameInput.input.style.display = null;
                    nameInput.input.style.height = null;
                    nameInput.downArrow.style.display = '';
                    nameInput.upArrow.style.display = '';
                    nameInput = false;
                    app.display.clearOld();
                }
            }else{
                return exit( settings, function () {
                    app.display.clearOld();
                    app.display.reset();
                    app.display.resetPreviousIndex();
                    clearTempAndPrev();
                    app.undo.tempAndPrev();
                    setupScreenElement.removeChild(document.getElementById('settings'));
                    setupScreenElement.removeChild(document.getElementById('descriptionOrChatScreen'));
                });
            }
        },

        coSelection: function (properties, prevList, prevSelection){

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
            if (prevSelection !== undefined) var ind = prevList[prevSelection];

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
        },

        login: function () { 

            // if login is successful go to game setup, otherwise the user has declined
            var paramsLocation=window.location.toString().indexOf('?');
            var params="";
            if (paramsLocation>=0)
            params=window.location.toString().slice(paramsLocation);

            top.location = 'https://graph.facebook.com/oauth/authorize?client_id=1481194978837888&scope=public_profile&email&redirect_uri=http://localhost/'+params;
        },

        join: function (from){
            if(!temp.selectTeams)
                return choseCo(from);
            else if(temp.ready)
                return playerReady(from);
            else return choseTeam(from);
        },

        setupRoom: function (name) {
            var room = {};
            var map = app.map.get();
            room.name = name;
            room.settings = app.game.settings();
            room.max = app.map.players();
            room.map = map;
            room.category = map.category;
            socket.emit('newRoom', room);
        },

        setup: function (setupScreen){

            // select game mode
            if(app.user.id() && !mode){

                mode = app.display.select('modeItemIndex', 'selectModeMenu', app.effect.setupMenuMovement, 'li', 5, 'infinite').id;

                if(mode){
                    setupScreenElement = document.getElementById('setupScreen');
                    app.dom.removeChildren(setupScreenElement, 'title');
                    var footer = document.getElementById('footer');
                    footer.style.display = 'none';
                }
            }

            // set up the game based on what mode is being selected
            if(mode && !game){
                if(mode === 'logout') return app.modes[mode]();
                //if(mode === 'mapdesign') return app.modes[mode]();
                game = app.modes[mode](setupScreenElement);
            }

            // listen for fading colors in and out on selection
            app.effect.swell.color(Date.now());

            // if a game has been set 
            if (game) {

                // remove the setup screen
                setupScreenElement.parentNode.removeChild(setupScreenElement);                

                // start game adds players, player info, settings, game type, mode, maps etc to be used in game, then 
                // starts the game loop if it the game was successfully set up
                if(game === 'editor' && app.editor.start() || app.game.start(game))
                    return true;

                // if the game cannot be started then reset
                game = mode = false;
                app.display.clear();
                app.screens.modeMenu();
            }

            // if the game hasnt been started then keep looping the setup menu
            window.requestAnimationFrame(app.menu.setup);

            // remove key presses on each iteration
            if(app.key.pressed()) app.key.undo();        
        },

        start: function () {ready = true}
    };
}();