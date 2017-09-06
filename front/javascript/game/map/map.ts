import settings from "../../settings/settings";
import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";
import {areDimensions, Dimensions} from "../coordinates/dimensions";
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

    const {isArray, isString, isNumber}: TypeChecker = typeChecker();
    const id: MapId = element.id;

    return (isNumber(id) || isString(id))
        && isString(element.name)
        && isNumber(element.maximumAmountOfPlayers)
        && isString(element.category)
        && areDimensions(element.dimensions)
        && isArray(element.terrain)
        && isArray(element.buildings)
        && isArray(element.units)
        && isString(element.createor);
}

export default (function() {

    const categories: any = settings().toObject("map", "numberToCategoryMappings");

    return function(

        name: string,
        creator: number,
        maximumAmountOfPlayers: number,
        dimensions: Dimensions,
        terrain: Terrain[] = [],
        buildings: Building[] = [],
        units: Unit[] = [],
        id?: MapId,
    ) {
        const category: string = units.length ? "preDeployed" : categories[maximumAmountOfPlayers];

        return {

            id,
            name,
            creator,
            maximumAmountOfPlayers,
            category,
            dimensions,
            terrain,
            buildings,
            units,
        };
    };
}());
