import {Dimensions} from "../../game/map/coordinates/dimensions";
import {Position} from "../../game/map/coordinates/position";
import createHeap, {BinaryHeap} from "../storage/heaps/binaryHeap";
import {Matrix} from "../storage/matrix/matrix";
import pathTracker, {PathTracker, Tracker} from "./pathTracker";

export interface PathFinder<Type> {

  getAllReachablePositions(element: Type, movement?: number): Position[];
  getShortestPath(element: Type, target: Position): Position[];
}

type GetCost = <Type>(element: Type, neighbor: any) => number;
type GetAllowed = <Type>(element: Type) => number;
type GetPosition = <Type>(element: Type) => Position;

export default function <Type>(
  matrix: Matrix<Type>,
  dimensions: Dimensions,
  positionOfElement: GetPosition,
  movementCost: GetCost,
  allowedMovement: GetAllowed,
): PathFinder<Type> {

  const abs = Math.abs;
  const floor = Math.floor;
  const random = Math.random;
  const getNeighbors = (position: Position, visited: PathTracker): Type[] => {

    return position.neighbors(dimensions)
      .reduce((neighbors: Type[], currentPosition: Position): Type[] => {

        const neighbor: Type = matrix.get(currentPosition);
        const positionOfNeighbor: Position = positionOfElement(neighbor);

        if (neighbor && !visited.getPosition(positionOfNeighbor)) {

          neighbors.push(neighbor);
        }

        return neighbors;

      }, []);
  };
  const manhattanDistance = (position: Position, origin: Position, target: Position) => {

    const distanceToTargetX = position.x - target.x;
    const distanceToTargetY = position.y - target.y;
    const distanceFromOriginX = origin.x - target.x;
    const distanceFromOriginY = origin.y - target.y;

    const cross = abs((distanceToTargetX * distanceFromOriginY) - (distanceFromOriginX * distanceToTargetY));
    const rand = floor(random() + 1) / 1000;

    return ((abs(distanceToTargetX) + abs(distanceToTargetY)) + (cross * rand));
  };
  const getPath = (position: Position, visited: PathTracker, allowed: number): Position[] => {

    const path: Position[] = [];

    let parentPosition: Position = position;

    while (parentPosition) {

      if (visited.getG(parentPosition) <= allowed) {

        path.push(parentPosition);
      }

      parentPosition = visited.getParent(parentPosition);
    }

    return path.reverse();
  };
  const getAllReachablePositions = (element: Type, movement?: number): Position[] => {

    const visited: PathTracker = pathTracker();
    const getCost = (currentElement: Tracker): number => visited.getF(positionOfElement(currentElement));
    const open: BinaryHeap<Tracker> = createHeap<Tracker>(getCost);
    const reachable: Position[] = [positionOfElement(element)];
    const allowed = movement || allowedMovement(element);

    let position: Position = positionOfElement(element);
    let current: Tracker;
    let cost: number;

    open.push(visited.close(position).getPosition(position));

    while (open.size()) {

      current = open.pop();
      position = positionOfElement(current);

      getNeighbors(positionOfElement(current), visited).forEach((neighbor: Type) => {

        const positionOfNeighbor: Position = positionOfElement(neighbor);

        cost = (visited.getF(position) || 0) + movementCost(neighbor, element);

        if (cost <= allowed) {

          visited.close(positionOfNeighbor).setF(positionOfNeighbor, cost);

          open.push(visited.getPosition(positionOfNeighbor));

          reachable.push(positionOfNeighbor);
        }
      });
    }

    return reachable;
  };
  const getShortestPath = (element: Type, target: Position): Position[] => {

    let position = positionOfElement(element);

    const startCost: number = 0;
    const startingPosition: Position = position;
    const getCost = (currentElement: Tracker): number => visited.getF(positionOfElement(currentElement));
    const visited: PathTracker = pathTracker();
    const open: BinaryHeap<Tracker> = createHeap<Tracker>(getCost);
    const first: Tracker = visited.close(position)
      .setF(position, manhattanDistance(position, position, target))
      .setG(position, startCost)
      .getPosition(position);

    open.push(first);

    while (open.size()) {

      position = positionOfElement(open.pop());

      if (position.on(target)) {

        return getPath(position, visited, allowedMovement(element));
      }

      getNeighbors(position, visited).forEach((neighbor: Type): void => {

        const positionOfNeighbor: Position = positionOfElement(neighbor);
        const neighborHasNotBeenVisited: boolean = !visited.getPosition(positionOfNeighbor);
        const currentCost: number = visited.getG(position) || 0;
        const costOfPathToNeighbor: number = visited.getG(positionOfNeighbor);
        const costOfCurrentPath: number = currentCost + movementCost(neighbor, element);

        if (neighborHasNotBeenVisited || costOfCurrentPath < costOfPathToNeighbor) {

          visited.close(positionOfNeighbor)
            .setParent(positionOfNeighbor, position)
            .setG(positionOfNeighbor, costOfCurrentPath)
            .setF(positionOfNeighbor, costOfCurrentPath + manhattanDistance(
              positionOfNeighbor,
              startingPosition,
              target,
            ));

          open.push(visited.getPosition(positionOfNeighbor));
        }
      });
    }
    return [];
  };

  return {

    getAllReachablePositions,
    getShortestPath,
  };
}
