import {Map} from "../game/map/map";
import {Dimensions} from "./dimensions";

export interface Position {

    x: number;
    y: number;
    orientation?: string;
    on(position: Coordinates): boolean;
    toString(): string;
    inMap(map: Map): boolean;
    neighbors(map: Map): Position[];
    corners(map: Map): Position[];
    surrounding(map: Map): Position[];
}

export interface Coordinates {

    x: number;
    y: number;
}

export default function createPosition(

    xAxis: number,
    yAxis: number,
    orientation: string = "",
    mapDimensions?: Coordinates,

): Position {

    const filter = (positions: Position[], map: Map): Position[] => {

        return positions.reduce((allowedPositions: Position[], position: Position): Position[] => {

            if (position.inMap(map)) {

                allowedPositions.push(position);
            }

            return allowedPositions;

        }, []);
    };

    return {

        corners(map: Map): Position[] {

            const {x, y} = this;
            const positions: Position[] = [

                createPosition(x - 1, y - 1, "northWest", mapDimensions),
                createPosition(x + 1, y - 1, "southEast", mapDimensions),
                createPosition(x + 1, y + 1, "northEast", mapDimensions),
                createPosition(x - 1, y + 1, "southWest", mapDimensions),
            ];

            return filter(positions, map);
        },
        inMap(map: Map): boolean {

            const {x, y}: Position = this;
            const {width, height}: Dimensions = map.dimensions;
            const startingPosition = 0;

            return x >= startingPosition
                && y >= startingPosition
                && x < width
                && y < height;
        },
        neighbors(map: Map): Position[] {

            const {x, y} = this;
            const positions: Position[] = [

                createPosition(x - 1, y, "west", mapDimensions),
                createPosition(x, y - 1, "south", mapDimensions),
                createPosition(x + 1, y, "east", mapDimensions),
                createPosition(x, y + 1, "north", mapDimensions),
            ];

            return filter(positions, map);
        },
        on({x, y}: Coordinates): boolean {

            return this.x === x && this.y === y;
        },
        orientation,
        surrounding(map: Map): Position[] {

            const neighboringSquares = this.neighbors(map);
            const squaresOnEachCorner = this.corners(map);

            return neighboringSquares.concat(squaresOnEachCorner);
        },
        toString(): string {

            return `{x: ${this.x}, y: ${this.y}}`;
        },
        x: xAxis,
        y: yAxis,
    };
}
