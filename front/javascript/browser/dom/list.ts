import notifications, {PubSub} from "../../tools/pubSub";

export interface List<Type> {

    isEmpty(): boolean;
    getCurrentIndex(): number;
    getCurrentElement(): Type;
    moveToFirstElement(): Type;
    next(): Type;
    previous(): Type;
    moveToLastElement(): Type;
    addElement(element: any): List<Type>;
    addElements(elementsToBeAdded: any[]): List<Type>;
    moveToElement(element: any): List<Type>;
    getElementAtIndex(index: number): Type;
    getNeighboringElements(numberOfNeighboringElements: number): any[];
    filter(callback: (value: any, index: number, array: any[]) => any[]): List<Type>;
    map(callback: (value: any, index: number, array: any[]) => any[]): List<Type>;
    sort(callback: (a: any, b: any) => number): List<Type>;
    reduce(callback: (accumulator: any, value: any, index: number, array: any[]) => any): any;
    forEach(callback: (value: any, index: number, array: any[]) => void): void;
    find(callback: (value: any, index: number, array: any[]) => any): any;
}

export default function createList<Type>(initialElements: any[] = []): List<Type> {

    let elements: any[] = initialElements;
    let index: number = 0;

    const minimumIndex: number = 0;
    const {publish}: PubSub = notifications();
    const previous = (): any => getElementAtIndex(moveToIndex(wrapIndexAroundLength(index - 1)));
    const next = (): any => getElementAtIndex(moveToIndex(wrapIndexAroundLength(index + 1)));
    const isEmpty = (): boolean => !elements.length;
    const setIndex = (desiredIndex: number): number => {

        index = desiredIndex;

        return index;
    };
    const wrapIndexAroundLength = (unwrappedIndex: number): number => {

        const length = elements.length;

        if (unwrappedIndex >= length) {

            return unwrappedIndex - length;
        }
        return unwrappedIndex < minimumIndex ? length + unwrappedIndex : unwrappedIndex;
    };
    const getCurrentIndex = (): number => index;
    const getCurrentElement = (): any => getElementAtIndex(index);
    const getElementAtIndex = (desiredIndex: number): any => {

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
    const filter = (callback: (value: any, index: number, array: any[]) => any[]): List<Type> => {

        return copyCurrentList(elements.filter(callback));
    };
    const find = (callback: (value: any, index: number, array: any[]) => any): any => {

        return elements.find(callback);
    };
    const map = (callback: (value: any, index: number, array: any[]) => any[]): List<Type> => {

        return copyCurrentList(elements.map(callback));
    };
    const reduce = (callback: (accumulator: any, value: any, index: number, array: any[]) => any): any => {

        return elements.reduce(callback);
    };
    const forEach = (callback: (value: any, index: number, array: any[]) => void): void => {

        elements.forEach(callback);
    };
    const sort = (callback: (a: any, b: any) => number): List<Type> => {

        const copyOfElements = elements.slice();

        return copyCurrentList(copyOfElements.sort(callback));
    };
    const getNeighboringElements = (numberOfNeighboringElements: number = 1): any[] => {

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
    const addElement = function(element: any): List<Type> {

        elements.push(element);

        return this;
    };
    const addElements = function(elementsToBeAdded: any): List<Type> {

        elements = elements.concat(elementsToBeAdded);

        return this;
    };
    const moveToElement = function(element: any): List<Type> {

        const indexOfDesiredElement: number = elements.indexOf(element);

        if (!isNaN(indexOfDesiredElement)) {

            setIndex(indexOfDesiredElement);
        }

        return this;
    };

    return {

        addElement,
        addElements,
        getCurrentElement,
        getCurrentIndex,
        getElementAtIndex,
        filter,
        find,
        forEach,
        isEmpty,
        map,
        moveToElement,
        moveToFirstElement,
        moveToLastElement,
        getNeighboringElements,
        next,
        previous,
        reduce,
        sort,
    };
}
