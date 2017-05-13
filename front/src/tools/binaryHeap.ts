export interface BinaryHeap<HeapElement> {

    size(): number;
    top(): HeapElement;
    pop(): HeapElement;
    forEach(callback: (element: HeapElement) => any): void;
    map(callback: (element: HeapElement) => HeapElement): BinaryHeap<HeapElement>;
    push(value: HeapElement): BinaryHeap<HeapElement>;
    setToMax(): BinaryHeap<HeapElement>;
    setToMin(): BinaryHeap<HeapElement>;
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
        child: number = 2,
        indexOfParent: number = 1,

    ): HeapElement[] => {

        const childIndex: number = child - 1;
        const parentIndex: number = indexOfParent - 1;
        const modifiedHeap: HeapElement[] = currentHeap.slice();

        modifiedHeap[childIndex] = currentHeap[parentIndex];
        modifiedHeap[parentIndex] = currentHeap[childIndex];

        return modifiedHeap;
    };
    const rightIsNextBestHeapElement = (

        currentHeap: HeapElement[],
        leftChildIndex: number,
        rightChildIndex: number,

    ): boolean => {

        const valueOfLeftChild: HeapElement = valueAtIndex(currentHeap, leftChildIndex);
        const valueOfRightChild: HeapElement = valueAtIndex(currentHeap, rightChildIndex);

        return isMaxHeap ?
            valueOfLeftChild > valueOfRightChild :
            valueOfLeftChild < valueOfRightChild;
    };
    const moveElementToPositionInHeap = (value: HeapElement, currentHeap: HeapElement[]): HeapElement[] => {

        const index = currentHeap.length;
        const boundary: number = 1;
        const inBounds = (currentIndex: number): boolean => currentIndex > boundary;

        let modifiedHeap: HeapElement[] = currentHeap.concat([value]);
        let childIndex: number = index;
        let parentIndex: number = parent(childIndex);

        while (inBounds(childIndex) && rightIsNextBestHeapElement(modifiedHeap, childIndex, parentIndex)) {

            modifiedHeap = swapChildWithParent(modifiedHeap, childIndex, parentIndex);
            childIndex = parentIndex;
            parentIndex = parent(childIndex);
        }

        return modifiedHeap;
    };
    const choseIndex = (currentHeap: HeapElement[], rightChildIndex: number, leftChildIndex: number): number => {

        const isInBounds = currentHeap.length > rightChildIndex;

        if (isInBounds && rightIsNextBestHeapElement(currentHeap, leftChildIndex, rightChildIndex)) {

            return rightChildIndex;
        }
        return leftChildIndex;
    };
    const sortHeap = (currentHeap: HeapElement[], index: number): HeapElement[] => {

        let parentIndex = index;
        let childIndex = parentIndex;
        let modifiedHeap = currentHeap.slice();
        let leftChildIndex = leftChild(parentIndex);

        const bounds = currentHeap.length;
        const indexOfLastElement = bounds - 1;

        while (leftChildIndex < bounds) {

            childIndex = choseIndex(modifiedHeap, leftChildIndex, rightChild(parentIndex));
            modifiedHeap = swapChildWithParent(modifiedHeap, childIndex, parentIndex);
            parentIndex = childIndex;
            leftChildIndex = leftChild(parentIndex);
        }

        if (childIndex <= bounds) {

            return modifiedHeap;
        }

        modifiedHeap = swapChildWithParent(modifiedHeap, childIndex, indexOfLastElement);

        return moveElementToPositionInHeap(modifiedHeap[indexOfLastElement], modifiedHeap);
    };
    const removeAndReturnTopElement = (): HeapElement => sortHeap(heap, 1).pop();
    const toSortedArray = (currentHeap: HeapElement[]): HeapElement[] => {

        return currentHeap.slice()
            .map(() => removeAndReturnTopElement());
    };
    const size = (): number => heap.length;
    const top = (): HeapElement => heap[0];
    const pop = (): HeapElement => removeAndReturnTopElement();
    const map = (callback: (element: HeapElement) => HeapElement): BinaryHeap<HeapElement> => {

        const newHeap: BinaryHeap<HeapElement> = binaryHeap<HeapElement>(getValue);

        heap.forEach((element) => newHeap.push(callback(element)));

        return newHeap;
    };
    const forEach = (callback: (element: HeapElement) => any): void => toSortedArray(heap)
        .forEach((element) => callback(element));

    return {
        forEach,
        map,
        pop,
        size,
        top,
        push(value: HeapElement): BinaryHeap<HeapElement> {

            heap = moveElementToPositionInHeap(value, heap);

            return this;
        },
        setToMax(): BinaryHeap<HeapElement> {

            isMaxHeap = true;

            return this;
        },
        setToMin(): BinaryHeap<HeapElement> {

            isMaxHeap = false;

            return this;
        },
    };
}
