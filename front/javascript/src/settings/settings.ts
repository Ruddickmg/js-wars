import dictionary, {Dictionary} from "../tools/storage/dictionary";
import single from "../tools/storage/singleton";
import colors from "./colors/colorSettings";
import screenConfiguration from "./configuration/screen";
import connection from "./connection/connections";
import canvas from "./dom/canvas";
import errorEvents from "./error/errorEvents";
import cursor from "./game/cursor";
import game from "./game/game";
import actions from "./huds/actions";
import hoverInfo from "./huds/hoverInfo";
import position from "./huds/position";
import factorsAllowingKeyboardInput from "./keyboard/factorsAllowingKeyboardInput";
import factorsDenyingKeyboardInput from "./keyboard/factorsDenyingKeyboardInput";
import keyCodeMappings from "./keyboard/keyCodeMappings";
import building from "./map/building";
import map from "./map/mapSettings";
import obstacle from "./map/obstacle";
import unit from "./map/unit";
import mode from "./menu/mode";
import options from "./menu/options";
import settings from "./menu/settings";

export default single<Dictionary>(() => dictionary({
  actions,
  canvas,
  capture: 20,
  colors,
  building,
  combineAbleProperties: ["fuel", "health", "ammo"],
  connection,
  cursor,
  debug: true,
  defaultHealth: 100,
  errorEvents,
  game,
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
  offScreen: 800,
  options,
  obstacle,
  screenConfiguration,
  settings,
  unit,
  swellIncrement: 3,
  swellSpeed: 1,
  testing: true,
  typingSpeed: 4,
}));
