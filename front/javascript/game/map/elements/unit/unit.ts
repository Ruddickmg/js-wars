import settings from "../../../../settings/settings";
import composer, {Composer} from "../../../../tools/composer";
import {Dictionary} from "../../../../tools/dictionary";
import identifier, {Identifier} from "../../../../tools/identity";
import typeChecker, {TypeChecker} from "../../../../tools/validation/typeChecker";
import createPosition, {isPosition, Position} from "../../../coordinates/position";
import createBuilding, {Building} from "../building/building";

export type UnitId = string | number;
export type Target = Unit | Building;
export type Action = string;

interface Actions {

    [index: string]: Action;
}

export interface Unit {

    action?: string;
    [index: string]: any;
    actions: Actions;
    damage: number[];
    drawing: string;
    fuel: number;
    health: number;
    id: UnitId;
    loaded?: Unit[];
    moved: number;
    movement: number;
    moves: Position[];
    name: string;
    playerNumber: number;
    position: Position;
    selectable: boolean;
    targets: Target[];
    type: string;
    vision: number;
}

export function isUnit(element: any): boolean {

    const {isString, isNumber, isArray, isDefined, isObject, isBoolean}: TypeChecker = typeChecker();

    return isDefined(element)
        && isString(element.action)
        && isObject(element.actions)
        && isArray(element.damage)
        && isString(element.drawing)
        && isNumber(element.fuel)
        && isNumber(element.health)
        && (isNumber(element.id) || isString(element.id))
        && (!isDefined(element.loaded) || isArray(element.loaded))
        && (!isDefined(element.moved) || isNumber(element.moved))
        && isNumber(element.movement)
        && isArray(element.moves)
        && isString(element.name)
        && isNumber(element.playerNumber)
        && isPosition(element.position)
        && isBoolean(element.selectable)
        && isArray(element.targets)
        && isString(element.type)
        && isNumber(element.vision);
}

export default function(type: string, position: Position, playerNumber: number): Unit {

    const increment = (id: number) => id + 1;
    const decrement = (id: number) => id - 1;
    const identity: Identifier<number> = identifier<number>(1, increment, decrement);
    const selectivelyCombineObjects: Composer<Unit> = composer() as Composer<Unit>;
    const mapElementDefaults: Dictionary = settings().get("mapElements");
    const unitDefaults = mapElementDefaults.get("units", type);
    const {ammo, fuel, health, loaded, vision}: any = unitDefaults.toObject();
    const baseObject = createBuilding(type, position, playerNumber, 0);
    const unitNameAndType = {type: "unit", name: type};
    const damage: number[] = [];
    const moves: Position[] = [];
    const targets: Target[] = [];

    const unitProperties = {

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
