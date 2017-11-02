import {expect} from "chai";
import range from "../../../../../../src/tools/array/range";
import singlyLinkedList, {SinglyLinkedList} from "../../../../../../src/tools/storage/lists/linkedList/single/list";
// import doublyLinkedList from "../../../../../../src/tools/storage/lists/linkedList/single/list";

describe("linkedList", () => {

  const single: SinglyLinkedList<any> = singlyLinkedList<any>();
  const testList = function(list: SinglyLinkedList<any>, type: string) {

    const firstEntry: number = 1;
    const secondEntry: number = 4;
    const values: number[] = range(1, 20);

    describe(type, () => {

      it("Start empty.", () => {

        expect(list.isEmpty()).to.equal(true);
      });

      it("Push an element into the list and no longer be empty.", () => {

        list.push(firstEntry);

        expect(list.isEmpty()).to.equal(false);
      });

      it("Retrieve the pushed element.", () => {

        expect(list.back()).to.equal(firstEntry);
      });

      it("Shift and retrieve a value on the front of a list.", () => {

        list.unshift(secondEntry);
        expect(list.front()).to.equal(secondEntry);
      });

      it("Remove from the back of the list.", () => {

        expect(list.pop()).to.equal(firstEntry);
        expect(list.back()).to.equal(secondEntry);
      });

      it("Report length of list.", () => {

        expect(list.length()).to.equal(1);
      });

      it("Remove from the front of the list and report being empty.", () => {

        expect(list.shift()).to.equal(secondEntry);
        expect(list.isEmpty()).to.equal(true);
      });

      it("Fold values.", () => {

        const reduceFunction = (container: number, value: number): number => container + value;
        const reducedValue: number = values.reduce(reduceFunction, 0);
        values.forEach((value: number): any => list.push(value));
        expect(list.reduce(reduceFunction, 0)).to.equal(reducedValue);
      });

      it("Iterates via a forEach method.", () => {

        let index: number = 0;

        list.forEach((value: number): any => expect(value).to.equal(values[index++]));
      });

      it("Can be filtered.", () => {

        const filtered: SinglyLinkedList<any> = list.filter((value: number): boolean => value > secondEntry);
        expect(filtered.length()).to.equal(list.length() - secondEntry);
      });

      it("Map values", () => {

        const mappingFunction = (value: number): number => value + value;
        const mapped: number[] = values.map(mappingFunction);
        let index: number = 0;
        list.map(mappingFunction).forEach((value: number): any => expect(value).to.equal(mapped[index++]));
      });

      it("Search list.", () => {

        [-1, 0, 21, 22, 23].forEach((value: number): void => {

          expect(list.find((value2: number): boolean => value === value2)).to.equal(undefined);
        });

        values.forEach((value: number): void => {

          expect(list.find((value2: number): boolean => value === value2)).to.equal(value);
        });
      });

      it("Reverses.", () => {

        let index = list.length() - 1;
        list.reverse().forEach((value: number) => expect(value).to.equal(values[index--]));
      });

      it("Clear list.", () => {

        expect(list.isEmpty()).to.equal(false);
        list.clear();
        expect(list.isEmpty()).to.equal(true);
      });
    });
  };

  testList(single, "singlyLinkedList");
});
