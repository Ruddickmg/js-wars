/* ---------------------------------------------------------------------------------------------------------*\
    
    socket connection handlers
    
\* ---------------------------------------------------------------------------------------------------------*/

var socket = io.connect("http://127.0.0.1:8080") || io.connect("http://jswars-jswars.rhcloud.com:8000");

socket.on('player', function(player){app.game.setPlayer(player);});
socket.on('userAdded', function(message){app.chat.display(message);});
socket.on('gameReadyMessage', function(message){app.chat.display(message);});
socket.on('propertyChange', function(properties){app.game.changeProperties(properties);});
socket.on('readyStateChange', function(player){app.game.playerReady(player);});
socket.on('addPlayer', function(player){app.game.addPlayer(player);});
socket.on('room', function(room){app.game.room(room);});
socket.on('addRoom',function(room){app.game.addRoom(room);});
socket.on('removeRoom', function(room){app.game.removeRoom(room);});
socket.on('disc', function(user){
    app.chat.display({message:'has been disconnected.', user:user.name.uc_first()});
    app.game.removePlayer(user);
});
socket.on('userJoined', function(user){
    app.game.addPlayer(user);
    if(!user.cp) app.chat.display({message:'has joined the game.', user:user.name.uc_first()});
});
socket.on('userLeft', function(user){
    app.chat.display({message:'has left the game.', user:user.name.uc_first()});
    app.game.removePlayer(user);
});
socket.on('userRemoved', function (user) {
    app.chat.display({message:'has been removed from the game.', user:user.name.uc_first()});
    app.game.removePlayer(user);
});

socket.on('back', function(){app.modes.boot();app.game.back();});
socket.on('cursorMove', function(move){app.keys.push(move);});
socket.on('attack', function(attack){app.actions.attack(attack);});
socket.on('joinUnits', function(combine){app.actions.combine(combine);});
socket.on('capture', function(capture){app.actions.capture(capture);});
socket.on('endTurn', function(){app.options.end();});
socket.on('moveUnit', function(move){
    app.map[move.type][move.index].x = move.x;
    app.map[move.type][move.index].y = move.y;
    window.requestAnimationFrame(app.animateUnit);
});

/* ---------------------------------------------------------------------------------------------------------*\
    
    add useful methods to prototypes
   
\* ---------------------------------------------------------------------------------------------------------*/

// add first letter capitalization funcitonality
String.prototype.uc_first = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// simple check if value is in a flat array
Array.prototype.hasValue = function (value) {
    return this.indexOf(value) > -1;
};

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
    
    app is a container and holds low level variables for all elements of the application 
\* ---------------------------------------------------------------------------------------------------------*/

