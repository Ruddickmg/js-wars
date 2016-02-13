/* ---------------------------------------------------------------------------------------------------------*\   
    add useful methods to prototypes
\* ---------------------------------------------------------------------------------------------------------*/

// add first letter capitalization funcitonality
String.prototype.uc_first = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// simple check if value is in a flat array
Array.prototype.hasValue = function (value) {return this.indexOf(value) > -1;};

// remove one arrays values from another
Array.prototype.offsetArray = function (offsetArray) {
    for (var z = 0; z < offsetArray.length; z += 1) {
        for (var n = 0; n < this.length; n += 1) {
            if (this[n].x === offsetArray[z].x && this[n].y === offsetArray[z].y) {
                this.splice(n, 1);
            }
        }
    }
    return this;
};

/* ---------------------------------------------------------------------------------------------------------*\
    socket connection handlers
\* ---------------------------------------------------------------------------------------------------------*/

var socket = require('./tools/sockets.js');

/* ---------------------------------------------------------------------------------------------------------*\
    app holds all elements of the application 
\* ---------------------------------------------------------------------------------------------------------*/

var app = require('./settings/app.js');

/* --------------------------------------------------------------------------------------*\ 
    load dummy variables if/for testing locally 
\* --------------------------------------------------------------------------------------*/

if (app.testing){

    gameMap = require('./objects/map.js');

    app.games.push({
        category: gameMap.category,
        max: gameMap.players,
        mapId: gameMap.id,
        settings: {
            funds: 1000,
            fog:'off',
            weather:'random',
            turn:'off',
            capt:'off',
            power: 'on',
            visuals: 'off', 
        },
        name:'testing'
    });
}

/* --------------------------------------------------------------------------------------*\
    app.settings holds application settings
\* --------------------------------------------------------------------------------------*/

app.settings = require('./settings/game.js');

/* --------------------------------------------------------------------------------------*\
    app.heap is a binary heap 
\* --------------------------------------------------------------------------------------*/

app.heap = require('./tools/binaryHeap.js');
 
/* ---------------------------------------------------------------------------------------------------------*\
    handle chat interactions
\* ---------------------------------------------------------------------------------------------------------*/

app.chat = require('./tools/chat.js');

/* ---------------------------------------------------------------------------------------------------------*\
    handles AJAJ calls where needed
\* ---------------------------------------------------------------------------------------------------------*/

app.request = require('./tools/request.js');

/* --------------------------------------------------------------------------------------------------------*\
    app.game.setup controls the setting up and selection of games / game modes 
\*---------------------------------------------------------------------------------------------------------*/

