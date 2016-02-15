/* ------------------------------------------------------------------------------------------------------*\
   
    controls the setting up and selection of games / game modes 
   
\* ------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
socket = require('../tools/sockets.js');
app.settings = require('../settings/game.js');
app.effect = require('../game/effects.js');
app.modes = require('../menu/modes.js');
app.dom = require('../tools/dom.js');
app.undo = require('../tools/undo.js');
app.co = require('../objects/co.js');

console.log

module.exports = function () {

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

    var mogElements = {
        game: {
            section: 'gameSelectScreen',
            div:'selectGameScreen',
            type:'game',
            index:'Index',
            attribute:'class',
            url:'games'
        },

        // name screen elements
        map: {
            section: 'mapSelectScreen',
            div:'selectMapScreen',
            type:'map',
            url:'maps/type'
        }
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

    var map, player, roomChange, setupScreenElement, game = false, mode = false, started = false, temp = {}, 
    prev = {}, currentPlayer = null, players = [], defeated = [], now = new Date(), gameName = false, boot = false;

    var speed = 1.5;
    var color = app.settings.colors;
    var playerColor = {
        1:color['red'],
        2:color['blue'],
        3:color['green'],
        4:color['yellow']
    };
    
    var setUserProperties = function (property, value, index) {
        var properties = ['co', 'mode', 'Team'];
        var len = properties.length;

        for(var l = 0; l < len; l += 1){
            var setting = properties[l];
            if(property.indexOf(setting) > -1){
                var number = index ? index : Number(property.replace('player','').replace(setting,'')) - 1;
                if(players[number]) players[number][setting.toLowerCase()] = value;
            }
        }
    };

    var settings = {
        // amount of income per building per turn, 1000 - 9500 incrimenting by 500, default is 1000
        funds: 1000,

        // toggle fog
        fog:'off',

        // toggle weather setting
        weather:'random',

        // end of game on number of turns completed 1 - 99, 0 is off
        turn:'off',

        // end game on cartain number of buildings captured 1 - 52,  0 is off
        capt:'off',

        //  toggle co powers active.. default on
        power: 'on',

        // toggle attack animations.. default off
        visuals: 'off',

        // keyboard settings
        keyMap: {
            exit: 27,
            select: 13,
            up: 38,
            down: 40,
            left: 37,
            right: 39
        }
    };

    var getMap = function (id) { app.request.get(id, 'maps/select', function (response) { setMap(response); }); };
    var setMap = function (selectedMap) { map = selectedMap; };

    var findMapById = function(maps, id) {
        var len = maps.length;
        for ( var i = 0; i < len; i += 1){
            if(maps[i].id == id) return maps[i];
        }
        return false;
    };

    var findGameById = function(games, id) {
        var keys = Object.keys(games);
        var len = keys.length;
        for ( var i = 0; i < len; i += 1){
            if(games[keys[i]].id == id) return games[keys[i]];
        }
        return false;
    };

    var exit = function (value, callback, exit) {
        if (app.key.pressed('enter') || app.key.pressed('esc') || boot){
            if(callback) callback();
            if(app.key.pressed('esc') || boot){
                app.keys.splice(0,app.keys.length);
                if(boot) boot = false;
                return exit ? exit : 'back';
            }
            app.keys.splice(0,app.keys.length);
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
            }
            return 'border' + dir[id] + 'Color';
        }

        var len = element.length;

        if(len){
            for(var i = 0; i < len; i += 1){
                var id = element[i].id.replace('ArrowBackground','');
                element[i].style[direction(id)] = color;
            }
        }else{
            var id = element.id.replace('ArrowBackground','');
            element.style[direction(id)] = color;
        }
    };

    var changeTeamElementHeight = function (height, len) {
        if(!len) var len = players.length;
        var screenHeight = setupScreenElement.offsetHeight;
        var h = Number(height.replace('%','')) / 100;
        var newHeight = h * screenHeight;
        for (var p = 1; p <= len; p += 1){
            var element = document.getElementById('player' + p);
            element.style.top = newHeight + 'px';
        }
    };

    var changeSelectTeamHeight = function (height) {
        var len = players.length;
        for(var t = 1; t <= len; t += 1){
            var element = document.getElementById('player'+t+'Team');
            element.style.top = height + 'px';
        }
    };

    var resetDefaults = function (type) {

        var len = players.length;

        for(var t = 1; t <= len; t += 1){

            var element = document.getElementById('player'+t+type);

            var previous = players[t - 1][type.toLowerCase()];

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

    var clearTempAndPrev = function () {
        temp = {};
        prev = {};
        app.display.resetPreviousIndex();
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

    var coBorderColor = function (type) {
        var len = players.length;
        for(var p = 1; p <= len; p += 1){
            var ind = p - 1;
            if(!temp.playerElement) temp.playerElement = [];
            if(!temp.playerElement[ind]) temp.playerElement[ind] = document.getElementById('player'+p+'co');
            var playerElement = temp.playerElement[ind];
            if(players[ind].ready && playerElement){
                playerElement.style.borderColor = app.hsl(playerColor[p]);
            }else if(playerElement){
                app.effect.swell.color(now, playerElement, playerColor[p], speed - .5, false, playerElement.id.replace('co','swell'));
            }
        }
    };

    // assign head quarters to player
    var getHQ = function () {

        // list off all buildings on map
        var buildings = app.map.building;

        for (var b = 0; b < buildings.length; b += 1) {

            // if the building shares an id with the player and is an hq then it is theirs
            if (buildings[b].type === 'hq' && buildings[b].player === number) {

                // return the building
                return buildings[b];
            }
        }
    };

    // get look st the co list and add the proper co
    var getCO = function (player) {
        return app.co[co](player);
    };

    var key = settings.keyMap;

    return {
        setUserProperties:setUserProperties,
        keys:key,
        coSelection: function (properties, prevList, prevItems){
            var list = [];
            var number = player.number;
            var keys = Object.keys(properties);
            var keysLength = keys.length;
            if(prevItems) var ind = prevList[prevItems];

            if(player.number = 1 && !temp.yk){
                console.log(player);
                temp.yk = true;
            }

            for(var k = 0; k < keysLength; k += 1){
                var key = keys[k];

                if(key.indexOf('mode') > 0 && number === 1){
                    var pNumber = key.replace('player','').replace('mode','');
                    var getValue = app.dom.getDisplayedValue;
                    var mode = getValue(key); 
                    if(pNumber != 1){
                        var i = pNumber - 1;
                        var p = players[i];
                        if(mode === 'Cp'){
                            var property = 'player'+pNumber+'co';
                            if(p && !p.cp){
                                var value = getValue(property);
                                var cp = {
                                    name:'Cp' + number,
                                    number:number,
                                    ready:true,
                                    cp:p.id
                                };
                                socket.emit('boot', {player:p, cp:cp});
                                this.removePlayer(i, cp);
                                setUserProperties(property, value);
                            }
                            list.push(property);
                        }else if(p && p.cp){
                            socket.emit('boot', {player:false, cp:p});
                            this.removePlayer(i);
                        }
                    }
                    list.push(key);
                }else if(key.indexOf(number+'co') > 0){
                    list.push(key);
                }
            }
            return {list:list, ind:ind};
        },

        // create a new player object
        newPlayer: function (id, co, name, number) {

            // return the player object
            return {
                number: number,
                // player id
                id: id,
                // player name
                name: name,
                hq: getHQ(),
                // holds amount of special built up
                special: 0,
                unitsLost: 0,
                gold: 0,
                co: getCO(this) // chosen co
            };
        },
        playerReady:function(s){players[s.number - 1].ready = s.ready;},
        setPlayer:function(p){player = p;},
        player: function () {return player;},
        map: function () {return map;},
        numOfPlayers: function () {return map.players;},
        started: function () {return started;},
        currentPlayer: function () {return currentPlayer;},
        players: function () {return players;},
        defeated: function () {return defeated;},
        settings: function () {return settings;},
        destroyUnit: function (p){players[p - 1].unitsLost += 1;},
        playerDefeated: function (p){defeated.concat(players.splice(p - 1, 1));},
        back: function(){boot = true;},
        addPlayer: function (p){
            // if player was not passed use player from previous screen (for host)
            if(!p) var p = player;
            var i = false;
            var fbid = p.cp ? p.cp : p.fbid;

            // check if player is already in and replace if they are
            if(players.length <= map.players){
                var length = players.length;
                for(var x = 0; x < length; x += 1){

                    if(players[x].fbid === fbid){
                        players.splice(x,1,p);
                        i = true;
                    }
                }
                if(!i) players.push(p);

                // get the attributes of the co from game and add them to player object
                var id = 'player'+p.number+'co';
                var co = document.getElementById(id);
                var children = co.childNodes;
                var len = children.length;
                for(var c = 0; c < len; c += 1){
                    var child = children[c];
                    if(child.getAttribute('default')){
                        var value = child.getAttribute('class');
                    } 
                }
                setUserProperties(id, value);
                console.log(players);
                return true;
            }else{
                return false;
            }
        },
        removePlayer: function(p, cp){
            var i;
            if(p.number){
                i = p.number - 1;
            }else if(p.fbid){
                var keys = Object.keys(players);
                var len = keys.length;
                for(var x = 0; x < len; x += 1){
                    var player = players[keys[x]];
                    var pNumber = player.number - 1;
                    if(p.fbid === player.fbid){
                        i = pNumber;
                    }else if(player.number > p.number){
                        player.number = pNumber;
                    }
                }
            }else{
                i = p;
            }
            if(players[i]){
                var number = i + 1;
                var leng = players.length;

                for(var n = 0; n < leng; n += 1){
                    if(n > i){
                        var player = players[n];
                        var element = document.getElementById('player'+player.number+'co');
                        element.style.borderColor = 'white';
                        player.number -= 1;
                    }
                }
                if(cp){
                    players.splice(i, 1, cp);
                }else{
                    players.splice(i, 1);
                }
                console.log(players);
                return true;
            }
            return false;
        },
        addRoom:function(room){
            if(!Object.keys(app.games)[0]) app.display.resetPreviousIndex();
            if(app.games && prev.cat === room.category) app.games[room.name] = room;
            roomChange = true;
            
        },
        removeRoom: function(room){
            if(app.games){
                var games = app.games;
                var keys = Object.keys(games);
                var len = keys.length;
                if(prev.cat === room.category){
                    for(var g = 0; g < len; g += 1){
                        var key = keys[g];
                        if(games[key].name === room.name){
                            roomChange = true;
                            delete app.games[room.name];
                        }
                    }
                }
            }
        },
        room: function (room) {
            map = room.map;
            settings = room.settings;
            players = room.players;
        },
        set: function (setting, value) {
            settings[setting] = value;
            return settings[setting];
        },
        changeProperties: function(p){
            if(p){
                var element = document.getElementById(p.property);
                var children = element.childNodes;
                var len = children.length;

                for(var e = 0; e < len; e += 1){
                    var selected = children[e];
                    var value = selected.getAttribute('class');
                    if(value === p.value){
                        selected.style.display = 'block';
                    }else{
                        selected.style.display = 'none';
                    }
                }
                setUserProperties(p.property, p.value, p.index);
            }
        },
        choseMapOrGame: function (type) {

            var clearSelect = function () {    
                var select = document.getElementById(type+'SelectScreen');
                var buildings = document.getElementById('buildingsDisplay');
                var categories = document.getElementById('categorySelectScreen');

                setupScreenElement.removeChild(select);
                setupScreenElement.removeChild(buildings);
                setupScreenElement.removeChild(categories);
                clearTempAndPrev();
                app.undo.tempAndPrev();
            }

            var mogElems = mogElements[type];
            var mog = app[type+'s'];

            if(!temp.select){
                if(type === 'game') mogElements[type].properties = app.settings.categories;
                temp.select = app.display.mapOrGame(mogElems, mog);
            }

            var category = app.effect.horizontalScroll(document.getElementById('selectCategoryScreen'));

            if(category && prev.cat !== category){

                if(app.testing){     
                    if(type === 'game'){       
                        var elements = app.display.info(mog, ['name'], mogElems, type+'SelectionIndex');
                        app.display.mapOrGameSelection(mapElements.section, elements);
                        app.display.mapInfo(gameMap);
                    }else{
                        gameMap.id = 1;
                        app.maps = [gameMap];
                        var elements = app.display.info(mog, ['name'], mogElems, type+'SelectionIndex');
                        app.display.mapOrGameSelection(mogElems.section, elements);
                        app.display.mapInfo(gameMap);
                        console.log(gameMap);
                        console.log(app.maps);
                        app.display.resetPreviousIndex(); // reset index
                    }
                }else{
                    // send a request to the server for a list of maps if one has not been returned yet
                    app.request.get(category, mogElems.url, function (response) {
                        if (response) {
                            var r = response.error ? [] : response;
                            var mog = app[type+'s'] = Object.keys(r)[0] ? r : {};
                            var elements = app.display.info(mog, ['name'], mogElems, type+'SelectionIndex');
                            app.display.mapOrGameSelection(mogElems.section, elements);
                            if(type === 'game'){
                                var m = response[Object.keys(response)[0]];
                                if(m) app.display.mapInfo(m.map);
                            }else if(type === 'map'){
                                var m = response[0];
                                if(m) app.display.mapInfo(m);
                            }
                            app.display.resetPreviousIndex(); // reset index
                            return true;
                        }
                        return false;
                    });
                }
                prev.cat = category;
            }

            if(roomChange){
                var elements = app.display.info(app[type+'s'], ['name'], mogElems, type+'SelectionIndex');
                console.log(elements);
                app.display.mapOrGameSelection(mogElems.section, elements);
                roomChange = false;
            }

             // enable selection of maps and keep track of which map is being highlighted for selection
            var selectedId = app.display.select(type+'SelectionIndex', 'select'+type.uc_first()+'Screen', app.effect.highlightListItem, 'ul', 5);

            // display information on each map in their appropriate locations on the setup screen as they are scrolled over
            var selectionIndex = app.display.index();
            if(selectionIndex && app.display.previousIndex() !== selectionIndex){
                if(type === 'game'){
                    app.display.mapInfo(mog[Object.keys(mog)[selectionIndex - 1]].map);
                }else if(type === 'map'){
                    app.display.mapInfo(mog);
                }
            }
            
            // if a map has been selected, return it for use in the game.
            if(selectedId){

                if(type === 'game'){
                    var mapOrGame = findGameById(mog, selectedId);
                }else if(type === 'map'){
                    var mapOrGame = findMapById(mog, selectedId); // replace with getmap if necessary
                }

                if(mapOrGame){
                    if(type === 'game'){
                        socket.emit('join', mapOrGame);
                        map = mapOrGame.map;
                        settings = mapOrGame.settings;
                        players = mapOrGame.players;
                        player.number = players.length + 1;
                        players.push(player);
                    }else if(type === 'map'){
                        mapOrGame.category = prev.cat;
                        map = mapOrGame;
                        player.number = 1;
                        players.push(player);
                    }
                    app.undo.keys();
                    clearSelect();
                    delete temp[type+'Select'];
                    return true;
                }
            }

            if (app.key.pressed('esc')) {
                app.undo.keys();
                clearSelect();
                return 'back';
            } 
            return false;
        },
        choseSettings: function (){

            if(!temp.settings){
                temp.swell = false;
                settingsElement = app.display.settingsOrTeamsDisplay(settingsElements, setupScreenElement, temp.back);
                if(temp.back){
                    moveElements('down', settingsElement, function(){ temp.swell = true; });
                }else{
                    moveElements('up', settingsElement, function(){ temp.swell = true; });
                }
                temp.settings = true;
            }

            if(!temp.gameName || temp.back){

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
            app.effect.swell.color(now, [temp.up, temp.down], color['white'], speed, swell);

            if(app.key.pressed('enter') || temp.gameName){

                if(!temp.gameName){
                    temp.gameName = true;
                    app.undo.keys();
                }

                if(!temp.nameSelect){

                    temp.nameSelect = true;

                    var nameInput = temp.nameInput = document.getElementById('nameForm');
                    var description = temp.descript = document.getElementById('descriptions');
                    var upArrow = temp.upA = document.getElementById('upArrowOutline');
                    var downArrow = temp.downA = document.getElementById('downArrowOutline');
                    var name = temp.name = document.getElementById('nameInput');

                    description.style.paddingTop = '2%';
                    description.style.paddingBottom = '1.5%';
                    description.parentNode.style.overflow = 'hidden';

                    nameInput.style.display = 'block';
                    nameInput.style.height = '30%';

                    name.focus();

                    upArrow.style.display = 'none';
                    downArrow.style.display = 'none';

                    app.effect.typeLetters(description, 'Enter name for game room.');
                }
                
                if(app.key.pressed('enter')){

                    gameName = temp.name.value;

                    if(!gameName){
                        app.effect.typeLetters(temp.descript, 'A name must be entered for the game.');
                    }else if(gameName.length < 3){
                        app.effect.typeLetters(temp.descript, 'Name must be at least three letters long.');
                    }else{
                        app.game.setupRoom();
                        app.undo.keys();

                        var settingsElem = document.getElementById('settings');
                        settingsElem.removeChild(temp.upA);
                        settingsElem.removeChild(temp.downA);

                        clearTempAndPrev();
                        app.undo.tempAndPrev();

                        moveElements('up', settingsElem, function(settings){
                            setupScreenElement.removeChild(settings);
                            moveElements('up', temp.teamsElement);
                        }, true);

                        setupScreenElement.removeChild(document.getElementById('descriptionOrChatScreen'));

                        return settings;
                    }
                }else if(app.key.pressed('esc')){
                    var description = temp.descript;
                    var nameInput = temp.nameInput;
                    description.style.paddingTop = null;
                    description.style.paddingBottom = null;
                    nameInput.style.display = null;
                    nameInput.style.height = null;
                    temp.downA.style.display = '';
                    temp.upA.style.display = '';
                    app.game.clearLastItem();
                    delete temp.nameSelect;
                    delete temp.gameName;
                }
            }else{
                return exit( settings, function () {
                    clearTempAndPrev();
                    app.undo.tempAndPrev();
                    setupScreenElement.removeChild(document.getElementById('settings'));
                    setupScreenElement.removeChild(document.getElementById('descriptionOrChatScreen'));
                });
            }
        },
        join: function (from){

            if(!temp.selectTeams){
                if(!temp.joinCreate){
                    var teamsElement = temp.teamsElement = app.display.settingsOrTeamsDisplay(playerElements, setupScreenElement);
                    playerElements.properties = app.settings.playersDisplayElement;
                    if (from === 'choseGame') moveElements('up', teamsElement);
                    temp.joinCreate = true;
                    console.log(players);
                }
                var team = app.display.complexSelect(playerElements, function(property){
                    var element = temp.selectedContainer = document.getElementById(property);
                    var top = Number(element.parentNode.style.top.replace('px',''));
                    var arrows = createArrows(element, top, top + 25);
                    temp.up = arrows.up;
                    temp.down = arrows.down;
                    return element;
                }, true);

                if (team && players.length){
                    setUserProperties(team.property, team.value);
                    team.index = player.number - 1;
                    socket.emit('setUserProperties', team);
                }
       
                app.effect.swell.color(now, [temp.up, temp.down], color['white'], speed, swell);
                coBorderColor();

                if (app.key.pressed('enter')) {

                    clearTempAndPrev();
                    app.undo.tempAndPrev();
                    app.undo.keys();
                    resetDefaults('co');
                    resetDefaults('mode');
                    player.ready = true;
                    players[player.number - 1].ready = true;
                    socket.emit('ready', player);

                    if(map.players > 2){
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
                        players = [];
                        temp.back = true;
                        temp.gameName = true;
                        setupScreenElement.removeChild(document.getElementById('descriptionOrChatScreen'));
                    });
                }
            }else if(temp.ready){
                if(!temp.readyScreenChanged){

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

                if(app.key.pressed('enter')){

                    var message = app.chat.message(temp.input);
                    if (message) app.chat.display(message);
                    app.undo.keys();
                    return false;

                }else if(app.key.pressed('esc') || boot){

                    player.ready = false;
                    players[player.number - 1].ready = false;
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

                    app.undo.keys();
                    var upArr = document.getElementById('upArrowOutline');
                    var downArr = document.getElementById('downArrowOutline');
                    upArr.style.display = '';
                    downArr.style.display = '';
                    temp.ready = false;

                    if(map.players > 2){
                        temp.selectTeams = true;
                    }else{
                        changeTeamElementHeight('30%');
                        temp.selectTeams = false;
                        temp.joinCreate = true;
                    }
                }
            }else{
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

                    var arrows = createArrows(element ,top + 5, top);

                    temp.up = arrows.up;
                    temp.down = arrows.down;

                    return element;
                });

                if (team) setUserProperties(team.property, team.value);

                app.effect.swell.color(now, [temp.up, temp.down], color['white'], speed, swell);
                coBorderColor();

                if (app.key.pressed('esc') || app.key.pressed('enter') || boot){
                    var top = prev.top;
                    changeSelectTeamHeight(top);
                    resetDefaults('Team');
                    app.undo.tempAndPrev();
                    clearTempAndPrev();

                    if(app.key.pressed('enter')){
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
                    app.keys.splice(0,app.keys.length);
                    changeTeamElementHeight('30%');
                    temp.joinCreate = true;
                }
            }
        },
        setup: function (setupScreen){

            now = Date.now();

            // select game mode
            if(app.user && !mode){
                mode = app.display.select('modeItemIndex', 'selectModeMenu', app.effect.setupMenuMovement, 'li', 5, 'infinite');

                if(mode){
                    setupScreenElement = document.getElementById('setupScreen');
                    app.dom.removeChildren(setupScreenElement, 'title');
                    var footer = document.getElementById('footer');
                    footer.style.display = 'none';
                }
            }

            // set up the game based on what mode is being selected
            if(mode){
                if(mode === 'logout') return app.modes[mode]();
                game = app.modes[mode](setupScreenElement);
            }

            // listen for fading colors in and out on selection
            app.effect.swell.color(now);

            if(game === 'back'){
                setupScreenElement.parentNode.removeChild(setupScreenElement);
                game = mode = false;
                app.display.selectModeMenu();
                return app.game.setup();
            }

            // if a game has been started 
            if (game) {

                // start game adds players, player info, settings, game type, mode, maps etc to be used in game
                app.start(game);

                // start game loop
                return this.loop();

            // if the game hasnt been started then keep looping the setup menu
            }else{
                window.requestAnimationFrame(app.game.setup);
            }

            // remove key presses on each iteration
            if(app.keys.length)app.keys.splice(0,app.keys.length);        
        },
        setupRoom: function () {
            var room = {};
            var hq = [];
            var buildings = map.buildings;
            var len = buildings.length;
            for ( var b = 0; b < len; b += 1){
                if(buildings[b].type === 'hq') hq.push(buildings[b]);
            }
            room.name = gameName;
            room.settings = settings;
            room.max = hq.length;
            room.map = map;
            room.category = map.category;
            socket.emit('newRoom', room);
        },
        turn: function () {

            // make note of whose turn it is
            if ( currentPlayer.fbid === app.user.fbid ) {
                app.usersTurn = true;
            } else {
                app.usersTurn = false;
            }
        },

        /* --------------------------------------------------------------------------------------------------------*\
            app.game.loop consolidates all the game logic and runs it in a loop, coordinating animation calls and 
            running the game
        \*---------------------------------------------------------------------------------------------------------*/

        loop: function () {
            app.move.cursor(); // controls cursor and screen movement
            app.display.hud() // display terrain info
                .coStatus() // display co status hud
                .options() // listen for options activation
                .listen();  // listen for active huds and activate selection ability for their lists
            app.effect.swell.color(); // listen for fading colors in and out on selection
            app.select.move(); // controls selection and interaction with map elements
            app.build.units(); // controls building of units
            app.select.exit(); // controls the ability to escape display menus
            window.requestAnimationFrame(app.game.loop);
            app.undo.keys();
        }
    };
}();