import {Dimensions} from "../../game/coordinates/dimensions";
import {Position} from "../../game/coordinates/position";
import createHeap, {BinaryHeap} from "../storage/heaps/binaryHeap";
import {Matrix} from "../storage/matrix/matrix";
import matrixTracker, {MatrixTracker} from "../storage/matrix/matrixTracking";

export interface PathFinder<Type> {

    getAllReachablePositions(element: Type, movement?: number): Position[];
    getShortestPath(element: Type, target: Position): Position[];
}

type GetCost = <Type>(element: Type, neighbor: any) => number;
type GetAllowed = <Type>(element: Type) => number;
type GetPosition = <Type>(element: Type) => Position;

export default function<Type>(
    matrix: Matrix<Type>,
    dimensions: Dimensions,
    positionOfElement: GetPosition,
    movementCost: GetCost,
    allowedMovement: GetAllowed,
): PathFinder<Type> {

    const abs = Math.abs;
    const floor = Math.floor;
    const random = Math.random;

    const getNeighbors = (position: Position, visited: MatrixTracker<Type>): Type[] => {

        return position.neighbors(dimensions)
            .reduce((neighbors: Type[], currentPosition: Position): Type[] => {

                const neighbor: Type = matrix.get(currentPosition);

                if (neighbor && !visited.getElement(neighbor)) {

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

    const getPath = (currentElement: Type, visited: MatrixTracker<Type>): Position[] => {

        const path: Position[] = [];
        let current: Type = currentElement;

        while (current) {

            path.push(positionOfElement(current));

            current = visited.getParent(current);
        }

        return path.reverse();
    };

    const getAllReachablePositions = (element: Type, movement?: number): Position[] => {

        const visited: MatrixTracker<Type> = matrixTracker<Type>();
        const open: BinaryHeap<any> = createHeap<any>(visited.getF);
        const reachable: Position[] = [positionOfElement(element)];
        const allowed = movement || allowedMovement(element);

        let current: Type;
        let cost: number;

        open.push(visited.close(element));

        while (open.size()) {

            current = open.pop();

            getNeighbors(positionOfElement(current), visited).forEach((neighbor: Type) => {

                cost = (visited.getF(current) || 0) + movementCost(neighbor, element);

                if (cost <= allowed) {

                    visited.close(neighbor).setF(neighbor, cost);

                    open.push(visited.getElement(neighbor));

                    reachable.push(positionOfElement(neighbor));
                }
            });
        }

        return reachable;
    };

    const getShortestPath = (element: Type, target: Position): Position[] => {

        const visited: MatrixTracker<Type> = matrixTracker<Type>();
        const open: BinaryHeap<Type> = createHeap<Type>(visited.getF);
        const allowed = allowedMovement(element);

        let current: Type;
        let position = positionOfElement(element);

        visited.close(element).setF(element, manhattanDistance(position, position, target));
        open.push(element);

        while (open.size()) {

            current = open.pop();
            position = positionOfElement(current);

            if (position.on(target)) {

                return getPath(current, visited);
            }

            getNeighbors(position, visited).forEach((neighbor: Type): void => {

                const currentCost: number = visited.getG(current) || 0;
                const costOfNeighbor: number = visited.getG(neighbor);
                const costOfMove: number = movementCost(neighbor, element);
                const totalCost: number = currentCost + costOfMove;

                if (totalCost <= allowed && !costOfNeighbor || costOfNeighbor >= currentCost) {

                    visited.close(neighbor)
                        .setG(neighbor, totalCost)
                        .setF(neighbor, totalCost + manhattanDistance(
                                positionOfElement(neighbor),
                                positionOfElement(element),
                                target,
                            ))
                        .setParent(neighbor, current);

                    open.push(visited.getElement(neighbor));
                }
            });
        }
    };

    return {

        getAllReachablePositions,
        getShortestPath,
    };
}
