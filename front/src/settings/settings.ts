/**
 * Created by moonmaster on 5/18/17.
 */
import buildingStats from "../game/map/elements/building/buildingDefaults";
import terrainStats from "../game/map/elements/terrain/terrainDefaults";
import unitStats from "../game/map/elements/unit/unitDefinitions";
import capitalizeFirstLetter from "../tools/capitalizeFirstLetter";
import dictionary, {Dictionary} from "../tools/dictionary";
import single from "../tools/singleton";
import factorsAllowingKeyboardInput from "./keyboard/factorsAllowingKeyboardInput";
import factorsDenyingKeyboardInput from "./keyboard/factorsDenyingKeyboardInput";
import keys from "./keyboard/keyCodeMappings";

export interface Settings extends Dictionary {}

const modeMenuItem = function(name: string, options?: string[], type?: string) {

    return {

        display: capitalizeFirstLetter(name),
        id: name,
        type: type || name,
        options,
    };
};

export default single<Dictionary>(() => dictionary({

    keys: {

        keys,
        factorsAllowingKeyboardInput,
        factorsDenyingKeyboardInput,
    },

    actionsDisplay: ["attack", "capture", "wait", "load", "drop", "join", "name"],

    capture: 20,

    categories: {
        eight: {type: "8 Player"},
        five: {type: "5 Player"},
        four: {type: "4 Player"},
        preDeployed: {type: "Pre-Deployed"},
        seven: {type: "7 Player"},
        six: {type: "6 Player"},
        three: {type: "3 Player"},
        two: {type: "1 on 1"},
    },

    colorSwellIncrement: 1.5,
    colorSwellSpeed: 2,

    // general swell speed
    colors: {

        blue: {h: 216, s: 100, l: 50},
        design: {h: 216, s: 100, l: 50},
        game: {h: 0, s: 100, l: 50},
        green: {h: 144, s: 100, l: 50},
        join: {h: 144, s: 100, l: 50},
        logout: {h: 288, s: 100, l: 50},
        red: {h: 0, s: 100, l: 50},
        store: {h: 72, s: 100, l: 50},
        white: {h: 360, s: 0, l: 100},
        yellow: {h: 72, s: 100, l: 50},
    },

    combineAbleProperties: ["fuel", "health", "ammo"],

    cursor: {
        scroll: {
            x: 0,
            y: 0,
        },
        speed: 50,
        x: 6,
        y: 4,
    },

    default: {

        category: () => 0,
        cursorMoved: () => true,
        lightness: () => 50,
        menuOptionsActive: () => false,
        saturation: () => 0,
        scrollTime: () => 0,
        selectActive: () => false,
    },

    defaultHealth: 100,

    game: {

        capt: "off",
        fog: "off",
        funds: 1000,
        power: "on",
        turn: "off",
        visuals: "off",
        weather: "random",
    },

    hoverInfo: ["ammo", "showHealth", "health", "name", "fuel", "defense", "canvas"],

    // which actions can be displayed
    hudHeight: 200,
    hudLeft: 1050,

    // spacing / positioning of mode menu selection elements
    hudWidth: 120,
    mapCategories: ["preDeployed", "two", "three", "four", "five", "six", "seven", "eight"],

    // cursor settings
    mapElementRestrictions: {

        bridge: ["bridge"],
        pipe: ["pipe"],
        reef: this.sea,
        river: ["river"],
        road: ["road"],
        sea: ["sea", "reef", "shoal"],
        shoal: this.sea,
    },

    mapElements: {

        buildings: buildingStats,
        terrain: terrainStats,
        units: unitStats,
    },

    modeMenuSpacing: 20,

    // which attributes of objects ( unit, buildings etc ) will be displayed in hud
    notSelectable: ["terrain", "hq", "city"],

    // categories of maps
    obstacleStats: {

        infantry: {
            mountain: 2,
            plain: 1,
            unit: 1000,
            wood: 1,
        },
        mountain: {
            apc: 2,
            infantry: 2,
        },
        plain: {
            apc: 1,
            infantry: 1,
        },
        unit: {
            apc: 1,
            infantry: 1,
        },
        wood: {
            apc: 2,
            infantry: 1,
        },
    },

    obstacleTypes: ["unit", "terrain"],

    // list of the effects each obstacle has on each unit type
    optionsMenu: {
        co: {name: "Co"},
        end: {name: "End"},
        intel: {name: "Intel"},
        options: {name: "Options"},
        save: {name: "Save"},
    },

    optionsMenuDisplay: ["options", "unit", "intel", "save", "end", "name"],

    // mapEditor elements that cannot be selected
    playerColor: {

        1: {h: 0, s: 100, l: 50},
        2: {h: 216, s: 100, l: 50},
        3: {h: 72, s: 100, l: 50},
        4: {h: 144, s: 100, l: 50},
    },

    // types to look through when determining terrains effect on unit movement
    playersDisplayElement: {

    },

    selectModeMenu: [
        modeMenuItem("game", ["new", "continue"], "setup"),
        modeMenuItem("join", ["new", "continue"]), // used to have param: `color:"yellow"`
        modeMenuItem("design", ["map", "co"]),
        modeMenuItem("store"),
        modeMenuItem("logout", null, "exit"),
    ],

    selectedModeHeight: 75,

    settingsDisplayElement: {

        capt: {
            description: "Set number of properties needed to win.",
            inc: 1,
            max: 45,
            min: 7,
            off: "OFF",
        },
        fog: {
            description: "Set ON to limit vision with fog of war.",
            off: "OFF",
            on: "ON",
        },
        funds: {
            description: "Set funds recieved per allied base.",
            inc: 500,
            max: 9500,
            min: 1000,
        },
        power: {
            description: "Select ON to enamble CO powers.",
            off: "OFF",
            on: "ON",
        },
        turn: {
            description: "Set number of days to battle.",
            inc: 1,
            max: 99,
            min: 5,
            off: "OFF",
        },
        visuals: {
            a: "Type A",
            b: "Type B",
            c: "Type C",
            description: {
                a: "Battle and capture animation.",
                b: "Battle animation only.",
                c: "Battle animation for players only.",
                off: "No animation.",
            },
            off: "OFF",
        },
        weather: {
            clear: "Clear",
            description: "RANDOM causes climate to change.",
            rain: "Rain",
            random: "Random",
            snow: "Snow",
        },
    },

    // dimensions of diplay hud
    swellIncrement: 3,
    swellSpeed: 1,

    testing: false,

    // speed at which color swell.. fading in and out, will cycle (lower is faster)
    typesOfMapElements: {

        airport: "building",
        base: "building",
        hq: "building",
        plains: "plain",
        seaport: "building",
        woods: "wood",
    },
    typesOfUnitsABuildingCanHeal: {

        airport: ["flight"],
        base: ["foot", "wheels"],
        city: ["foot", "wheels"],
        hq: ["foot", "wheels"],
        seaport: ["boat"],
    },

    typingSpeed: 2.5,

    // colors of menus etc...
    unitInfoDisplay: ["movement", "vision", "fuel", "weapon1", "weapon2", "property", "value"],

    // options attributes for display
}));
