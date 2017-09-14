import dictionary, {Dictionary} from "../tools/storage/dictionary";
import single from "../tools/storage/singleton";
import colors from "./colors/colorSettings";
import canvasSettings from "./dom/canvas";
import errorEvents from "./error/errorEvents";
import hoverInfo from "./hud/hoverInfo";
import position from "./hud/position";
import factorsAllowingKeyboardInput from "./keyboard/factorsAllowingKeyboardInput";
import factorsDenyingKeyboardInput from "./keyboard/factorsDenyingKeyboardInput";
import keyCodeMappings from "./keyboard/keyCodeMappings";
import map from "./map/mapSettings";
import mode from "./menu/mode";
import settings from "./menu/settings";

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
        co: "Co",
        end: "End",
        intel: "Intel",
        options: "Options",
        save: "Save",
    },

    optionsMenuDisplay: ["options", "unit", "intel", "save", "end", "name"],

    // mapEditor elements that cannot be selected
    playerColor: {

        1: {h: 0, s: 100, l: 50},
        2: {h: 216, s: 100, l: 50},
        3: {h: 72, s: 100, l: 50},
        4: {h: 144, s: 100, l: 50},
    },

    settings,

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
