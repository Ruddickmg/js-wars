import {Dimensions} from "../../coordinates/dimensions";
import {Position} from "../../coordinates/position";
import {MapElement} from "../../game/map/elements/defaults";
import mapController from "../../game/map/mapController";
import createHeap, {BinaryHeap} from "../../tools/binaryHeap";
import {MatrixMap} from "../../game/map/mapMatrix";
import matrixTracker, {MatrixTracker} from "./matrixTracking";
// import unitHandler from "";

export default function(map: MatrixMap) {

    const {topElementAtPosition} = mapController();
    const {allowedMovement, movementCost} = unitHandler;
    const dimensions: Dimensions = map.dimensions();

    const getNeighbors = (position: Position, visited: MatrixTracker): MapElement[] => {

        return position.neighbors(dimensions)
            .reduce((neighbors: MapElement[], currentPosition: Position): MapElement[] => {

                const neighbor: MapElement = topElementAtPosition(currentPosition, map);

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

        const cross = Math.abs((distanceToTargetX * distanceFromOriginY) - (distanceFromOriginX * distanceToTargetY));
        const rand = Math.floor(Math.random() + 1) / 1000;

        return ((Math.abs(distanceToTargetX) + Math.abs(distanceToTargetY)) + (cross * rand));
    };

    const getPath = (currentElement: MapElement, visited: MatrixTracker): Position[] => {

        const path: Position[] = [];
        let current: MapElement = currentElement;

        while (current) {

            path.push(current.position);

            current = visited.getParent(current);
        }

        return path.reverse();
    };

    const getAllReachablePositions = (element: MapElement, movement: any): Position[] => {

        const visited: MatrixTracker = matrixTracker();
        const open: BinaryHeap<any> = createHeap<any>(visited.getF);
        const reachable: Position[] = [element.position];
        const allowed = movement || allowedMovement(element);

        let current: MapElement;
        let cost: number;

        open.push(visited.close(element));

        while (open.size()) {

            current = open.pop();

            getNeighbors(current.position, visited).forEach((neighbor: MapElement) => {

                cost = (visited.getF(current) || 0) + movementCost(neighbor, element);

                if (cost <= allowed) {

                    visited.close(neighbor).setF(neighbor, cost);

                    open.push(visited.getElement(neighbor));

                    reachable.push(neighbor.position);
                }
            });
        }

        return reachable;
    };

    const getShortestPath = (element: MapElement, target: Position): Position[] => {

        const visited: MatrixTracker = matrixTracker();
        const open: BinaryHeap<any> = createHeap<any>(visited.getF);
        const allowed = movementCost(element);

        let current: MapElement;
        let position = element.position;

        visited.close(element).setF(element, manhattanDistance(position, position, target));
        open.push(element);

        while (open.size()) {

            current = open.pop();
            position = current.position;

            if (position.on(target)) {

                return getPath(current, visited);
            }

            getNeighbors(position, visited).forEach((neighbor: MapElement): void => {

                const currentCost: number = visited.getG(current) || 0;
                const costOfNeighbor: number = visited.getG(neighbor);
                const costOfMove: number = movementCost(neighbor, element);
                const totalCost: number = currentCost + costOfMove;

                if (totalCost <= allowed && !costOfNeighbor || costOfNeighbor >= currentCost) {

                    visited.close(neighbor)
                        .setG(neighbor, totalCost)
                        .setF(neighbor, totalCost + manhattanDistance(
                                neighbor.position,
                                element.position,
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
