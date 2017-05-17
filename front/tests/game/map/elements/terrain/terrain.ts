import {default as createPosition, Position} from "../position";
import createDefaults from "../defaults";
import unitDefaults from "../unit/unitDefinitions";
import buildingDefaults from "../building/buildingDefaults";
import terrainDefaults from "./properties";

export interface Terrain {

    type: string,
    orientation: string,
    name: string,
    draw: string,
    position: Position
}

export default function (type: string, {x, y}: Position): Terrain {

    const defaults = createDefaults(unitDefaults, buildingDefaults, terrainDefaults);

    return {

        type: "terrain",
        orientation: "",
        name: defaults.name(type),
        draw: type,
        position: createPosition(x, y)
    };
}
