import {expect} from "chai";
import keyBoardInput, {KeyBoard} from "../../../src/browser/input/keyboard";
import selector, {SelectionHandler} from "../../../src/browser/menu/selector";
import createList, {ArrayList} from "../../../src/tools/storage/lists/arrayList/list";

interface SelectorMethods<Type> {

  vertical(selectionHandler: any): SelectionHandler<Type>;
  horizontal(selectionHandler: any): SelectionHandler<Type>;
  select(): void;
}

describe("selector", () => {

  const keyboard: KeyBoard = keyBoardInput();
  const arrOne: number[] = [1, 2, 3, 4, 5];
  const arrTwo: number[] = [6, 7, 8, 9, 10];
  const arrThree: number[] = [11, 12, 13, 14, 15];
  const listOne: ArrayList<any> = createList<any>(arrOne);
  const listTwo: ArrayList<any> = createList<any>(arrTwo);
  const listThree: ArrayList<any> = createList<any>(arrThree);
  const combined: ArrayList<number>[] = [listOne, listTwo, listThree];
  const topList: ArrayList<ArrayList<number>> = createList<ArrayList<number>>(combined);
  const reversedList: ArrayList<ArrayList<number>> = createList<ArrayList<number>>(combined.slice().reverse());

  const iterationTest = (
    list: ArrayList<ArrayList<number>>,
    getSelector: () => SelectionHandler<ArrayList<number>>,
  ) => {

    it("Can retrieve it's currently selected element.", () => {

      const select: SelectionHandler<any> = getSelector();
      expect(select.getSelected()).to.equal(listOne);
    });

    it("Will start out disconnected from user input.", () => {

      const select: SelectionHandler<any> = getSelector();
      keyboard.pressLeft();
      keyboard.pressUp();
      expect(select.getSelected()).to.equal(listOne);
    });

    it("Will respond to keyboard input once activated.", () => {

      const select: SelectionHandler<any> = getSelector();
      expect(select.getSelected()).to.equal(listOne);
      select.start();
      keyboard.pressRight();
      expect(select.getSelected()).to.not.equal(listOne);
    });

    it("Stops responding to keyboard input when de-activated.", () => {

      const select: SelectionHandler<any> = getSelector();

      let selected: any = select.getSelected();

      select.start();
      keyboard.pressUp();
      expect(select.getSelected()).to.not.equal(selected);
      selected = select.getSelected();
      select.stop();
      keyboard.pressUp();
      expect(select.getSelected()).to.equal(selected);
    });

    it("Will move between lists horizontally when set to horizontal selection.", () => {

      const select: SelectionHandler<any> = getSelector()
        .selectHorizontally()
        .start();

      list.forEach((_: ArrayList<number>, index: number): any => {

        keyboard.pressRight();
        expect(select.getSelected()).to.equal(list.getElementAtIndex(index + 1));
      });
    });

    it("will move between lists vertically when set to vertical selection.", () => {

      const select: SelectionHandler<any> = getSelector()
        .selectVertically()
        .start();

      list.forEach((_: ArrayList<number>, index: number): any => {

        keyboard.pressDown();
        expect(select.getSelected()).to.equal(list.getElementAtIndex(index + 1));
      });
    });

    it("will move through values of a selected list vertically when set to horizontal selection.", () => {

      const select: SelectionHandler<any> = getSelector()
        .selectVertically()
        .start();

      list.forEach((listElement: ArrayList<number>): any => {

        const length: number = listElement.length();

        let index: number = 1;

        for (index; index < length; index += 1) {

          keyboard.pressDown();
          expect(select.getSelected()).to.equal(listElement.getElementAtIndex(index));
        }

        keyboard.pressRight();
      });
    });

    it("Will move through values of a selected list horizontally when set to vertical selection.", () => {

      const select: SelectionHandler<any> = getSelector()
        .selectVertically()
        .start();

      list.forEach((listElement: ArrayList<number>): any => {

        const length: number = listElement.length();

        let index: number = 1;

        for (index; index < length; index += 1) {

          keyboard.pressRight();
          expect(select.getSelected())
            .to.equal(listElement.getElementAtIndex(index));
        }

        keyboard.pressDown();
      });
    });
  };

  describe("Will operate on settings set from constructor.", () => {

    iterationTest(topList, (): SelectionHandler<ArrayList<number>> => selector(topList));
  });

  describe("Will operate on settings set from setSelections method.", () => {

    iterationTest(reversedList, (): SelectionHandler<ArrayList<number>> => {

      return selector(topList).setSelections(reversedList);
    });
  });

  // TODO implement more tests.
});
