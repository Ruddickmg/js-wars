import createMatrix, {Matrix} from "../../tools/storage/matrix/matrix";
import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";
import {Dimensions} from "./coordinates/dimensions";
import createPosition, {Position} from "./coordinates/position";
import createTerrain from "./elements/terrain/terrain";
import {Map} from "./map";
import mapController, {MapController} from "./mapController";

export interface MatrixMap<Type> {

  clean(): void;

  getElement(element: Type): Type;

  get(coordinates: Position): Type;

  insert(element: Type): Type;

  remove(element: Type): any;

  dimensions(): Dimensions;
}

export default function <Type>(map: Map, positionOfElement: any): MatrixMap<Type> {

  let placeHolders: any[] = [];

  const {getOccupantsOfPosition}: MapController = mapController(map);
  const {isUnit, isTerrain}: TypeChecker = typeChecker();
  const matrix: Matrix<Type> = createMatrix<Type>();
  const isSame = (element: any, comparison: any) => {

    return element && comparison && element.id === comparison.id;
  };
  const insert = (element: Type): Type => {

    return matrix.insert(positionOfElement(element), element);
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
  const getElement = (element: Type): Type => get(positionOfElement(element));
  const get = (coordinates: Position): any => {

    const minimumIndex: number = 0;
    const {x, y}: Position = coordinates;
    const {width, height}: Dimensions = map.dimensions;
    const positionIsInBounds = x <= width && x >= minimumIndex && y <= height && y >= minimumIndex;
    const defaultElement: Type = createTerrain("plain", createPosition(x, y));

    if (positionIsInBounds) {

      if (!matrix.get(coordinates)) {

        placeHolders.push(coordinates);

        matrix.insert(coordinates, defaultElement);
      }

      return matrix.get(coordinates);
    }

    throw RangeError(`provided position: {${x}, ${y}}, out of map bounds: {width: ${width}, height: ${height}}.`);
  };
  const remove = (element: Type): Type => {

    const position: Position = positionOfElement(element);
    const {unit, building, terrain} = getOccupantsOfPosition(position, map);
    const {x, y} = position;

    if (isUnit(element) && isSame(unit, element)) {

      matrix.insert(
        position,
        building
        || terrain
        || createTerrain("plain", createPosition(x, y)),
      );

      return unit;
    }
  };
  const dimensions = (): Dimensions => map.dimensions;

  return {

    clean,
    getElement,
    insert,
    get,
    remove,
    dimensions,
  };
}
