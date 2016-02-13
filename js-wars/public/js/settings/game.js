/* --------------------------------------------------------------------------------------*\
    
    settings consolidates all the customizable options and rules for the game into
    an object for easy and dynamic manipulation
    
\* --------------------------------------------------------------------------------------*/

module.exports = {
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