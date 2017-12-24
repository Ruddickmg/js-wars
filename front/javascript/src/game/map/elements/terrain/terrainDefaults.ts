import obstacles from "./obsticles";
import createProperty from "./property";

export default {
  base: createProperty("Base", obstacles.building),
  hq: createProperty("HQ", obstacles.building),
  plain: createProperty("Plains", obstacles.plain),
  snow: createProperty("Snow", obstacles.snow),
  tallMountain: createProperty("Mountain", obstacles.mountain),
  tree: createProperty("Woods", obstacles.wood),
  unit: createProperty("Unit", obstacles.unit),
};
