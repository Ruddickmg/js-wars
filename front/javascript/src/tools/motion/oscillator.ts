import timeKeeper, {Time} from "../calculations/time";
import {publish} from "../pubSub";
import typeChecker, {TypeChecker} from "../validation/typeChecker";
import validateCallbacks from "../validation/validateCallbacks";

type OscillatorCallback = (position: number) => void;

export interface Oscillator {
  addCallback(callback: OscillatorCallback): Oscillator;
  clear(): Oscillator;
  isOscillating(): boolean;
  setCallback(...callback: OscillatorCallback[]): Oscillator;
  setIncrement(newSpeed: number): Oscillator;
  setMaximum(maximum: number): Oscillator;
  setMinimum(minimum: number): Oscillator;
  setPosition(position: number): Oscillator;
  setSpeed(newSpeed: number): Oscillator;
  start(): Oscillator;
  stop(): Oscillator;
}

export default (function() {
  const time: Time = timeKeeper();
  const {isFunction, isNumber}: TypeChecker = typeChecker();
  return function(min: number = 50, max: number = 100, initial: number = max): Oscillator {
    let maximum: number = max;
    let minimum: number = min;
    let oscillating: boolean = false;
    let speed: number = 10;
    let increment: number = 1;
    let current: number = initial;
    let previous: number = initial;
    let callbacks: OscillatorCallback[] = [];
    const isOscillating = (): boolean => oscillating;
    const oscillator = (): void => {
      const nextStepDown = current - increment;
      const nextStepUp = current + increment;
      const decrementing = current < previous;
      const incrementing = current >= previous;
      const belowMinimum: boolean = nextStepDown < minimum;
      const aboveMaximum: boolean = nextStepUp > maximum;
      previous = current;
      callbacks.forEach((callback: OscillatorCallback): void => callback(current));
      if (oscillating) {
        time.wait(speed).then(() => {
          if (decrementing && !belowMinimum || aboveMaximum) {
            current = nextStepDown;
          } else if (incrementing && !aboveMaximum || belowMinimum) {
            current = nextStepUp;
          }
          oscillator();
        }).catch((error: Error): void => {
          throw error;
        });
      }
    };
    return {
      isOscillating,
      clear(): Oscillator {
        callbacks = [];
        oscillating = false;
        return this;
      },
      addCallback(callback: OscillatorCallback): Oscillator {
        if (isFunction(callback)) {
          callbacks.push(callback);
        } else {
          publish("invalidInput", {className: "oscillator", method: "addCallback", input: callback});
        }
        return this;
      },
      setCallback(...callback: OscillatorCallback[]): Oscillator {
        callbacks = validateCallbacks(callback, "oscillator", "setCallback");
        return this;
      },
      setIncrement(amount: number): Oscillator {
        if (isNumber(amount)) {
          increment = amount;
        } else {
          publish("invalidInput", {className: "oscillator", method: "setIncrement", input: amount});
        }
        return this;
      },
      setMaximum(newMaximum: number): Oscillator {
        if (isNumber(newMaximum)) {
          maximum = newMaximum;
        } else {
          publish("invalidInput", {className: "oscillator", method: "setMaximum", input: newMaximum});
        }
        return this;
      },
      setMinimum(newMinimum: number): Oscillator {
        if (isNumber(newMinimum)) {
          minimum = newMinimum;
        } else {
          publish("invalidInput", {className: "oscillator", method: "setMinimum", input: newMinimum});
        }

        return this;
      },
      setPosition(position: number): Oscillator {

        if (isNumber(position)) {

          current = position;

        } else {

          publish("invalidInput", {className: "oscillator", method: "setPosition", input: position});
        }

        return this;
      },
      setSpeed(newSpeed: number): Oscillator {

        if (isNumber(newSpeed)) {

          speed = newSpeed;

        } else {

          publish("invalidInput", {className: "oscillator", method: "setSpeed", input: newSpeed});
        }

        return this;
      },
      start(): Oscillator {

        if (!oscillating) {

          oscillating = true;
          oscillator();
        }

        return this;
      },
      stop(): Oscillator {

        oscillating = false;

        return this;
      },
    };
  };
}());
