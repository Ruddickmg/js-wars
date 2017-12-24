import {expect} from "chai";
import createList, {ArrayList} from "../../../../../src/tools/storage/lists/arrayList/list";

describe("arrayList", () => {
  const pivotPoint: number = 2;
  const notInList: number = 5;
  const firstElement: number = 1;
  const secondElement: number = 2;
  const thirdElement: number = 3;
  const fourthElement: number = 4;
  const elementsToAdd: number[] = [
    secondElement,
    thirdElement,
    fourthElement,
  ];
  const values: number[] = [firstElement].concat(elementsToAdd);
  let list: ArrayList<any>;
  beforeEach(() => {
    list = createList<any>();
  });
  it("Starts out empty.", () => expect(list.isEmpty()).to.equal(true));
  it("Adds an element to the list.", () => {
    list.addElement(firstElement);
    expect(list.isEmpty()).to.equal(false);
  });
  it("Retrieves an element from a specified position (index) in the list.", () => {
    const indexOfFirstElement: number = 0;
    list.addElement(firstElement);
    expect(list.getElementAtIndex(indexOfFirstElement)).to.equal(firstElement);
  });
  it("Can add multiple elements at a time.", () => {
    list.addElements(values);
    expect(list.getElementAtIndex(1)).to.equal(secondElement);
    expect(list.getElementAtIndex(2)).to.equal(thirdElement);
    expect(list.getElementAtIndex(3)).to.equal(fourthElement);
  });
  it("Reports its length.", () => {
    list.addElements(values);
    expect(list.length()).to.equal(4);
  });
  it("Can move forward through the list.", () => {
    list.addElements(values);
    expect(list.next()).to.equal(secondElement);
    expect(list.next()).to.equal(thirdElement);
    expect(list.next()).to.equal(fourthElement);
  });
  it("Can move backward through the list.", () => {
    list.addElements(values);
    expect(list.previous()).to.equal(fourthElement);
  });
  it("Report its current index.", () => {
    list.addElements(values);
    list.next();
    list.next();
    expect(list.getCurrentIndex()).to.equal(2);
  });
  it("Return its currently selected element.", () => {
    list.addElements(values);
    expect(list.getCurrentElement()).to.equal(firstElement);
  });
  it("Can move to its first element.", () => {
    list.addElements(values);
    list.next();
    expect(list.moveToFirstElement()).to.equal(firstElement);
  });
  it("Can move to its last element.", () => {
    list.addElements(values);
    expect(list.moveToLastElement()).to.equal(fourthElement);
  });
  it("Can find an index based on the return of a callback", () => {
    list.addElements(values);
    expect(list.findIndex((element: any) => element === thirdElement)).to.equal(2);
  });
  it("Can move to a specified element.", () => {
    let currentIndex: number;
    list.addElements(values);
    currentIndex = list.findIndex((element: any): boolean => element === thirdElement);
    expect(currentIndex).to.equal(2);
  });
  it("Can retrieve neighboring elements", () => {
    const expectedNeighbors: number[] = [firstElement, secondElement, thirdElement];
    let neighbors: number[];
    list.addElements(values);
    list.next();
    neighbors = list.getNeighboringElements(1);
    expect(expectedNeighbors).to.deep.equal(neighbors);
  });
  it("Can retrieve a random element.", () => {
    list.addElements(values);
    expect(values).to.contain(list.getRandom());
  });
  it("Can be sorted.", () => {
    const comparisonFunction = (a: number, b: number): number => b - a;
    let sortedArrayList: ArrayList<any>;
    const reversedValues: number[] = values.slice().sort(comparisonFunction);
    list.addElements(values);
    sortedArrayList = list.sort(comparisonFunction);
    reversedValues.forEach((value: number, index: number): void => {
      expect(sortedArrayList.getElementAtIndex(index)).to.equal(value);
    });
  });
  it("Can have specified portions of it modified.", () => {
    const modification: number = 2;
    const beginningIndex: number = 1;
    const endingIndex: number = 2;
    const modifyFunction = (value: number): number => value + modification;
    const modifiedList: ArrayList<any> = list.modify(modifyFunction, beginningIndex, endingIndex);
    modifiedList.forEach((value: number, index: number): void => {
      const valueAtIndex: number = list.getElementAtIndex(index);
      const expectedValue: number = index >= beginningIndex && index <= endingIndex ?
        modifyFunction(valueAtIndex) :
        valueAtIndex;
      expect(value).to.equal(expectedValue);
    });
  });
  it("Can be reduced.", () => {
    const reduceFunction = (total: number, value: number): number => total + value;
    const reducedValues: number = values.reduce(reduceFunction, 0);
    let reducedMatrix: number;
    list.addElements(values);
    reducedMatrix = list.reduce(reduceFunction, 0);
    expect(reducedMatrix).to.equal(reducedValues);
  });
  it("Can be iterated over with a forEach.", () => {
    list.addElements(values);
    list.forEach((value: number, index: number): any => expect(value).to.equal(values[index]));
  });
  it("Can be mapped.", () => {
    const mapFunction = (value: number): number => value * value;
    let mapped: ArrayList<any>;
    list.addElements(values);
    mapped = list.map(mapFunction);
    mapped.forEach((value: number, index: number): any => expect(value).to.equal(mapFunction(values[index])));
  });
  it("Can be filtered.", () => {
    const filterFunction = (value: number): boolean => value > pivotPoint;
    const filteredOut: number[] = [];
    const kept: number[] = [];
    let size: number;
    let filtered: ArrayList<any>;
    list.addElements(values);
    size = list.length();
    filtered = list.filter(filterFunction);
    list.forEach((value: number): any => filterFunction(value) ? kept.push(value) : filteredOut.push(value));
    kept.forEach((value: number, index: number): any => expect(filtered.getElementAtIndex(index)).to.equal(value));
    expect(filtered.length()).to.equal(size - filteredOut.length);
  });
  it("Can be searched.", () => {
    list.addElements(values);
    expect(list.find((value: number): boolean => value === pivotPoint)).to.equal(pivotPoint);
    expect(list.find((value: number): boolean => value > notInList)).to.equal(undefined);
  });
});
