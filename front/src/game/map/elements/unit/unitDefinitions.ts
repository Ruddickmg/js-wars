const movable = {
    foot: ['plain', 'river', 'mountain', 'wood', 'road', 'building'],
    wheels: ['plain', 'wood', 'road', 'building'],
    flight: ['plain', 'river', 'mountain', 'wood', 'road', 'water', 'building'], 
    boat: ['water', 'building']
};

export default {
    
    infantry: {
        
        properties: {
            type: 'infantry',
            name: 'Infantry',
            movement: 3,
            vision: 2,
            range: {
                low: 1,
                high: 1
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
                missiles:25,
                bCopter:7,
                tCopter:30,
                pipe:1
            },
            movementCosts: {
                mountain:2,
                wood:1,
                plain:1,
                building:1
            },
            movable: movable.foot,
            transportation: 'foot',
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
                low: 1,
                high: 1
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
                missiles:85,
                bCopter:9,
                tCopter:35,
                pipe:15
            },
            movable: movable.foot,
            transportation: 'foot',
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
                low: 1,
                high: 1
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
                missiles:28,
                bCopter:10,
                tCopter:35,
                pipe:1
            },
            movable: movable.wheels,
            transportation: 'wheels',
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
                low: 1,
                high: 1
            }, // steal supplies!
            maxLoad:1,
            load:['infantry', 'mech'],
            loaded:[],
            canAttack:[],
            movable: movable.wheels,
            movementCosts: {
                mountain:7,
                wood:2,
                plain:1,
                building:1
            },
            transportation: 'wheels',
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
                low: 1,
                high: 1
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
                missiles:55,
                bCopter:120,
                tCopter:120,
                fighter:65,
                bomber:75,
                pipe:55
            },
            movable: movable.wheels,
            transportation: 'wheels',
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
                low: 1,
                high: 1
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
                missiles:85,
                bCopter:10,
                tCopter:40,
                bShip:1,
                lander:10,
                cruiser:5,
                sub:1,
                pipe:15
            },
            movable: movable.wheels,
            transportation: 'wheels',
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
                low: 1,
                high: 1
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
                missiles:105,
                bCopter:12,
                tCopter:45,
                bShip:10,
                lander:35,
                cruiser:45,
                sub:10,
                pipe:55
            },
            movable: movable.wheels,
            transportation: 'wheels',
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
                low: 2,
                high: 3
            },
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
                missiles:80,
                bShip:40,
                lander:55,
                cruiser:65,
                sub:60,
                pipe:45
            },
            movable: movable.wheels,
            transportation: 'wheels',
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
                low: 3,
                high: 5
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
                missiles:90,
                bShip:55,
                lander:60,
                cruiser:85,
                sub:85,
                pipe:55
            },
            movable: movable.wheels,
            transportation: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 50,
            weapon1: {},
            weapon2: {}
        },
        name: 'Rockets',
        cost: 15000
    },
    missiles: {
        properties: {
            type: 'missiles',
            name: 'missiles',
            movement: 4,
            vision: 1,
            range: {
                low: 3,
                high: 5
            },
            damageType:'ranged',
            baseDamage:{
                fighter:100,
                bomber:100,
                bCopter:120,
                tCopter:120
            },
            movable: movable.wheels,
            transportation: 'wheels',
            health: 10,
            ammo: 10,
            fuel: 50,
            weapon1: {},
            weapon2: {}
        },
        name: 'missiles',
        cost: 12000
    },
    neoTank: {
        properties: {
            type: 'neoTank',
            name: 'Neo Tank',
            movement: 6,
            vision: 1,
            range: {
                low: 1,
                high: 1
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
                missiles:125,
                bCopter:22,
                tCopter:55,
                bShip:15,
                lander:40,
                cruiser:50,
                sub:15,
                pipe:75
            },
            movable: movable.wheels,
            transportation: 'wheels',
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
                low: 1,
                high: 1
            },
            load:['infantry', 'mech'],
            loaded:[],
            transport:1,
            movable: movable.flight,
            transportation: 'flight',
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
                low: 1,
                high: 1
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
                missiles:65,
                bCopter:65,
                tCopter:95,
                bShip:25,
                lander:25,
                cruiser:55,
                sub:25,
                pipe:25
            },
            movable: movable.flight,
            transportation: 'flight',
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
                low: 1,
                high: 1
            },
            damageType:'direct',
            baseDamage:{
                bCopter:100,
                tCopter:100,
                bomber:100,
                fighter:55
            },
            movable: movable.flight,
            transportation: 'flight',
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
                low: 1,
                high: 1
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
                missiles:105,
                bShip:75,
                lander:95,
                cruiser:85,
                sub:95,
                pipe:95
            },
            movable: movable.flight,
            transportation: 'flight',
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
                low: 1,
                high: 1
            },
            transport:2,
            load:[
                'infantry', 
                'mech', 
                'tank', 
                'midTank',
                'apc', 
                'missiles', 
                'rockets',
                'neoTank',
                'antiAir',
                'artillery',
                'recon'
            ],
            loaded:[],
            movable: movable.boat,
            transportation: 'boat',
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
                low: 1,
                high: 1
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
            movable: movable.boat,
            transportation: 'boat',
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
    submarine: {
        properties: {
            type: 'submarine',
            name: 'submarine',
            movement: 5,
            vision: 5,
            range: {
                low: 1,
                high: 1
            },
            damageType:'direct',
            baseDamage:{
                bShip:55,
                lander:95,
                cruiser:25,
                sub:55
            },
            movable: movable.boat,
            transportation: 'boat',
            health: 10,
            ammo: 10,
            fuel: 60,
            weapon1: {},
            weapon2: {},
            fpt: 1,
            divefpt: 5
        },
        name: 'submarine',
        cost: 20000
    },
    bShip: {
        properties: {
            type: 'bShip',
            name: 'B-Ship',
            movement: 5,
            vision: 2,
            range: {
                low: 2,
                high: 6
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
                missiles:90,
                bShip:50,
                lander:95,
                cruiser:95,
                sub:95,
                pipe:55
            },
            movable: movable.boat,
            transportation: 'boat',
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