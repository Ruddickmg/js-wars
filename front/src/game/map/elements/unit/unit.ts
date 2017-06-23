import {default as createPosition, Position} from "../../../../coordinates/position";
import settings, {Settings} from "../../../../settings/settings";
import {Composer, default as composer} from "../../../../tools/composer";
import {default as identifier, Identifier} from "../../../../tools/identity";
import {Building, default as createBuilding} from "../building/building";

export type UnitId = string | number;
export type Target = Unit | Building;
export type Action = string;

interface Actions {

    [index: string]: Action;
}

export interface Unit {

    type: string;
    name: string;
    id: UnitId;
    playerNumber: number;
    position: Position;
    moves: Position[];
    movement: number;
    actions: Actions;
    damage: number[];
    targets: Target[];
    health: number;
    fuel: number;
    vision: number;
    selectable: boolean;
    loaded?: Unit[];
    moved: number;
    action: string;
    [index: string]: any;
}

const increment = (id: number) => id + 1;
const decrement = (id: number) => id - 1;
const identity: Identifier<number> = identifier<number>(1, increment, decrement);

export default function(type: string, position: Position, playerNumber: number): Unit {

    const selectivelyCombineObjects: Composer<Unit> = composer() as Composer<Unit>;
    const mapElementDefaults: Settings = settings().get("mapElements");
    const unitDefaults = mapElementDefaults.get("units", type);
    const {ammo, fuel, health, loaded, vision}: any = unitDefaults.toObject();
    const baseObject = createBuilding(type, position, playerNumber, 0);
    const unitNameAndType = {type: "unit", name: type};
    const damage: number[] = [];
    const moves: Position[] = [];
    const targets: Target[] = [];

    const unitProperties = {

        action: false,
        actions: {},
        ammo,
        damage,
        fuel,
        health,
        id: identity.get(),
        loaded,
        moved: 0,
        movement: 0,
        moves,
        position: createPosition(position.x, position.y),
        selectable: false,
        targets,
        vision,
    };

    return selectivelyCombineObjects.excluding(
        ["type", "health", "index"],
        unitNameAndType,
        unitProperties,
        baseObject,
    );
}
