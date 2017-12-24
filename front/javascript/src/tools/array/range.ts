import validator, {Validator} from "../validation/validator";

export default (function() {
  const {validateNumber}: Validator = validator("range");
  return function(beginning: number, end?: number, increment: number = 1): number[] {
    let start: number = end ? beginning : 0;
    let index: number = 0;
    const range: number[] = [];
    const ending: number = end ? end : beginning;
    const positiveIncrement: boolean = increment > -1;
    const incrementing: boolean = start <= ending;
    const change = positiveIncrement && incrementing
    || !positiveIncrement && !incrementing ? increment : -increment;
    if (validateNumber(start) && validateNumber(ending) && validateNumber(change)) {
      while (incrementing ? start <= ending : start >= ending) {
        range[index++] = start;
        start += change;
      }
    }
    return range;
  };
}());
