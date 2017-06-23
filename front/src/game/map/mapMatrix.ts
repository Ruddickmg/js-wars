import createMatrix, {Matrix} from "../../browser/tools/matrix";
import {Dimensions} from "../../coordinates/dimensions";
import createPosition, {Position} from "../../coordinates/position";
import typeChecker, {TypeChecker} from "../../tools/typeChecker";
import {MapElement} from "./elements/defaults";
import createTerrain from "./elements/terrain/terrain";
import {Map} from "./map";
import mapController, {MapController} from "./mapController";

export interface MatrixMap {

    clean(): void;
    get(element: MapElement): MapElement;
    insert(element: MapElement): MapElement;
    position(coordinates: Position): any;
    remove(element: MapElement): any;
}

export default function(map: Map) {

    let placeHolders: any[] = [];

    const {getOccupantsOfPosition}: MapController = mapController(map);
    const {isUnit, isTerrain}: TypeChecker = typeChecker();
    const matrix: Matrix = createMatrix();
    const isSame = (element: any, comparison: any) => {

        return element && comparison && element.id === comparison.id;
    };
    const insert = (element: MapElement): MapElement => {

        return matrix.insert(element.position, element);
    };
    const clean = (): void => {

        placeHolders.forEach((placeHolder: Position): void => {

            const topElement = matrix.get(placeHolder);

            if (isTerrain(topElement)) {

                matrix.remove(placeHolder);
            }
        });

        placeHolders = [];
    };
    const get = (element: MapElement): MapElement => position(element.position);
    const position = (coordinates: Position): any => {

        const minimumIndex: number = 0;
        const {x, y}: Position = coordinates;
        const {width, height}: Dimensions = map.dimensions;
        const positionIsInBounds = x <= width && x >= minimumIndex && y <= height && y >= minimumIndex;

        if (positionIsInBounds) {

            if (!matrix.get(coordinates)) {

                placeHolders.push(coordinates);

                matrix.insert(coordinates, createTerrain("plain", createPosition(x, y)));
            }

            return matrix.get(coordinates);
        }

        throw RangeError(`provided position: {${x}, ${y}}, out of map bounds: {width: ${width}, height: ${height}}.`);
    };
    const remove = (element: MapElement): any => {

        const positionOfElement = element.position;
        const {unit, building, terrain} = getOccupantsOfPosition(positionOfElement, map);
        const {x, y} = positionOfElement;

        if (isUnit(element) && isSame(unit, element)) {

            matrix.insert(
                positionOfElement,
                building
                || terrain
                || createTerrain("plain", createPosition(x, y)),
            );

            return unit;
        }
    };

    return {

        clean,
        get,
        insert,
        position,
        remove,
    };
}

// TODO testing

