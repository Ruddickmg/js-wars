export interface Position {

    x: number,
    y: number,
    orientation?: string,
    on(position: Position): boolean,
    toString(): string,
    inMap(): boolean,
    neighbors(): Position[],
    corners(): Position[],
    surrounding(): Position[]
}

interface Coordinates {

    x: number,
    y: number
}

export default function createPosition(x: number, y: number, orientation: string="", mapDimensions?: Coordinates): Position {

    const filter = (positions: Position[]): Position[] => {

        return positions.reduce((allowedPositions: Position[], position: Position): Position[] => {

            if (position.inMap()) {

                allowedPositions.push(position);
            }

            return allowedPositions;

        }, []);
    };

    return {

        x:x,
        y:y,
        orientation: orientation,
        on: ({x, y}: Coordinates): boolean => this.x === x && this.y === y,
        toString: (): string => `{ x: ${this.x}, y: ${this.y}}`,
        inMap(): boolean {

            const {x, y} = mapDimensions;

            return this.x >= 0 &&
                this.y >= 0 &&
                this.x < x &&
                this.y < y;
        },
        neighbors(): Position[] {

            const
                {x, y} = this,
                positions: Position[] = [

                    createPosition(x - 1, y, 'west', mapDimensions),
                    createPosition(x, y - 1, 'south', mapDimensions),
                    createPosition(x + 1, y, 'east', mapDimensions),
                    createPosition(x, y + 1, 'north', mapDimensions)
                ];

            return filter(positions);
        },
        corners(): Position[] {

            const
                {x, y} = this,
                positions: Position[] = [

                    createPosition(x - 1, y - 1, 'northWest', mapDimensions),
                    createPosition(x + 1, y - 1, 'southEast', mapDimensions),
                    createPosition(x + 1, y + 1, 'northEast', mapDimensions),
                    createPosition(x - 1, y + 1, 'southWest', mapDimensions)
                ];

            return filter(positions);
        },
        surrounding(): Position[] {

            const
                neighboringSquares = this.neighbors(),
                squaresOnEachCorner = this.corners();

            return neighboringSquares.concat(squaresOnEachCorner);
        }
    }
};