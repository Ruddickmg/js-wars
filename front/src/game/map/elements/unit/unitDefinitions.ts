const movable = {
    boat: ["water", "building"],
    flight: ["plain", "river", "mountain", "wood", "road", "water", "building"],
    foot: ["plain", "river", "mountain", "wood", "road", "building"],
    wheels: ["plain", "wood", "road", "building"],
};

export default {

    antiAir: {
        cost: 8000,
        name: "Anti-Aircraft",
        properties: {
            ammo: 10,
            baseDamage: {
                antiAir: 45,
                apc: 50,
                artillery: 50,
                bCopter: 120,
                bomber: 75,
                fighter: 65,
                infantry: 105,
                mech: 105,
                midTank: 10,
                missiles: 55,
                neoTank: 5,
                pipe: 55,
                recon: 60,
                rockets: 55,
                tCopter: 120,
                tank: 25,
            },
            damageType: "direct",
            fuel: 60,
            health: 10,
            inRange: {
                high: 1,
                low: 1,
            },
            movable: movable.wheels,
            movement: 6,
            name: "Anti-Air",
            transportation: "wheels",
            type: "antiAir",
            vision: 2,
            weapon1: {},
            weapon2: {},
        },
    },
    apc: {
        cost: 5000,
        name: "APC",
        properties: {
            canAttack: [],
            fuel: 70,
            health: 10,
            inRange: {
                high: 1,
                low: 1,
            },
            load: ["infantry", "mech"],
            loaded: [],
            maxLoad: 1,
            movable: movable.wheels,
            movement: 6,
            movementCosts: {
                building: 1,
                mountain: 7,
                plain: 1,
                wood: 2,
            },
            name: "APC",
            transportation: "wheels",
            type: "apc",
            vision: 1,
            weapon1: {},
            weapon2: {},
        },
    },
    artillery: {
        cost: 6000,
        name: "Artillery",
        properties: {
            ammo: 10,
            baseDamage: {
                antiAir: 75,
                apc: 70,
                artillery: 75,
                bShip: 40,
                cruiser: 65,
                infantry: 90,
                lander: 55,
                mech: 85,
                midTank: 45,
                missiles: 80,
                neoTank: 40,
                pipe: 45,
                recon: 80,
                rockets: 80,
                sub: 60,
                tank: 70,
            },
            damageType: "ranged",
            fuel: 50,
            health: 10,
            inRange: {
                high: 3,
                low: 2,
            },
            movable: movable.wheels,
            movement: 5,
            name: "Artillary",
            transportation: "wheels",
            type: "artillery",
            vision: 1,
            weapon1: {},
            weapon2: {},
        },
    },
    bCopter: {
        cost: 9000,
        name: "B-Copter",
        properties: {
            ammo: 10,
            baseDamage: {
                antiAir: 25,
                apc: 60,
                artillery: 65,
                bCopter: 65,
                bShip: 25,
                cruiser: 55,
                infantry: 75,
                lander: 25,
                mech: 75,
                midTank: 25,
                missiles: 65,
                neoTank: 20,
                pipe: 25,
                recon: 55,
                rockets: 65,
                sub: 25,
                tCopter: 95,
                tank: 55,
            },
            damageType: "direct",
            fpt: 1,
            fuel: 99,
            health: 10,
            inRange: {
                high: 1,
                low: 1,
            },
            movable: movable.flight,
            movement: 6,
            name: "B-Copter",
            transportation: "flight",
            type: "bCopter",
            vision: 3,
            weapon1: {},
            weapon2: {},
        },
    },
    bShip: {
        cost: 28000,
        name: "B-Ship",
        properties: {
            ammo: 10,
            baseDamage: {
                antiAir: 85,
                apc: 80,
                artillery: 80,
                bShip: 50,
                cruiser: 95,
                infantry: 95,
                lander: 95,
                mech: 90,
                midTank: 55,
                missiles: 90,
                neoTank: 50,
                pipe: 55,
                recon: 90,
                rockets: 85,
                sub: 95,
                tank: 80,
            },
            damageType: "ranged",
            fpt: 1,
            fuel: 99,
            health: 10,
            inRange: {
                high: 6,
                low: 2,
            },
            movable: movable.boat,
            movement: 5,
            name: "B-Ship",
            transportation: "boat",
            type: "bShip",
            vision: 2,
            weapon1: {},
            weapon2: {},
        },
    },
    bomber: {
        cost: 22000,
        name: "Bomber",
        properties: {
            ammo: 10,
            baseDamage: {
                antiAir: 95,
                apc: 105,
                artillery: 105,
                bShip: 75,
                cruiser: 85,
                infantry: 110,
                lander: 95,
                mech: 110,
                midTank: 95,
                missiles: 105,
                neoTank: 90,
                pipe: 95,
                recon: 105,
                rockets: 105,
                sub: 95,
                tank: 105,
            },
            damageType: "direct",
            fpt: 5,
            fuel: 99,
            health: 10,
            inRange: {
                high: 1,
                low: 1,
            },
            movable: movable.flight,
            movement: 7,
            name: "Bomber",
            transportation: "flight",
            type: "bomber",
            vision: 2,
            weapon1: {},
            weapon2: {},
        },
    },
    cruiser: {
        cost: 18000,
        name: "Cruiser",
        properties: {
            ammo: 10,
            baseDamage: {
                bCopter: 115,
                bomber: 65,
                fighter: 55,
                sub: 90,
                tCopter: 115,
            },
            damageType: "direct",
            fpt: 1,
            fuel: 99,
            health: 10,
            inRange: {
                high: 1,
                low: 1,
            },
            load: ["tCopter", "bCopter"],
            loaded: [],
            movable: movable.boat,
            movement: 6,
            name: "Cruiser",
            transport: 2,
            transportation: "boat",
            type: "cruiser",
            vision: 3,
            weapon1: {},
            weapon2: {},
        },
    },
    fighter: {
        cost: 20000,
        name: "Fighter",
        properties: {
            ammo: 10,
            baseDamage: {
                bCopter: 100,
                bomber: 100,
                fighter: 55,
                tCopter: 100,
            },
            damageType: "direct",
            fpt: 5,
            fuel: 99,
            health: 10,
            inRange: {
                high: 1,
                low: 1,
            },
            movable: movable.flight,
            movement: 9,
            name: "Fighter",
            transportation: "flight",
            type: "fighter",
            vision: 2,
            weapon1: {},
            weapon2: {},
        },
    },
    infantry: {

        cost: 1000,
        name: "Infantry",
        properties: {
            ammo: 10,
            baseDamage: {
                antiAir: 5,
                apc: 14,
                artillery: 15,
                bCopter: 7,
                infantry: 55,
                mech: 45,
                midTank: 1,
                missiles: 25,
                neoTank: 1,
                pipe: 1,
                recon: 12,
                rockets: 25,
                tCopter: 30,
                tank: 5,
            },
            canAttack: ["wheels", "foot"],
            capture: true,
            damageType: "direct",
            fuel: 99,
            health: 10,
            inRange: {
                high: 1,
                low: 1,
            },
            movable: movable.foot,
            movement: 3,
            movementCosts: {
                building: 1,
                mountain: 2,
                plain: 1,
                wood: 1,
            },
            name: "Infantry",
            transportation: "foot",
            type: "infantry",
            vision: 2,
            weapon1: {},
            weapon2: {},
        },
    },
    lander: {
        cost: 12000,
        name: "Lander",
        properties: {
            fpt: 1,
            fuel: 99,
            health: 10,
            inRange: {
                high: 1,
                low: 1,
            },
            load: [
                "infantry",
                "mech",
                "tank",
                "midTank",
                "apc",
                "missiles",
                "rockets",
                "neoTank",
                "antiAir",
                "artillery",
                "recon",
            ],
            loaded: [],
            movable: movable.boat,
            movement: 6,
            name: "Lander",
            transport: 2,
            transportation: "boat",
            type: "lander",
            vision: 1,
            weapon1: {},
            weapon2: {},
        },
    },
    mech: {
        cost: 3000,
        name: "Mech",
        properties: {
            ammo: 10,
            baseDamage: {
                antiAir: 65,
                apc: 75,
                artillery: 70,
                bCopter: 9,
                infantry: 65,
                mech: 55,
                midTank: 15,
                missiles: 85,
                neoTank: 15,
                pipe: 15,
                recon: 85,
                rockets: 85,
                tCopter: 35,
                tank: 55,
            },
            capture: true,
            damageType: "direct",
            fuel: 70,
            health: 10,
            inRange: {
                high: 1,
                low: 1,
            },
            movable: movable.foot,
            movement: 2,
            name: "Mech",
            transportation: "foot",
            type: "mech",
            vision: 2,
            weapon1: {},
            weapon2: {},
        },
    },
    midTank: {
        properties: {
            ammo: 10,
            baseDamage: {
                antiAir: 105,
                apc: 105,
                artillery: 105,
                bCopter: 12,
                bShip: 10,
                cruiser: 45,
                infantry: 105,
                lander: 35,
                mech: 95,
                midTank: 55,
                missiles: 105,
                neoTank: 45,
                pipe: 55,
                recon: 105,
                rockets: 105,
                sub: 10,
                tCopter: 45,
                tank: 85,
            },
        cost: 16000,
            damageType: "direct",
            fuel: 50,
            health: 10,
            inRange: {
                high: 1,
                low: 1,
            },
            movable: movable.wheels,
            movement: 5,
            name: "Mid Tank",
            transportation: "wheels",
            type: "midTank",
            vision: 1,
            weapon1: {},
            weapon2: {},
        },
    },
    missiles: {
        cost: 12000,
        name: "missiles",
        properties: {
            ammo: 10,
            baseDamage: {
                bCopter: 120,
                bomber: 100,
                fighter: 100,
                tCopter: 120,
            },
            damageType: "ranged",
            fuel: 50,
            health: 10,
            inRange: {
                high: 5,
                low: 3,
            },
            movable: movable.wheels,
            movement: 4,
            name: "missiles",
            transportation: "wheels",
            type: "missiles",
            vision: 1,
            weapon1: {},
            weapon2: {},
        },
    },
    neoTank: {
        cost: 22000,
        name: "Neo Tank",
        properties: {
            ammo: 10,
            baseDamage: {
                antiAir: 115,
                apc: 125,
                artillery: 115,
                bCopter: 22,
                bShip: 15,
                cruiser: 50,
                infantry: 125,
                lander: 40,
                mech: 115,
                midTank: 75,
                missiles: 125,
                neoTank: 55,
                pipe: 75,
                recon: 125,
                rockets: 125,
                sub: 15,
                tCopter: 55,
                tank: 105,
            },
            damageType: "direct",
            fuel: 99,
            health: 10,
            inRange: {
                high: 1,
                low: 1,
            },
            movable: movable.wheels,
            movement: 6,
            name: "Neo Tank",
            transportation: "wheels",
            type: "neoTank",
            vision: 1,
            weapon1: {},
            weapon2: {},
        },
    },
    recon: {
        cost: 4000,
        name: "Recon",
        properties: {
            ammo: 10,
            baseDamage: {
                antiAir: 4,
                apc: 45,
                artillery: 45,
                bCopter: 10,
                infantry: 70,
                mech: 65,
                midTank: 1,
                missiles: 28,
                neoTank: 1,
                pipe: 1,
                recon: 32,
                rockets: 55,
                tCopter: 35,
                tank: 6,
            },
            damageType: "direct",
            fuel: 80,
            health: 10,
            inRange: {
                high: 1,
                low: 1,
            },
            movable: movable.wheels,
            movement: 8,
            name: "Recon",
            transportation: "wheels",
            type: "recon",
            vision: 5,
            weapon1: {},
            weapon2: {},
        },
    },
    rockets: {
        cost: 15000,
        name: "Rockets",
        properties: {
            ammo: 10,
            baseDamage: {
                antiAir: 85,
                apc: 80,
                artillery: 80,
                bShip: 55,
                cruiser: 85,
                infantry: 95,
                lander: 60,
                mech: 90,
                midTank: 55,
                missiles: 90,
                neoTank: 50,
                pipe: 55,
                recon: 90,
                rockets: 85,
                sub: 85,
                tank: 80,
            },
            damageType: "ranged",
            fuel: 50,
            health: 10,
            inRange: {
                high: 5,
                low: 3,
            },
            movable: movable.wheels,
            movement: 5,
            name: "Rockets",
            transportation: "wheels",
            type: "rockets",
            vision: 1,
            weapon1: {},
            weapon2: {},
        },
    },
    submarine: {
        cost: 20000,
        name: "submarine",
        properties: {
            ammo: 10,
            baseDamage: {
                bShip: 55,
                cruiser: 25,
                lander: 95,
                sub: 55,
            },
            damageType: "direct",
            diveFpt: 5,
            fpt: 1,
            fuel: 60,
            health: 10,
            inRange: {
                high: 1,
                low: 1,
            },
            movable: movable.boat,
            movement: 5,
            name: "submarine",
            transportation: "boat",
            type: "submarine",
            vision: 5,
            weapon1: {},
            weapon2: {},
        },
    },
    tCopter: {
        cost: 5000,
        name: "T-Copter",
        properties: {
            canAttack: [],
            fpt: 2,
            fuel: 99,
            health: 10,
            inRange: {
                high: 1,
                low: 1,
            },
            load: ["infantry", "mech"],
            loaded: [],
            movable: movable.flight,
            movement: 6,
            name: "T-Copter",
            transport: 1,
            transportation: "flight",
            type: "tCopter",
            vision: 2,
            weapon1: {},
            weapon2: {},
        },
    },
    tank: {
        properties: {
            ammo: 10,
            baseDamage: {
                antiAir: 65,
                apc: 75,
                artillery: 70,
                bCopter: 10,
                bShip: 1,
                cruiser: 5,
                infantry: 75,
                lander: 10,
                mech: 70,
                midTank: 15,
                missiles: 85,
                neoTank: 15,
                pipe: 15,
                recon: 85,
                rockets: 85,
                sub: 1,
                tCopter: 40,
                tank: 55,
            },
            cost: 7000,
            damageType: "direct",
            fuel: 60,
            health: 10,
            inRange: {
                high: 1,
                low: 1,
            },
            movable: movable.wheels,
            movement: 6,
            name: "Tank",
            transportation: "wheels",
            type: "tank",
            vision: 3,
            weapon1: {},
            weapon2: {},
        },
    },
};
