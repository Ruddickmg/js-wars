import {Dimensions} from "../../coordinates/dimensions.";
import {Player} from "../../users/players/player";
import {Building} from "./elements/building/building";
import {Terrain} from "./elements/terrain/terrain";
import {Unit} from "./elements/unit/unit";

export type MapId = string | number;

export interface Map {

    id?: MapId;
    name: string;
    maximumAmountOfPlayers: number;
    players: Player[];
    category: string;
    dimensions: Dimensions;
    terrain: Terrain[];
    buildings: Building[];
    units: Unit[];
}

export default (function() {

    const categories: any = {

        2: "two",
        3: "three",
        4: "four",
        5: "five",
        6: "six",
        7: "seven",
        8: "eight",
    };

    return function(

        name: string,
        maximumAmountOfPlayers: number,
        dimensions: Dimensions,
        id?: MapId,
        terrain: Terrain[] = [],
        buildings: Building[] = [],
        units: Unit[] = [],
    ) {

        const category: string = units.length ?
            categories[maximumAmountOfPlayers] :
            "preDeployed";

        return {

            id,
            name,
            maximumAmountOfPlayers,
            players: [] as Player[],
            category,
            dimensions,
            terrain,
            buildings,
            units,
        };
    };
}());

