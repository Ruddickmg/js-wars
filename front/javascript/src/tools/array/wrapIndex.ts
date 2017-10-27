import validator, {Validator} from "../validation/validator";

export default (function() {

  const {validateNumber}: Validator = validator("wrapIndex");
  const minimumIndex: number = 0;

  return (unwrappedIndex: number, limit: number): number => {

    const isNegative: boolean = unwrappedIndex < minimumIndex;
    const change: number = isNegative ? limit : -limit;

    let index: number = unwrappedIndex;

    if (validateNumber(index) && validateNumber(limit) && limit > minimumIndex) {

      while (index >= limit || index < minimumIndex) {

        index += change;
      }
      return index;
    }
  };
}());
