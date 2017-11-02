import {expect} from "chai";
import selector, {SelectionHandler} from "../../../src/browser/menu/selector";
import createList, {ArrayList} from "../../../src/tools/storage/lists/arrayList/list";

interface SelectorMethods<Type> {

  selectVertically(): SelectionHandler<Type>;
  selectHorizontally(): SelectionHandler<Type>;
  setSelections(selections: ArrayList<Type>): SelectionHandler<Type>;
  vertical(selectionHandler: any): SelectionHandler<Type>;
  horizontal(selectionHandler: any): SelectionHandler<Type>;
  stop(): SelectionHandler<Type>;
}

interface Selectio<Type> extends SelectorMethods<Type> {

  getSelected(): Type;
  select(): void;
  start(): Selectio<Type>;
}

describe("selector", () => {

  const topList: ArrayList<any> = createList<any>();
  const listOne: ArrayList<any> = createList<any>([1, 2, 3, 4, 5]);
  const listTwo: ArrayList<any> = createList<any>([6, 7, 8, 9, 10]);
  const listThree: ArrayList<any> = createList<any>([11, 12, 13, 14, 15]);
  const select: SelectionHandler<any> = selector();

  topList.addElements([listOne, listTwo, listThree]);

  it("Can have selections set for itself.", () => {

    select.setSelections(topList);

    expect(select.getSelected()).to.equal(1);
  });

  // TODO implement tests.
});
