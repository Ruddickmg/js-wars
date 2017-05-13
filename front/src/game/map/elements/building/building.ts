import {default as composer, Composer} from "../../../../tools/composer";
import {default as createTerrain, Terrain} from "../terrain/terrain.js";
import {Player} from "../../../../users/players/player";

export interface Building {

    type: string,
    player: Player,
    health: number,
    name: string,
    index?: number,
    draw: string,
    position: Position
}

export default function (type, position, player, index): Building {
    
	const
        selectivelyCombineObjects: Composer = composer(),
        baseObject: Terrain = createTerrain(type, position),
        buildingProperties = {

            type: "building",
            player: player,
            health: 20,
            name: type,
            index: index,
        };

	return <Building>selectivelyCombineObjects.excluding("type", "name", "orientation")
        .combine(buildingProperties, baseObject);
};