import {expect} from "chai";
import binaryHeap, {BinaryHeap} from "../../../../../src/tools/storage/heaps/binaryHeap";

describe("binaryHeap", () => {

  const numberOfTests = 100;
  const newHeap = (): BinaryHeap<number> => binaryHeap<number>((int: number) => int);
  const loadHeap = (heap: BinaryHeap<number>): BinaryHeap<number> => {

    let elements = numberOfTests;

    while (elements--) {

      heap.push(elements);
    }

    return heap;
  };
  const loadedMinHeap = () => loadHeap(newHeap());
  const loadedMaxHeap = () => loadHeap(newHeap().setToMax());

  describe("isEmpty.", () => {

    const heap: BinaryHeap<any> = newHeap();

    expect(heap.isEmpty()).to.equal(true);

    heap.push(numberOfTests);

    expect(heap.isEmpty()).to.equal(false);
  });

  describe("size", () => {

    const heap: BinaryHeap<number> = newHeap();
    let numberOfElements: number = 0;

    it("reports the amount of elements in the heap", () => {

      for (numberOfElements; numberOfElements < numberOfTests; numberOfElements++) {

        heap.push(numberOfElements);

        expect(heap.size()).is.equal(numberOfElements + 1);
      }
    });
  });

  describe("top", () => {

    const heap: BinaryHeap<number> = newHeap();
    let numberOfElements: number = numberOfTests;

    it("returns the first heap element", () => {

      while (numberOfElements--) {

        heap.push(numberOfElements);

        expect(heap.top()).is.equal(numberOfElements);
      }
    });
  });

  describe("push", () => {

    const heap: BinaryHeap<number> = newHeap();
    const values: any = {};
    let value: number = numberOfTests;
    let keys: any[];

    while (value--) {

      values[value] = true;
    }

    keys = Object.keys(values);

    it("adds an element to the heap", () => {

      keys.sort((a, b) => b - a).forEach((key: number) => heap.push(Number(key)));

      while (heap.size()) {

        value = heap.pop();

        delete values[value];
      }

      expect(Object.keys(values).length).to.equal(0);
    });
  });

  describe("pop", () => {

    describe("min heap", () => {

      const heap: BinaryHeap<number> = loadedMinHeap();
      let numberOfElements: number = 0;

      it("removes and returns the smallest heap element", () => {

        for (numberOfElements; numberOfElements < numberOfTests; numberOfElements += 1) {

          expect(heap.pop()).is.equal(numberOfElements);
        }
      });
    });

    describe("max heap", () => {

      const heap: BinaryHeap<number> = loadedMaxHeap();
      let numberOfElements = numberOfTests;

      it("removes and returns the largest heap element", () => {

        while (numberOfElements--) {

          expect(heap.pop()).is.equal(numberOfElements);
          expect(heap.size()).is.equal(numberOfElements);
        }
      });
    });
  });

  describe("forEach", () => {

    it("iterates over each element of the heap in order", () => {

      const heap: BinaryHeap<number> = loadedMinHeap();
      let count = 0;

      heap.forEach((element: number): any => {

        expect(element).is.equal(count++);
      });
    });
  });

  describe("map", () => {

    const heap: BinaryHeap<number> = loadedMinHeap();
    const numberToAdd = 2;

    it("returns a new heap with a function applied to every element", () => {

      const mapped: BinaryHeap<number> = heap.map((element: number): number => element + numberToAdd);

      mapped.forEach((element: number): void => expect(element).to.equal(heap.pop() + numberToAdd));
    });
  });

  describe("filter", () => {

    const heap: BinaryHeap<number> = loadedMaxHeap();
    const halfOfInsertedElements = numberOfTests / 2;

    it("returns a new heap with unwanted values filtered out", () => {

      const filtered: BinaryHeap<number> = heap.filter((element) => element < halfOfInsertedElements);

      expect(filtered.size()).to.equal(halfOfInsertedElements);

      while (filtered.size()) {

        expect(filtered.pop()).to.be.below(halfOfInsertedElements);
      }
    });
  });

  describe("reduce", () => {

    const heap: BinaryHeap<number> = loadedMaxHeap();

    it("combines every heap element with a callback", () => {

      const reduced: number[] = heap
        .reduce((accumulator: number[], element: number): number[] => [element].concat(accumulator), []);

      reduced.forEach((element: number): void => expect(element).to.equal(heap.pop()));
    });
  });

  describe("setToMax", () => {

    const heap: BinaryHeap<number> = loadedMaxHeap();

    it("configures the heap to return its maximum value", () => {

      let prev = heap.pop();
      let current;

      while (heap.size()) {

        current = heap.pop();

        expect(current).to.be.below(prev);

        prev = current;
      }
    });
  });

  describe("setToMin", () => {

    const heap: BinaryHeap<number> = loadedMinHeap();

    it("configures the heap to return its maximum value", () => {

      let prev = heap.pop();
      let current;

      while (heap.size()) {

        current = heap.pop();

        expect(current).to.be.above(prev);

        prev = current;
      }
    });
  });

  describe("isMax", () => {

    const heap = newHeap().setToMax();

    it("reports whether the heap is set to max or not", () => {

      expect(heap.isMax()).to.equal(true);

      heap.setToMin();

      expect(heap.isMax()).to.equal(false);
    });
  });
});
