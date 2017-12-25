import createMatrix, {Matrix} from "../../tools/storage/matrix/matrix";
import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";
import {Dimensions} from "./coordinates/dimensions";
import createPosition, {isPosition, Position} from "./coordinates/position";
import createTerrain from "./elements/terrain/terrain";
import {Map} from "./map";
import mapController, {MapController} from "./mapController";

export interface MatrixMap<Type> extends Matrix<Type> {
  clean(): void;
  getElement(element: Type): Type;
  get(coordinates: Position): Type;
  positionOfElement(element: Type): Position;
  insert(element: Type, position?: Position): Type;
  remove(element: Position | Type): any;
  dimensions(): Dimensions;
}

const getPosition = (element: any): Position => element.position;
export default function <Type>(map: Map, positionOfElement: (element: any) => Position = getPosition): MatrixMap<Type> {
  let placeHolders: any[] = [];
  const {getOccupantsOfPosition}: MapController = mapController(map);
  const {isUnit, isTerrain}: TypeChecker = typeChecker;
  const matrix: Matrix<Type> = createMatrix<Type>();
  const isSame = (currentElement: any, comparison: any) => {
    return currentElement && comparison && currentElement.id === comparison.id;
  };
  const insert = (element: Type, position?: Position): Type => {
    return matrix.insert(element, position || positionOfElement(element));
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
    const defaultElement: any = createTerrain("plain", createPosition(x, y));
    if (positionIsInBounds) {
      if (!matrix.get(coordinates)) {
        placeHolders.push(coordinates);
        matrix.insert(defaultElement, coordinates);
      }
      return matrix.get(coordinates);
    }
    throw RangeError(`provided position: {${x}, ${y}}, out of map bounds: {width: ${width}, height: ${height}}.`);
  };
  const remove = (element: Type | Position): Type => {
    const position: Position = isPosition(element) ? element as Position : positionOfElement(element as Type);
    const {unit, building, terrain} = getOccupantsOfPosition(position, map);
    const {x, y} = position;
    if (isUnit(element) && isSame(unit, element)) {
      matrix.insert(
        building
        || terrain
        || createTerrain("plain", createPosition(x, y)),
        position,
      );
      return unit;
    }
  };
  const dimensions = (): Dimensions => map.dimensions;
  return Object.assign(matrix, {
    clean,
    dimensions,
    get,
    getElement,
    insert,
    positionOfElement,
    remove,
  });
}
