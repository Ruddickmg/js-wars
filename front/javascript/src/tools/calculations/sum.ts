import single from "../storage/singleton";
import validator, {Validator} from "../validation/validator";

export interface Summer {
  sum(elements: any[], getValue: (element: any) => number): number;
  add(array: number[]): number;
  square(array: number[]): number;
  exp(array: number[]): number;
}

export default single<Summer>(function() {
  const {validateArray}: Validator = validator("sum");
  return function(): Summer {
    const pow = Math.pow;
    const sum = (elements: any[], getValue: (element: any) => number): number => {
      let currentElement: number;
      let total: number = 0;
      if (validateArray(elements)) {
        currentElement = elements.length;
        while (currentElement--) {
          total += getValue(elements[currentElement]);
        }
      }
      return total;
    };
    const add = (array: number[]) => sum(array, (value: any) => value);
    const square = (array: number[]) => sum(array, (value: number) => pow(value, 2));
    const exp = (array: number[]) => sum(array, (value: number) => Math.exp(value));
    return {
      add,
      exp,
      square,
      sum,
    };
  };
}());
