import {expect} from "chai";
import createElement, {Element} from "../../../src/browser/dom/element/element";
import createScroller, {Scroller} from "../../../src/browser/effects/scrolling";
import range from "../../../src/tools/array/range";
import createList, {ArrayList} from "../../../src/tools/storage/lists/arrayList/list";

describe("scrolling", () => {
  const elements: Element<number>[] = range(1, 10)
    .map((value: number): Element<number> => {
      return createElement<number>(`element#${value}`, `div`)
        .setValue(value);
    });
  const displayStyle: string = "none";
  const empty: string = "";
  const lowBufferPoint: number = 2;
  const highBufferPoint: number = 7;
  const buffer: number = 1;
  const numberOfElements: number = 5;
  const lowRange: number[] = range(-1, 5);
  const highRange: number[] = range(4, 10);
  const checkRange = (list: ArrayList<Element<number>>, specified: number[]) => {
    const specifiedRange: number[] = specified.slice();
    const beforeBuffer: number = specifiedRange.shift();
    const afterBuffer: number = specifiedRange.pop();
    expect(list.getElementAtIndex(beforeBuffer).element.style.display).to.equal(displayStyle);
    expect(list.getElementAtIndex(afterBuffer).element.style.display).to.equal(displayStyle);
    specifiedRange.forEach((index: number): any => {
      expect(list.getElementAtIndex(index).element.style.display).to.equal(empty);
    });
  };
  let scroller: Scroller;
  let list: ArrayList<Element<number>>;
  beforeEach(() => {
    elements.forEach((element: Element<number>): any => element.hide());
    list = createList<Element<number>>(elements);
    scroller = createScroller(numberOfElements, buffer, list);
  });
  it("Keeps a buffer from the edges moving downward.", () => {
    const length: number = list.length();
    let index: number = 0;
    for (index; index < length; index++) {
      if (index > highBufferPoint) {
        checkRange(list, highRange);
      } else if (index > lowBufferPoint) {
        checkRange(list, range(index - 4, index + 2));
      } else {
        checkRange(list, lowRange);
      }
      [list, scroller].forEach((movement: any): any => movement.next());
    }
  });
  it("Keeps a buffer from the edges moving upward.", () => {
    let index: number = list.length();
    [list, scroller].forEach((movement: any): any => movement.previous());
    while (index--) {
      if (index >= highBufferPoint) {
        checkRange(list, highRange);
      } else if (index >= lowBufferPoint) {
        checkRange(list, range(index + 4, index - 2));
      } else {
        checkRange(list, lowRange);
      }
      [list, scroller].forEach((movement: any): any => movement.previous());
    }
  });
  it("Wraps around when passed endpoint moving downwards.", () => {
    let lastIndex: number = list.length() - 1;
    checkRange(list, lowRange);
    while (lastIndex--) {
      [list, scroller].forEach((movement: any): any => movement.next());
    }
    checkRange(list, highRange);
    [list, scroller].forEach((movement: any): any => movement.next());
    checkRange(list, lowRange);
  });
  it("Wraps around when passed endpoint moving downwards.", () => {
    checkRange(list, lowRange);
    [list, scroller].forEach((movement: any): any => movement.previous());
    checkRange(list, highRange);
  });
});
