import {Position} from "../../game/map/coordinates/position";
import {MapElement} from "../../game/map/elements/defaults";
import {isUnit} from "../../game/map/elements/unit/unit";
import {MatrixMap} from "../../game/map/mapMatrix";
import pathfinder, {PathFinder} from "../../tools/pathfinding/pathFinder";
import {publish, subscribe} from "../../tools/pubSub";
import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";

export interface ShowPath {
  movementRange(position: Position): void;
  attackRange(position: Position): void;
  path(position: Position): void;
}

export default function(map: MatrixMap<MapElement>) {
  const {movementCost, allowedMovement}: UnitController = unitController();
  const findPath: PathFinder<any> = pathfinder(
    map,
    map.dimensions(),
    map.positionOfElement,
    movementCost,
    allowedMovement,
  );
  const {isArray}: TypeChecker = typeChecker();
  const getRangeOfElementAtPosition = (position: Position): Position[] => {
    const topElement: MapElement = map.get(position);
    if (isUnit(topElement)) {
      return findPath.getAllReachablePositions(topElement);
    }
  };
  const animate = (position: Position, animation: string) => {
    const pathToAnimate: Position[] = getRangeOfElementAtPosition(position);
    if (isArray(pathToAnimate)) {
      publish(animation, pathToAnimate);
    }
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
