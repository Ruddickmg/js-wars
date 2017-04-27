"use strict";

function binaryHeap(getValue = (number) => number) {

    let
        heap = [],
        isMaxHeap = false;

    const
        valueAtIndex = (currentHeap, index) => getValue(currentHeap[index - 1]),
        parent = (index) => Math.floor(index / 2),
        leftChild = (index) => index * 2,
        rightChild = (index) => leftChild(index) + 1,
        swapChildWithParent = (currentHeap, child=2, parent=1) => {

            const
                childIndex = child - 1,
                parentIndex = parent - 1,
                modifiedHeap = currentHeap.slice();

            modifiedHeap[childIndex] = currentHeap[parentIndex];
            modifiedHeap[parentIndex] = currentHeap[childIndex];

            return modifiedHeap;
        },
        inequality = (heap, leftChildIndex, rightChildIndex) => {

            const
                valueOfLeftChild = valueAtIndex(heap, leftChildIndex),
                valueOfRightChild = valueAtIndex(heap, rightChildIndex);

            return isMaxHeap ?
                valueOfLeftChild > valueOfRightChild:
                valueOfLeftChild < valueOfRightChild;
        },
        moveElementToPositionInHeap = (value, currentHeap, index) => {

            let
                boundary = 1,
                childIndex = index,
                modifiedHeap = currentHeap.slice(),
                parentIndex = parent(childIndex),
                inBounds = (index) => index > boundary;

            while (inBounds(childIndex) && inequality(modifiedHeap, childIndex, parentIndex)) {

                modifiedHeap = swapChildWithParent(modifiedHeap, childIndex, parentIndex);
                childIndex = parentIndex;
                parentIndex = parent(childIndex);
            }

            return modifiedHeap;
        },
        choseIndex = (currentHeap, rightChildIndex, leftChildIndex) => {

            const isInBounds = currentHeap.length > rightChildIndex;

            if (isInBounds && inequality(currentHeap, leftChildIndex, rightChildIndex)) {

                return rightChildIndex;
            }

            return leftChildIndex;
        },
        sortHeap = (currentHeap, index) => {

            const bounds = currentHeap.length;

            let
                parentIndex = index,
                childIndex = parentIndex,
                modifiedHeap = currentHeap.slice(),
                leftChildIndex = leftChild(parentIndex);

            while (leftChildIndex < bounds) {

                childIndex = choseIndex(modifiedHeap, leftChild(parentIndex), rightChild(parentIndex));
                modifiedHeap = swapChildWithParent(modifiedHeap, childIndex, parentIndex);
                parentIndex = childIndex;
            }

            if (childIndex <= bounds) {

                return modifiedHeap;
            }

            modifiedHeap = swapChildWithParent(modifiedHeap, childIndex, bounds);

            return moveElementToPositionInHeap(modifiedHeap[bounds], modifiedHeap, bounds);
        },
        removeAndReturnTopElement = () => sortHeap(heap, 1).pop(),
        toSortedArray = (heap) => {

            const sortedArray = heap.map(() => removeAndReturnTopElement());

            sortedArray.forEach((element) => heap.push(element));

            return sortedArray;
        };

    return {

        size: () => heap.length,
        top: () => heap[0],
        pop: () => removeAndReturnTopElement(),
        forEach: (callback) => toSortedArray(heap).forEach((element) => callback(element)),
        map(callback) {

            const newHeap = binaryHeap(getValue);

            heap.forEach((element) => newHeap.push(callback(element)));

            return newHeap;
        },
        push(value) {

            heap = moveElementToPositionInHeap(value, heap, heap.length);

            return this;
        },
        setToMax() {

            isMaxHeap = true;

            return this;
        },
        setToMin() {

            isMaxHeap = false;

            return this;
        },
        clear() {

            heap = [];

            return this;
        }
    };
}

module.exports = binaryHeap;