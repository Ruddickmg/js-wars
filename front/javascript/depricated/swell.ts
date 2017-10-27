import getSettings from "../settings/settings";
import createOscillator, {Oscillator} from "../src/tools/motion/oscillator";
import {Dictionary} from "../src/tools/storage/dictionary";
import {Element} from "../browser/dom/element/element";

export interface Sweller extends Oscillator {

  setElement(element: Element<any>): Sweller;

  isSwelling(): boolean;

  start(): Sweller;

  stop(): Sweller;
}

interface Origin {

  left: number;
  top: number;
  size: number;
}

export default function(min: number, max: number, speed: number = 2): Sweller {

  let element: Element<any>;
  let center: number;
  let originalDimensions: Origin;

  const minimum: number = min;
  const maximum: number = max;
  const widthType: string = "offset";
  const settings: Dictionary = getSettings();
  const swellIncrement: number = settings.get("swellIncrement");
  const oscillator: Oscillator = createOscillator(minimum, maximum);
  const changeSize = (size: number): void => {

    element.setWidth(size);
    element.setHeight(size);
    element.setTop(size + center);
    element.setLeft(size + center);
  };
  const storeOriginalDimensions = (currentElement: Element<any>): Origin => {

    const left: number = currentElement.element.style.left;
    const top: number = currentElement.element.style.top;
    const size: number = currentElement.getWidth(widthType);

    originalDimensions = {top, left, size};

    return originalDimensions;
  };
  const restoreOriginalDimensions = (currentElement: Element<any>): void => {

    const {top, left, size}: Origin = originalDimensions;

    currentElement.setLeft(left);
    currentElement.setTop(top);
    currentElement.setWidth(size);
    currentElement.setHeight(size);
  };
  const setElement = function(newElement: Element<any>): Sweller {

    let size: number;

    storeOriginalDimensions(newElement);
    size = originalDimensions.size;
    element = newElement;
    center = size / 2;

    if (oscillator.isOscillating()) {

      oscillator.stop();
      oscillator.setPosition(size);
      oscillator.setCallback(changeSize);
      oscillator.start();
    }

    return this;
  };
  const stop = function(): Sweller {

    restoreOriginalDimensions(element);
    oscillator.stop();

    return this;
  };
  const isSwelling = oscillator.isOscillating;

  oscillator.setIncrement(swellIncrement)
    .setSpeed(speed);

  return Object.assign(Object.create(oscillator), {

    setElement,
    stop,
    isSwelling,
  });
}
