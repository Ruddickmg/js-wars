import wrapIndex from "../../../tools/array/wrapIndex";
import randomNumber from "../../../tools/calculations/random";
import notifications, {PubSub} from "../../../tools/pubSub";
import isValidIndex from "../../../tools/validation/nonNegativeIndex";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import isList from "./isList";

export interface List<Type> {

    addElement(element: Type): List<Type>;
    addElements(elementsToBeAdded: Type[]): List<Type>;
    filter(callback: MapCallback): List<Type>;
    find(callback: MapCallback): Type;
    forEach(callback: MapCallback): void;
    getCurrentElement(): Type;
    getCurrentIndex(): number;
    getElementAtIndex(index: number): Type;
    getNeighboringElements(numberOfNeighboringElements: number): Type[];
    getRandom(): Type;
    isEmpty(): boolean;
    length(): number;
    map(callback: MapCallback): List<any>;
    modify(callback: MapCallback, beginningIndex: number, endIndex: number): List<Type>;
    moveToElement(element: Type): List<Type>;
    moveToFirstElement(): Type;
    moveToLastElement(): Type;
    next(): Type;
    previous(): Type;
    reduce(callback: ReduceCallback): any;
    sort(callback: (a: Type, b: Type) => number): List<Type>;
}

type MapCallback = <Type>(element: Type, index: number, list: List<Type>) => any;
type ReduceCallback = <Type>(accumulator: any, value: Type, index: number, list: List<Type>) => any;

export default (function() {

    const min = Math.min;
    const minimumIndex: number = 0;
    const {publish}: PubSub = notifications();
    const {isNumber, isDefined}: TypeChecker = typeChecker()
        .register("list", isList);

    return function createList<Type>(initialElements: any[] = []): List<Type> {

        let elements: any[] = initialElements;
        let index: number = 0;

        const wrapIndexAroundLength = (unwrappedIndex: number): number => wrapIndex(unwrappedIndex, elements.length);
        const previous = (): any => getElementAtIndex(moveToIndex(wrapIndexAroundLength(index - 1)));
        const next = (): any => getElementAtIndex(moveToIndex(wrapIndexAroundLength(index + 1)));
        const isEmpty = (): boolean => !elements.length;
        const setIndex = (desiredIndex: number): number => {

            index = desiredIndex;

            return index;
        };
        const getRandom = (): Type => elements[randomNumber.index(elements)];
        const getCurrentIndex = (): number => index;
        const getCurrentElement = (): Type => getElementAtIndex(index);
        const getElementAtIndex = (desiredIndex: number): Type => {

            return elements[wrapIndexAroundLength(desiredIndex)];
        };
        const moveToIndex = (desiredIndex: number): number => {

            return setIndex(wrapIndexAroundLength(desiredIndex));
        };
        const moveToFirstElement = (): any => getElementAtIndex(setIndex(minimumIndex));
        const moveToLastElement = (): any => {

            const end: number = elements.length - 1;
            const indexOfLastElement: number = end > minimumIndex ? end : minimumIndex;

            return getElementAtIndex(moveToIndex(indexOfLastElement));
        };
        const copyCurrentList = (desiredElements: any[]): List<Type> => {

            const current = getElementAtIndex(index);
            const newList = createList<Type>(desiredElements);

            newList.moveToElement(current);

            return newList;
        };
        const filter = (callback: MapCallback): List<Type> => {

            return copyCurrentList(elements.filter((element: Type, currentIndex: number): any => {

                return callback(element, currentIndex, this);
            }));
        };
        const find = (callback: MapCallback): Type => {

            return elements.find((element: Type, currentIndex: number): any => {

                return callback(element, currentIndex, this);
            });
        };
        const map = function(callback: MapCallback): List<any> {

            return copyCurrentList(elements.map((element: Type, currentIndex: number): any => {

                return callback(element, currentIndex, this);
            }));
        };
        const reduce = function(callback: ReduceCallback): any {

            return elements.reduce((accumulator: any, element: Type, currentIndex: number): any => {

                return callback(accumulator, element, currentIndex, this);
            });
        };
        const forEach = function(callback: MapCallback): void {

            elements.forEach((element: Type, currentIndex: number): any => {

                return callback(element, currentIndex, this);
            });
        };
        const sort = (callback: (a: any, b: any) => number): List<Type> => {

            const copyOfElements = elements.slice();

            return copyCurrentList(copyOfElements.sort(callback));
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
        const addElement = function(element: Type): List<Type> {

            elements.push(element);

            return this;
        };
        const addElements = function(elementsToBeAdded: Type[]): List<Type> {

            elements = elements.concat(elementsToBeAdded);

            return this;
        };
        const moveToElement = function(element: Type): List<Type> {

            const indexOfDesiredElement: number = elements.indexOf(element);

            if (isDefined(element) && isNumber(indexOfDesiredElement) && isValidIndex(indexOfDesiredElement)) {

                setIndex(indexOfDesiredElement);
            }

            return this;
        };
        const length = (): number => elements.length;
        const modify = function(
            callback: (element: Type, index: number, list: List<Type>) => any,
            beginning: number = 0,
            end: number = length(),
        ): List<Type> {

            let currentIndex: number = beginning;

            const stoppingPoint = min(end, length() - 1);

            for (currentIndex; currentIndex <= stoppingPoint; currentIndex += 1) {

                callback(elements[currentIndex], currentIndex, this);
            }

            return this;
        };

        return {

            addElement,
            addElements,
            filter,
            find,
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
