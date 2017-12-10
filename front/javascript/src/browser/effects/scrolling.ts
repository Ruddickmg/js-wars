import wrapIndex from "../../tools/array/wrapIndex";
import getAllowedRange from "../../tools/calculations/getAllowedRange";
import curry from "../../tools/function/curry";
import {ArrayList} from "../../tools/storage/lists/arrayList/list";
import validator, {Validator} from "../../tools/validation/validator";
import {Element} from "../dom/element/element";

export interface Scroller {
  next(): Scroller;
  previous(): Scroller;
  scroll(movingForward: boolean): Scroller;
}

export default (function() {
  const oneStep: number = 1;
  const firstIndex: number = 0;
  const floor = Math.floor;
  const max = Math.max;
  const abs = Math.abs;
  const getValueOfDirection = (movingForward: boolean): number => movingForward ? 1 : -1;
  const showElement = (element: Element<any>): any => element.show();
  const hideElement = (element: Element<any>): any => element.hide();
  const getDistance = (index: number, secondIndex: number, length: number) => {
    return index > secondIndex ? abs((length - index) + secondIndex) : secondIndex - index;
  };
  return curry(function(elementsToShow: number, buffering: number, list: ArrayList<Element<any>>): Scroller {
    const {validateNumber, validateList}: Validator = validator("scrolling");
    const distanceAllowedFromEdge: number = max(buffering, firstIndex);
    const amountOfElementsToShow: number = max(elementsToShow, firstIndex);
    const numberOfNeighbors: number = max(amountOfElementsToShow - oneStep, firstIndex);
    const amountAbove: number = floor(numberOfNeighbors / 2);
    const amountBelow: number = numberOfNeighbors - amountAbove;
    const currentIndex = list.getCurrentIndex();
    const length: number = list.length();
    const lastIndex: number = length - 1;
    const firstElement: number = currentIndex - amountAbove;
    const lastElement: number = currentIndex + amountBelow;
    const initialRange: number[] = getAllowedRange(list.length(), firstElement, lastElement);
    const moveView = (movingForward: boolean, index: number): any => {
      let elementToShow: number;
      const movement: number = getValueOfDirection(movingForward);
      const elementToHide: number = movingForward ? firstElementToShow : lastElementToShow;
      const top: number = firstElementToShow + movement;
      const bottom: number = lastElementToShow + movement;
      const distanceFromEdge: number = movingForward ?
        getDistance(index, bottom, length) :
        getDistance(top, index, length);
      if (distanceFromEdge <= distanceAllowedFromEdge) {
        firstElementToShow = wrapIndex(top, length);
        lastElementToShow = wrapIndex(bottom, length);
        elementToShow = movingForward ? lastElementToShow : firstElementToShow;
        list.getElementAtIndex(elementToShow).show();
        list.getElementAtIndex(elementToHide).hide();
      }
    };
    const scroll = function(movingForward: boolean): Scroller {
      let elementPositions: number[];
      const position: number = list.getCurrentIndex();
      const top: number = position - amountAbove;
      const bottom: number = position + amountBelow;
      const landedOnFirstElement: boolean = position <= firstIndex;
      const landedOnLastElement: boolean = position >= lastIndex;
      const withinScrollBoundaries: boolean = top + oneStep >= firstIndex && bottom - oneStep <= lastIndex;
      if (movingForward && landedOnFirstElement || !movingForward && landedOnLastElement) {
        list.modify(hideElement, firstElementToShow, lastElementToShow);
        elementPositions = getAllowedRange(list.length(), position - amountAbove, position + amountBelow);
        firstElementToShow = elementPositions[0];
        lastElementToShow = elementPositions.pop();
        list.modify(showElement, firstElementToShow, lastElementToShow);
      } else if (withinScrollBoundaries) {
        moveView(movingForward, position);
      }
      return this;
    };
    const next = function() {
      scroll(true);
      return this;
    };
    const previous = function() {
      scroll(false);
      return this;
    };
    let firstElementToShow: number = initialRange[firstIndex];
    let lastElementToShow: number = initialRange.pop();
    list.modify(showElement, firstElementToShow, lastElementToShow);
    if (validateList(list) && validateNumber(elementsToShow) && validateNumber(buffering)) {
      return {
        next,
        previous,
        scroll,
      };
    }
  });
}());
