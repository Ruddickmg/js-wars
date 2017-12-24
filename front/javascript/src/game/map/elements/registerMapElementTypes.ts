import typeChecker from "../../../tools/validation/typeChecker";
import {Map} from "../map";
import {MapElement} from "./defaults";

export default function(map: Map) {
  const check = typeChecker();
  const restricted = {
    bridge: ["bridge"],
    pipe: ["pipe"],
    reef: this.sea,
    river: ["river"],
    road: ["road"],
    sea: ["sea", "reef", "shoal"],
    shoal: this.sea,
  };
  const isSea = (element: MapElement): boolean => {
    return restricted.sea.indexOf(element.name) > -1;
  };
  check.registerChecksOnProperty("type", ["unit", "terrain", "building"]);
  check.registerChecksOnProperty("name", ["plain", "shoal", "reef", "river"]);
  check.register("sea", isSea);
  check.register("beach", (element: MapElement): boolean => {
    const neighbors = element.position.neighbors(map.dimensions);
    if (isSea(element)) {
      return neighbors.reduce((isBeach, neighboringPosition) => {
        const neighbor = map.top(neighboringPosition);
        return !isSea(neighbor) || isBeach;
      }, false);
    }
    return false;
  });
}
