import wrapIndex from "../../tools/array/wrapIndex";
import {ArrayList} from "../../tools/storage/lists/arrayList/list";
import validator, {Validator} from "../../tools/validation/validator";
import {Element} from "../dom/element/element";

export type Scroller = (movingForward: boolean) => void;
export type ScrollHandler = (list: ArrayList<Element<any>>) => Scroller;
export default (function() {
  const className: string = "scrolling";
  const {validateBoolean, validateNumber, validateList}: Validator = validator(className);
  const oneStep: number = 1;
  const firstIndex: number = 0;
  const floor = Math.floor;
  const min = Math.min;
  const max = Math.max;
  const abs = Math.abs;
  const getLastIndex = (list: ArrayList<Element<any>>): number => list.length() - 1;
  const getValueOfDirection = (movingForward: boolean): number => movingForward ? 1 : -1;
  const showElement = (element: Element<any>): any => element.show();
  const hideElement = (element: Element<any>): any => element.hide();
  const getDistance = (index: number, secondIndex: number, length: number) => {
    return index > secondIndex ? abs((length - index) + secondIndex) : secondIndex - index;
  };
  const showElements = (currentList: ArrayList<any>, beginning: number, end: number, amount: number) => {
    const lastIndex: number = getLastIndex(currentList);
    const first: number = end > lastIndex ? lastIndex - amount : max(beginning, firstIndex);
    const last: number = beginning < firstIndex ? amount : min(end, lastIndex);
    currentList.modify(showElement, first, last);
    return {first, last};
  };
  return (numberOfElementsToShow: number = 1, amountOfBuffering: number = 1): ScrollHandler => {
    let numberOfNeighbors: number;
    let buffer: number;
    let amountOfElementsToShow: number;
    let firstElementToShow: number;
    let lastElementToShow: number;
    let amountAbove: number;
    let amountBelow: number;
    let list: ArrayList<Element<any>>;
    const scroll = (movingForward: boolean, currentIndex: number): any => {
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
    const scroller = (movingForward: boolean): void => {
      let elementPositions: any;
      const index: number = list.getCurrentIndex();
      const lastIndex: number = getLastIndex(list);
      const landedOnFirstElement: boolean = index <= firstIndex;
      const landedOnLastElement: boolean = index >= lastIndex;
      const withinScrollBoundaries: boolean = index - amountAbove + oneStep >= firstIndex
        && index + amountBelow - oneStep <= lastIndex;
      if (validateBoolean(movingForward, "scroller")) {
        if (movingForward && landedOnFirstElement || !movingForward && landedOnLastElement) {
          list.modify(hideElement, firstElementToShow, lastElementToShow);
          elementPositions = showElements(list, index - amountAbove, index + amountBelow, numberOfNeighbors);
          firstElementToShow = elementPositions.first;
          lastElementToShow = elementPositions.last;
        } else if (withinScrollBoundaries) {
          scroll(movingForward, index);
        }
      }
    };
    const setList = (listToBeScrolled: ArrayList<Element<any>>): Scroller => {
      const currentIndex = listToBeScrolled.getCurrentIndex();
      const firstElement: number = currentIndex - amountAbove;
      const lastElement: number = currentIndex + amountBelow;
      let elementPositions: any;
      if (validateList(listToBeScrolled, "setList")) {
        list = listToBeScrolled;
        elementPositions = showElements(list, firstElement, lastElement, numberOfNeighbors);
        firstElementToShow = elementPositions.first;
        lastElementToShow = elementPositions.last;
        return scroller;
      }
    };
    if (validateNumber(numberOfElementsToShow, className) && validateNumber(amountOfBuffering, className)) {
      buffer = max(amountOfBuffering, firstIndex);
      amountOfElementsToShow = max(numberOfElementsToShow, firstIndex);
      numberOfNeighbors = max(amountOfElementsToShow - oneStep, firstIndex);
      amountAbove = floor(numberOfNeighbors / 2);
      amountBelow = numberOfNeighbors - amountAbove;
      return setList;
    }
  };
}());
