import wrapIndex from "../../tools/array/wrapIndex";
import getAllowedRange from "../../tools/calculations/getAllowedRange";
import {ArrayList} from "../../tools/storage/lists/arrayList/list";
import validator, {Validator} from "../../tools/validation/validator";
import {Element} from "../dom/element/element";

export interface Scroller {
  next(): Scroller;
  previous(): Scroller;
  scroll(movingForward: boolean): Scroller;
}

export type ScrollHandler = (list: ArrayList<Element<any>>) => Scroller;

export default (function() {
  const oneStep: number = 1;
  const firstIndex: number = 0;
  const floor = Math.floor;
  const max = Math.max;
  const abs = Math.abs;
  const getLastIndex = (list: ArrayList<Element<any>>): number => list.length() - 1;
  const getValueOfDirection = (movingForward: boolean): number => movingForward ? 1 : -1;
  const showElement = (element: Element<any>): any => element.show();
  const hideElement = (element: Element<any>): any => element.hide();
  const getDistance = (index: number, secondIndex: number, length: number) => {
    return index > secondIndex ? abs((length - index) + secondIndex) : secondIndex - index;
  };
  return function(numberOfElementsToShow: number = 1, amountOfBuffering: number = 1): ScrollHandler {
    const {validateBoolean, validateNumber, validateList}: Validator = validator("scrolling");
    let numberOfNeighbors: number;
    let buffer: number;
    let amountOfElementsToShow: number;
    let firstElementToShow: number;
    let lastElementToShow: number;
    let amountAbove: number;
    let amountBelow: number;
    let list: ArrayList<Element<any>>;
    const scrollThroughList = (movingForward: boolean, currentIndex: number): any => {
      let elementToShow: number;
      const length: number = list.length();
      const movement: number = getValueOfDirection(movingForward);
      const distanceAllowedFromEdge: number = buffer;
      const elementToHide: number = movingForward ? firstElementToShow : lastElementToShow;
      const distanceFromEdge: number = movingForward ?
        getDistance(currentIndex, lastElementToShow + movement, length) :
        getDistance(firstElementToShow + movement, currentIndex, length);

      if (distanceFromEdge <= distanceAllowedFromEdge) {
        firstElementToShow = wrapIndex(firstElementToShow + movement, length);
        lastElementToShow = wrapIndex(lastElementToShow + movement, length);
        elementToShow = movingForward ? lastElementToShow : firstElementToShow;
        list.getElementAtIndex(elementToShow).show();
        list.getElementAtIndex(elementToHide).hide();
      }
    };
    const scroll = function(movingForward: boolean): Scroller {
      let elementPositions: number[];
      const index: number = list.getCurrentIndex();
      const lastIndex: number = getLastIndex(list);
      const landedOnFirstElement: boolean = index <= firstIndex;
      const landedOnLastElement: boolean = index >= lastIndex;
      const withinScrollBoundaries: boolean = index - amountAbove + oneStep >= firstIndex
        && index + amountBelow - oneStep <= lastIndex;

      if (validateBoolean(movingForward, "scroll")) {
        if (movingForward && landedOnFirstElement || !movingForward && landedOnLastElement) {
          list.modify(hideElement, firstElementToShow, lastElementToShow);
          elementPositions = getAllowedRange(list.length(), index - amountAbove, index + amountBelow);
          firstElementToShow = elementPositions[0];
          lastElementToShow = elementPositions.pop();
          list.modify(showElement, firstElementToShow, lastElementToShow);
        } else if (withinScrollBoundaries) {
          scrollThroughList(movingForward, index);
        }
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
    const setList = function(listToBeScrolled: ArrayList<Element<any>>): Scroller {
      const currentIndex = listToBeScrolled.getCurrentIndex();
      const firstElement: number = currentIndex - amountAbove;
      const lastElement: number = currentIndex + amountBelow;
      let elementPositions: number[];
      if (validateList(listToBeScrolled, "setList")) {
        list = listToBeScrolled;
        elementPositions = getAllowedRange(list.length(), firstElement, lastElement);
        firstElementToShow = elementPositions[0];
        lastElementToShow = elementPositions.pop();
        list.modify(showElement, firstElementToShow, lastElementToShow);
        return {
          next,
          previous,
          scroll,
        };
      }
    };
    if (validateNumber(numberOfElementsToShow) && validateNumber(amountOfBuffering)) {
      buffer = max(amountOfBuffering, firstIndex);
      amountOfElementsToShow = max(numberOfElementsToShow, firstIndex);
      numberOfNeighbors = max(amountOfElementsToShow - oneStep, firstIndex);
      amountAbove = floor(numberOfNeighbors / 2);
      amountBelow = numberOfNeighbors - amountAbove;
      return setList;
    }
  };
}());