app.game = function () {

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
                    delete app.prev.items;
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

            // scroll info on hovered elements, user joins etc in footer scroll bar
            app.effect.scrollInfo(now);

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

/* ---------------------------------------------------------------------------------------------------------*\
    event listeners
\* ---------------------------------------------------------------------------------------------------------*/

window.addEventListener("keydown", function (e) {
    if( !app.game.started() || app.usersTurn || e.keyCode === app.settings.keys.exit || app.options.active() ){
        app.keys[e.keyCode] = e.keyCode;
    }
}, false);

window.addEventListener("keyup", function (e) {
    app.keys[e.keyCode] = false;
    app.keys.splice(0,app.keys.length);
}, false);

/* ---------------------------------------------------------------------------------------------------------*\
    app.start sets up the game with the players and other info necessary for the new game
\* ---------------------------------------------------------------------------------------------------------*/

app.start = require('./game/start.js');

/* ---------------------------------------------------------------------------------------------------------*\
    app.init creates a new canvas instance
\* ---------------------------------------------------------------------------------------------------------*/

app.init = require('./tools/init.js');

/* ---------------------------------------------------------------------------------------------------------*\
    app.build handles the creation of new units, buildings or terrain on the map
\* ---------------------------------------------------------------------------------------------------------*/

app.build = require('./game/build.js');

/* ---------------------------------------------------------------------------------------------------------*\
    app.undo handles the cleanup and disposal of elements that are no longer needed or need to be removed
\* ---------------------------------------------------------------------------------------------------------*/

app.undo = require('./tools/undo.js');

/* ----------------------------------------------------------------------------------------------------------*\
    app.options handles the in game options selection, end turn, save etc.
\* ----------------------------------------------------------------------------------------------------------*/

app.options = require('./game/options.js');

/* ----------------------------------------------------------------------------------------------------------*\
    app.actions handles actions that a unit can take
\* ----------------------------------------------------------------------------------------------------------*/

app.actions = require('./game/actions.js');

/* ----------------------------------------------------------------------------------------------------------*\
    app.calculate handles calculations like pathfinding and the definition of movement range
\* ----------------------------------------------------------------------------------------------------------*/

app.calculate = require('./game/calculate.js');

/* ------------------------------------------------------------------------------------------------------*\
    app.select handles the selection and movement of map elements
\* ------------------------------------------------------------------------------------------------------*/

app.select = require('./game/select.js');

/* ------------------------------------------------------------------------------------------------------*\
    app.dom is a list of functions used to assist manipulating the dom
\* ------------------------------------------------------------------------------------------------------*/

app.dom = require('./tools/dom.js');

/* ------------------------------------------------------------------------------------------------------*\
    app.display handles all the display screens and the users interaction with them
\* ------------------------------------------------------------------------------------------------------*/

app.display = function () {

    var sideX, sideY, selectionIndex = 1, selectedElement, hide, len, prevX, prev = {}, temp = {}, selectable = true, prevIndex = undefined,
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

            if(selectedElement){
                selectedElementId = selectedElement.getAttribute('id');
                if(app.effect.selected()) app.effect.input(selectedElement.id); 
            }

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

        if(!app.prev) app.undo.tempAndPrev();
        
        // if a specific display value hasnt been set then default to an empty string
        var display = elements.display ? elements.display : '';

        // get properties from the object being displayed and use them to retrieve indexes, descriptions etc
        var properties = elements.properties;

        // create list of property names accessable to the player (object keys)
        if(player){
            var co = app.game.coSelection(properties, prev.list, app.prev.items);
            var list = co.list;
            var ind = co.ind;
        }else{
            var list = Object.keys(properties);
        }

        var listLength = list.length;

        // keep track of what is selected in the list for recall
        if(prev.listLength !== listLength && app.prev.items && player) app.prev.items = list.indexOf(ind);
        
        // get the currently selected index, start with 0 if one has not yet been defined
        var index = app.scroll.horizontal().infinite(app.prev.items || 0, 0, list.length - 1);

        // get the property name of the currently selected index for use in retrieving elements of the same name
        var property = list[index];

        // get the element that displays the text: descriptions, chat etc...
        if(!app.temp.text) app.temp.text = document.getElementById(elements.text);

        // if there arent any previous indexes (we have just started) or the last index is not
        // the same as the current index then manipulate the newly selected element
        if(app.prev.items === undefined || app.prev.items !== index || prev.listLength !== listLength){
            
            prev.list = list;
            prev.listLength = listLength;

            // if the description for the current element is text then print it
            if(!properties[property].description) console.log(properties);
            if ( typeof (properties[property].description) === 'string' ){
                app.effect.typeLetters(app.temp.text, properties[property].description);
            }
            
            // indicate that we have changed elements
            var change = true;

            // callback that handles what to do with horizontally scrolled elements
            var selected = app.temp.selected = callback(property);

            // get all the list items from the currently selected element
            var items = app.temp.items = app.dom.getImmediateChildrenByTagName(selected, 'li');

            // save the currently selected index as a comparison to possibly changed indexes in the future
            app.prev.items = index;

            // if we have visited this element before, get the last selected index for it and display that
            // rather then the currently selected list item index
            if (app.prev[property]) var itemIndex = app.prev[property].getAttribute(property + elements.index);
        }

        // if there wasnt a previously selected item index for the current element 
        if(!itemIndex){
            
            // get the length of the array of list items in the currently selected element
            var len = app.temp.items.length;

            // then find the position of scroll that we are currently at for the newly selected element
            // use the length as a boundry marker in the scroll function
            var itemIndex = app.scroll.verticle().infinite(app.prev.itemIndex || 1, 1, len);
        }

        // if there has been a change, or if the previous item index is not the same as the current
        if(change || itemIndex && app.prev.itemIndex !== itemIndex){

            // if there has been a change but there is no previously selected list item for the
            // currently selected element
            if(change && !app.prev[property]){

                // get the element listed as the default value for selection
                var element = app.dom.findElementByTag('default', app.temp.items, true);

            }else{

                // get the element at the currently selected list items index
                var element = app.dom.findElementByTag(property + elements.index, app.temp.items, itemIndex);
            }

            // hide the previously selected list item for the currently selected element
            if(app.prev[property] && !change) app.prev[property].style.display = 'none';

            // display the currently selected list item
            element.style.display = display;

            // save the currently selected list item for use as the last selected item
            // in the currently selected element in case we need to move back to it
            app.prev[property] = element;

            // save the currently selected index as a comparison to possibly changed indexes in the future
            app.prev.itemIndex = Number(itemIndex);

            // get the value of the selected attribute
            var value = element.getAttribute(elements.attribute);

            // if the description from properties is an object then use the current value as a key 
            // for that object in order to display a description for each list item, rather then its 
            // parent element as a whole
            if ( typeof (properties[property].description) === 'object' ){
                app.effect.typeLetters(app.temp.text, properties[property].description[value]);
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
        reset: function () {selectionIndex = 1},
        index: function () {return selectionIndex},
        previousIndex: function () {return prevIndex;},
        resetPreviousIndex: function () {prevIndex = undefined;},
        loop: function () {loop=true},
        through: function (){loop=false},
        menuItemOptions: function ( selectedElement, menu ) {
            var prev = app.prev.horizon;
            var horizon = app.scroll.horizontal().finite(app.prev.horizon || 1, 1, 2);
            if(menu) menu.style.opacity = 1;

            // display the menu options
            if(horizon && prev !== horizon){

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
                delete app.temp.horizon;
                app.prev.horizon = horizon;
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

/* ------------------------------------------------------------------------------------------------------*\
    app.move handles all the movement in the game, the cursor, scrolling, and moving of units etc..
\* ------------------------------------------------------------------------------------------------------*/

app.move = function () {

    var abs = Math.abs;

    var refreshMovement = function (player) {
        var unit;
        var units = app.map.unit;

        // used for accessing the correct building array via what type of transportation the unit uses
        var ports = {
            air: 'airport',
            foot: 'base',
            wheels: 'base',
            boat: 'seaport'
        };
        for (var u = 0; u < units.length; u += 1) {
            unit = units[u];
            // check for units that belong to the current player
            if (unit.player === player) {
                // add the original movement allowance to each unit on the board belonging to the current player
                app.map.unit[u].movement = app.units[unit.type].properties.movement;

                // reset attack abilities
                app.map.unit[u].attacked = false;   

                // reset capture abilities
                app.map.unit[u].captured = false;
            }
        }
        return true;
    };

    // screenRefresh the postions on the screen of all the units/terrain/buildings/etc
    var screenRefresh = function () { 
        window.requestAnimationFrame(app.animate(['terrain', 'building', 'unit']));
    };

    var moveScreen = function (axis, x, screenDim) {

        var delay = app.settings.scrollSpeed;
        var screenZeroWidth = app.settings.cursor.scroll[axis];
        var midScreen = screenDim / 2;
        var lower = screenZeroWidth + midScreen;
        var scroll = app.settings.cursor.scroll[axis] + screenDim;
        var dimensions = app.map.dimensions[axis];

        if (!app.temp.scrollTimer) app.temp.scrollTimer = new Date();

        app.settings.cursor[axis] = x;

        // if the hq is located to the right or below the center of the screen then move there
        if (x > scroll - midScreen) {
            // loop with a recursive function so that the time can be delayed
            // creating the effect of moving the screen rather then immediately jumping to the hq
            (function loopDelay(i, dim) {
                setTimeout(function () { // set delay time
                    screenDim += 1;
                    app.settings.cursor.scroll[axis] += 1;
                    screenRefresh();
                    // if the distance between the center screen position and the hq has not been traveled
                    // then keep going, or if the screen has reached the limit of the map dimensions then stop
                    if (--i && screenDim <= dim) loopDelay(i, dim);
                }, delay); // <--- delay time
            })(x - (scroll - midScreen), dimensions);

            // if its to the left or above the screen then move the opposite direction
        } else if (x < lower) {
            (function loopDelay2(i, dim) {
                setTimeout(function () { // set delay time
                    screenZeroWidth -= 1;
                    app.settings.cursor.scroll[axis] -= 1;
                    screenRefresh();
                    if (--i && screenZeroWidth > dim) loopDelay2(i, dim);
                }, delay); // <--- delay time
            })(lower - x, 0);
        }
    };

    // checks if movement is within allowed range
    var canMove = function (move, range) {

        for (var o = 0; o < range.length; o += 1) {

            if (range[o].x === move.x && range[o].y === move.y) {
                return true;
            }
        }
        return false;
    };

    // creates scrolling effect allowing movement and map dimensions beyond screen dimensions
    var scrol = function (incriment, axis, operation) {

        var d = app.map.dimensions[axis]; // map dimensions
        var screenDimensions = {
            x: 15,
            y: 10
        }; // screen dimensions
        var s = screenDimensions[axis];
        var c = app.settings.cursor.scroll[axis];

        // if the resulting movement is greater then the screen size but within the dimensions of the map then scroll
        if (incriment >= s + c && incriment <= d) {
            app.settings.cursor.scroll[axis] += operation;
            screenRefresh();

            // if the resulting movement is less then the screen size but within the dimensions of the map then scroll back
        } else if (incriment < c && incriment >= 0) {
            app.settings.cursor.scroll[axis] += operation;
            screenRefresh();
        }
    };

    var cursor = function (axis, comparison, operation) {

        var temp = app.temp;

        if (!temp.selectedBuilding && !temp.optionsActive && !temp.actionsActive) {

            var cursor = app.settings.cursor[axis]; // cursor location

            scrol(cursor + operation, axis, operation); // handle scrolling

            if (app.select.unit()) {
                var result = limit(axis, operation);
                if (result) {
                    app.undo.effect('path');
                    app.display.path({
                        x: result.x,
                        y: result.y
                    });
                    return true;
                }
            } else if (operation < 0) {
                if (cursor + operation >= comparison) {
                    app.settings.cursor[axis] += operation;
                    return true;
                }
            } else {
                if (cursor + operation <= comparison) {
                    app.settings.cursor[axis] += operation;
                    return true;
                }
            }
        }
        return false;
    };

    var limit = function (axis, operation) {
        var oAxis = axis === 'x' ? 'y' : 'x';
        var a = {};
        var d = app.map.dimensions;

        a[axis] = app.settings.cursor[axis] + operation;
        a[oAxis] = app.settings.cursor[oAxis];

        if (canMove(a, app.select.range()) && a[axis] >= 0 && a.x <= d.x && a.y <= d.y) {
            app.settings.cursor[axis] += operation;
            return app.settings.cursor;
        }
        return false;
    };

    return {

        refresh: function (player) {
            return refreshMovement(player.id);
        },

        // move screen to current players hq
        screenToHQ: function (player) {
            var sd = app.cursorCanvas.dimensions();
            var screenWidth = sd.width / 64;
            var screenHeight = sd.height / 64;
            var x = player.hq.x;
            var y = player.hq.y;

            moveScreen('x', x, screenWidth);
            moveScreen('y', y, screenHeight);
        },

        // keep track of cursor position
        cursor: function () {
            if (!app.select.building() && !app.options.active() && !app.actions.active()) {
                var d = app.map.dimensions;
                var key = app.key;
                var pressed;

                // Player holding up
                // if the cursor has moved store a temporary varibale that expresses this @ app.def.cursorMoved
                if (key.pressed('up') && cursor('y', 0, -1)) pressed = key.up;

                if (key.pressed('down') && cursor('y', d.y, 1)) pressed = key.down;

                // player holding left
                if (key.pressed('left') && cursor('x', 0, -1)) pressed = key.left;

                // Player holding right
                if (key.pressed('right') && cursor('x', d.x, 1)) pressed = key.right;

                if(pressed){
                    app.def.cursorMoved = true;
                    socket.emit('cursorMove', pressed);
                };
                window.requestAnimationFrame(app.animate('cursor'));
            }
            return this;
        }
    };
}();

/* --------------------------------------------------------------------------------------*\
    app.modes holds functions for the selection of game modes / logout etc..
\* --------------------------------------------------------------------------------------*/

app.modes = function (){

    var key = app.game.keys;
    var game = {};
    var boot = false, active = false;
    
    return {
        boot:function(){boot = true},
        logout: function (){
            alert('log out!');
            /*  
            // log user out of facebook
            FB.logout(function(response) {
              console.log(response);
            });
            */
        },
        newgame:function(setupScreen, callback){

            // handle map selection
            if (!game.map){
                game.map = app.game.choseMapOrGame('map');
                if(game.map === 'back'){
                    delete game.map;
                    return 'back';
                }
            }

            // handle settings selection
            if (game.map && !game.settings){
                game.settings = app.game.choseSettings(setupScreen);
                if (game.settings === 'back') {
                    delete game.settings;
                    delete game.map;
                }
            }

            // handle co position and selection as well as joining the game
            if (game.map && game.settings && !game.players){
                game.players = app.game.join(setupScreen);
                if(game.players === 'back'){
                    console.log('back');
                    socket.emit('exit', boot);
                    delete game.players;
                    delete game.settings;
                    boot = false;
                }
            }

            if (game.map && game.settings && game.players) return game;
            return false;
        },
        continuegame:function(){
            alert('continue an old game is under construction. try new game or join new');
        },
        newjoin:function(){
            // handle game selection
            if (!game.room){
                game.room = app.game.choseMapOrGame('game');
                if(game.room === 'back'){
                    delete game.room;
                    return 'back';
                }
            }

            if(game.room && !game.players){
                game.players = app.game.join('choseGame');
                if(game.players === 'back'){
                    socket.emit('exit');
                    delete game.room;
                    delete game.players;
                }
            }
        },
        continuejoin:function(){
            alert('continue join is under construction, try new game or join new');
        },
        COdesign:function(){
            alert('design a co is under construction. try new game or join new');
        },
        mapdesign:function(){
            if(!app.prev.sent){
                app.request.post(gameMap, 'maps/save', function(response){
                    console.log(response);
                });
                app.prev.sent = true;
            }
            if(app.key.pressed('esc')){
                return 'back';
            }
        },
        store:function(){
            alert('go to the game store is under construction. try new game or join new');
        },
        active: function(){return active;},
        activate: function(){active = true;},
        deactivate: function(){active = false;},
    };
}();

/* --------------------------------------------------------------------------------------*\
    app.game.settings consolidates holds settings for the game
\* --------------------------------------------------------------------------------------*/

app.scroll = require('./menu/scroll.js');

/* --------------------------------------------------------------------------------------*\
    app.effect is holds the coordinates for effects
\* --------------------------------------------------------------------------------------*/

app.effect = function () {

    var key, undo, block, prev = {}, positions = ['oneAbove','twoAbove','oneBelow','twoBelow'], scrollInput;

    var findElementsByClass = function (element, className){
        var elements = [];
        for (var i = 0; i < element.childNodes.length; i += 1) {
            if (element.childNodes[i].className === className) {
                elements.push(element.childNodes[i]);
            }
        }
        return elements;
    };

    var fade = function (element, id){
        app.temp.swell = element;
        app.temp.swellingColor = app.settings.colors[id];
    };

    var stopFading = function (){delete app.temp.swell;};

    var highlightListItem = function (selectedElement, tag, index, prev, elements) {

        // apply highlighting 
        selectedElement.style.backgroundColor = 'tan';

        // display info on the currently hovered over element
        if (id === 'selectUnitScreen') unitInfo(selected, selectedElement.id); /// selected unnacounted for

        // if there is then remove its highlighting
        if (prev) prev.style.backgroundColor = '';

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
        highlight: [],
        path: [],

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

            var previous = app.prev.category;

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
                app.prev.category = show;
                return show.id;
            }
            return false;
        },

        setupMenuMovement:function (selectedElement, tag, index, prev, elements){

            // if the item being hovered over has changed, remove the effects of being hovered over
            if(prev){
                stopFading();
                var background = findElementsByClass(prev, 'modeBackground')[0] || false;
                if(background){
                    background.style.height = '';
                    background.style.borderColor = '';
                }else{
                    prev.style.height = '';
                    prev.style.borderColor = '';
                }
                if(!app.modes.active()){
                    if(app.prev.textBackground){
                        var tbg = app.prev.textBackground;
                        tbg.style.transform = '';
                        tbg.style.backgroundColor = 'white';
                    }
                    if(app.prev.text) app.prev.text.style.letterSpacing = '';
                    block = findElementsByClass(prev, 'block')[0] || false;
                    if(block) block.style.display = '';
                    var prevOptions = findElementsByClass(prev, 'modeOptions')[0] || false;
                    if(prevOptions && !app.temp.horizon) prevOptions.style.opacity = 0;
                }
            }

            app.display.through();

            if(!app.def.menuOptionsActive && app.temp.horizon && app.temp.horizon === 'right') delete app.temp.horizon;

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

                // get the h1 text element of the selected mode and its background span
                var text = findElementsByClass(selectedElement, 'text')[0] || false;
                var background = selectedElement.getElementsByTagName('span')[0] || false;

                if(text && background){
                    // save the background and text for resetting on new selection
                    app.prev.textBackground = background;
                    app.prev.text = text;

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
                app.display.menuItemOptions(selectedElement, menu);
                if(menu){
                    app.def.menuOptionsActive = true;
                    return false; // tells select that it is not selectable since it has further options
                }else if(!app.modes.active()){
                    app.def.menuOptionsActive = false;
                }
            }
            return true;
        },

        input: function (input) {scrollInput = input;},
        selected: function () {return scrollInput;},

        scrollInfo:function(now){
            if(scrollInput){

                if(now - app.def.scrollTime > 5){

                    app.def.scrollTime = now;

                    if(app.def.scroll !== scrollInput){
                        delete app.temp.p;
                        delete app.temp.footer;
                    }

                    var p = app.temp.p, footer = app.temp.footer, text = app.temp.footerText;

                    if(!footer) footer = app.temp.footer = document.getElementById('footer');
                    if(footer){
                        if (!p) p = app.temp.p = document.getElementById('scrollingInfo');
                        if (!text) text = app.temp.footerText = document.getElementById('footerText');
                    }
                    if(p && text){

                        text.innerHTML = app.settings.scrollMessages[scrollInput];

                        if(app.temp.scrollPosition === undefined) app.temp.scroll.element();Position = -text.offsetWidth;
                        
                        var pos = app.temp.scroll.element();Position;

                        if(pos !== undefined){
                            if(pos <= footer.offsetWidth ){
                                p.style.left = pos + 'px';
                                app.temp.scroll.element();Position += 3;
                            }else{
                                app.temp.scroll.element();Position = -text.offsetWidth * 4;
                            }
                        }
                    }
                }
            }
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
            size: function (element, min, max, inc, swellSpeed) {

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

/* --------------------------------------------------------------------------------------*\
    app.co holds all the co's, their skills and implimentation
\* --------------------------------------------------------------------------------------*/

app.co = require('./game/co.js');

/* --------------------------------------------------------------------------------------*\
    app.units is a repo for the units that may be created on the map and their stats
\* --------------------------------------------------------------------------------------*/

app.units = require('./objects/units.js');

/* --------------------------------------------------------------------------------------*\
    app.buildings is a list of each building and the inits they are capable of producing
\* --------------------------------------------------------------------------------------*/

app.buildings = require('./objects/buildings.js');

/* --------------------------------------------------------------------------------------------------------*\
    app.init sets up a working canvas instance to the specified canvas dom element id, it is passed the id
    of a canvas element that exists in the dom and takes care of initialization of that canvas element
\*---------------------------------------------------------------------------------------------------------*/

app.backgroundCanvas = app.init('background');
app.terrainCanvas = app.init('landforms');
app.buildingCanvas = app.init('buildings');
app.effectsCanvas = app.init('effects');
app.unitCanvas = app.init('units');
app.weatherCanvas = app.init('weather');
app.cursorCanvas = app.init('cursor');

/* ----------------------------------------------------------------------------------------------------------*\
    animation instructions
\*-----------------------------------------------------------------------------------------------------------*/

app.drawTerrain = function (draw) { draw.cache().coordinate('map', 'terrain');};
app.drawBuilding = function (draw) { draw.coordinate('map', 'building');};
app.drawBackground = function (draw) {draw.background('background');};
app.drawUnit = function (draw) { draw.coordinate('map', 'unit'); };
app.drawWeather = function (draw) {}; // weather stuff animated here
app.drawEffects = function (draw) { 
    draw.coordinate('effect', 'highlight'); // highlighting of movement range
    draw.coordinate('effect', 'path'); // highlighting current path
};

app.drawCursor = function (draw) {
    if (!app.settings.hideCursor && app.usersTurn) draw.coordinate('map', 'cursor', [app.settings.cursor]);
    if (app.settings.target) draw.coordinate('map', 'target', [app.settings.target]);
};

/* ----------------------------------------------------------------------------------------------------------*\
    app.animate triggers game animations
\*-----------------------------------------------------------------------------------------------------------*/

app.animate = require('./game/animate.js');

/* --------------------------------------------------------------------------------------------------------*\
    app.draw controls drawing of animations
\*---------------------------------------------------------------------------------------------------------*/

app.draw = require('./game/draw.js');

/* --------------------------------------------------------------------------------------------------------*\
    app.animations is a collection of animations used in the game
\*---------------------------------------------------------------------------------------------------------*/

app.animations = require('./objects/animations.js');