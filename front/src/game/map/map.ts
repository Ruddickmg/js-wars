import {Dimensions} from "../../coordinates/dimensions";
import settings from "../../settings/settings";
import {Player} from "../../users/players/player";
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
    creator: string;
}

export default (function() {

    const categories: any = settings().get("mapCategories");

    return function(

        name: string,
        maximumAmountOfPlayers: number,
        dimensions: Dimensions,
        id?: MapId,
        terrain: Terrain[] = [],
        buildings: Building[] = [],
        units: Unit[] = [],
        creator: string = "none",
    ) {

        const category: string = units.length ?
            categories[maximumAmountOfPlayers] :
            "preDeployed";

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

