export interface List {

    isEmpty(): boolean;
    getCurrentIndex(): number;
    getCurrentElement(): any;
    moveToFirstElement(): any;
    next(): any;
    previous(): any;
    moveToLastElement(): any;
    addElement(element: any): List;
    addElements(elementsToBeAdded: any[]): List;
    moveToElement(property: any): List;
    filter(callback: (value: any, index: number, array: any[]) => any[]): List;
    map(callback: (value: any, index: number, array: any[]) => any[]): List;
    sort(callback: (a: any, b: any) => number): List;
    reduce(callback: (accumulator: any, value: any, index: number, array: any[]) => any): any;
    forEach(callback: (value: any, index: number, array: any[]) => void): void;
    find(callback: (value: any, index: number, array: any[]) => any): any;
    getNeighboringElements(numberOfNeighboringElements: number): any[];
}

export default function createList(initialElements: any[]= []): List {

    let elements: any[] = initialElements;
    let index: number = 0;
    const minimumIndex: number = 0;

    // consider option to toggle wrap around behavior
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

        return elements[desiredIndex];
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

    const copyCurrentList = (desiredElements: any[]): List => {

        const current = getElementAtIndex(index);

        return createList(desiredElements).moveToElement(current);
    };

    const filter = (callback: (value: any, index: number, array: any[]) => any[]): List => {

        return copyCurrentList(elements.filter(callback));
    };

    const find = (callback: (value: any, index: number, array: any[]) => any): any => {

        return elements.find(callback);
    };

    const map = (callback: (value: any, index: number, array: any[]) => any[]): List => {

        return copyCurrentList(elements.map(callback));
    };

    const reduce = (callback: (accumulator: any, value: any, index: number, array: any[]) => any): any => {

        return elements.reduce(callback);
    };

    const forEach = (callback: (value: any, index: number, array: any[]) => void): void => {

        elements.forEach(callback);
    };

    const sort = (callback: (a: any, b: any) => number): List => {

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

        let indexOfNeighbor = index - numberOfNeighboringElements;
        let wrappedIndex;
        let neighbor;

        if (notEnoughElementsInList) {

            throw new Error(`Not enough elements in list to accommodate ${numberOfNeighboringElements} neighbors`);
        }

        for (indexOfNeighbor; indexOfNeighbor <= length; indexOfNeighbor += 1) {

            wrappedIndex = wrapIndexAroundLength(indexOfNeighbor);
            neighbor = elements[wrappedIndex];

            currentAndNeighboringElements.push(neighbor);
        }

        return currentAndNeighboringElements;
    };

    const addElement = function(element: any): List {

        elements.push(element);

        return this;
    };

    const addElements = function(elementsToBeAdded: any[]): List {

        elements = elements.concat(elementsToBeAdded);

        return this;
    };

    const moveToElement = function(element: any): List {

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
