import {expect} from "chai";
import range from "../../../../src/tools/array/range";
import cache, {Cache} from "../../../../src/tools/storage/cache";

describe("cache", () => {

  const myUndefined: any = void 0;
  const beginning: number = 1;
  const end: number = 5;
  const testCache: Cache<any> = cache<any>();
  const elementName: string = "thing1";
  const element: string = "whaaa?";
  const elements: string[] = ["1", "2", "3", "4"];
  const numbers: number[] = range(beginning, end);
  const mappingFunction = (value: number): number => value + 1;

  it("Adds elements to cache", () => testCache.add(elementName, element));
  it("Retrieves elements from cache.", () => expect(testCache.get(elementName)).to.equal(element));
  it("Reports whether it contains a key.", () => expect(testCache.contains(elementName)).to.equal(true));
  it("Removes element from cache", () => {

    expect(testCache.remove(elementName)).to.equal(element);
    expect(testCache.get(elementName)).to.equal(myUndefined);
    expect(testCache.contains(elementName)).to.equal(false);
  });
  it("Reports the size of the cache.", () => {

    expect(testCache.size()).to.equal(0);
    elements.forEach((value: any): any => testCache.add(value, value));
    expect(testCache.size()).to.equal(elements.length);
  });
  it("Clears all elements from cache.", () => {
      expect(testCache.size()).to.equal(elements.length);
      testCache.clear();
      expect(testCache.size()).to.equal(0);
      elements.forEach((value: any) => {
        expect(testCache.get(value)).to.equal(myUndefined);
        expect(testCache.contains(value)).to.equal(false);
      });
  });
  it("Can be iterated over with a forEach.", () => {

    let index: number = 0;
    numbers.forEach((value: any): any => testCache.add(value, value));
    testCache.forEach((value: any): void => expect(value).to.equal(numbers[index++]));
  });
  it("Can be mapped.", () => {

    const expected: number[] = numbers.map(mappingFunction);
    const mapped: Cache<any> = testCache.map(mappingFunction);
    numbers.forEach((value: number, index: number): void => {
      expect(mapped.get(`${value}`)).to.equal(expected[index]);
    });
  });
  it("Can be reduced.", () => {

    const reduceFuncton: any = (previous: number, value: number): number => value + previous;
    const expected: number = numbers.reduce(reduceFuncton, 0);
    const reduced: number = testCache.reduce(reduceFuncton, 0);
    expect(reduced).to.equal(expected);
  });
  it("Can be filtered.", () => {

    const pivotPoint: number = 2;
    const filteredOut: number[] = range(beginning, pivotPoint);
    const kept: number[] = range(pivotPoint + 1, end);
    const filterFunction = (value: number): boolean => value > pivotPoint;
    const filtered: Cache<number> = testCache.filter(filterFunction);

    filteredOut.forEach((value: number): void => expect(filtered.contains(`${value}`)).to.equal(false));
    kept.forEach((value: number): void => expect(filtered.contains(`${value}`)).to.equal(true));
  });
  it("Can be searched.", () => {

    const notInCache: number[] = range(6, 10).concat(range(-5, -1));

    numbers.forEach((value: number): void => expect(testCache.find((cached: number): boolean => value === cached))
      .to.equal(value));

    notInCache.forEach((value: number): void => expect(testCache.find((cached: number): boolean => value === cached))
      .to.equal(myUndefined));
  });
});
