import {Position} from "../../game/coordinates/position";
import {MapElement} from "../../game/map/elements/defaults";
import {MatrixMap} from "../../game/map/mapMatrix";
import pathfinder, {PathFinder} from "../../tools/path";
import notifications, {PubSub} from "../../tools/pubSub";

export interface Highlighter {

    movementRange(position: Position): void;
    attackRange(position: Position): void;
    path(position: Position): void;
}

export default function(map: MatrixMap) {

    const findPath: PathFinder = pathfinder(map);
    const {publish, subscribe}: PubSub = notifications();

    const getRangeOfElementAtPosition = (position: Position): Position[] => {

        const topElement: MapElement = map.position(position);

        return findPath.getAllReachablePositions(topElement);
    };
    const animate = (position: Position, animation: string) => {

        const path: Position[] = getRangeOfElementAtPosition(position);

        publish(animation, path);
    };
    const movementRange = (position: Position): void => animate(position, "animateMovementRange");
    const attackRange = (position: Position): void => animate(position, "animateAttackRange");
    const path = (position: Position): void => animate(position, "animateMovement");

    subscribe("showAttackRange", attackRange);
    subscribe("showMovementRange", movementRange);
    subscribe("showPath", path);

    return {

        attackRange,
        movementRange,
        path,
    };
}
