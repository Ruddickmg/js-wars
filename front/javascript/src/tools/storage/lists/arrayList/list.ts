import wrapIndex from "../../../array/wrapIndex";
import randomNumber from "../../../calculations/random";
import notifications, {PubSub} from "../../../pubSub";
import isValidIndex from "../../../validation/nonNegativeIndex";
import typeChecker, {TypeChecker} from "../../../validation/typeChecker";
import isList from "./isList";

export interface ArrayList<Type> {
  addElement(element: Type): ArrayList<Type>;
  addElements(elementsToBeAdded: Type[]): ArrayList<Type>;
  filter(callback: MapCallback): ArrayList<Type>;
  find(callback: MapCallback): Type;
  findIndex(callback: MapCallback): number;
  forEach(callback: MapCallback): void;
  getCurrentElement(): Type;
  getCurrentIndex(): number;
  getElementAtIndex(index: number): Type;
  getNeighboringElements(numberOfNeighboringElements: number): Type[];
  getRandom(): Type;
  isEmpty(): boolean;
  length(): number;
  map(callback: MapCallback): ArrayList<any>;
  modify(callback: MapCallback, beginningIndex: number, endIndex: number): ArrayList<Type>;
  moveToElement(callback: MapCallback): ArrayList<Type>;
  moveToFirstElement(): Type;
  moveToLastElement(): Type;
  next(): Type;
  previous(): Type;
  reduce(callback: ReduceCallback<Type>, initialValue: any): any;
  sort(callback: (a: Type, b: Type) => number): ArrayList<Type>;
  [property: string]: any;
}

type MapCallback = <Type>(element: Type, index: number, list: ArrayList<Type>) => any;
type ReduceCallback<Type> = <Type>(accumulator: any, value: Type, index: number, list: ArrayList<Type>) => any;

