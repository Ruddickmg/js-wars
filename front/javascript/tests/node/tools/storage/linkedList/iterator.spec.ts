import {expect} from "chai";
import range from "../../../../../src/tools/array/range";
import {LinkedListIterator} from "../../../../../src/tools/storage/linkedList/single/iterator";
import linkedList, {SinglyLinkedList} from "../../../../../src/tools/storage/linkedList/single/list";
import {LinkedListNode} from "../../../../../src/tools/storage/linkedList/single/node";

describe("iterator", () => {

  const singlyLinkedList: SinglyLinkedList<any> = linkedList<any>();
  const values: number[] = range(1, 10);
  const insertedBefore: number = -1;
  const insertedAfter: number = -2;
  const loadList = (list: SinglyLinkedList<any>): SinglyLinkedList<any> => {

    values.forEach((value: number): any => list.push(value));

    return list;
  };
  const singlyLinkedIteratorTest = (list: SinglyLinkedList<any>): void => {

    it("Returns the current node.", () => {

      const iterator: LinkedListIterator<any> = list.iterator();

      iterator.next();

      expect(iterator.current().value).to.equal(values[0]);
    });

    it("Returns the value of the current node", () => {

      const iterator: LinkedListIterator<any> = list.iterator();

      iterator.next();

      expect(iterator.value()).to.equal(values[0]);
    });

    it("Inserts into list before the iterators current position.", () => {

      const iterator: LinkedListIterator<any> = list.iterator();
      const iteratorTwo: LinkedListIterator<any> = list.iterator();

      iterator.next();
      iterator.insertBefore(insertedBefore);
      iteratorTwo.next();
      expect(iteratorTwo.value()).to.equal(insertedBefore);
      values.unshift(insertedBefore);
    });

    it("Inserts into list after the iterators current position.", () => {

      const iterator: LinkedListIterator<any> = list.iterator();
      const iteratorTwo: LinkedListIterator<any> = list.iterator();

      iterator.insert(insertedAfter);
      iteratorTwo.next();

      expect(iteratorTwo.value()).to.equal(insertedAfter);
      values.unshift(insertedAfter);
    });

    it("Iterates through each element in the list.", () => {

      const iterator: LinkedListIterator<any> = list.iterator();
      const end: LinkedListNode<any> = iterator.end();

      let index: number = 0;

      while (iterator.next() !== end) {

        expect(iterator.value()).to.equal(values[index++]);
      }
    });

    it("Can remove the node at the iterators current position.", () => {

      const iterator: LinkedListIterator<any> = list.iterator();
      const iteratorTwo: LinkedListIterator<any> = list.iterator();

      iterator.next();
      expect(iterator.remove().value).to.equal(insertedAfter);
      iteratorTwo.next();
      expect(iteratorTwo.value()).to.equal(insertedBefore);
    });
  };

  singlyLinkedIteratorTest(loadList(singlyLinkedList));
});
