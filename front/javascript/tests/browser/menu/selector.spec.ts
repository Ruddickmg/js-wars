import {expect} from "chai";
import keyBoardInput, {KeyBoard} from "../../../src/browser/input/keyboard";
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

interface Selection<Type> extends SelectorMethods<Type> {

  getSelected(): Type;
  select(): void;
  start(): Selection<Type>;
}

describe("selector", () => {

  const keyBoard: KeyBoard = keyBoardInput();
  const listOne: ArrayList<any> = createList<any>([1, 2, 3, 4, 5]);
  const listTwo: ArrayList<any> = createList<any>([6, 7, 8, 9, 10]);
  const listThree: ArrayList<any> = createList<any>([11, 12, 13, 14, 15]);
  const topList: ArrayList<any> = createList<any>([listOne, listTwo, listThree]);
  const select: SelectionHandler<any> = selector(topList);

  it("Can retrieve it's currently selected element.", () => {

    expect(select.getSelected()).to.equal(listOne);
  });

  it("Will start out disconnected from user input.", () => {

    keyBoard.pressLeft();
    keyBoard.pressUp();
    expect(select.getSelected()).to.equal(listOne);
  });

  // TODO implement more tests.
});