app = {

    testing: true,
    games:[],

    // return an hsl string from either manual settings or object containing hsl values
    hsl:function(h,s,l) {
        var format = function (hue, saturation, lightness) {
            return 'hsl('+hue+','+saturation+'%,'+lightness+'%)';
        }
        if (!s && s !== 0) return format(h.h, h.s, h.l);
        return format(h,s,l);
    },

    turn: function () {
        // make note of whose turn it is
        if ( app.game.currentPlayer().fbid === app.user.fbid ) {
            app.usersTurn = true;
        } else {
            app.usersTurn = false;
        }
    },

    // holds number of pixles to move elements on or off screen
    offScreen: 800,

    // target element to insert before
    domInsertLocation: document.getElementById('before'),

    // holds temporary shared variables, usually info on game state changes that need to be accessed globally
    temp:{},

    // holds previously selected elements for resetting to defaults
    prev:{},

    // holds default shared variables, usually info on game state changes that need to be accessed globally
    def: {
        category:0,
        menuOptionsActive:false,
        selectActive: false,
        cursorMoved: true,
        saturation:0,
        scrollTime: 0,
        lightness:50
    },

    users: [{
        co: 'sami',
        name: 'grant'
    }, {
        co: 'andy',
        name: 'steve'
    }],

    cache: {},
    keys: [], // holds array of key pressed events
    maps: [], // holds maps for selection

    key: {
        pressed: function (key) {
            if(key !== 'pressed'){
                 var code = app.key[key];
                 if(code) return app.keys.indexOf(code) !== -1;
            }
            return false;
        },
        esc: 27,
        enter: 13,
        up: 38,
        down: 40,
        left: 37,
        right: 39
    },

    // create a new player object
    player: function (id, co, name, number) {

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

    // set custom animation repo if desired
    setAnimationRepo: function (repo) {
        this.animationRepo = repo;
        return this;
    }
};

/* --------------------------------------------------------------------------------------*\
    
    gameMap contains all the settings for a dummy map, unit locations, terrain, buildings, etc. 
    it holds coordinates of objects that correspond to animations in the animation repo
    maps can be built and edited dynamically by inserting or removing objects from/into the 
    arrays
\* --------------------------------------------------------------------------------------*/

if (app.testing){
    gameMap = {
        id:1,
        creator:1,
        name:'2p map',
        players:2,
        category:'two',
        background: {
            type: 'plain',
            x: 20,
            y: 20
        },
        dimensions: {
            x: 20,
            y: 20
        },
        plain: {
            type: 'plain',
            name: 'Plains',
            def: 1
        },
        terrain: [{
            x: 1,
            y: 7,
            type: 'tallMountain',
            name: 'Mountain',
            obsticle: 'mountain',
            def: 2
        }, {
            x: 2,
            y: 5,
            type: 'tallMountain',
            name: 'Mountain',
            obsticle: 'mountain',
            def: 2
        }, {
            x: 3,
            y: 4,
            type: 'tallMountain',
            name: 'Mountain',
            obsticle: 'mountain',
            def: 2
        }, {
            x: 8,
            y: 5,
            type: 'tallMountain',
            name: 'Mountain',
            obsticle: 'mountain',
            def: 2
        }, {
            x: 1,
            y: 1,
            type: 'tallMountain',
            name: 'Mountain',
            obsticle: 'mountain',
            def: 2
        }, {
            x: 1,
            y: 5,
            type: 'tree',
            name: 'Woods',
            obsticle: 'wood',
            def: 3
        }, {
            x: 1,
            y: 6,
            type: 'tree',
            name: 'Woods',
            obsticle: 'wood',
            def: 3
        }, {
            x: 1,
            y: 8,
            type: 'tree',
            name: 'Woods',
            obsticle: 'wood',
            def: 3
        }, {
            x: 3,
            y: 5,
            type: 'tree',
            name: 'Woods',
            obsticle: 'wood',
            def: 3
        }, {
            x: 6,
            y: 2,
            type: 'tree',
            name: 'Woods',
            obsticle: 'wood',
            def: 3
        }, {
            x: 6,
            y: 3,
            type: 'tree',
            name: 'Woods',
            obsticle: 'wood',
            def: 3
        }, {
            x: 9,
            y: 5,
            type: 'tree',
            name: 'Woods',
            obsticle: 'wood',
            def: 3
        }, {
            x: 9,
            y: 6,
            type: 'tree',
            name: 'Woods',
            obsticle: 'wood',
            def: 3
        } ],
        buildings: [{
            x: 0,
            y: 5,
            type: 'hq',
            name: 'HQ',
            obsticle: 'building',
            player: 1,
            color: 'red',
            def: 4
        },{
            x: 20,
            y: 5,
            type: 'hq',
            name: 'HQ',
            obsticle: 'building',
            player: 2,
            color: 'blue',
            def: 4
        },{
            x: 0,
            y: 4,
            type: 'base',
            name: 'Base',
            obsticle: 'building',
            player: 1,
            color: 'red',
            def: 4
        },{
            x: 4,
            y: 4,
            type: 'base',
            name: 'Base',
            obsticle: 'building',
            player: 1,
            color: 'red',
            def: 4
        },{
            x: 15,
            y: 4,
            type: 'base',
            name: 'Base',
            obsticle: 'building',
            player: 2,
            color: 'blue',
            def: 4
        }],
        unit: []
    };

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
    
    app.settings consolidates all the customizable options and rules for the game into
    an object for easy and dynamic manipulation
\* --------------------------------------------------------------------------------------*/

app.settings = {

    // messages to display in the bottom scroll bar as items are hovered over and people join games, etc..
    scrollMessages:{
        logout:'select to log out of the game',
        game:'Create or continue a saved game',
        newgame:'Set up a new game',
        continuegame:'Resume a saved game',
        join:'Join a new or saved game',
        newjoin:'Find and join a new game',
        continuejoin:'Re-Join a saved game started at an earlier time',
        COdesign:'Customize the look of your CO',
        mapdesign:'Create your own custom maps',
        design:'Design maps or edit CO appearance',
        store:'Purchase maps, CO\'s, and other game goods' 
    },

    // speed at which color swell.. fading in and out, will cycle (lower is faster)
    colorSwellIncriment:1.5,
    colorSwellSpeed:2,

    // general swell speed
    swellIncriment:3,
    swellSpeed:1,

    //typing speed
    typingSpeed:2.5,

    // colors of menus etc...
    colors: {
        design:{h:216,s:100,l:50},
        store:{h:72, s:100, l:50},
        game:{h:0, s:100, l:50},
        join:{h:144, s:100, l:50},
        logout:{h:288, s:100, l:50},
        white:{h:360,s:0,l:100},
        yellow:{h:72, s:100, l:50},
        green:{h:144, s:100, l:50},
        red:{h:0, s:100, l:50},
        blue:{h:216,s:100,l:50}
    },

    // speed at which the screen will move to next hq at the changinf of turns
    scrollSpeed: 50,

    // types to look through when determining terrains effect on unit movement
    obsticleTypes: ['unit', 'terrain'],

    // list of the effects each obsticle has on each unit type
    obsticleStats: {
        mountain: {
            infantry: 2,
            apc:2
        },
        wood: {
            infantry: 1,
            apc:2
        },
        plain: {
            infantry: 1,
            apc:1
        },
        unit: {
            infantry: 1,
            apc:1
        }
    },

    selectedModeHeight: 75,

    selectModeMenu:[{
            id:'logout',
            display:'Logout',
            type:'exit',
        },{
            id:'game',
            display:'Game',
            type:'setup',
            options:['new', 'continue']
        },{
            id:'join',
            display:'Join',
            type:'join',
            color:'yellow',
            options:['new', 'continue']
        },{
            id:'design',
            display:'Design',
            type:'design',
            options:['map', 'CO']

        },{
            id:'store',
            display:'Store',
            type:'store',
    }],

    categories:{
        two:{
            type:'1 on 1'
        },
        three: {
            type:'3 Player'
        },
        four:{
            type:'4 Player'
        },
        five:{
            type:'5 Player'
        },
        six:{
            type:'6 Player'
        },
        seven:{
            type:'7 Player'
        },
        eight:{
            type:'8 Player'
        },
        preDeployed:{
            type:'Pre-Deployed'
        }
    },

    capture: 20,

    combinableProperties:['fuel','health','ammo'],

    // terrain each unit is allowed to walk on
    movable: {
        foot: ['plain', 'river', 'mountain', 'wood', 'road', 'building'],
        wheels: ['plain', 'wood', 'road', 'building'],
        flight: ['plain', 'river', 'mountain', 'wood', 'road', 'water', 'building'],
        boat: ['water', 'building']
    },

    options: {
        unit: {
            name: 'Unit'
        },
        intel: {
            name: 'Intel'
        },
        options: {
            name: 'Options'
        },
        save: {
            name: 'Save'
        },
        end: {
            name: 'End'
        }
    },

    buildingDisplayElement: {
        city:{
            numberOf:0,
            type:'city'
        },
        base:{
            numberOf:0,
            type:'base'
        },
        airport:{
            numberOf:0,
            type:'airport'
        },
        seaport:{
            numberOf:0,
            type:'seaport'
        },
    },

    playersDisplayElement: {

    },

    settingsDisplayElement: {
        fog:{
            description:'Set ON to limit vision with fog of war.',
            on:'ON',
            off:'OFF'
        },
        weather:{
            description:'RANDOM causes climate to change.',
            clear:'Clear',
            rain:'Rain',
            snow:'Snow',
            random:'Random'
        },
        funds:{
            description:'Set funds recieved per allied base.',
            inc:500,
            min:1000,
            max:9500
        },
        turn:{
            description:'Set number of days to battle.',
            off:'OFF',
            inc:1,
            min:5,
            max:99
        },
        capt:{
            description:'Set number of properties needed to win.',
            off:'OFF',
            inc:1,
            min:7,
            max:45
        },
        power:{
            description:'Select ON to enamble CO powers.',
            on:'ON',
            off:'OFF'
        },
        visuals:{
            description:{
                off:'No animation.',
                a:'Battle and capture animation.',
                b:'Battle animation only.',
                c:'Battle animation for players only.'
            },
            off:'OFF',
            a:'Type A',
            b:'Type B',
            c:'Type C'
        }
    },

    // dimensions of diplay hud
    hudWidth: 120,
    hudHeight: 200,
    hudLeft: 1050,

    // spacing / positioning of mode menu selection elements
    modeMenuSpacing:20,

    // displayable attributes for the building count element on map/game selection
    buildingDisplay:['numberOf', 'canvas'],

    // which attributes of objects ( unit, buildings etc ) will be displayed in hud
    hoverInfo: ['ammo', 'health', 'name', 'fuel', 'def', 'canvas'],

    // which actions can be displayed
    actionsDisplay: ['attack', 'capture', 'wait', 'name'],

    // unit info attributes for display
    unitInfoDisplay: ['movement', 'vision', 'fuel', 'weapon1', 'weapon2', 'property', 'value'],

    // which attributes of units will be displayed on unit selection/purchase/building hud
    unitSelectionDisplay: ['name', 'cost'],

    // options attributes for displ
    optionsDisplay: ['options', 'unit', 'intel', 'save', 'end', 'name'],

    // map elements that cannot be selected
    notSelectable: ['terrain', 'hq', 'city'],

    // cursor settings
    cursor: {
        x: 6,
        y: 4,
        speed: 50,
        scroll: {
            x: 0,
            y: 0
        }
    }
};

/* --------------------------------------------------------------------------------------*\
    
    app.heap is a binary heap, takes a string as an optional argument, this string is used
    as the name of a property in a potential object to be accessed while assessing its 
    value in relation to the other heap elements

\* --------------------------------------------------------------------------------------*/

app.heap = function (property) { 

    // create the heap
    var heap = []; 

    // change any object properties associated with swap
    // if they have been assigned to the array element
    var heapIndex = function(index, parentIndex){
        if (heap[index].heapIndex !== undefined) heap.heapIndex = parentIndex;
        if (heap[parentIndex].heapIndex !== undefined) heap.heapIndex = index;
    };

    // swaps the parent index with the child, returns child's new index (parent index)
    // subtract one from each input to compensate for the array starting at 0 rather then 1
    var swap = function (index, parentIndex) {
        index -= 1; parentIndex -= 1; heapIndex(index, parentIndex);
        heap[index] = heap.splice(parentIndex, 1, heap[index])[0]; 
        return parentIndex;
    };

    // get the value at the input index, compensate for whether there is a property being accessed or not
    var value = function (index) {return property ? heap[index - 1][property] : heap[index - 1];};

    // calculate the parent index
    var parent = function (index) {return Math.floor(index/2)};

    // calculate the indexes of the left and right
    var left = function (i) {return i * 2;};
    var right = function (i) {return left(i) + 1;};

    // compare the values at the two supplied indexes, return the result of whether input l is greater then input r
    var lt = function(l,r) {return value(l) < value(r);};

    // if we are at the start of the array or the current nodes value is greater then its parent then return the current 
    // index (compensate for 0), otherwise swap the parent and child then repeat from the childs new position
    var bubble = function (index) {return index < 2 || lt(parent(index), index) ? index - 1 : bubble(swap(index, parent(index)));};

    var sort = function (index) {
        var l = left(index), r = right(index), length = heap.length;

        // if there are no more childnodes, swap the value at the current index with the value at
        // end of the array, sort the value at the current index then remove and return the 
        // last array element (the minimum element)
        if (length <= l) {swap(index, length); bubble(index); return heap.pop();}

        // if the right node is in range and less then the left node then swap 
        // the child with the right node, otherwise swap with the left
        return sort(swap(index, length > r && lt(r,l) ? r : l ));
    };

    return {
        // add a value to the heap
        push: function (value) {heap.push(value); return bubble(heap.length);},

        // remove and return the top item from the heap
        pop: function () {return sort(1);},

        // return the first value of the heap (lowest)
        min: function () {return heap.slice(0,1)[0];},

        // return the amount of elements in the heap (array)
        size: function () {return heap.length;},

        // bubble up an index
        bubble: function (index) {return bubble(index + 1);},

        // update an element in the heap, has an optional property argument used for accessing object properties
        update: function (index, value, property) {
            if(property){
                heap[index][property] = value;
            }else{
                heap.splice(index, 1, value);
            }
            return bubble(index + 1);
        }
    };
};
 
/* ---------------------------------------------------------------------------------------------------------*\
    
    function that makes player chat rooms work
    
\* ---------------------------------------------------------------------------------------------------------*/

// handle chat interactions
app.chat = function () {
    return {
        // add message for display, input is message object containing a user name and id, or just a message
        display: function (mo) {

            // construct message with user name or if there is no user name just use the message
            var message = mo.user ? mo.user + ': ' + mo.message : mo.message;

            // element that message is being appended to
            var chat = document.getElementById('chat');

            // if the message is a string then append it to the chat element
            if(chat && typeof (message) === 'string') {
                var chatMessage = document.createElement('li'); // create a list element to contain the message
                chatMessage.setAttribute('class', 'message'); // set attribute for styling
                chatMessage.innerHTML = message; // set text to message
                chat.appendChild(chatMessage); // append the li element to the chat element
                return message; // return the appended message
            }
            return false;
        },

        // send message, input is an object/element containing textual user input accessed by ".value"
        message: function (element) {
            var text = element.value; // user text input
            var name = app.user.screenName ? app.user.screenName : app.user.first_name; // get user name of user sending message
            if (name && text){ // make sure there is user input and a user name
                var message = { message:text, user:name }; // create message object containing user name and input text
                socket.emit('gameReadyChat', message); // transmit message to chat room
                element.value = ''; // reset the input box to empty for future input
                return message; // return the input message
            }
            return false;
        }
    };
}();

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
    
    function that makes AJAJ work where needed
    
\* ---------------------------------------------------------------------------------------------------------*/

app.request = function () {

    var ajaj = function (input, action, callback, url) {

        if ( !url ) throw new Error('No address specified for back end services');

        try{
          // Opera 8.0+, Firefox, Chrome, Safari
          var request = new XMLHttpRequest();
       }catch (e){
          // Internet Explorer Browsers
          try{
             var request = new ActiveXObject("Msxml2.XMLHTTP");
          }catch (e) {
             try{
                var request = new ActiveXObject("Microsoft.XMLHTTP");
             }catch (e){
                // Something went wrong
                alert("Your browser broke!");
                return false;
             }
          }
       }

       request.onreadystatechange = function(){
            if (request.readyState == 4 && request.status == 200)
            {
                if (callback){
                    return callback(JSON.parse(request.responseText));
                }else{
                    // Javascript function JSON.parse to parse JSON data
                    return JSON.parse(request.responseText);
                }
            }
        }

        try {
            var ts = new Date().getTime();
            request.open(action, url+'?ts='+ts, true);
            request.setRequestHeader("Content-type","application/json;charset=UTF-8");
            request.send(JSON.stringify(input));
        }catch (e){
            console.log(e);
            return false;
        }
    }
    return {
        post:function (input, url, callback){
            return ajaj(input, 'POST', callback, url);
        },
        get:function (input, url, callback) {
            return ajaj(input, 'GET', callback, url + '/' + input);
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

// initiate game by getting all the players, creating objects for them and assigning player one for first turn
app.start = function () {

    var players = app.game.players();
    var map = app.game.map();
    var settings = app.game.settings();

    for (var p = 0; p < players.length; p += 1) {

        // add each player to the players array
        app.game.loadPlayers(
            app.player(
                players[p].fbid,
                players[p].co, 
                players[p].screenName, 
                p + 1
            )
        );
    }

    // assign the first player as the current player
    app.game.setCurrentPlayer(app.game.players()[0]);

    // check whose turn it is
    app.turn();

    // set inital gold amount
    app.game.setCurrentPlayerGold(app.calculate.income(app.game.currentPlayer()));

    // begin game animations
    app.animateBackground();
    app.animateTerrain();
    app.animateBuildings();
    app.animateUnit();
    app.animateCursor();

    // if the current player has been assigned return true
    if (app.game.currentPlayer()){
        app.game.start(true);
        return true;
    } 
    return false;
};

/* ---------------------------------------------------------------------------------------------------------*\
    
    app.init creates a new canvas instance, taking the name of the target canvas id and optionally the context
    as a second perameter, it defaults to a 2d context. init also provides methods for rendering, setting 
    animations and returning the screen dimensions
\* ---------------------------------------------------------------------------------------------------------*/

app.init = function (element, context) {

    var canvas = document.getElementById(element);

    // check if browser supports canvas
    if (canvas.getContext) {

        // if the context is not set, default to 2d
        app.ctx = context === undefined || context === null ? '2d' : context;

        // get the canvas context and put canvas in screen
        var animate = canvas.getContext(app.ctx);

        // get width and height
        var sty = window.getComputedStyle(canvas);
        var padding = parseFloat(sty.paddingLeft) + parseFloat(sty.paddingRight);
        var screenWidth = canvas.clientWidth - padding;
        var screenHeight = canvas.clientHeight - padding;
        var screenClear = function () {
            //animate.clearRect( element.positionX, element.positionY, element.width, element.height );
            animate.clearRect(0, 0, screenWidth, screenHeight);
        };

        return {

            // set the context for the animation, defaults to 2d
            setContext: function (context) {
                this.context = context;
                return this;
            },

            // insert animation into canvas
            setAnimations: function (animations) {
                this.animations = animations;
                return this;
            },

            // draw to canvas
            render: function (loop, gridSquareSize) { // pass a function to loop if you want it to loop, otherwise it will render only once, or on demand
                if (!this.animations) { // throw error if there are no animations
                    throw new Error('No animations were specified');
                }
                screenClear();
                var drawings = app.draw(animate, {
                    width: screenWidth,
                    height: screenHeight
                }, gridSquareSize);
                this.animations(drawings);
                if (loop) window.requestAnimationFrame(loop);
            },

            // return the dimensions of the canvas screen
            dimensions: function () {
                return {
                    width: screenWidth,
                    height: screenHeight
                };
            }
        };
    } else {
        // if canvas not supported then throw an error
        throw new Error("browser does not support canvas element. canvas support required for animations");
    }
};

/* ---------------------------------------------------------------------------------------------------------*\
    
    app.build handles the creation of new units, buildings or terrain on the map
\* ---------------------------------------------------------------------------------------------------------*/

app.build = function () {

    // create new unit if/after one is selected
    var createUnit = function (building, unitType, player) {

        var player = app.game.currentPlayer();

        // creaate a new unit object with input
        var newUnit = {
            x: building.x,
            y: building.y,
            obsticle: 'unit',
            player: player
        };

        // get the requested unit types information from its reposetory
        var unit = app.buildings[building.type][unitType];

        // get the cost of the selected unit type
        var cost = unit.cost;

        // subtract the cost of the unit from the current players gold if they have enough
        if (currentPlayer.gold - cost > 0) {
            currentPlayer.gold -= cost;
        }

        // get the properties of the requested unit type
        var unitProperties = unit.properties;

        // get the names of the properties
        var properties = Object.keys(unitProperties);

        for (var p = 0; p < properties.length; p += 1) {

            // go through and add each property to the new unit object
            newUnit[properties[p]] = unitProperties[properties[p]]; // this may cause issues if pointers to original object properties persist, probly not, but keep en eye out
        }

        // set movement to zero for newly created units
        newUnit.movement = 0;

        // return the new unit
        return newUnit;
    };

    return {

        // select and create units
        units: function () {
            // get the building types
            var building = app.select.building();
            if (building) {

                // display the unit select menu
                var unit = app.display.select('unitSelectionIndex', 'selectUnitScreen', app.effect.highlightListItem, 'ul', 7);

                // if a unit has been selected then create it
                if (unit) {

                    // create and add the new unit to the map
                    app.map.unit.push(createUnit(building, unit, app.game.currentPlayer().id));
                    app.undo.all(); // removes the selection screen and variables created during its existance
                    app.def.cursorMoved = true; // refreshes the hud system to detect new unit on map;
                    window.requestAnimationFrame(app.animateUnit); // animate the changes
                }
            }
            return this;
        }
    };
}();

/* ---------------------------------------------------------------------------------------------------------*\
    
    app.undo handles the cleanup and disposal of elements that are no longer needed or need to be removed
\* ---------------------------------------------------------------------------------------------------------*/

app.undo = function () {

    // show undoes a hide of an element
    var show = function (hiddenElement) {

        // get hidden element
        var hidden = document.getElementById(hiddenElement);

        // show element
        if (hidden) hidden.style.display = '';
    };

    return {

        // remove a pressed key from the keys array
        keyPress: function (key) {return app.keys.splice(key, 1);},
        keys: function () {if(app.keys.length)app.keys.splice(0,app.keys.length);},

        // undo the selection of map elements
        selectElement: function () {
            var range = app.select.range();
            if (range) range.splice(0, range.length);
            app.select.deselect();
            if (app.select.building()) app.select.deselect();
        },

        hudHilight:function(){
            app.display.reset();
            if(app.display.index()) app.display.resetPreviousIndex();
            if (app.options.active()) {
                show('coStatusHud');
                app.options.deactivate();
            }
        },

        selectUnit:function(){
            if (app.select.unit()) {
                app.select.deselect();
                window.requestAnimationFrame(app.animateUnit);
            }
        },

        actionsSelect: function (){
            if(app.actions.active()){
                app.actions.unset();
                app.actions.clear();
                delete app.settings.target;
                delete app.prev.actionIndex;
                this.display('actionHud');
                this.display('damageDisplay');
                app.def.cursorMoved = true;
                app.settings.hideCursor = false;
                app.actions.deactivate();
                window.requestAnimationFrame(app.animateCursor);
            }
        },

        effect: function (effect) {
            if (app.effect[effect]) {
                app.effect[effect].splice(0, app.effect[effect].length);
                window.requestAnimationFrame(app.animateEffects);
            }
            return this;
        },

        display: function (element) {
            var remove = document.getElementById(element);
            if (remove) remove.parentNode.removeChild(remove);
            return this;
        },

        buildUnitScreen: function () {
            var removeArray = ['buildUnitScreen', 'unitInfoScreen', 'optionsMenu'];
            for (var r = 0; r < removeArray.length; r += 1) {
                var remove = document.getElementById(removeArray[r]);
                if (remove) remove.parentNode.removeChild(remove);
            }
            return this;
        },

        all: function () {
            this.selectUnit();
            this.selectElement();
            this.actionsSelect();
            this.hudHilight();
            this.keyPress(app.key.enter);
            this.buildUnitScreen();
            this.effect('highlight').effect('path');
            app.def.cursorMoved = true; // refreshes the hud system to detect new unit on map
            return this;
        },

        tempAndPrev: function () {
            app.temp = {};
            app.prev = {};
        }
    };
}();

/* ----------------------------------------------------------------------------------------------------------*\
    
    app.options handles the in game options selection, end turn, save etc.
\* ----------------------------------------------------------------------------------------------------------*/

app.options = function () {

    var active = false;

    // move to next player on turn change
    var nextPlayer = function () {

        var players = app.game.players();

        // if the player is the last in the array return the first player
        if (app.game.currentPlayer().id === players.length) return players[0];

        // return the next player
        return app.game.players()[app.game.currentPlayer().id];
    };

    var endTurn = function () {
        // get the next player
        var player = nextPlayer();

        // end power if it is active
        player.co.endPower();

        // assign the next player as the current player
        app.game.setCurrentPlayer(player);

        // make note of whose turn it is
        app.turn();

        // move the screen to the next players headquarters
        app.move.screenToHQ(player);

        // refresh the movement points of the players units
        app.move.refresh(player);

        // add this turns income
        app.game.setCurrentPlayerGold(player.gold + app.calculate.income(player));
    };

    return {
        unit: function () {
            alert('unit!');
        },

        intel: function () {
            alert('intel');
        },

        options: function () {
            alert('options');
        },

        save: function () {
            alert('save');
        },

        // end turn
        end: function () {
            endTurn();
            if(app.usersTurn) socket.emit('endTurn', 'end');
            return this;
        },
        active:function(){return active;},
        activate:function(){active = true;},
        deactivate:function(){active = false;}
    };
}();

/* ----------------------------------------------------------------------------------------------------------*\
    
    app.actions handles actions that a unit can take
\* ----------------------------------------------------------------------------------------------------------*/

app.actions = function () {
    
    var prevIndex, len, prevLen, damage, undo, key, active = false, attackableArray;
    var options = {};
    var index = 0;
    var round = Math.round;

    // detect any attackable units within selected units attack range
    var attackable = function (selected) {

        var attackable = [];

        // get selected units position
        var x = selected.x;
        var y = selected.y;

        // find its neighbors 
        var neighbors = [{
            x: x + 1,
            y: y
        }, {
            x: x,
            y: y + 1
        }, {
            x: x - 1,
            y: y
        }, {
            x: x,
            y: y - 1
        }]; // to be replaced with a range algorithm

        // get list of units
        var units = app.map.unit;
        var neighbor, unit;

        // get unit types that the selected unit can attack
        if(selected.canAttack){

            var canAttack = selected.canAttack;

            // get the id of the current player
            var player = app.game.currentPlayer().id;

            if (!selected.attacked){
                for (var n = 0; n < neighbors.length; n += 1) {
                    // each neighbor
                    neighbor = neighbors[n];

                    for (var u = 0; u < units.length; u += 1) {
                        // each unit
                        unit = units[u];
                        unit.ind = u; // set for easy retrieval and editing;

                        // if the selected unit can attack its neighbor and the neighbor is not the current players unit
                        if (canAttack.hasValue(unit.transportaion) && neighbor.x === unit.x && neighbor.y === unit.y && unit.player !== player) {

                            // calcualte damage percentage for each attackable unit
                            unit.damage = app.calculate.damage(unit);

                            // add the neighbor to an array of neighbors the selected unit can attack
                            attackable.push(unit);
                        }
                    }
                }
                // if their are any units in the attackable array, then return it, otherwise return false
                if (attackable[0]){
                    return attackable;
                }
            }
        }
        return false;
    };

    // check if the building the selected unit has landed on can be captured or not
    var capturable = function (selected) {

        // if the selected unit can capture buildings then continue
        if (selected.capture && !selected.captured) {

            // get a list of buildings on the map
            buildings = app.map.building;

            for (var b = 0; b < buildings.length; b += 1) {

                building = buildings[b]; // each building

                // if the building does not already belong to the selected unit, and the unit is on the building then return it
                if (building.player !== selected.player && building.x === selected.x && building.y === selected.y) {
                    building.ind = b;
                    return building;
                }
            }
        }
        // return false if the building cannot be captured by the selected unit
        return false;
    };

    var destroy = function (ind) {app.map.unit.splice(ind, 1);};

    var unsetPersistingVars = function () {
        delete len; 
        delete prevLen;
        delete damage;
        options = {};
        index = 0;
    };

    var attack = function (attacked, damage, attacker, retaliate) {
        if(attacked.health - damage > 0){
            app.map.unit[attacked.ind].health = attacked.health - damage;
            var selected = attacker ? attacker : app.select.unit();
            app.map.unit[selected.ind].attacked = true; // show that unit has attacked this turn
            var retaliation = retaliate ? retaliate : round(app.calculate.damage(selected, app.map.unit[attacked.ind])/10);
            if(app.usersTurn) {
                socket.emit('attack', { 
                    attacker:selected,
                    unit:attacked,
                    damage:damage,
                    retaliation:retaliation
                });
            }
            if( selected.health - retaliation > 0 ){
                app.map.unit[selected.ind].health = selected.health - retaliation;
            }else{
                app.game.destroyUnit(selected.player);
                destroy(selected.ind);
            }
        }else{
            app.game.destroyUnit(attacked.player);
            destroy(attacked.ind);
        }
        if(app.usersTurn){
            unsetPersistingVars();
            delete app.settings.target;
            app.undo.all();
        }
        window.requestAnimationFrame(app.animateUnit);
    };

    // display a target for selecting which opposing unit to attack
    var choseAttack = function (attackable) {

        attackableArray = attackableArray ? attackableArray : attackable; 

        if(!key) key = app.game.settings.keyMap;
        if(!undo) undo = app.undo.keyPress;
        if(!len || len !== attackableArray.length){
            len = attackableArray.length;
            prevLen = len;
        }

        // move to the next attackableArray unit
        if (app.key.pressed('up') || app.key.pressed('right')) { // Player holding up
            undo(key.up);
            undo(key.right);
            index += 1;
        }

        // move to the previous attackableArray unit
        if (app.key.pressed('down') || app.key.pressed('left')) { // Player holding down
            undo(key.down);
            undo(key.left);
            index -= 1;
        }

        if( index !== app.prev.actionIndex ){
            // cycle through target selectino
            if (index < 0 && index) index = len - 1;
            if (index === len) index = 0
            damage = attackableArray[index].damage;
            app.display.damage(damage);
            app.prev.actionIndex = index;

            // create target for rendering at specified coordinates
            app.settings.target = {
                x: attackableArray[index].x,
                y: attackableArray[index].y
            };
        }

        // if the target has been selected return it
        if (app.key.pressed('enter')) {
            undo(key.select);
            app.def.cursorMoved = true;
            window.requestAnimationFrame(app.animateCursor); // animate changes
            return {unit:attackableArray[index], damage:round(damage/10)};
        }
        window.requestAnimationFrame(app.animateCursor); // animate changes
    };

    return {

        unset:unsetPersistingVars,
        active: function () {return active},
        activate: function () {active = true},
        deactivate: function () {active = false},
        clear: function () {attackableArray = false},

        // check to see if any actions can be perfomed
        check: function (combine) {

            // use selected unit
            var selected = app.select.unit();

            // find any attackable opponents 
            var canAttack = attackable(selected);

            // find any capturable buildings
            var canCapture = capturable(selected);

            // add buildings or opponenets to an object containing possible actions
            if (canAttack) options.attack = canAttack;
            if (canCapture) options.capture = canCapture;
            if(combine){
                if (combine.combine) options.combine = combine;
                if (combine.load) options.load = combine;
            }
            if (canCapture || canAttack || combine) options.wait = true;

            // if there are any actions that can be taken then return them
            if (options.wait){
                return options;
            }
            return false;
        },

        // capture a building
        capture: function (capturing) {
            if(options.capture){
                var building = capturing ? capturing.building : options.capture;
                var unit = capturing ? capturing.unit : app.select.unit();
                if (app.usersTurn) socket.emit('capture', {building:building, unit:unit});
                var capture = app.game.currentPlayer.co.capture ? app.game.currentPlayer.co.capture(unit.health) : unit.health;

                // if the building has not between catpured all the way
                if (building.capture - capture > 0) {

                    // subtract the amount of capture dealt by the unit from the buildings capture level
                    app.map.building[building.ind].capture -= capture;
                    app.map.unit[unit.ind].captured = true;
                    app.undo.all();
                    return true;

                // if the building is done being captured and is not a headquarters
                } else if (building.type !== 'hq') {
                    // assign the building to the capturing player
                    app.map.building[building.ind].player = unit.player;
                    app.map.building[building.ind].capture = app.settings.capture;
                    app.map.unit[unit.ind].captured = true;
                    app.undo.all();
                    return true;
                }

                // otherwise assign all the buildings belonging to the owner of the captured hq to the capturing player
                var buildings = app.map.building;
                var defeated = buildings[building.ind].player;
                for(var b = 0; b < buildings.length; b += 1){
                    if( buildings[b].player === defeated ){
                        app.map.building[b].player = unit.player;
                    }
                }

                app.game.playerDefeated(defeated);
                app.map.unit[unit.ind].captured = true;
                app.undo.all();
                alert('player '+defeated+' defeated');
                if(app.game.players().length === 1){
                    alert('player '+app.game.players()[0].id+' wins!');
                }
            }
        },

        load: function () {
            if(options.load){
                var load = options.load;
                var selected = app.select.unit();
                app.map.unit[load.ind].loaded = load.loaded.concat(app.map.unit.splice(selected.ind,1));
                app.undo.all();
                window.requestAnimationFrame(app.animateUnit);
            }
            return false;
        },

        combine: function (combine) {
            if (options.combine){    
                var combine = combine ? combine.combine : options.combine;
                var selected = combine ? combine.unit : app.select.unit();
                var props = app.settings.combinableProperties;

                // emit units to be combined to other players games for syncronization
                if (app.usersTurn) socket.emit('joinUnits', {combine:combine, unit:selected});

                // combine properties of the selected unit with the target unit
                for (var u = 0; u < props.length; u += 1){
                    prop = props[u];
                    max = app.units[selected.type].properties[prop];
                    if( combine[prop] + selected[prop] < max ){
                        app.map.unit[combine.ind][prop] += selected[prop];
                    }else{
                        app.map.unit[combine.ind][prop] = max;
                    }
                }

                // remove selected unit  
                app.map.unit.splice(selected.ind, 1);
                app.undo.all();
                window.requestAnimationFrame(app.animateUnit);
            }
            return false;
        },

        wait: function () {
            unsetPersistingVars();
            app.undo.all();
            app.undo.display('actionHud');
        },

        attack: function (battle) {
            if( options.attack || battle ){
                if(!app.settings.hideCursor && app.actions.active()) app.settings.hideCursor = true;
                var attacked = battle ? battle : choseAttack(options.attack);
                if ( attacked ) {
                    delete options;
                    return attack(attacked.unit, attacked.damage, attacked.attacker, attacked.retaliation);
                }
                if (app.actions.active()) window.requestAnimationFrame(app.actions.attack);
            }
        }
    };
}();

/* ----------------------------------------------------------------------------------------------------------*\
    
    app.calculate handles the more intense calculations like pathfinding and the definition of movement range
\* ----------------------------------------------------------------------------------------------------------*/

app.calculate = function () {

    var abs = Math.abs;
    var floor = Math.floor;
    var random = Math.random;
    var round = Math.round;

    var numberOfBuildings = function(map){

        // clear out previous numbers
        var display = app.settings.buildingDisplayElement;
        var types = Object.keys(display);
        var len = types.length;
        for(var t = 0; t < len; t += 1){
            app.settings.buildingDisplayElement[types[t]].numberOf = 0;
        }

        // get selected maps building list
        var buildings = map.buildings;
        var num = buildings.length;

        // add one for each building type found  to the building display list
        for (var n = 0; n < num; n += 1){
            var type = buildings[n].type;

            if(type !== 'hq') app.settings.buildingDisplayElement[type].numberOf += 1; 
        }
        return app.settings.buildingDisplayElement;
    };

    var findTerrain = function (unit){
        terrain = app.map.terrain;
        for (var t = 0; t < terrain.length; t += 1){
            if(terrain[t].x === unit.x && terrain[t].y === unit.y){
                return terrain[t];
            }
        }
        return false;
    };

    var rand = function(){return floor((random() * 9) + 1)};

    var calcDamage = function (attacked, attacker) {
        var r = rand();
        var baseDamage = attacker.baseDamage[attacked.type];
        var coAttack = app.game.currentPlayer().co.attack(attacker);
        var coDefense = app.game.players()[attacked.player - 1].co.defense(attacked);
        var terrainDefense = findTerrain(attacked).def;
        terrainDefense = !terrainDefense ? 1 : terrainDefense;
        var defenderHP = attacked.health;
        var attackerHP = attacker.health;
        return round((abs(baseDamage * coAttack/100 + r) * (attackerHP/10) * abs((200-(coDefense + terrainDefense * defenderHP))/100)));
    };

    var attackRange = function () {

    };

    // create a range of movement based on the unit allowed square movement
    var movementCost = function (origin, x, y) {

        // calculate the difference between the current cursor location and the origin, add the operation on the axis being moved on
        return abs((origin.x + x) - origin.x) + abs((origin.y + y) - origin.y);
    };

    // calculate true offset location considering movement and position
    var offset = function (off, orig) {
        var ret = [];
        var inRange = function (obj) {
            if (abs(obj.x - orig.x) + abs(obj.y - orig.y) <= orig.movement && obj.x >= 0 && obj.y >= 0) {
                return true;
            }
            return false;
        };

        // if the selected unit can move on the terrain ( obsticle ) then calculate the offset
        if (orig.movable.hasValue(off.obsticle)) {
            var opX = off.x < orig.x ? -1 : 1;
            var opY = off.y < orig.y ? -1 : 1;
            var x = (orig.x + (orig.movement * opX) - (off.cost * opX) + opX);
            var y = (orig.y + (orig.movement * opY) - (off.cost * opY) + opY);
            var objX = {
                x: x,
                y: off.y
            };
            var objY = {
                x: off.x,
                y: y
            };
            if (inRange(objX)) ret.push(objX);
            if (inRange(objY)) ret.push(objY);
        } else {
            // otherwise add the specific location of the obsticle to the offset array 
            ret.push({
                x: off.x,
                y: off.y
            }); // check this if issues with unit offset, could be faulty method of dealing with this problem
        }
        return ret;
    };

    // detect if a square is an obsticle
    var findObsticles = function (x, y) {

        // loop over obsticle types
        for (var ot = 0; ot < app.settings.obsticleTypes.length; ot += 1) {

            // check if the currently examined grid square is one of the obsticle types
            var obs = app.select.hovered(app.settings.obsticleTypes[ot], x, y);

            // if it is and has a cost etc.. then return it
            if (obs.stat === true) {
                return app.map[obs.objectClass][obs.ind];
            }
        }
    };
    var cleanGrid = function (g) {
        var del = ['ind', 'p', 'f', 'g', 'visited', 'closed', 'heapIndex'];
        for (var a = 1; a < g.length; a += 1) {
            for (var b = 0; b < del.length; b += 1) {
                delete g[a][del[b]];
            }
        }
    },
    getNeighbors = function (c) {
        var x = c.x;
        var y = c.y;
        var g, gpx, gpy;
        var neighbors = [];
        for (var l = 0; l < grid.length; l += 1) {
            g = grid[l];
            gpx = abs(g.x - x);
            gpy = abs(g.y - y);

            // if the distance from the current square is only one and 
            if (gpx < 2 && gpy < 2 && gpx !== gpy && !g.closed) neighbors.push(g);
        }

        if (mode === undefined) {}
        return neighbors;
    },
    dist = function (c) {
        var dx1 = c.x - dest.x;
        var dy1 = c.y - dest.y;
        var dx2 = orig.x - dest.x;
        var dy2 = orig.y - dest.y;
        var cross = abs(dx1 * dy2 - dx2 * dy1);
        var rand = Math.floor(Math.random()+1)/(1000);
        return ((abs(c.x - dest.x) + abs(c.y - dest.y)) + (cross * rand));
    };

    var pathfinder = function (orig, dest, grid, mode) {
        var mov = orig.movement, neighbor, neighbors, x, y, cur, start = grid[0], open = app.heap('f');
        start.heapIndex = open.push(start);

        while (open.size()) {

            cur = open.pop();
            cur.closed = true;

            // if the destination has been reached, return the array of values
            if (dest.x === cur.x && dest.y === cur.y) {
                ret = [cur];
                while (cur.p) {ret.push(cur.p); cur = cur.p;}
                if (ret.length <= mov + 1) {cleanGrid(grid); return mode ? ret : mode;}
            }

            neighbors = getNeighbors(cur);

            for (var i = 0; i < n.length; i += 1) {

                neighbor = neighbors[i]; // current neighboring square
                cost = cur.g + neighbor.cost;

                // if the neghboring square has been inspected before then ignore it or if the cost
                // of moving to the neighboring square is more then allowed then ignore it
                if (neighbor.closed || cost > mov) continue;

                // if the current square is in the open array and a better position then update it
                if (neighbor.heapIndex === undefined || neighbor.g > cur.g) {

                    neighbor.g = cost; // distance from start to neighboring square
                    neighbor.h = cost + dist(neighbor, dest); // distance from neighboring to destination
                    neighbor.f = cost + neighbor.h; // distance from start to neighboring square added to the distance from neighboring square to destination
                    neighbor.p = cur;

                    // if the neighboring square hasent been encountered add it to the open list for comparison
                    if (neighbor.heapIndex === undefined) {
                        neighbor.heapIndex = open.push(neighbor);
                    }else{
                        // otherwise sort the heap in consideration of the new score
                        open.sort(neighbor.heapIndex);
                    }
                }
            }
        }
        cleanGrid(grid); // clean all assigned variables from grid so they wont interfier with future path finding in a loop

        // if the goal is to tell if a path can be reached or not, and it couldnt be reached
        // return the destination as an unreachable location
        if (mode !== undefined) return dest;
    };

    // calculate the movement costs of terrain land marks etc..
    var evaluateOffset = function (origin, dest, grid) {

        var range = [];

        for (var i = 0; i < dest.length; i += 1) {

            var g = grid.slice(0);

            var path = pathfinder(origin, dest[i], g, 'subtract');

            if (path) range.push(path);
        }

        return range;
    };

    // check which side of the screen the cursor is on
    var checkSide = function (axis) {
        var d = app.cursorCanvas.dimensions();
        var m = axis === 'x' ? d.width / 64 : d.height / 64; // screen width
        var x = app.settings.cursor.scroll[axis]; // map position relative to scroll
        if (app.settings.cursor.x > (m / 2) + x) return true;
        return false;
    };

    // calculate income
    var calcIncome = function (player) {

        // get the amount of income per building for current game
        var income = app.game.settings().funds;
        var owner, count = 0;
        var buildings = app.map.building; // buildings list

        for (var b = 0; b < buildings.length; b += 1) {

            // count the number of buildings that belong to the current player
            if (buildings[b].player === player) {
                count += 1;
            }
        }
        // return the income ( amount of buildings multiplied by income per building set for game )
        return count * income;
    };

    return {

        numberOfBuildings: numberOfBuildings,

        damage: function (attacked, attacker) {
            attacker = !attacker ? app.select.unit() : attacker;
            return calcDamage( attacked, attacker );
        },

        // finds path
        path: function (orig, dest, grid, mode) {
            return pathfinder(orig, dest, grid, mode);
        },

        // returns cursor location ( left or right side of screen )
        side: function (axis) {
            if (checkSide(axis)) return 'right';
            return 'left';
        },

        // calculate income
        income: function (player) {
            return calcIncome(player.id);
        },

        // find range of allowed movement over variable terrain
        range: function () {

            if (app.select.unit()) {

                var id = 0; // id for grid point identificaion;
                var range = [];
                var offs = [];
                var selected = app.select.unit();

                // amount of allotted movement for unit
                var len = selected.movement;

                // loop through x and y axis range of movement
                for (var ex = -len; ex <= len; ex += 1) {
                    for (var wy = -len; wy <= len; wy += 1) {

                        // if movement cost is less then or eual to the allotted movement then add it to the range array
                        if (movementCost(selected, ex, wy) <= selected.movement) {

                            // incremient id
                            id += 1;

                            // add origin to range of movement values
                            var x = selected.x + ex;
                            var y = selected.y + wy;

                            // locate obsticles                                 
                            var obsticle = findObsticles(x, y);

                            if (obsticle !== undefined) {

                                // get the number of offset movement from the obsticle based on unit type and obsticle type
                                var obsticleOffset = app.settings.obsticleStats[obsticle.obsticle][app.select.unit().type];

                                if (obsticleOffset !== undefined) {
                                    if (selected.x === x && selected.y === y) {
                                        range.unshift({
                                            x: x,
                                            y: y,
                                            cost: 0,
                                            g: 0,
                                            f: 0,
                                            ind: 0,
                                            id: id,
                                            type: 'highlight'
                                        });
                                    } else {
                                        // make an array of obsticleOffset values, starting point, plus movement, and the amount of obsticleOffset beyond that movement
                                        obsticle.cost = obsticleOffset;
                                        obsticle.id = id;
                                        range.push(obsticle);
                                        offs = offs.concat(offset(obsticle, selected));
                                    }
                                }
                            } else {
                                range.push({
                                    x: x,
                                    y: y,
                                    cost: 1,
                                    id: id,
                                    type: 'highlight'
                                });
                            }
                        }
                    }
                }
                return range.offsetArray(evaluateOffset(selected, offs, range));
            }
            return false;
        }
    };
}();

/* ------------------------------------------------------------------------------------------------------*\
    
    app.select handles the selection and movement of map elements
\* ------------------------------------------------------------------------------------------------------*/

app.select = function () {

    var selected = {}, abs = Math.abs, active = false, range = [], hovered = false;

    // moves a unit
    var move = function (type, index) {

        // if there is a selected unit and select is active and the select key has been pressed
        if (selected.unit && active && app.key.pressed('enter')) {

            app.undo.keyPress(app.key.enter);

            // cursor location
            var cursor = app.settings.cursor;

            // selected unit
            var unit = select.unit;

            // check if square moving to has a unit on it
            var landing = gridPoint('unit');

            // get the unit to combine with
            if ( landing ) var combine = app.map.unit[landing.ind];

            // if the unit being landed on belongs to the current player, is the same type of unit but is not the same unit
            if( combine && combine.player === unit.player && combine.ind !== unit.ind ){

                // if is the same unit then combine units
                if ( combine.type === unit.type ){  
                    combine.combine = true;

                // if the unit is a transport and the unit being moved into can be loaded into that transport, then show the option to load into the transport
                }else if(combine.transport && unit.load.hasValue(unit.type) && unit.loaded.length < unit.transport.length){
                    combine.load = true;
                }
                if( combine.load || combine.combine ){
                    // get actions for the unit
                    var actions = app.actions.check(combine);

                    // if there are actions returned then display them
                    if(actions.wait) app.display.actions(actions);
                }
            }else{
                
                // calculate how many squares were moved
                var xmove = abs(unit.x - cursor.x);
                var ymove = abs(unit.y - cursor.y);

                // remove the amount of squares moved from the units allowed movement for the turn
                app.map.unit[unit.ind].movement -= xmove + ymove;

                // change selected units position to the cursor location
                app.map[type][index].x = cursor.x;
                app.map[type][index].y = cursor.y;
                socket.emit('moveUnit', {index:index, type:type, x:cursor.x, y:cursor.y});

                //animate the changes
                window.requestAnimationFrame(app.animateUnit);

                // check to see if actions can be taken
                var actions = app.actions.check();
            }
            
            // remove the range and path hilights
            app.undo.effect('highlight').effect('path');

            // if there are actions that can be taken then display the necessary options
            if ( actions.wait ) {
                app.display.actions(actions);

            // if there are no actions then deselect the unit
            } else {
                app.undo.all();
            }
            return true;
        }
        return false;
    };

    var element = function (type, index) {
        //  if the index input is undefined or false then use the current cursor location (!index will fail for 0)
        if (index === undefined || index === false) {

            var hover = gridPoint(type);

            // if the selectable status is not false and the map element is defined then select it
            if (hover) select(type, hover.ind);

        } else {
            // if there is an index supplied then use it allong with the type
            select(type, index);
        }
        // if an object was selected then return true, otherwise return false
        return selected.unit ? true : false;
    };

    var select = function (type, index) {

        // if their is not a selection active and the cursor is not hovering over empty terrain, 
        // then do the following when the select key is pressed
        if (!active && type !== 'terrain' && app.key.pressed('enter')) {
            app.undo.keyPress(app.key.enter);
            attempt = app.map[type][index];

            // set properties for selected object if it can be selected
            // make sure the player attempting to interact with the object is the owner of the object
            if (!app.settings.notSelectable.hasValue(attempt.type) && attempt.player === app.game.currentPlayer().id) {
                
                selected[type] = attempt;
                selected[type].category = type;
                selected[type].ind = index;

                // if the selected object is a unit, do unit stuff
                if (selected.unit) {
                    range = app.calculate.range(); // set range of movement
                    app.display.range(); // highlight rang of movemet

                // otherwise do building stuff
                } else {
                    app.display.selectionInterface(selected.building.type, 'unitSelectionIndex');
                }

                // remove the terrain info display
                app.undo.display('hud');
                active = true;
                return true;
            }
        }
        return false;
    };

    // check what is occupying a specific point on the game map based on type
    var gridPoint = function (type, x, y) {

        // use current cursor location if one has not been passed in
        x = x ? x : app.settings.cursor.x;
        y = y ? y : app.settings.cursor.y;

        // get array of objects on map of specified type
        var arr = app.map[type];

        // look through array of objects and check if they are at the current or passed grid point
        for (var p = 0; p < arr.length; p += 1) {

            // if an object is found at the same grid pint return it 
            if (arr[p].x === x && arr[p].y === y) {
                return {
                    ind: p,
                    category: type,
                    stat: true
                };
            }
        }
        return false;
    };

    return {
        // returns info on the grid square currently hovered over
        hovered:gridPoint

        // return the currently selected building/unit or return false if none are currently selected
        unit: function () {return selected.unit ? selected.unit : false;},
        building: function () {return selected.building ? selected.building : false;},

        // return whether select is active or not
        active: function (b) {return active;},

        // set active status to true
        activate: function () {active = true;},

        // returns an array of grid points that can be acted on
        range : function () {return range},

        // get info on the selected hovered for movement
        display : function (item) {hovered = item;},

        // set active status to false and reset selected and range to an empty
        deselect: function () {active = false; selected = {}; range = [];},

        // on press of the exit key ( defined in app.game.settings.keyMap ) undo any active select or interface
        exit: function () {
            if (app.key.pressed('esc')) app.undo.all();
            return this;
        },

        // allows selection and movement of objects on screen
        move: function (type) {

            // if theres no input then say so
            if (!hovered && !type) {
                throw new Error('no type or input specified, please enter a type of map element into the input of the "interact()" method or chain the "info()" method prior to the "interact()" method');

                // if there is an object being hovered over, or hovered is undefined ( meaning input is possibly from type input rather then hovered )
            } else if (hovered || hovered === undefined) {

                // get the type of object being hovered over
                if(!type) type = hovered.category;

                // get the index of the object being hovered over
                var intInd = !hovered ? undefined : hovered.ind;

                // if the map element is selectable and the selected map element is a unit then facilitate interaction with that unit
                if (element(type, intInd) && selected.unit) {
                    move('unit', selected.unit.ind);
                }
            }
        }
    };
}();

/* ------------------------------------------------------------------------------------------------------*\
    
    app.dom is a list of functions used to assist manipulating the dom

\* ------------------------------------------------------------------------------------------------------*/

app.dom = function (){

    return {
        getDisplayedValue: function (id) {
            var element = document.getElementById(id);
            var children = element.childNodes;
            var len = children.length;
            for(c = 0; c < len; c += 1){
                var child = children[c];
                if(child.style.display !== 'none') return child.getAttribute('class');
            }
        },
        // remove all children of dom element
        removeAllChildren: function (element, keep){
            while(element.firstChild) {
                var clear = element.firstChild;
                if (clear.id !== keep) {
                    element.removeChild(clear);
                }else{
                    var keeper = element.firstChild;
                    element.removeChild(clear);
                }
            }
            if(keeper) element.appendChild(keeper);
        },

        // remove children of dom element
        removeChildren: function (element, keep){
            var remove = element.children;
            for (var c = 0; c < remove.length; c += 1) {
                var clear = remove[c];
                if (clear.id !== keep) {
                    element.removeChild(clear);
                }
            }
        },
        
        // find each element by their tag name, get the element that matches the currently selected index and return it
        findElementByTag: function (tag, element, index) {
            var len = element.length;
            for (var e = 0; e < len; e += 1) {
                // element returns a string, so must cast the index to string for comparison
                // if the element tag value ( index ) is equal to the currently selected index then return it
                if (element[e].getAttribute(tag) === index.toString()) {
                    return element[e];
                }
            }
        },

        getImmediateChildrenByTagName: function(element, type){
            var elements = [];
            if(element){
                var children = element.childNodes;
                var name = type.toUpperCase();
                var len = children.length;
                for(var i = 0; i < len; i += 1) {
                    var child = children[i];
                    if(child.nodeType === 1 && child.tagName === name) elements.push(child);
                }
            }
            return elements;
        },
        show: function (show, list, display){
            if(!display) var display = '';
            if(show){
                show.style.display = display;
                show.setAttribute('default', true );
                return show.getAttribute('class');
            }else{
                list[0].style.display = display;
                list[0].setAttribute('default', true);
                return list[0].getAttribute('class');
            }
        }
    };
}();

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
            window.requestAnimationFrame(app.animateEffects);
        },

        range: function () {
            // set the range highlight to the calculated range
            app.effect.highlight = app.effect.highlight.concat(app.select.range());

            // animate changes
            window.requestAnimationFrame(app.animateEffects);
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
        window.requestAnimationFrame(app.animateTerrain);
        window.requestAnimationFrame(app.animateBuildings);
        window.requestAnimationFrame(app.animateUnit);
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
                window.requestAnimationFrame(app.animateCursor);
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
    
    app.game.settings consolidates all the user customizable options for the game into
    an object for easy and dynamic manipulation
\* --------------------------------------------------------------------------------------*/

app.scroll = function () {

    var undo = app.undo.keyPress;
    var key = app.key;

    var scroll = function (neg, pos){
        if (app.key.pressed(neg)){
            undo(app.key[neg]);
            return -1;
        } else if (app.key.pressed(pos)) {
            undo(app.key[pos]);
            return 1;
        }
        return 0;
    };

    return {
        horizontal:function (){
            this.scroll = scroll('left','right');
            return this;
        },
        verticle:function(){
            this.scroll = scroll('up','down');
            return this;
        },
        infinite: function (index, min, max) {
            var point = index + this.scroll;
            var def = this.scroll < 0 ? max : min;
            return point > max || point < min ? def : point;
        },
        finite: function (index, min, max) {
            if(this.scroll){
                var point = index + this.scroll;
                if (point <= max && point >= min) return point;
            }
            return false;
        }
    };
}();

/* --------------------------------------------------------------------------------------*\
    
    app.effect is holds the coordinates for effects, these are dynamic, hence the empty
    arrays, they will fill and remove data as necessary to animate the game effects, it 
    also holds logic for display effects

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

app.co = function () {

    var percent = function (amount) {
        return amount / 100;
    };

    var addToEach = function(player, funk, property, amount, parameter1, parameter2, parameter3) {
        if(!parameter) parameter = 100;
        var units = app.map.unit;
        for ( var u = 0; u < units.length; u += 1 ){
            if( units[u].player === player.id ){
                app.map.unit[u][property] = funk( unit[u], property, amount, parameter1, parameter2, parameter3 );
            }
        }
    };

    var editProperty = function(unit, property, amount, parameter){
        if( unit[property] + amount > parameter ){
            return parameter;
        }else{
            return unit[property] + amount;
        }
    };

    var filter = function (unit, property, amount, max, parameter1, parameter2){
        if(unit[parameter1] === parameter2){
            if(unit[property] + amount > max){
                return max;
            }else{
                return unit[property] + amount;
            }
        }
    };

    var editRange = function (unit, property, amount){
        if(unit.damageType === 'ranged'){
            unit.range.hi += amount;
            return unit.range;
        }
    };

    var editArray = function (unit, property, amount, parameter1, parameter2){
        var baseDamage = {};
        var damage = Object.keys(unit[property]);
        for(var d = 0; d < damage.length; d += 1 ){

            // if there is no perameter then simply find the percentage added to all units
            if(!parameter1){
                var dam = unit[property][damage[d]];

                // add the damage plus the percent of increase
                baseDamage[damage[d]] *= amount;

            // if there is a parameter then only add to the damage type specified in the perameter
            }else if ( unit[parameter1] === parameter2 ){

                var dam = unit[property][damage[d]];
                baseDamage[damage[d]] *= amount
            }
        }
        return baseDamage;
    };

    return {

        andy: function (player) {

            var image = 'red';
            var special = 100;
            var powerActive = false;
            var superPowerActive = false;
            var damage = 100;

            return {
                image: image,
                name:'Andy',
                power:function(){
                    addToEach(player, editProperty(), 'health', 2, 10);
                },
                superPower:function(){
                    superPowerActive = true;
                    addToEach(player, editProperty(),'health', 5, 10);
                    addToEach(player, editProperty(),'movement', 1);
                    special = 130;
                },
                attack:function(){
                    return damage * percent(special);
                },
                defense:function(){
                    return 100;
                },
                endPower:function(){
                    if(superPowerActive){
                        addToEach(player, editProperty(),'movement', -1);
                        special = 100;
                        superPowerActive = false;
                    }
                }
            }
        },
        max: function (player) {
            var image = 'blue';
            var damage = 100;
            var special = 120;
            var powerActive = false;
            var superPowerActive = false;  

            return {
                image:image,
                name:'Max',     
                power:function(){
                    powerActive = true;
                    special = 140;
                },
                superPower:function(){
                    powerActive = true;
                    special = 170;
                },
                attack:function(unit){
                    if( unit.damageType === 'direct' ){
                        return damage * percent(special);
                    }else{
                        return damage;
                    }
                },
                defense:function(){
                    return 100;
                },
                endPower:function(){
                    if(powerActive){
                        special = 120;
                        powerActive = false;
                    }
                },
                build:function(unit){
                    unit.range.hi -= 1;
                    return unit;
                }
            }
        },
        sami: function (player) {

            var image = 'green';
            var damage = 100;
            var special = 120;
            var powerActive = false;
            var superPowerActive = false;  
            var capSpecial = 150;
            var penalty = 90;

            return {
                image:image,
                name:'Sami',
                power: function (){
                    powerActive = true;
                    addToEach(player, filter(), 'movement', 1, 20, 'transportaion', 'foot');
                    special = 170;
                },
                superPower: function(){
                   superPowerActive = true;
                    addToEach(player, filter(), 'movement', 2, 20, 'transportaion', 'foot');
                    special = 200;
                    capSpecial = 2000;
                },
                attack: function(unit){
                    if(unit.transportaion === 'foot'){
                        return damage * percent(special);
                    }else if(unit.damageType === direct){
                        return damage * percent(penalty);
                    }
                    return damage;
                },
                defense:function(){
                    return 100;
                },
                endPower:function(){
                    if(powerActive){
                        addToEach(player, filter(), 'movement', -1, 20, 'transportaion', 'foot');
                    }else if(superPowerActive){
                        addToEach(player, filter(), 'movement', -2, 20, 'transportaion', 'foot');
                    }
                    special = 120;
                },
                capture: function (capture){
                    return capture * percent(capSpecial);
                }
            };
        }
    };
}();

/* --------------------------------------------------------------------------------------*\
    
    app.units is a repo for the units that may be created on the map and their stats

\* --------------------------------------------------------------------------------------*/

app.units = {
    infantry: {
        properties: {
            type: 'infantry',
            name: 'Infantry',
            movement: 3,
            vision: 2,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 55,
                mech:45,
                recon:12,
                tank:5,
                midTank:1,
                neoTank:1,
                apc:14,
                artillery:15,
                rockets:25,
                antiAir:5,
                missles:25,
                bCopter:7,
                tCopter:30,
                pipe:1
            },
            movable: app.settings.movable.foot,
            transportaion: 'foot',
            capture: true,
            canAttack: ['wheels', 'foot'],
            health: 10,
            ammo: 10,
            fuel: 99,
            weapon1: {},
            weapon2: {}
        },
        name: 'Infantry',
        cost: 1000
    },
    mech: {
        properties: {
            type: 'mech',
            name: 'Mech',
            movement: 2,
            vision: 2,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 65,
                mech:55,
                recon:85,
                tank:55,
                midTank:15,
                neoTank:15,
                apc:75,
                artillery:70,
                rockets:85,
                antiAir:65,
                missles:85,
                bCopter:9,
                tCopter:35,
                pipe:15
            },
            movable: app.settings.movable.foot,
            transportaion: 'foot',
            capture: true,
            health: 10,
            ammo: 10,
            fuel: 70,
            weapon1: {},
            weapon2: {}
        },
        name: 'Mech',
        cost: 3000
    },
    recon: {
        properties: {
            type: 'recon',
            name: 'Recon',
            movement: 8,
            vision: 5,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 70,
                mech:65,
                recon:32,
                tank:6,
                midTank:1,
                neoTank:1,
                apc:45,
                artillery:45,
                rockets:55,
                antiAir:4,
                missles:28,
                bCopter:10,
                tCopter:35,
                pipe:1
            },
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 80,
            weapon1: {},
            weapon2: {}
        },
        name: 'Recon',
        cost: 4000
    },
    apc: {
        properties: {
            type: 'apc',
            name: 'APC',
            movement: 6,
            vision: 1,
            range: {
                lo: 1,
                hi: 1
            }, // steal supplies!
            load:1,
            load:['infantry', 'mech'],
            loaded:[],
            canAttack:[],
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            fuel: 70,
            weapon1: {},
            weapon2: {}
        },
        name: 'APC',
        cost: 5000
    },
    antiAir: {
        properties: {
            type: 'antiAir',
            name: 'Anti-Air',
            movement: 6,
            vision: 2,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 105,
                mech:105,
                recon:60,
                tank:25,
                midTank:10,
                neoTank:5,
                apc:50,
                artillery:50,
                rockets:55,
                antiAir:45,
                missles:55,
                bCopter:120,
                tCopter:120,
                fighter:65,
                bomber:75,
                pipe:55
            },
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 60,
            weapon1: {},
            weapon2: {}
        },
        name: 'Anti-Aircraft',
        cost: 8000
    },
    tank: {
        properties: {
            type: 'tank',
            name: 'Tank',
            movement: 6,
            vision: 3,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 75,
                mech:70,
                recon:85,
                tank:55,
                midTank:15,
                neoTank:15,
                apc:75,
                artillery:70,
                rockets:85,
                antiAir:65,
                missles:85,
                bCopter:10,
                tCopter:40,
                bShip:1,
                lander:10,
                cruiser:5,
                sub:1,
                pipe:15
            },
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 60,
            weapon1: {},
            weapon2: {}
        },
        name: 'Tank',
        cost: 7000
    },
    midTank: {
        properties: {
            type: 'midTank',
            name: 'Mid Tank',
            movement: 5,
            vision: 1,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 105,
                mech:95,
                recon:105,
                tank:85,
                midTank:55,
                neoTank:45,
                apc:105,
                artillery:105,
                rockets:105,
                antiAir:105,
                missles:105,
                bCopter:12,
                tCopter:45,
                bShip:10,
                lander:35,
                cruiser:45,
                sub:10,
                pipe:55
            },
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 50,
            weapon1: {},
            weapon2: {}
        },
        name: 'Mid Tank',
        cost: 16000
    },
    artillery: {
        properties: {
            type: 'artillery',
            name: 'Artillary',
            movement: 5,
            vision: 1,
            damageType:'ranged',
            range: {
                lo: 2,
                hi: 3
            },
            damageType:'direct',
            baseDamage:{
                infantry: 90,
                mech:85,
                recon:80,
                tank:70,
                midTank:45,
                neoTank:40,
                apc:70,
                artillery:75,
                rockets:80,
                antiAir:75,
                missles:80,
                bShip:40,
                lander:55,
                cruiser:65,
                sub:60,
                pipe:45
            },
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 50,
            weapon1: {},
            weapon2: {}
        },
        name: 'Artillery',
        cost: 6000
    },
    rockets: {
        properties: {
            type: 'rockets',
            name: 'Rockets',
            movement: 5,
            vision: 1,
            range: {
                lo: 3,
                hi: 5
            },
            damageType:'ranged',
            baseDamage:{
                infantry: 95,
                mech:90,
                recon:90,
                tank:80,
                midTank:55,
                neoTank:50,
                apc:80,
                artillery:80,
                rockets:85,
                antiAir:85,
                missles:90,
                bShip:55,
                lander:60,
                cruiser:85,
                sub:85,
                pipe:55
            },
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 50,
            weapon1: {},
            weapon2: {}
        },
        name: 'Rockets',
        cost: 15000
    },
    missles: {
        properties: {
            type: 'missles',
            name: 'Missles',
            movement: 4,
            vision: 1,
            range: {
                lo: 3,
                hi: 5
            },
            damageType:'ranged',
            baseDamage:{
                fighter:100,
                bomber:100,
                bCopter:120,
                tCopter:120
            },
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 50,
            weapon1: {},
            weapon2: {}
        },
        name: 'Missles',
        cost: 12000
    },
    neoTank: {
        properties: {
            type: 'neoTank',
            name: 'Neo Tank',
            movement: 6,
            vision: 1,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 125,
                mech:115,
                recon:125,
                tank:105,
                midTank:75,
                neoTank:55,
                apc:125,
                artillery:115,
                rockets:125,
                antiAir:115,
                missles:125,
                bCopter:22,
                tCopter:55,
                bShip:15,
                lander:40,
                cruiser:50,
                sub:15,
                pipe:75
            },
            movable: app.settings.movable.wheels,
            transportaion: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 99,
            weapon1: {},
            weapon2: {}
        },
        name: 'Neo Tank',
        cost: 22000
    },
    tCopter: {
        properties: {
            type: 'tCopter',
            name: 'T-Copter',
            movement: 6,
            vision: 2,
            range: {
                lo: 1,
                hi: 1
            },
            load:['infantry', 'mech'],
            loaded:[],
            transport:1,
            movable: app.settings.movable.flight,
            transportaion: 'flight',
            health: 10,
            canAttack:[],
            fuel: 99,
            weapon1: {},
            weapon2: {},
            fpt: 2
        },
        name: 'T-Copter',
        cost: 5000
    },
    bCopter: {
        properties: {
            type: 'bCopter',
            name: 'B-Copter',
            movement: 6,
            vision: 3,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 75,
                mech:75,
                recon:55,
                tank:55,
                midTank:25,
                neoTank:20,
                apc:60,
                artillery:65,
                rockets:65,
                antiAir:25,
                missles:65,
                bCopter:65,
                tCopter:95,
                bShip:25,
                lander:25,
                cruiser:55,
                sub:25,
                pipe:25
            },
            movable: app.settings.movable.flight,
            transportaion: 'flight',
            health: 10,
            ammo: 10,
            fuel: 99,
            weapon1: {},
            weapon2: {},
            fpt: 1
        },
        name: 'B-Copter',
        cost: 9000
    },
    fighter: {
        properties: {
            type: 'fighter',
            name: 'Fighter',
            movement: 9,
            vision: 2,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                bCopter:100,
                tCopter:100,
                bomber:100,
                fighter:55
            },
            movable: app.settings.movable.flight,
            transportaion: 'flight',
            health: 10,
            ammo: 10,
            fuel: 99,
            weapon1: {},
            weapon2: {},
            fpt: 5
        },
        name: 'Fighter',
        cost: 20000
    },
    bomber: {
        properties: {
            type: 'bomber',
            name: 'Bomber',
            movement: 7,
            vision: 2,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                infantry: 110,
                mech:110,
                recon:105,
                tank:105,
                midTank:95,
                neoTank:90,
                apc:105,
                artillery:105,
                rockets:105,
                antiAir:95,
                missles:105,
                bShip:75,
                lander:95,
                cruiser:85,
                sub:95,
                pipe:95
            },
            movable: app.settings.movable.flight,
            transportaion: 'flight',
            health: 10,
            ammo: 10,
            fuel: 99,
            weapon1: {},
            weapon2: {},
            fpt: 5
        },
        name: 'Bomber',
        cost: 22000
    },
    lander: {
        properties: {
            type: 'lander',
            name: 'Lander',
            movement: 6,
            vision: 1,
            range: {
                lo: 1,
                hi: 1
            },
            transport:2,
            load:[
                'infantry', 
                'mech', 
                'tank', 
                'midTank',
                'apc', 
                'missles', 
                'rockets',
                'neoTank',
                'antiAir',
                'artillery',
                'recon'
            ],
            loaded:[],
            movable: app.settings.movable.boat,
            transportaion: 'boat',
            health: 10,
            fuel: 99,
            weapon1: {},
            weapon2: {},
            fpt: 1
        },
        name: 'Lander',
        cost: 12000
    },
    cruiser: {
        properties: {
            type: 'cruiser',
            name: 'Cruiser',
            movement: 6,
            vision: 3,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                bCopter:115,
                tCopter:115,
                fighter:55,
                bomber:65,
                sub:90
            },
            transport:2,
            load:['tCopter', 'bCopter'],
            loaded:[],
            movable: app.settings.movable.boat,
            transportaion: 'boat',
            health: 10,
            ammo: 10,
            fuel: 99,
            weapon1: {},
            weapon2: {},
            fpt: 1
        },
        name: 'Cruiser',
        cost: 18000
    },
    submerine: {
        properties: {
            type: 'submerine',
            name: 'Submerine',
            movement: 5,
            vision: 5,
            range: {
                lo: 1,
                hi: 1
            },
            damageType:'direct',
            baseDamage:{
                bShip:55,
                lander:95,
                cruiser:25,
                sub:55
            },
            movable: app.settings.movable.boat,
            transportaion: 'boat',
            health: 10,
            ammo: 10,
            fuel: 60,
            weapon1: {},
            weapon2: {},
            fpt: 1,
            divefpt: 5
        },
        name: 'Submerine',
        cost: 20000
    },
    bShip: {
        properties: {
            type: 'bShip',
            name: 'B-Ship',
            movement: 5,
            vision: 2,
            range: {
                lo: 2,
                hi: 6
            },
            damageType:'ranged',
            baseDamage:{
                infantry:95,
                mech:90,
                recon:90,
                tank:80,
                midTank:55,
                neoTank:50,
                apc:80,
                artillery:80,
                rockets:85,
                antiAir:85,
                missles:90,
                bShip:50,
                lander:95,
                cruiser:95,
                sub:95,
                pipe:55
            },
            movable: app.settings.movable.boat,
            transportaion: 'boat',
            health: 10,
            ammo: 10,
            fuel: 99,
            weapon1: {},
            weapon2: {},
            fpt: 1
        },
        name: 'B-Ship',
        cost: 28000
    }
};

