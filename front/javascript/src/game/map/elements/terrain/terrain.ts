import createPosition, {Position} from "../../coordinates/position";
import getDefaults from "../defaults";

export interface Terrain {

  type: string;
  orientation: string;
  name: string;
  drawing: string;
  position: Position;
}

export default function(type: string, {x, y}: Position): Terrain {

  const defaults: any = getDefaults();

  return {

    drawing: type,
    name: defaults.name(type),
    orientation: "",
    position: createPosition(x, y),
    type: "terrain",
  };
}
