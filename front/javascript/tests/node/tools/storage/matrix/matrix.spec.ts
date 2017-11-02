import {expect} from "chai";
import createPosition, {Position} from "../../../../../src/game/map/coordinates/position";
import range from "../../../../../src/tools/array/range";
import createMatrix, {Matrix} from "../../../../../src/tools/storage/matrix/matrix";

describe("matrix", () => {

  const pivotPoint: number = 50;
  const notInMatrix: number = 101;
  const initialValue: string = "value";
  const matrix: Matrix<any> = createMatrix<any>();
  const positionToModify: Position = createPosition(1, 1);
  const xs: number[] = range(1, 10);
  const ys: number[] = range(10, 1);
  const values: number[] = range(10, 100, 10);
  const map: any = {};
  const makeKey = (x: number, y: number): string => `${x}${y}`;

  values.forEach((value: number, index: number): void => {

    const x = xs[index];
    const y = ys[index];

    matrix.insert(createPosition(x, y), value);
    map[makeKey(x, y)] = value;
  });

  it("Starts out empty.", () => expect(matrix.get(positionToModify)).to.equal(undefined));
  it("Adds a value to a specified position.", () => {

    matrix.insert(positionToModify, initialValue);
    expect(matrix.get(positionToModify)).to.equal(initialValue);
  });
  it("Will remove value from specified position.", () => {

    expect(matrix.remove(positionToModify)).to.equal(initialValue);
    expect(matrix.get(positionToModify)).to.equal(undefined);
  });
  it("Can be reduced.", () => {

    const reduceFunction = (total: number, value: number): number => total + value;
    const reducedValues: number = values.reduce(reduceFunction, 0);
    const reducedMatrix: number = matrix.reduce(reduceFunction, 0);

    expect(reducedMatrix).to.equal(reducedValues);
  });
  it("Can be iterated over with a forEach.", () => {

    matrix.forEach((value: number, position: Position): void => {

      const {x, y}: Position = position;

      expect(value).to.equal(map[makeKey(x, y)]);
    });
  });
  it("Can be mapped.", () => {

    const mapFunction = (value: number): number => value * value;
    const mapped: Matrix<any> = matrix.map(mapFunction);

    mapped.forEach((value: number, position: Position): void => {

      expect(value).to.equal(mapFunction(matrix.get(position)));
    });
  });
  it("Can be filtered.", () => {

    const filterFunction = (value: number): boolean => value > pivotPoint;
    const filtered: Matrix<any> = matrix.filter(filterFunction);
    const filteredOut: Position[] = [];
    const kept: Position[] = [];

    matrix.forEach((value: number, position: Position): void => {
      if (filterFunction(value)) {
        kept.push(position);
      } else {
        filteredOut.push(position);
      }
    });

    filteredOut.forEach((position: Position): any => expect(filtered.get(position)).to.equal(undefined));
    kept.forEach((position: Position): void => {

      const {x, y}: Position = position;

      expect(filtered.get(position)).to.equal(map[makeKey(x, y)]);
    });
  });
  it("Can be searched.", () => {

    expect(matrix.find((value: number): boolean => value === pivotPoint)).to.equal(pivotPoint);
    expect(matrix.find((value: number): boolean => value > notInMatrix)).to.equal(undefined);
  });
});
