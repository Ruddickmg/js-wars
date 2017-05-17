export interface BinaryHeap<HeapElement> {

    size(): number;
    top(): HeapElement;
    pop(): HeapElement;
    forEach(callback: (element: HeapElement) => any): void;
    filter(callback: (element: HeapElement) => boolean): BinaryHeap<HeapElement>;
    reduce(callback: (init: any, element: HeapElement, heap?: BinaryHeap<HeapElement>) => any, initialValue?: any): any;
    map(callback: (element: HeapElement) => HeapElement): BinaryHeap<HeapElement>;
    push(value: HeapElement): BinaryHeap<HeapElement>;
    setToMax(): BinaryHeap<HeapElement>;
    setToMin(): BinaryHeap<HeapElement>;
    isMax(): boolean;
}

export default function binaryHeap<HeapElement>(

    getValue = (value: HeapElement): HeapElement => value,

): BinaryHeap<HeapElement> {

    let heap: HeapElement[] = [];
    let isMaxHeap: boolean = false;

    const valueAtIndex = (currentHeap: HeapElement[], index: number): HeapElement => getValue(currentHeap[index - 1]);
    const parent = (index: number): number => Math.floor(index / 2);
    const leftChild = (index: number): number => index * 2;
    const rightChild = (index: number): number => leftChild(index) + 1;
    const swapChildWithParent = (

        currentHeap: HeapElement[],
        indexOfChild: number = 2,
        indexOfParent: number = 1,

    ): HeapElement[] => {

        const childIndex: number = indexOfChild - 1;
        const parentIndex: number = indexOfParent - 1;
        const temp = currentHeap[parentIndex];

        currentHeap[parentIndex] = currentHeap[childIndex];
        currentHeap[childIndex] = temp;

        return currentHeap;
    };
    const insertElementIntoHeap = (value: HeapElement, currentHeap: HeapElement[]): HeapElement[] => {

        currentHeap.push(value);

        return moveElementAtIndexIntoPosition(currentHeap, currentHeap.length);
    };
    const moveElementAtIndexIntoPosition = (currentHeap: HeapElement[], index: number) => {

        let childIndex: number = index;
        let parentIndex: number = parent(childIndex);

        while (rightChildIsBestHeapElement(currentHeap, parentIndex, childIndex)) {

            swapChildWithParent(currentHeap, parentIndex, childIndex);
            childIndex = parentIndex;
            parentIndex = parent(childIndex);
        }

        return currentHeap;
    };
    const rightChildIsBestHeapElement = (

        currentHeap: HeapElement[],
        leftChildIndex: number,
        rightChildIndex: number,

    ): boolean => {

        const valueOfLeftChild: HeapElement = valueAtIndex(currentHeap, leftChildIndex);
        const valueOfRightChild: HeapElement = valueAtIndex(currentHeap, rightChildIndex);

        return isMaxHeap ?
            valueOfLeftChild < valueOfRightChild :
            valueOfLeftChild > valueOfRightChild;
    };
    const determineIndexOfBestChild = (

        currentHeap: HeapElement[],
        rightChildIndex: number,
        leftChildIndex: number,

    ): number => {

        const rightIndexIsInBounds = rightChildIndex < currentHeap.length;

        if (rightIndexIsInBounds && rightChildIsBestHeapElement(currentHeap, leftChildIndex, rightChildIndex)) {

            return rightChildIndex;
        }

        return leftChildIndex;
    };

    const heapSort = (currentHeap: HeapElement[], index: number): HeapElement[] => {

        const indexOfLastElement: number = size();

        let parentIndex: number = index;
        let childIndex: number = index;
        let leftChildIndex: number = leftChild(parentIndex);

        while (leftChildIndex < indexOfLastElement) {

            childIndex = determineIndexOfBestChild(currentHeap, leftChildIndex, rightChild(parentIndex));
            swapChildWithParent(currentHeap, childIndex, parentIndex);
            parentIndex = childIndex;
            leftChildIndex = leftChild(parentIndex);
        }

        if (rightChildIsBestHeapElement(currentHeap, indexOfLastElement, childIndex)) {

            swapChildWithParent(currentHeap, childIndex, indexOfLastElement);
            moveElementAtIndexIntoPosition(currentHeap, childIndex);
        }

        return currentHeap;
    };
    const top = (): HeapElement => heap[0];
    const pop = (): HeapElement => {

        heap = heapSort(heap, 1);

        return heap.pop();
    };
    const size = (): number => heap.length;
    const cloneHeap = (): BinaryHeap<HeapElement> => {

        const newHeap: BinaryHeap<HeapElement> = binaryHeap<HeapElement>(getValue);
        let indexOfHeapElement: number = size();

        while (indexOfHeapElement--) {

            newHeap.push(heap[indexOfHeapElement]);
        }

        return newHeap;
    };
    const reduce = (

        callback: (accumulator: any, element: HeapElement, heap?: BinaryHeap<HeapElement>) => any,
        initialValue?: any,

    ): any => {

        const clonedHeap: BinaryHeap<HeapElement> = cloneHeap();
        const numberOfHeapElements = size();
        let indexOfHeapElement = 0;
        let accumulator: any = initialValue;

        for (indexOfHeapElement; indexOfHeapElement < numberOfHeapElements; indexOfHeapElement += 1) {

            accumulator = callback(accumulator, clonedHeap.pop(), clonedHeap);
        }

        return accumulator;
    };

    const map = (callback: (element: HeapElement) => HeapElement): BinaryHeap<HeapElement> => {

        const newHeap: BinaryHeap<HeapElement> = binaryHeap<HeapElement>(getValue);
        let indexOfHeapElement: number = size();

        while (indexOfHeapElement--) {

            newHeap.push(callback(heap[indexOfHeapElement]));
        }

        return newHeap;
    };

    const filter = (callback: (element: HeapElement) => boolean): BinaryHeap<HeapElement> => {

        const newHeap: BinaryHeap<HeapElement> = binaryHeap<HeapElement>(getValue);
        let indexOfHeapElement: number = size();
        let heapElement: HeapElement;

        while (indexOfHeapElement--) {

            heapElement = heap[indexOfHeapElement];

            if (callback(heapElement)) {

                newHeap.push(heapElement);
            }
        }

        return newHeap;
    };

    const forEach = (callback: (element: HeapElement) => any): void => {

        reduce((_: any, element: HeapElement) => callback(element));
    };

    const push = function(value: HeapElement): BinaryHeap<HeapElement> {

        heap = insertElementIntoHeap(value, heap);

        return this;
    };

    const setToMax = function(): BinaryHeap<HeapElement> {

        isMaxHeap = true;

        return this;
    };

    const setToMin = function(): BinaryHeap<HeapElement> {

        isMaxHeap = false;

        return this;
    };

    const isMax = (): boolean => isMaxHeap;

    return {

        forEach,
        filter,
        reduce,
        map,
        pop,
        size,
        top,
        push,
        setToMax,
        setToMin,
        isMax,
    };
}
