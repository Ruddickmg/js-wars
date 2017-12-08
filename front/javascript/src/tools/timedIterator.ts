import validator, {Validator} from "./validation/validator";

type CallBack = (value: any, index: number, iterable: any[] | string) => any;

export interface TimedIterator {
  reset(): TimedIterator;
  setSpeed(speed: number): TimedIterator;
  setCallback(callback: CallBack): TimedIterator;
  iterate(container: string | any[], callback?: CallBack): Promise<string | any[]>;
}

export default function(): TimedIterator {
  let current: string | any[];
  let callback: CallBack;
  let speed: number = 0;
  let position: number = 0;
  let iterator: any;
  const {validateNumber, validateFunction}: Validator = validator("timedIterator");
  const stillOnTheSameContainer = (container: string | any[]): boolean => container === current;
  const setSpeed = function(newSpeed: number): TimedIterator {
    if (validateNumber(newSpeed, "setSpeed")) {
      speed = newSpeed;
    }
    return this;
  };
  const setCallback = function(newCallback: CallBack): TimedIterator {
    if (validateFunction(newCallback, "setCallback")) {
      callback = newCallback;
    }
    return this;
  };
  const moveThrough = (container: string | any[], handleElement: CallBack = callback): Promise<string | any[]> => {
    const value = container[position];
    const unchanged: boolean = stillOnTheSameContainer(container);
    const moreRemaining = position < container.length;
    if (unchanged && moreRemaining) {
      return new Promise((resolve) => {
        if (validateFunction(handleElement)) {
          iterator = setTimeout(resolve, speed);
          handleElement(value, position, container);
          current = container;
          position += 1;
        }
      }).then(() => moveThrough(container, handleElement));
    }
    return Promise.resolve(current);
  };
  const reset = function(): TimedIterator {
    clearTimeout(iterator);
    position = 0;
    return this;
  };
  const iterate = (container: any[] | string, callBack: CallBack): Promise<any[] | string> => {
    reset();
    current = container;
    return moveThrough(container, callBack);
  };
  return {
    reset,
    setCallback,
    setSpeed,
    iterate,
  };
}
