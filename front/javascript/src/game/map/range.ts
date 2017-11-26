import {Dimensions} from "./coordinates/dimensions";
import createPosition, {Position} from "./coordinates/position";
import {isUnit} from "./elements/unit/unit";
import {PathTracker, default as pathTracker} from "../../tools/pathfinding/pathTracker";

export default function(dimensions: Dimensions) {

  const iterateThroughDiamond = (
    position: Position,
    allowed: number,
    callback: (position: Position) => any,
  ): void => {

    const xAxis: number = position.x;
    const yAxis: number = position.y;
    const range: number = (allowed * 2);
    const right: number = xAxis + allowed;
    const left: number = xAxis - allowed;
    const minimumIndex: number = 0;
    const verticalLimit: number = dimensions.y;
    const horizontalLimit: number = dimensions.x;

    let index: number;
    let top: number;
    let bottom: number;
    let x: number;
    let y: number;
    let increment: number;
    let result: any;

    // get the diamond pattern of squares
    for (x = left, increment = minimumIndex; /* x <= right, */ increment <= range; x += 1, increment += 1) {

      index = increment > allowed ? range - increment : increment;
      top = yAxis - index;
      top = top > minimumIndex ? top : minimumIndex; // top
      bottom = yAxis + index;
      bottom = bottom < verticalLimit ? bottom : verticalLimit - 1; // bottom

      // add all reachable squares to array
      if (x >= minimumIndex && x <= horizontalLimit) {
        for (y = top; y <= bottom; y += 1) {

          result = callback(createPosition(x, y));

          if (result) {

            return result;
          }
        }
      }
    }
  };

  return {iterateThroughDiamond};

  // const movement =  function(unit, map, distance) {
  //
  //   return this.reachable(unit, distance === undefined ? app.path.reachable(unit, true) :
  //     this.setInitialPosition(position, this.diamond(Math.min(distance, unit.movement()))));
  // };
  //
  // const setInitialPosition =   function(position, diamond) {
  //
  //   let l = diamond.length, array = [];
  //
  //   while (!sharedPosition(position, diamond[--l])) ;
  //
  //   diamond.unshift(diamond.splice(l, 1)[0]);
  //
  //   return diamond;
  // };
  //
  // const reachable =  function(unit, reachable) {
  //
  //   const array = [];
  //
  //   for (i = 0; i < reachable.length; i += 1) {
  //
  //     if (isUnit(reachable[i]) || unitController.owns(reachable[i], unit)) {
  //
  //       array.push(reachable[i]);
  //     }
  //   }
  //
  //   return array;
  // };
  //
  // const show = (range: Position[], visited:): Position[] => {
  //
  //   const visited: PathTracker = pathTracker();
  //
  //   range.forEach((position: Position): void => {
  //
  //     const neighbors = position.neighbors(dimensions);
  //     let neighbor;
  //
  //     for (j = 0, len = neighbors.length; j < len; j += 1) {
  //
  //       neighbor = neighbors[j];
  //
  //       if (!visited.getPosition(neighbor)) {
  //
  //         visited.close(neighbor);
  //         range.push(neighbor);
  //       }
  //     }
  //   });
  //
  //   return range;
  // },
  //
  // attack:   function(range) {
  //
  //   const range = [];
  //   const high = this.diamond(range.high);
  //   const low = this.diamond(range.low - 1);
  //   const highLen = high.length;
  //   const lowLen = low.length;
  //
  //   for (let push, h = 0, h  as highLen;
  //   h += 1
  // )
  //   {
  //
  //     push = true;
  //
  //     for (let l = 0; l < lowLen; l += 1) {
  //
  //       if (high[h].on(low[l])) {
  //
  //         push = false;
  //       }
  //     }
  //
  //     if (push) range.push(high[h]);
  //   }
  //
  //   return range;
  // },
  //
  // attackable:   function(position, range, unit) {
  //
  //   let array = [], l = range.length;
  //
  //   while (l--) {
  //
  //     element = range[l];
  //
  //     if (isUnit(element) && !unitController.owns(element, unit) && unitController.canAttack(element, unit)) {
  //
  //       array.push(element);
  //     }
  //   }
  //
  //   // if their are any units in the attackable array, then return it, otherwise return false
  //   return array;
  // },
  //
  // inRange:   function(unit, range) {
  //
  //   let l = range.length;
  //
  //   while (l--) {
  //
  //     if (unitController.on(range[l], unit)) {
  //
  //       return true;
  //     }
  //   }
  //   return false;
  // };
}
