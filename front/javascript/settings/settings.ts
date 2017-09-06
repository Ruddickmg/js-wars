import dictionary, {Dictionary} from "../tools/dictionary";
import single from "../tools/singleton";
import colors from "./colors/colorSettings";
import canvasSettings from "./dom/canvas";
import errorEvents from "./error/errorEvents";
import factorsAllowingKeyboardInput from "./keyboard/factorsAllowingKeyboardInput";
import factorsDenyingKeyboardInput from "./keyboard/factorsDenyingKeyboardInput";
import keyCodeMappings from "./keyboard/keyCodeMappings";
import mode from "./menu/mode";
import map from "./map/mapSettings";
import hoverInfo from "./hud/hoverInfo";
import position from "./hud/position";

export default single<Dictionary>(() => dictionary({

    actionsDisplay: ["attack", "capture", "wait", "load", "drop", "join", "name"],
    canvas: canvasSettings,
    capture: 20,

    colors,

    combineAbleProperties: ["fuel", "health", "ammo"],

    cursor: {
        speed: 50,
        x: 6,
        y: 4,
    },

    debug: true,
    defaultHealth: 100,
    errorEvents,
    game: {

        capt: "off",
        fog: "off",
        funds: 1000,
        power: "on",
        turn: "off",
        visuals: "off",
        weather: "random",
    },

    hud: {
        hoverInfo,
        position,
    },

    keys: {

        keyCodeMappings,
        factorsAllowingKeyboardInput,
        factorsDenyingKeyboardInput,
    },

    map,
    mode,

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
    offScreen: 800,

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

    // speed at which color swell.. fading in and out, will cycle (lower is faster)
    testing: true,
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
