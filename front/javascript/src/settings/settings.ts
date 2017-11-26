import dictionary, {Dictionary} from "../tools/storage/dictionary";
import single from "../tools/storage/singleton";
import colors from "./colors/colorSettings";
import screenConfiguration from "./configuration/screen";
import connection from "./connection/connections";
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
  connection,
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
  keyboard: {
    keyCodeMappings,
    factorsAllowingKeyboardInput,
    factorsDenyingKeyboardInput,
  },
  map,
  mode,
  notSelectable: ["terrain", "hq", "city"],
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
  optionsMenu: {
    co: "Co",
    end: "End",
    intel: "Intel",
    options: "Options",
    save: "Save",
  },
  optionsMenuDisplay: ["options", "unit", "intel", "save", "end", "name"],
  playerColor: {
    1: {h: 0, s: 100, l: 50},
    2: {h: 216, s: 100, l: 50},
    3: {h: 72, s: 100, l: 50},
    4: {h: 144, s: 100, l: 50},
  },
  screenConfiguration,
  settings,
  swellIncrement: 3,
  swellSpeed: 1,
  testing: true,
  typesOfUnitsABuildingCanHeal: {
    airport: ["air"],
    base: ["foot", "wheels"],
    city: ["foot", "wheels"],
    hq: ["foot", "wheels"],
    seaport: ["boat"],
  },
  typingSpeed: 4,
  unitInfoDisplay: [
    "movement",
    "vision",
    "fuel",
    "weapon1",
    "weapon2",
    "property",
    "value",
  ],
}));
