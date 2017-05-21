import {Position} from "../../../../coordinates/position";
import {Composer, default as composer} from "../../../../tools/composer";
import {Player} from "../../../../users/players/player";
import {default as createTerrain, Terrain} from "../terrain/terrain.js";

export interface Building {

    type: string;
    player: Player;
    health: number;
    name: string;
    index?: number;
    draw: string;
    position: Position;
}

export default function(name: string, position: Position, player: number, index?: number): Building {

    const combine: Composer<Building> = composer() as Composer<Building>;
    const baseObject: Terrain = createTerrain(name, position);
    const buildingProperties = {

        health: 20,
        index,
        player,
        name,
        type: "building",
    };

    return combine.excluding(

        ["type", "name", "orientation"],
        buildingProperties,
        baseObject,
    );
}
