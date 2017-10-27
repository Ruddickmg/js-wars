import createPosition, {Position} from "../../game/coordinates/position";
import createMatrix, {Matrix} from "../storage/matrix/matrix";

export interface PathTracker {

  clear(): PathTracker;
  close(position: Position): PathTracker;
  getF(position: Position): number;
  getG(position: Position): number;
  getParent(position: Position): Position;
  getPosition(position: Position): Tracker;
  setF(position: Position, value: number): PathTracker;
  setG(position: Position, value: number): PathTracker;
  setParent(position: Position, parent: Position): PathTracker;
}

export interface Tracker {
  f?: number;
  g?: number;
  parent?: Tracker;
  position: Position;
}

export default function(): PathTracker {

  let tracking: Matrix<Tracker> = createMatrix<Tracker>();

  const parentId: string = "parent";
  const fId: string = "f";
  const gId: string = "g";
  const add = function(currentPosition: Position): PathTracker {

    const {x, y} = currentPosition;
    const position: Position = createPosition(x, y);

    tracking.insert(currentPosition, {position} as any);

    return this;
  };

  const clear = function(): PathTracker {

    tracking = createMatrix<Tracker>();

    return this;
  };

  const close = function(position: Position): PathTracker {

    add(position);

    return this;
  };
  const get = (position: Position, property: string): number | Position => {

    const stored: any = tracking.get(position);

    if (stored) {

      return stored[property];
    }
  };
  const getF = (position: Position): number => get(position, fId) as number;
  const getG = (position: Position): number => get(position, gId) as number;
  const getParent = (position: Position): Position => get(position, parentId) as Position;
  const getPosition = (position: Position): Tracker => tracking.get(position);
  const setF = function(position: Position, value: number): PathTracker {

    set(position, value, fId);

    return this;
  };
  const setG = function(position: Position, value: number): PathTracker {

    set(position, value, gId);

    return this;
  };
  const setParent = function(position: Position, parent: Position): PathTracker {

    set(position, parent, parentId);

    return this;
  };
  const set = function(position: Position, value: any, property: string): void {

    const stored: any = tracking.get(position);

    if (stored) {

      stored[property] = value;
    }
  };

  return {

    clear,
    close,
    getF,
    getG,
    getParent,
    getPosition,
    setF,
    setG,
    setParent,
  };
}
