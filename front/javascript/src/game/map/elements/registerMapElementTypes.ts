import {isDefined, register} from "../../../tools/validation/typeChecker";
import {MatrixMap} from "../mapMatrix";
import {MapElement} from "./defaults";

const restricted = {
  bridge: ["bridge"],
  pipe: ["pipe"],
  reef: this.sea,
  river: ["river"],
  road: ["road"],
  sea: ["sea", "reef", "shoal"],
  shoal: this.sea,
};
const registerChecksOnProperty = (property: string, checks: any[]) => {
  checks.forEach((type: string) => {
    register(type, (element: any) =>
      isDefined(element) && element[property] === type);
  });
};

export default function(map: MatrixMap<MapElement>) {
  const isSea = (element: MapElement): boolean => {
    return restricted.sea.indexOf(element.name) > -1;
  };
  registerChecksOnProperty("type", ["unit", "terrain", "building"]);
  registerChecksOnProperty("name", ["plain", "shoal", "reef", "river"]);
  register("sea", isSea);
  register("beach", (element: MapElement): boolean => {
    const neighbors = element.position.neighbors(map.dimensions());
    if (isSea(element)) {
      return neighbors.reduce((isBeach, neighboringPosition) => {
        const neighbor = map.get(neighboringPosition);
        return !isSea(neighbor) || isBeach;
      }, false);
    }
    return false;
  });
}
