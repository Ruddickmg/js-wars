import {publish} from "../pubSub";
import typeChecker, {TypeChecker} from "../validation/typeChecker";

export default (function() {
  const {isArray}: TypeChecker = typeChecker();
  return function(
    firstInputArray: any[],
    secondInputArray: any[],
    callback: (
      firstValue?: any,
      secondValue?: any,
      index?: number,
      firstArray?: any[],
      secondArray?: any[],
    ) => any,
  ): any[] {
    let firstValue: any;
    let secondValue: any;
    let firstArray: any[];
    let secondArray: any[];
    let index: number;
    const length: number = Math.min(firstInputArray.length, secondInputArray.length);
    const zippedArray: any[] = [];
    if (isArray(firstInputArray) && isArray(secondInputArray)) {
      firstArray = firstInputArray.slice();
      secondArray = secondInputArray.slice();
      for (index = 0; index < length; index += 1) {
        firstValue = firstInputArray[index];
        secondValue = secondInputArray[index];
        zippedArray[index] = callback(firstValue, secondValue, index, firstArray, secondArray);
      }
      return zippedArray;
    }
    publish(
      "error",
      `invalid input passed to zipWith, firstArray: ${firstInputArray}, secondArray: ${secondInputArray}`,
    );
  };
}());