/* --------------------------------------------------------------------------------------*\
    
    app.buildings is a list of each building and the inits they are capable of producing

\* --------------------------------------------------------------------------------------*/

app.buildings = {
    base:{
        infantry:app.units.infantry,
        mech:app.units.mech,
        recon:app.units.recon,
        apc:app.units.apc,
        antiAir:app.units.antiAir,
        tank:app.units.tank,
        midTank:app.units.midTank,
        artillery:app.units.artillery,
        missles:app.units.missles,
        rockets:app.units.infantry,
        neoTank:app.units.neoTank
    },
    airport: {
        tCopter:app.units.tCopter,
        bCopter:app.units.bCopter,
        fighter:app.units.fighter,
        bomber:app.units.bomber
    },
    seaport: {
        lander:app.units.lander,
        cruiser:app.units.cruiser,
        submerine:app.units.submerine,
        bShip:app.units.bShip
    }
};

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
    The draw functions are passed into the setAnimations method of an initialized game canvas. 
    In the initialization they are passed the 'draw' variable, which is a repo of objects/drawings.
    The repo can be set with the 'setAnimationRepo' method of app.init, the default repo is app.objects
    setting a new repo for a canvas will overwrite the app.objects repo with its replacement for that canvas 
    ( not all canvases will be effected if you are using multiple canvases ). The methods of draw, used to 
    access the repo are as follows: coordinate: can take specific coordinates, or you can specify a coordinate 
    object containing an array or multiple arrays of objects with x and y coordinate properties and a type the 
    specifies what to draw at those coordinates. for example "draw.coordinate('map', 'unit');" will look at 
    app.map.unit where app.map.unit is an array of object coordinates with a type property. Within the coordinates,
    while looping, the coordinate method will look at the coordinate objects type property, find a drawing in the 
    specified or default repo by the same name, and draw the matching image at the specified coordinates. this 
    allows multiple coordinates to be specified for a specific type of drawing, unit, terrain, whatever and also 
    allows them to be added, removed or updated dynamically by adding or removing objects to the arrays.
    background: background will simply fill the entire background with a specified drawing from the repo
    cache: can be chained in the draw command and specifies that you want the objects being drawn to be cached 
    and drawn as a whole image, rather then drawn repeatedly for each coordinate, can improve performance when
    objects that dont need to change their appearance must be moved around allot ( scrolling for example will be
    faster with cached terrain elements )
