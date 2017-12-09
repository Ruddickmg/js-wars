import {Element} from "../src/browser/dom/element/element";
import timeKeeper, {Time} from "../src/tools/calculations/time";
import timedIterator, {TimedIterator} from "../src/tools/timedIterator";
import getValidator, {Validator} from "../src/tools/validation/validator";

export interface DomElementMover {
  animate(): DomElementMover;
  instantly(): DomElementMover;
  moveElementsOffScreen(direction: string, ...elements: Element<any>[]): Promise<any>;
  moveElementsOnScreen(fromDirection: string, ...elements: Element<any>[]): Promise<any>;
}

export default function(): DomElementMover {
  let animating = true;
  const millisecondsUntilOffScreen: number = 300;
  const defaultMovementSpeed: number = 201;
  const instant: number = 0;
  const className: string = "movementOfDomElements";
  const classForAnimatingMovement: string = "animated";
  const {wait}: Time = timeKeeper();
  const iterator: TimedIterator = timedIterator();
  const {validateElement}: Validator = getValidator(className);
  const generateClassNameForPosition = (position: string): string => `${position}Screen`;
  const cleanUpAfterMovement = (element: Element<any>): Promise<any> => {
    return new Promise((resolve: any) => {
      // if (animating) {
      //   element.removeClass(classForAnimatingMovement);
      // }
      resolve(element);
    });
  };
  const moveElementOffScreen = (element: Element<any>, position: string): Promise<any> => {
    if (validateElement(element, "moveElementOffScreen")) {
      element.appendClass(generateClassNameForPosition(position), animating ? classForAnimatingMovement : "");
      return wait(millisecondsUntilOffScreen).then(() => cleanUpAfterMovement(element));
    }
  };
  const moveElementOnScreen = (element: Element<any>, position: string): Promise<Element<any>> => {
    if (validateElement(element, "moveElementOnScreen")) {
      element.removeClass(generateClassNameForPosition(position), animating ? classForAnimatingMovement : "");
      return wait(millisecondsUntilOffScreen).then(() => cleanUpAfterMovement(element));
    }
  };
  const moveElementsOnScreen = (position: string, ...elements: Element<any>[]): Promise<Element<any>[]> => {
    return iterator.iterate(elements, (element: Element<any>) => moveElementOnScreen(element, position));
  };
  const moveElementsOffScreen = (position: string, ...elements: Element<any>[]): Promise<any> => {
    return iterator.iterate(elements, (element: Element<any>) => moveElementOffScreen(element, position));
  };
  const animate = function(): DomElementMover {
    animating = true;
    iterator.setSpeed(defaultMovementSpeed);
    return this;
  };
  const instantly = function(): DomElementMover {
    animating = false;
    iterator.setSpeed(instant);
    return this;
  };
  return {
    animate,
    instantly,
    moveElementsOffScreen,
    moveElementsOnScreen,
  };
}
