/* --------------------------------------------------------------------------------------*\
    
    app.settings consolidates all the customizable options and rules for the game into
    an object for easy and dynamic manipulation
\* --------------------------------------------------------------------------------------*/

app.settings = {

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

    capture: 20,

    // amount of income per building per turn
    income: 1000,

    // rules on how attacks will be handled between unit types
    attackStats: {},

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

    // dimensions of diplay hud
    hudWidth: 120,
    hudHeight: 200,
    hudLeft: 1050,

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
    },

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

/* --------------------------------------------------------------------------------------*\
    
    app.effect is holds the coordinates for effects, these are dynamic, hence the empty
    arrays, they will fill and remove data as necessary to animate the game effects
\* --------------------------------------------------------------------------------------*/

app.effect = {
    highlight: [],
    path: []
};

/* --------------------------------------------------------------------------------------*\
    
    app.map contains all the settings for the map, unit locations, terrain, buildings, etc. 
    it holds coordinates of objects that correspond to animations in the animation repo
    maps can be built and edited dynamically by inserting or removing objects from/into the 
    arrays
\* --------------------------------------------------------------------------------------*/

app.map = {
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
    building: [{
        x: 0,
        y: 5,
        type: 'hq',
        name: 'HQ',
        capture: app.settings.capture,
        obsticle: 'building',
        player: 1,
        color: 'red',
        def: 4
    }, {
        x: 20,
        y: 5,
        type: 'hq',
        name: 'HQ',
        capture: app.settings.capture,
        obsticle: 'building',
        player: 2,
        color: 'blue',
        def: 4
    }, {
        x: 0,
        y: 4,
        type: 'base',
        name: 'Base',
        capture: app.settings.capture,
        obsticle: 'building',
        player: 1,
        color: 'red',
        def: 4
    }, {
        x: 15,
        y: 4,
        type: 'base',
        name: 'Base',
        capture: app.settings.capture,
        obsticle: 'building',
        player: 2,
        color: 'blue',
        def: 4
    }],
    unit: []
};