\*-----------------------------------------------------------------------------------------------------------*/

app.drawEffects = function (draw) {
    draw.coordinate('effect', 'highlight'); // highlighting of movement range
    draw.coordinate('effect', 'path'); // highlighting current path
};

app.drawWeather = function (draw) {
    // weather stuff animated here
};

app.drawBuildings = function (draw) {
    draw.coordinate('map', 'building');
};

app.drawUnits = function (draw) {
    draw.coordinate('map', 'unit');
};

app.drawCursor = function (draw) {
    if (!app.settings.hideCursor && app.usersTurn) draw.coordinate('map', 'cursor', [app.settings.cursor]);
    if (app.settings.target) draw.coordinate('map', 'target', [app.settings.target]);
};

app.drawBackground = function (draw) {
    draw.background('background');
};

app.drawTerrain = function (draw) {
    draw.cache().coordinate('map', 'terrain');
};

/* --------------------------------------------------------------------------------------------------------*\
    The animate functions insert the draw methods into the specified canvas for rendering and then make a 
    call to the canvas to render those drawings with the render method. Calling the render method of an
    initialized canvas object will render the animations once. If a loop is wanted ( for changing animations 
    for example ), you may pass the parent function into the render function to be called recursively.
\*---------------------------------------------------------------------------------------------------------*/

