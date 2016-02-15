/* --------------------------------------------------------------------------------------*\
    
    contains all the settings for a dummy map, unit locations, terrain, buildings, etc. 
    it holds coordinates of objects that correspond to animations in the animation repo
    maps can be built and edited dynamically by inserting or removing objects from/into the 
    arrays
\* --------------------------------------------------------------------------------------*/

module.exports = {
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