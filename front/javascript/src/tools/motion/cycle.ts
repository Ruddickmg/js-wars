import timeKeeper, {Time} from "../calculations/time";
import {publish} from "../pubSub";
import typeChecker, {TypeChecker} from "../validation/typeChecker";
import validator, {Validator} from "../validation/validator";

type CycleCallback = (position: number) => any;

export interface Cycle {

  reset(): Cycle;

  setBeginning(beginning: number): Cycle;

  setEnd(end: number): Cycle;

  setIncrement(increment: number): Cycle;

  setSpeed(speed: number): Cycle;

  setCallback(callback: CycleCallback): Cycle;

  start(): Cycle;

  stop(): Cycle;
}

export default (function() {

  const pivotPoint: number = 0;
  const className: string = "cycle";
  const {validateNumber, validateFunction}: Validator = validator(className);
  const {isNumber, isDefined}: TypeChecker = typeChecker();
  const time: Time = timeKeeper();
  const validateIncrement = (input: number, method: string): boolean => {

    if (validateNumber(input, method)) {
      if (input !== pivotPoint) {

        return true;
      }
      publish("invalidInputError", {className, method, input});
    }
  };
  const validateIfExists = (input: any, validation: any): boolean => {

    return !isDefined(input) || validation(input, "constructor");
  };
  const validateNumberIfExists = (input: number): boolean => validateIfExists(input, validateNumber);
  const validateFunctionIfExists = (input: CycleCallback): boolean => validateIfExists(input, validateFunction);

  return function(beginningPoint?: number,
                  endingPoint?: number,
                  cycleFunction?: CycleCallback,
                  initialSpeed: number = 1,
                  initialIncrement: number = 1): Cycle {

    let decrementing: boolean = false;
    let cycling: boolean = false;
    let amountToIncrementBy: number;
    let cyclingSpeed: number;
    let endOfCycle: number;
    let position: number;
    let beginning: number;
    let cycleThrough: CycleCallback;

    const decrement = function(): void {

      if (amountToIncrementBy > pivotPoint) {

        amountToIncrementBy = -amountToIncrementBy;
      }
    };
    const increment = function(): void {

      if (amountToIncrementBy < pivotPoint) {

        amountToIncrementBy = -amountToIncrementBy;
      }
    };
    const reachedEndOfCycle = (): boolean => {

      return decrementing ? position < endOfCycle : position > endOfCycle;
    };
    const cycle = (): void => {

      if (cycling) {

        cycleThrough(position);

        position += amountToIncrementBy;

        if (reachedEndOfCycle()) {

          reset();
        }

        time.wait(cyclingSpeed).then(cycle);
      }
    };
    const reset = function(): Cycle {

      position = beginning;

      return this;
    };
    const start = function(): Cycle {

      const methodName: string = "start";

      if (
        validateNumber(beginning, methodName)
        && validateNumber(endOfCycle, methodName)
        && validateNumber(position, methodName)
        && validateNumber(cyclingSpeed, methodName)
        && validateNumber(amountToIncrementBy, methodName)
        && validateFunction(cycleThrough, methodName)
      ) {
        decrementing = beginning > endOfCycle;
        decrementing ? decrement() : increment();
        cycling = true;
        reset();
        cycle();
      }
      return this;
    };
    const stop = function(): Cycle {

      cycling = false;

      return this;
    };
    const setSpeed = function(speed: number): Cycle {

      if (validateNumber(speed, "setSpeed")) {

        cyclingSpeed = speed;
      }

      return this;
    };
    const setIncrement = function(amountOfIncrement: number): Cycle {

      if (validateIncrement(amountOfIncrement, "setIncrement")) {

        amountToIncrementBy = amountOfIncrement;
      }

      return this;
    };
    const setBeginning = function(startingPoint: number): Cycle {

      if (validateNumber(startingPoint, "setBeginning") && !cycling) {

        beginning = startingPoint;

        if (!isNumber(position)) {

          position = beginning;
        }
      }

      return this;
    };
    const setEnd = function(endPoint: number): Cycle {

      if (validateNumber(endPoint, "setEnd") && !cycling) {

        endOfCycle = endPoint;
      }

      return this;
    };
    const setCallback = function(callback: CycleCallback): Cycle {

      if (validateFunction(callback, "setCallback")) {

        cycleThrough = callback;
      }

      return this;
    };

    if (
      validateNumberIfExists(initialIncrement)
      && validateNumberIfExists(initialSpeed)
      && validateNumberIfExists(endingPoint)
      && validateNumberIfExists(beginningPoint)
      && validateFunctionIfExists(cycleFunction)
    ) {

      amountToIncrementBy = initialIncrement;
      cyclingSpeed = initialSpeed;
      endOfCycle = endingPoint;
      position = beginningPoint;
      beginning = beginningPoint;
      cycleThrough = cycleFunction;

      return {

        reset,
        setBeginning,
        setCallback,
        setEnd,
        setIncrement,
        setSpeed,
        start,
        stop,
      };
    }
  };
}());
