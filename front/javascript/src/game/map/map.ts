import settings from "../../settings/settings";
import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";
import {areDimensions, Dimensions} from "./coordinates/dimensions";
import {Building} from "./elements/building/building";
import {Terrain} from "./elements/terrain/terrain";
import {Unit} from "./elements/unit/unit";

export type MapId = string | number;

export interface Map {
  id?: MapId;
  name: string;
  maximumAmountOfPlayers: number;
  category: string;
  dimensions: Dimensions;
  terrain: Terrain[];
  buildings: Building[];
  units: Unit[];
  creator: number;
}

export function isMap(element: any): boolean {
  const {isArray, isString, isNumber, isNull, isDefined}: TypeChecker = typeChecker();
  let id: MapId;
  let bool: boolean = false;
  if (isDefined(element) && !isNull(element)) {
    id = element.id;
    bool = (isNumber(id) || isString(id) || isNull(id))
      && isString(element.name)
      && isNumber(element.maximumAmountOfPlayers)
      && isString(element.category)
      && areDimensions(element.dimensions)
      && isArray(element.terrain)
      && isArray(element.buildings)
      && isArray(element.units);
  }
  return bool;
}

export default (function() {
  const categories: any = settings().toObject("map", "numberToCategoryMappings");
  return function(
    name: string,
    creator: number = null,
    maximumAmountOfPlayers: number,
    dimensions: Dimensions,
    terrain: Terrain[] = [],
    buildings: Building[] = [],
    units: Unit[] = [],
    id: MapId = null,
  ) {
    const category: string = units.length ? "preDeployed" : categories[maximumAmountOfPlayers];
    return {
      buildings,
      category,
      creator,
      dimensions,
      id,
      maximumAmountOfPlayers,
      name,
      terrain,
      units,
    };
  };
}());
