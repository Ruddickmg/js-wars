import createPosition, {Position} from "../../../game/map/coordinates/position";
import {isDefined} from "../../validation/typeChecker";

type ReduceCallback<Type> = (accumulator: any, value: any, position: Position, self: Matrix<Type>) => any;
type MappingCallback<Type> = (value: any, position: Position, self: Matrix<Type>) => any;

interface Functors<Type> {
  filter(callback: MappingCallback<Type>): Matrix<Type>;
  find(callback: MappingCallback<Type>): Type;
  forEach(callback: MappingCallback<Type>): any;
  map(callback: MappingCallback<Type>): Matrix<Type>;
  reduce(callback: ReduceCallback<Type>, accumulator: any): any;
}

export interface Matrix<Type> extends Functors<Type> {
  get(position: Position): Type;
  insert(value: Type, position: Position): Type;
  remove(position: Position): Type;
}

export default function createMatrix<Type>(): Matrix<Type> {
  const matrix: any = {};
  const insert = (value: Type, {x, y}: Position): Type => {
    if (!matrix[x]) {
      matrix[x] = {};
    }
    matrix[x][y] = value;
    return matrix[x][y];
  };
  const get = ({x, y}: Position): Type => {
    if (matrix[x]) {
      return matrix[x][y];
    }
  };
  const remove = (position: Position): Type => {
    const {x, y}: Position = position;
    const removed = get(position);
    if (isDefined(removed)) {
      delete matrix[x][y];
    }
    return removed;
  };
  const functors: Functors<Type> = {
    filter(callback: MappingCallback<Type>): Matrix<Type> {
      return this.reduce((
        newMatrix: Matrix<Type>,
        value: Type,
        position: Position,
        self: Matrix<Type>,
      ): Matrix<Type> => {
        if (callback(value, position, self)) {
          newMatrix.insert(value, position);
        }
        return newMatrix;
      }, createMatrix<Type>());
    },
    find(callback: MappingCallback<Type>): Type {
      const xs: any[] = Object.keys(matrix);
      let ys: any[];
      let xKeyIndex: number = xs.length;
      let yKeyIndex: number;
      let x: number;
      let y: number;
      let value: any;
      while (xKeyIndex--) {
        x = xs[xKeyIndex];
        ys = Object.keys(matrix[x]);
        yKeyIndex = ys.length;
        while (yKeyIndex--) {
          y = ys[yKeyIndex];
          value = matrix[x][y];
          if (callback(value, createPosition(x, y), this)) {
            return value;
          }
        }
      }
    },
    forEach(callback: MappingCallback<Type>): void {
      this.reduce((_: any, value: Type, position: Position, self: Matrix<Type>): void => {
        callback(value, position, self);
      });
    },
    map(callback: MappingCallback<Type>): Matrix<Type> {
      return this.reduce((
        mappedMatrix: Matrix<Type>,
        value: Type,
        position: Position,
        self: Matrix<Type>,
      ): Matrix<Type> => {
        mappedMatrix.insert(callback(value, position, self), position);
        return mappedMatrix;
      }, createMatrix<Type>());
    },
    reduce(callback: ReduceCallback<Type>, initialAccumulator?: any): any {
      let accumulator: any = initialAccumulator;
      this.find((value: Type, position: Position, self: Matrix<Type>) => {
        accumulator = callback(accumulator, value, position, self);
      });
      return accumulator;
    },
  };
  return Object.assign({
    get,
    insert,
    remove,
  }, functors);
}