app.animateBuildings = function () {
    app.buildingCanvas.setAnimations(app.drawBuildings).render();
};

app.animateUnit = function () {
    app.unitCanvas.setAnimations(app.drawUnits).render();
};

app.animateBackground = function () {
    app.backgroundCanvas.setAnimations(app.drawBackground).render();
};

app.animateTerrain = function () {
    app.terrainCanvas.setAnimations(app.drawTerrain).render();
};

app.animateCursor = function () {
    app.cursorCanvas.setAnimations(app.drawCursor).render();
};

app.animateEffects = function () {
    app.effectsCanvas.setAnimations(app.drawEffects).render();
};

/* --------------------------------------------------------------------------------------------------------*\
    app.draw provides a set of methods for interacting with, scaling, caching, coordinating  
    and displaying the drawings/animations provided in the app.animationRepo
\*---------------------------------------------------------------------------------------------------------*/

app.draw = function (canvas, dimensions, base) {
    
    var w, h, width, height;
    var temp = {}; // holds temporary persistant variables that can be passed between functions ( similar to static variables / functions )

    // base is the amount of pixles in each grid square, used to scale canvas elements if needed
    base = base === null || base === undefined ? 64 : base;

    // set/get width and height dimensions for the game map
    if (dimensions === null || dimensions === undefined) {
        w = 64;
        h = 64;
    } else {
        width = dimensions.width;
        height = dimensions.height;
        w = width / 15;
        h = height / 10;
    }

    var animationObjects = app.animationRepo(width, height);

    // creates a small canvas
    var smallCanvas = function () {
        var smallCanvas = document.createElement('canvas');
        smallCanvas.width = w * 2;
        smallCanvas.height = h * 2;
        return smallCanvas;
    };

    // caches drawings so they can be recalled without redrawing ( performance boost in certain situations )
    var cacheDrawing = function (name) {

        // create a canvas
        var canvas = smallCanvas();

        // get context  
        var cacheCanvas = canvas.getContext(app.ctx);

        // set the position of the image to the center of the cached canvas                         
        var position = setPosition((w / 2), (h / 2));

        // draw image to cache to canvas
        animationObjects[name](cacheCanvas, position);

        // cache the canvas with drawing on it ( drawings cached by their class name )
        app.cache[name] = canvas;
    };

    // calculates the base for scaling
    var calcBase = function (d) {
        return d / base;
    };

    // scales items by calculating their base size multplied by 
    var scale = function (type, value) {
        var multiple = type === 'w' ? calcBase(w) : calcBase(h);
        return value === null || value === undefined ? multiple : multiple * value;
    };

    // creates a friendlier interface for drawing and automatically scales drawings etc for screen size
    var setPosition = function (x, yAxis) {

        var y = yAxis + h;

        return {
            // u = right, will move right the amonut of pixles specified
            r: function (number) {
                return x + scale('w', number);
            },
            // u = left, will move left the amonut of pixles specified
            l: function (number) {
                return x - scale('w', number);
            },
            // u = down, will move down the amonut of pixles specified
            d: function (number) {
                return y + scale('h', number);
            },
            // u = up, will move up the amonut of pixles specified
            u: function (number) {
                return y - scale('h', number);
            },
            // x is the x axis
            x: x,
            // y is the y axis
            y: y,
            // width
            w: w,
            // height
            h: h,
            // random number generator, used for grass background texture
            random: function (min, max) {
                return (Math.random() * (max - min)) + min;
            }
        };
    };

    // offset of small canvas drawing ( since the drawing is larger then single grid square it needs to be centered )
    var smallX = w / 2;
    var smallY = h / 2;

    return {

        // cache all images for performant display ( one drawing to rule them all )
        cache: function () {
            this.cached = true;
            return this;
        },

        // place drawings where they belong on board based on coorinates
        coordinate: function (objectClass, object, coordinet) {

            var s = {}; // holder for scroll coordinates
            var name; // holder for the name of an object to be drawn
            var scroll = app.settings.cursor.scroll; // scroll positoion ( map relative to display area )
            var wid = (w * 16); // display range
            var len = (h * 11);

            // get the coordinates for objects to be drawn
            coordinates = coordinet === undefined ? app[objectClass][object] : coordinet;

            // for each coordinates
            for (var c = 0; c < coordinates.length; c += 1) {

                // var s modifys the coordinates of the drawn objects to allow scrolling behavior
                // subtract the amount that the cursor has moved beyond the screen width from the 
                // coordinates x and y axis, making them appear to move in the opposite directon
                s.x = (coordinates[c].x * w) - (scroll.x * w);
                s.y = (coordinates[c].y * h) - (scroll.y * h);

                // only display coordinates that are withing the visable screen
                if (s.x >= 0 && s.y >= 0 && s.x <= wid && s.y <= len) {

                    // get the name of the object to be drawn on the screen
                    name = objectClass === 'map' && coordinet === undefined ? coordinates[c].type : object;

                    // if it is specified to be cached
                    if (this.cached) {

                        // check if it has already been cached and cache the drawing if it has not yet been cached
                        if (app.cache[name] === undefined) cacheDrawing(name);

                        // draw the cached image to the canvas at the coordinates minus 
                        // its offset to make sure its centered in the correct position
                        canvas.drawImage(app.cache[name], s.x - smallX, s.y - smallY);

                    } else {

                        // if it is not cached then draw the image normally at its specified coordinates
                        animationObjects[name](canvas, setPosition(s.x, s.y));
                    }
                }
            }
        },

        // fills background
        background: function (object) {
            for (var x = 0; x < app.map[object].x; x += 1) {
                for (var y = 0; y < app.map[object].y; y += 1) {
                    animationObjects[app.map[object].type](canvas, setPosition(x * w, y * h));
                }
            }
        },

        hudCanvas: function (object, objectClass) {

            // draw a background behind terrain and building elements
            if (objectClass !== 'unit') animationObjects.plain(canvas, setPosition(smallX, smallY));

            if (app.cache[object]) { // use cached drawing if available
                canvas.drawImage(app.cache[object], 0, 0);
            } else {
                animationObjects[object](canvas, setPosition(smallX, smallY));
            }
        }
    };
};

