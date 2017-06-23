import {Position} from "../../../../coordinates/position";
import {Composer, default as composer} from "../../../../tools/composer";
import {default as createTerrain, Terrain} from "../terrain/terrain.js";

export interface Building {

    type: string;
    playerNumber: number;
    health: number;
    name: string;
    index?: number;
    draw: string;
    position: Position;
}

export default function(name: string, position: Position, playerNumber: number, index?: number): Building {

    const combine: Composer<Building> = composer() as Composer<Building>;
    const baseObject: Terrain = createTerrain(name, position);
    const buildingProperties = {

        health: 20,
        index,
        playerNumber,
        name,
        type: "building",
    };

    return combine.excluding(

        ["type", "name", "orientation"],
        buildingProperties,
        baseObject,
    );
}
