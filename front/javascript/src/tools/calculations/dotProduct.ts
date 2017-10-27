import validator, {Validator} from "../validation/validator";

export default (function() {

  const {validateArray}: Validator = validator("dotProduct");

  return function(firstArray: number[], secondArray: number[]): number {

    const length = firstArray.length;

    if (validateArray(firstArray) && validateArray(secondArray)) {

      if (length <= secondArray.length) {

        return firstArray.reduce((current: number, value: number, index: number) => {

          return current + value * secondArray[index];
        }, 0);
      }
      throw Error("The second array of dot product must be greater or equal in length to the first.");
    }
    throw TypeError("Input into dot product must be two numerical arrays");
  };
}());