/* --------------------------------------------------------------------------------------------------------*\
    app.animationRepo is the default object repo the 'm' parameter is a method passed from 
    app.draw that scales the coordinates of the drawings to fit any grid square size, as 
    well as providing some functionality like random(), which generates random numbers within the specified 
    range of numbers. 
    'm' does not have to be used
    default is a base of 64 ( 64 X 64 pixles ), the base is set as a perameter of initializing the 
    app.draw();
\*---------------------------------------------------------------------------------------------------------*/

app.animationRepo = function (width, height) {
    return {
        cursor: function (canv, m) {
            // size of cursor corners
            var size = 15;
            canv.strokeStyle = "black";
            canv.fillStyle = "#fff536";
            canv.beginPath();
            // bottom left
            canv.moveTo(m.l(3), m.u(size));
            canv.lineTo(m.l(3), m.d(3));
            canv.lineTo(m.r(size), m.d(3));
            canv.lineTo(m.l(3), m.u(size));
            // bottem right
            canv.moveTo(m.r(67), m.u(size));
            canv.lineTo(m.r(67), m.d(3));
            canv.lineTo(m.r(64 - size), m.d(3));
            canv.lineTo(m.r(67), m.u(size));
            // top right
            canv.moveTo(m.r(67), m.u(64 - size));
            canv.lineTo(m.r(67), m.u(67));
            canv.lineTo(m.r(64 - size), m.u(67));
            canv.lineTo(m.r(67), m.u(64 - size));
            // bottem left
            canv.moveTo(m.l(3), m.u(64 - size));
            canv.lineTo(m.l(3), m.u(67));
            canv.lineTo(m.r(size), m.u(67));
            canv.lineTo(m.l(3), m.u(64 - size));
            canv.fill();
            canv.stroke();
            return canv;
        },
        highlight: function (canv, m) {
            canv.fillStyle = "rgba(255,255,255,0.3)";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            return canv;
        },
        target: function (canv, m) {
            canv.fillStyle = "rgba(0,255,0,0.3)";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            return canv;
        },
        path: function (canv, m) {
            canv.fillStyle = "rgba(255,0,0,0.5)";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            return canv;
        },
        base: function (canv, m) {
            canv.fillStyle = "rgba(0,0,200,0.9)";
            canv.beginPath();
            canv.lineTo(m.r(m.w - 5), m.y - 5);
            canv.lineTo(m.r(m.w - 5), m.u(m.h + 5));
            canv.lineTo(m.x - 5, m.u(m.h + 5));
            canv.lineTo(m.x - 5, m.y - 5);
            canv.fill();
            return canv;
        },
        hq: function (canv, m) {
            canv.fillStyle = "rgba(80,0,20,0.9)";
            canv.beginPath();
            canv.lineTo(m.r(m.w - 5), m.y - 5);
            canv.lineTo(m.r(m.w - 5), m.u(m.h + 5));
            canv.lineTo(m.x - 5, m.u(m.h + 5));
            canv.lineTo(m.x - 5, m.y - 5);
            canv.fill();
            return canv;
        },
        // dimensions 
        plain: function (canv, m) {
            canv.fillStyle = "#d6f71b";
            //canv.strokeStyle = "black";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            //canv.stroke();
            canv.strokeStyle = "#f2ff00";
            canv.beginPath();
            for (var rand = 0; rand < width; rand += 1) {
                var randomHeight = m.random(m.y, m.u(m.h));
                var randomWidth = m.random(m.x, m.r(m.w));
                canv.moveTo(randomWidth, randomHeight);
                canv.lineTo(randomWidth + 4, randomHeight);
            }
            canv.stroke();
            //canv.strokeStyle = "black";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            //canv.stroke();
            return canv;
        },
        tallMountain: function (canv, m) {
            canv.strokeStyle = "#41471d";
            canv.fillStyle = "#ff8800";
            canv.beginPath();
            canv.moveTo(m.x, m.u(20));
            canv.lineTo(m.x, m.u(30));
            canv.lineTo(m.r(5), m.u(45));
            canv.quadraticCurveTo(m.r(15), m.u(50), m.r(15), m.u(50));
            canv.moveTo(m.r(10), m.u(35));
            canv.lineTo(m.r(20), m.u(67));
            canv.quadraticCurveTo(m.r(25), m.u(78), m.r(52), m.u(67));
            canv.lineTo(m.r(62), m.u(34));
            canv.quadraticCurveTo(m.r(68), m.u(20), m.r(38), m.y);
            canv.quadraticCurveTo(m.r(22), m.y, m.x, m.u(20));
            canv.fill();
            canv.stroke();
            return canv;
        },
        shortMountain: function (canv, m) {
            canv.strokeStyle = "#41471d";
            canv.fillStyle = "#ff8800";
            canv.beginPath();
            canv.moveTo(x, m.u(10));
            canv.lineTo(m.r(20), m.u(m.h));
            canv.lineTo(m.r(40), m.u(m.h));
            canv.lineTo(m.r(m.w), m.u(10));
            canv.quadraticCurveTo(m.r(31), m.d(9), m.r(5), m.u(10));
            canv.quadraticCurveTo(m.r(20));
            canv.fill();
            canv.stroke();
            return canv;
        },
        tree: function (canv, m) {
            canv.strokeStyle = "black";
            canv.fillStyle = "rgb(41,148,35)";
            canv.beginPath();
            //bottom
            canv.moveTo(m.r(21), m.u(15));
            canv.quadraticCurveTo(m.r(42), m.d(1), m.r(60), m.u(15));
            canv.quadraticCurveTo(m.r(74), m.u(25), m.r(59), m.u(33));
            canv.moveTo(m.r(21), m.u(15));
            canv.quadraticCurveTo(m.r(16), m.u(20), m.r(29), m.u(30));
            //middle
            canv.moveTo(m.r(27), m.u(30));
            canv.quadraticCurveTo(m.r(42), m.u(20), m.r(60), m.u(34));
            canv.quadraticCurveTo(m.r(58), m.u(34), m.r(50), m.u(43));
            //canv.quadraticCurveTo(m.r(58),m.u(38), m.r(50), m.u(43));
            canv.moveTo(m.r(27), m.u(30));
            canv.quadraticCurveTo(m.r(34), m.u(34), m.r(37), m.u(40));
            //top
            canv.moveTo(m.r(35), m.u(40));
            canv.quadraticCurveTo(m.r(44), m.u(35), m.r(51), m.u(41));
            canv.quadraticCurveTo(m.r(52), m.u(43), m.r(42), m.u(50));
            canv.moveTo(m.r(35), m.u(40));
            canv.quadraticCurveTo(m.r(40), m.u(42), m.r(42), m.u(50));
            canv.fill();
            canv.stroke();
            return canv;
        },
        infantry: function (canv, m) {
            canv.fillStyle = "blue";
            canv.beginPath();
            canv.arc(m.r(32), m.u(32), 10, 0, 2 * Math.PI);
            canv.fill();
            return canv;
        },
        apc: function (canv, m) {
            canv.fillStyle = "orange";
            canv.beginPath();
            canv.arc(m.r(32), m.u(32), 10, 0, 2 * Math.PI);
            canv.fill();
            return canv;
        }
    };
};