import composer, {Composer} from "../../../../tools/object/composer";
import {Position} from "../../coordinates/position";
import createTerrain, {Terrain} from "../terrain/terrain.js";

export interface Building extends Terrain {
  type: string;
  playerNumber: number;
  health: number;
  name: string;
  index?: number;
  drawing: string;
  position: Position;
}

export default function(name: string, position: Position, playerNumber: number, index: number = null): Building {
  const combine: Composer<Building> = composer() as Composer<Building>;
  const baseObject: Terrain = createTerrain(name, position);
  const buildingProperties = {
    health: 20,
    index,
    name,
    playerNumber,
    type: "building",
  };
  return combine.excluding(
    ["type", "name", "orientation"],
    buildingProperties,
    baseObject,
  );
}
