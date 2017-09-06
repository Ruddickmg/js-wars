import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";
import {Dimensions} from "./dimensions";

export interface Coordinates {

    x: number;
    y: number;
}

export interface Position extends Coordinates {

    orientation?: string;
    on(position: Coordinates): boolean;
    toString(): string;
    inRange(dimensions: Dimensions): boolean;
    neighbors(dimensions: Dimensions): Position[];
    corners(dimensions: Dimensions): Position[];
    surrounding(dimensions: Dimensions): Position[];
    [index: string]: any;
}

export function isPosition(element: any): boolean {

    const {isNumber}: TypeChecker = typeChecker();
    const {x, y}: any = element;

    return isNumber(x) && isNumber(y);
}

export default (function(): any {

    const filter = (positions: Position[], dimensions: Dimensions): Position[] => {

        return positions.reduce((allowedPositions: Position[], position: Position): Position[] => {

            if (position.inRange(dimensions)) {

                allowedPositions.push(position);
            }

            return allowedPositions;

        }, []);
    };

    const positionIsInRange = ({x, y}: Position, {width, height}: Dimensions) => {

        const startingPosition = 0;

        return x >= startingPosition
            && y >= startingPosition
            && x < width
            && y < height;
    };

    const getCorners = ({x, y}: Position, dimensions: Dimensions) => {

        const positions: Position[] = [

            createPosition(x - 1, y - 1, "northWest"),
            createPosition(x + 1, y - 1, "southEast"),
            createPosition(x + 1, y + 1, "northEast"),
            createPosition(x - 1, y + 1, "southWest"),
        ];

        return filter(positions, dimensions);
    };

    const getNeighbors = ({x, y}: Position, dimensions: Dimensions) => {

        const positions: Position[] = [

            createPosition(x - 1, y, "west"),
            createPosition(x, y - 1, "south"),
            createPosition(x + 1, y, "east"),
            createPosition(x, y + 1, "north"),
        ];

        return filter(positions, dimensions);
    };

    const createPosition = function(xAxis: number, yAxis: number, orientation: string = ""): Position {

        return {

            corners(dimensions: Dimensions): Position[] {

                return getCorners(this, dimensions);
            },
            inRange(dimensions: Dimensions): boolean {

                return positionIsInRange(this, dimensions);
            },
            neighbors(dimensions: Dimensions): Position[] {

                return getNeighbors(this, dimensions);
            },
            on({x, y}: Coordinates): boolean {

                return this.x === x && this.y === y;
            },
            orientation,
            surrounding(dimensions: Dimensions): Position[] {

                const neighboringSquares = getNeighbors(this, dimensions);
                const squaresOnEachCorner = getCorners(this, dimensions);

                return neighboringSquares.concat(squaresOnEachCorner);
            },
            toString(): string {

                return `{x: ${this.x}, y: ${this.y}}`;
            },
            x: xAxis,
            y: yAxis,
        };
    };

    return createPosition;
})();
