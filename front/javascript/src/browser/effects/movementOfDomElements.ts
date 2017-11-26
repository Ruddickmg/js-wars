import timeKeeper, {Time} from "../../tools/calculations/time";
import getValidator, {Validator} from "../../tools/validation/validator";
import {Element} from "../dom/element/element";

export interface DomElementMover {
  animate(): DomElementMover;
  instantly(): DomElementMover;
  moveElementsOffScreen(direction: string, ...elements: Element<any>[]): Promise<any>;
  moveElementsOnScreen(fromDirection: string, ...elements: Element<any>[]): Promise<any>;
}

export default function(): DomElementMover {
  let transitioning: boolean = false;
  const millisecondsUntilOffScreen: number = 300;
  const defaultMovementSpeed: number = 2.5;
  const timeTillOffScreen = (): number => transitioning ? millisecondsUntilOffScreen : 0;
  const className: string = "movementOfDomElements";
  const classForAnimatingMovement: string = "animated";
  const {wait}: Time = timeKeeper();
  const {validateElement}: Validator = getValidator(className);
  const generateClassNameForPosition = (position: string): string => `${position}Screen`;
  const cleanUpAfterMovement = (element: Element<any>, transitioning: boolean): Promise<any> => {
    return new Promise((resolve: any) => {
      if (!transitioning) {
        element.removeClass(classForAnimatingMovement);
      }
      resolve(element);
    });
  };
  const moveElements = (
    elements: Element<any>[],
    position: string,
    moveElement: (element: Element<any>, direction?: string) => Promise<Element<any>>,
    timeBetweenMovingElements: number = defaultMovementSpeed,
    index: number = 0,
  ): Promise<any> => {
    let movement: Promise<any>;
    const element = elements[index];
    if (elements.length > index && validateElement(element, "moveElements")) {
      movement = moveElement(element, position);
      if (transitioning) {
        element.appendClass(classForAnimatingMovement);
        movement = movement.then(() => wait(timeBetweenMovingElements));
      }
      return movement.then(() => {
        return moveElements(elements, position, moveElement, timeBetweenMovingElements, index + 1);
      });
    }
    return Promise.resolve(elements);
  };
  const moveElementOffScreen = (element: Element<any>, position: string): Promise<any> => {
    if (validateElement(element, "moveElementOffScreen")) {
      element.appendClass(generateClassNameForPosition(position));
      return wait(timeTillOffScreen()).then(() => cleanUpAfterMovement(element));
    }
  };
  const moveElementOnScreen = (element: Element<any>, position: string): Promise<Element<any>> => {
    if (validateElement(element, "moveElementOnScreen")) {
      element.removeClass(generateClassNameForPosition(position));
      return wait(timeTillOffScreen()).then(() => cleanUpAfterMovement(element));
    }
  };
  const moveElementsOnScreen = (position: string, ...elements: Element<any>[]): Promise<Element<any>[]> => {
    return moveElements(elements, position, moveElementOnScreen);
  };
  const moveElementsOffScreen = (position: string, ...elements: Element<any>[]): Promise<any> => {
    return moveElements(elements, position, moveElementOffScreen);
  };
  const animate = function(): DomElementMover {
    transitioning = true;
    return this;
  };
  const instantly = function(): DomElementMover {
    transitioning = false;
    return this;
  };
  return {
    animate,
    instantly,
    moveElementsOffScreen,
    moveElementsOnScreen,
  };
}
