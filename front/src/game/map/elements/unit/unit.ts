import {default as createPosition, Position} from "../../../../coordinates/position";
import {default as createBuilding, Building} from "../building/building";
import {default as composer, Composer} from "../../../../tools/composer";
import {default as identifier, Identifier} from "../../../../tools/identity";
import createDefaults from "../defaults";
import unitDefaults from "./unitDefaults";
import terrainDefaults from "../terrain/terrainDefaults";
import buildingDefaults from "../building/buildingDefaults";
import {Player} from "../../../../users/players/player";
import unitDefinitions from '../unit/unitDefinitions';

export type UnitId = string | number;
export type Target = Unit | Building;
export type Action = string;

interface Actions {

    [index: string]: Action
}

export interface Unit {

    type: string,
    name: string,
    id: UnitId,
    player: Player,
    position: Position,
    moves: Position[],
    movement: number,
    actions: Actions,
    damage: number[],
    targets: Target[],
    health: number,
    fuel: number,
    vision: number,
    selectable: boolean,
    loaded?: Unit[],
    moved: number,
    action: string
}

const
    increment = (id:number) => id + 1,
    decrement = (id:number) => id - 1,
    identity: Identifier<number> = identifier<number>(1, increment, decrement);

export default function(type, position, player): Unit {

    const
        selectivelyCombineObjects: Composer = composer(),
        definition = unitDefinitions[type],
        defaults = createDefaults(unitDefaults(definition), buildingDefaults, terrainDefaults),
        baseObject = createBuilding(type, position, player, 0),
        unitNameAndType = {type: "unit", name: type},
        unitProperties = {

            id: identity.get(),
            position: createPosition(position.x, position.y),
            actions: {},
            targets: [],
            damage: [],
            health: defaults.health(),
            ammo: defaults.ammo(unitNameAndType),
            fuel: defaults.fuel(unitNameAndType),
            vision: defaults.vision(unitNameAndType),
            movement: 0,
            moves: [],
            moved: 0,
            selectable: false,
            loaded: defaults.loaded(unitNameAndType),
            action: false
        };

    return <Unit>selectivelyCombineObjects.excluding("type", "health", "index")
        .combine(unitNameAndType, unitProperties, baseObject);
};