export default (function() {

  const min = Math.min;
  const minimumIndex: number = 0;
  const {publish}: PubSub = notifications();
  const {isNumber, isFunction}: TypeChecker = typeChecker()
    .register("list", isList);

  return function createList<Type>(initialElements: any[] = []): ArrayList<Type> {

    let elements: any[] = initialElements;
    let index: number = 0;

    const addElement = function(element: Type): ArrayList<Type> {
      elements.push(element);
      return this;
    };
    const addElements = function(elementsToBeAdded: Type[]): ArrayList<Type> {
      elements = elements.concat(elementsToBeAdded);
      return this;
    };
    const copyCurrentList = (desiredElements: any[]): ArrayList<Type> => {
      const current = getElementAtIndex(index);
      const newList = createList<Type>(desiredElements);
      newList.moveToElement((currentElement: any): boolean => currentElement === current);
      return newList;
    };
    const filter = function(callback: MapCallback): ArrayList<Type> {
      return copyCurrentList(elements.filter((element: Type, currentIndex: number): any => {
        return callback(element, currentIndex, this);
      }));
    };
    const find = function(callback: MapCallback): Type {
      return elements.find((element: Type, currentIndex: number): any => {
        return callback(element, currentIndex, this);
      });
    };
    const findIndex = (callback: MapCallback): number => {
      let desiredIndex: number = elements.length;
      if (isFunction(callback)) {
        while (desiredIndex--) {
          if (callback(elements[desiredIndex], desiredIndex, this)) {
            return desiredIndex;
          }
        }
      }
    };
    const forEach = function(callback: MapCallback): void {
      elements.forEach((element: Type, currentIndex: number): any => {
        return callback(element, currentIndex, this);
      });
    };
    const getCurrentElement = (): Type => getElementAtIndex(index);
    const getCurrentIndex = (): number => index;
    const getElementAtIndex = (desiredIndex: number): Type => {
      return elements[wrapIndexAroundLength(desiredIndex)];
    };
    const getNeighboringElements = (numberOfNeighboringElements: number = 1): Type[] => {

      const amountOfElements = elements.length;
      const amountOfCurrentElements = 1;
      const amountOfNeighboringElements = numberOfNeighboringElements * 2;
      const notEnoughElementsInList = amountOfElements < amountOfNeighboringElements + amountOfCurrentElements;
      const length = index + numberOfNeighboringElements;
      const currentAndNeighboringElements = [];
      const error: string = `Not enough elements in list to accommodate ${numberOfNeighboringElements} neighbors`;

      let indexOfNeighbor = index - numberOfNeighboringElements;
      let wrappedIndex;
      let neighbor;

      if (notEnoughElementsInList) {
        publish("customError", {message: error, className: "List<Type>", method: "getNeighboringElements"});
      }

      for (indexOfNeighbor; indexOfNeighbor <= length; indexOfNeighbor += 1) {
        wrappedIndex = wrapIndexAroundLength(indexOfNeighbor);
        neighbor = elements[wrappedIndex];
        currentAndNeighboringElements.push(neighbor);
      }
      return currentAndNeighboringElements;
    };
    const getRandom = (): Type => getElementAtIndex(moveToIndex(randomNumber.index(elements)));
    const isEmpty = (): boolean => !elements.length;
    const length = (): number => elements.length;
    const map = function(callback: MapCallback): ArrayList<any> {
      return copyCurrentList(elements.map((element: Type, currentIndex: number): any => {
        return callback(element, currentIndex, this);
      }));
    };
    const modify = function(
      callback: (element: Type, index: number, list: ArrayList<Type>) => any,
      beginning: number = 0,
      end: number = length(),
    ): ArrayList<Type> {
      const stoppingPoint = min(end, length() - 1);
      return this.map((value: Type, currentIndex: number): Type => {
        if (currentIndex >= beginning && currentIndex <= stoppingPoint) {
          return callback(elements[currentIndex], currentIndex, this);
        }
        return value;
      });
    };
    const moveToElement = function(callback: MapCallback): ArrayList<Type> {
      const indexOfDesiredElement: number = findIndex(callback);
      if (isNumber(indexOfDesiredElement) && isValidIndex(indexOfDesiredElement)) {
        setIndex(indexOfDesiredElement);
      }
      return this;
    };
    const moveToFirstElement = (): any => getElementAtIndex(setIndex(minimumIndex));
    const moveToIndex = (desiredIndex: number): number => {
      return setIndex(wrapIndexAroundLength(desiredIndex));
    };
    const moveToLastElement = (): any => {
      const end: number = elements.length - 1;
      const indexOfLastElement: number = end > minimumIndex ? end : minimumIndex;
      return getElementAtIndex(moveToIndex(indexOfLastElement));
    };
    const next = (): any => getElementAtIndex(moveToIndex(wrapIndexAroundLength(index + 1)));
    const previous = (): any => getElementAtIndex(moveToIndex(wrapIndexAroundLength(index - 1)));
    const reduce = function(callback: ReduceCallback<Type>, initialValue: any): any {
      return elements.reduce((accumulator: any, element: Type, currentIndex: number): any => {
        return callback(accumulator, element, currentIndex, this);
      }, initialValue);
    };
    const setIndex = (desiredIndex: number): number => {
      index = desiredIndex;
      return index;
    };
    const sort = (callback: (a: any, b: any) => number): ArrayList<Type> => {
      const copyOfElements = elements.slice();
      return copyCurrentList(copyOfElements.sort(callback));
    };
    const wrapIndexAroundLength = (unwrappedIndex: number): number => wrapIndex(unwrappedIndex, elements.length);

    return {

      addElement,
      addElements,
      filter,
      find,
      findIndex,
      forEach,
      getCurrentElement,
      getCurrentIndex,
      getElementAtIndex,
      getNeighboringElements,
      getRandom,
      isEmpty,
      length,
      map,
      modify,
      moveToElement,
      moveToFirstElement,
      moveToLastElement,
      next,
      previous,
      reduce,
      sort,
    };
  };
}());
