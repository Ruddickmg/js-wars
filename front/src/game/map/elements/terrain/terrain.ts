import {default as createPosition, Position} from "../../../../coordinates/position";
import buildingDefaults from "../building/buildingDefaults";
import getDefaults from "../defaults";
import unitDefaults from "../unit/unitDefinitions";
import terrainDefaults from "./terrainDefaults";

export interface Terrain {

    type: string;
    orientation: string;
    name: string;
    draw: string;
    position: Position;
}

export default function(type: string, {x, y}: Position): Terrain {

    const defaults: any = getDefaults();

    return {

        draw: type,
        name: defaults.name(type),
        orientation: "",
        position: createPosition(x, y),
        type: "terrain",
    };
}
