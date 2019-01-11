import {expect} from "chai";
import keyBoardInput, {KeyBoard} from "../../../../src/browser/input/keyboard";
import selector, {SelectionHandler} from "../../../../src/browser/menu/selectors/twoDimensionalSelector";
import createList, {ArrayList} from "../../../../src/tools/storage/lists/arrayList/list";

describe("selector", () => {
  const keyboard: KeyBoard = keyBoardInput();
  const arrOne: number[] = [1, 2, 3, 4, 5];
  const arrTwo: number[] = [6, 7, 8, 9, 10];
  const arrThree: number[] = [11, 12, 13, 14, 15];
  const listOne: ArrayList<any> = createList<any>(arrOne);
  const listTwo: ArrayList<any> = createList<any>(arrTwo);
  const listThree: ArrayList<any> = createList<any>(arrThree);
  const combined: ArrayList<number>[] = [listOne, listTwo, listThree];
  const normalList: ArrayList<ArrayList<number>> = createList<ArrayList<number>>(combined);
  const reversedList: ArrayList<ArrayList<number>> = createList<ArrayList<number>>(combined.slice().reverse());
  const reset = (list: ArrayList<ArrayList<number>>): any => {
    list.forEach((element: ArrayList<number>): any => element.moveToFirstElement());
    list.moveToFirstElement();
  };
  const iterationTest = (
    list: ArrayList<ArrayList<number>>,
    getSelector: () => SelectionHandler<ArrayList<number>>,
    first: ArrayList<number>,
  ) => {
    it("Can retrieve it's currently selected element.", () => {
      const select: SelectionHandler<any> = getSelector();
      expect(select.getSelected()).to.equal(first);
    });
    it("Will start out disconnected from user input.", () => {
      const select: SelectionHandler<any> = getSelector();
      keyboard.pressLeft();
      keyboard.pressUp();
      expect(select.getSelected()).to.equal(first);
      keyboard.releaseUp();
      keyboard.releaseLeft();
    });
    it("Will respond to keyboard input once activated.", () => {
      const select: SelectionHandler<any> = getSelector();
      expect(select.getSelected()).to.equal(first);
      select.listen();
      keyboard.pressRight();
      expect(select.getSelected()).to.not.equal(first);
      keyboard.clearPressedKeys();
      select.stop();
    });
    it("Stops responding to keyboard input when de-activated.", () => {
      const select: SelectionHandler<any> = getSelector();
      let selected: any;
      selected = select.getSelected();
      select.listen();
      keyboard.pressRight();
      expect(select.getSelected()).to.not.equal(selected);
      selected = select.getSelected();
      select.stop();
      keyboard.pressUp();
      expect(select.getSelected()).to.equal(selected);
      keyboard.clearPressedKeys();
    });
    it("Will move between list footerElements horizontally when set to horizontal selection.", () => {
      const select: SelectionHandler<any> = getSelector()
        .selectHorizontally()
        .listen();
      list.forEach((_: ArrayList<number>, index: number): any => {
        keyboard.pressRight();
        expect(select.getSelected()).to.equal(list.getElementAtIndex(index + 1));
        keyboard.releaseRight();
      });
      select.stop();
    });
    it("will move between list footerElements vertically when set to vertical selection.", () => {
      const select: SelectionHandler<any> = getSelector()
        .selectVertically()
        .listen();
      list.forEach((_: ArrayList<number>, index: number): any => {
        const indexOfNextElement: number = index + 1;
        keyboard.pressDown();
        expect(select.getSelected())
          .to.equal(list.getElementAtIndex(indexOfNextElement));
        keyboard.releaseDown();
      });
      select.stop();
    });
    it("will move vertically through values of a selected list when set horizontal selection.", () => {
      const select: SelectionHandler<any> = getSelector()
        .selectHorizontally()
        .listen();
      list.forEach((listElement: ArrayList<number>): any => {
        const length: number = listElement.length();
        let index: number = 1;
        for (index; index < length; index += 1) {
          keyboard.pressDown();
          expect(select.getSelected())
            .to.equal(listElement.getElementAtIndex(index));
          keyboard.releaseDown();
        }
        keyboard.pressRight();
        keyboard.releaseRight();
      });
      select.stop();
    });
    it("Will move through values of a selected list horizontally when set to vertical selection.", () => {
      const select: SelectionHandler<any> = getSelector()
        .selectVertically()
        .listen();
      list.forEach((listElement: ArrayList<number>): any => {
        const length: number = listElement.length();
        let index: number = 1;
        for (index; index < length; index += 1) {
          keyboard.pressRight();
          expect(select.getSelected())
            .to.equal(listElement.getElementAtIndex(index));
          keyboard.releaseRight();
        }
        keyboard.pressDown();
        keyboard.releaseDown();
      });
      select.stop();
    });
    it("Can switch between vertical and horizontal selection.", () => {
      const select: SelectionHandler<any> = getSelector()
        .selectHorizontally()
        .listen();
      const length: number = list.getElementAtIndex(0).length();
      const halfWay: number = Math.round(length / 2);
      let index: number = 1;
      for (index; index < length; index += 1) {
        keyboard.pressDown();
        expect(select.getSelected())
          .to.equal(list.getElementAtIndex(0).getElementAtIndex(index));
        keyboard.releaseDown();
      }
      keyboard.pressDown();
      keyboard.pressRight();
      keyboard.clearPressedKeys();
      index = 1;
      for (index; index < halfWay; index += 1) {
        keyboard.pressDown();
        expect(select.getSelected())
          .to.equal(list.getElementAtIndex(1).getElementAtIndex(index));
        keyboard.releaseDown();
      }
      select.selectVertically();
      for (index; index < length; index += 1) {
        keyboard.pressRight();
        expect(select.getSelected())
          .to.equal(list.getElementAtIndex(1).getElementAtIndex(index));
        keyboard.releaseRight();
      }
      keyboard.pressRight();
      keyboard.pressDown();
      keyboard.clearPressedKeys();
      select.selectHorizontally();
      index = 1;
      for (index; index < length; index += 1) {
        keyboard.pressDown();
        expect(select.getSelected())
          .to.equal(list.getElementAtIndex(2).getElementAtIndex(index));
        keyboard.releaseDown();
      }
      keyboard.pressDown();
      keyboard.releaseDown();
      select.selectVertically();
      keyboard.pressDown();
      keyboard.releaseDown();
      expect(select.getSelected()).to.equal(list.getElementAtIndex(0));
      select.selectHorizontally();
      keyboard.pressRight();
      keyboard.releaseRight();
      expect(select.getSelected()).to.equal(list.getElementAtIndex(1));
      select.selectVertically();
      index = 1;
      for (index; index < halfWay; index += 1) {
        keyboard.pressRight();
        expect(select.getSelected())
          .to.equal(list.getElementAtIndex(1).getElementAtIndex(index));
        keyboard.releaseRight();
      }
      select.selectHorizontally();
      for (index; index < length; index += 1) {
        keyboard.pressDown();
        expect(select.getSelected())
          .to.equal(list.getElementAtIndex(1).getElementAtIndex(index));
        keyboard.releaseDown();
      }
      select.stop();
    });
    it("Can have callbacks set to be called on its movements when selecting vertically.", () => {
      const firstElement = list.getElementAtIndex(0);
      const secondElement = list.getElementAtIndex(1);
      const select: SelectionHandler<ArrayList<number>> = getSelector().selectVertically()
        .vertical((current: any, previous: any, selections: any) => {
          expect(previous).to.equal(firstElement);
          expect(current).to.equal(secondElement);
          expect(selections).to.equal(list);
        })
        .horizontal((current: any, previous: any, selections: any): any => {
          expect(previous).to.equal(firstElement.getElementAtIndex(0));
          expect(current).to.equal(firstElement.getElementAtIndex(1));
          expect(selections).to.equal(firstElement);
        })
        .listen();
      keyboard.pressRight();
      keyboard.pressDown();
      select.stop();
    });
    it("Can have callbacks set to be called on its movements when selecting horizontally.", () => {
      const firstElement = list.getElementAtIndex(0);
      const secondElement = list.getElementAtIndex(1);
      const select: SelectionHandler<ArrayList<number>> = getSelector().selectHorizontally()
        .horizontal((current: any, previous: any, selections: any) => {
          expect(previous).to.equal(firstElement);
          expect(current).to.equal(secondElement);
          expect(selections).to.equal(list);
        })
        .vertical((current: any, previous: any, selections: any): any => {
          expect(previous).to.equal(firstElement.getElementAtIndex(0));
          expect(current).to.equal(firstElement.getElementAtIndex(1));
          expect(selections).to.equal(firstElement);
        })
        .listen();
      keyboard.pressDown();
      keyboard.pressRight();
      select.stop();
    });
  };
  const singleDimensionLists = (testSelector: SelectionHandler<number>) => {
    it("will ignore counter directional key presses when not dealing with a multidimensional list", () => {
      testSelector.selectHorizontally().listen();
      expect(testSelector.getSelected()).to.equal(listOne.getElementAtIndex(0));
      keyboard.pressRight();
      expect(testSelector.getSelected()).to.equal(listOne.getElementAtIndex(1));
      keyboard.pressUp();
      expect(testSelector.getSelected()).to.equal(listOne.getElementAtIndex(1));
      testSelector.selectVertically();
      keyboard.pressDown();
      expect(testSelector.getSelected()).to.equal(listOne.getElementAtIndex(2));
      keyboard.pressLeft();
      expect(testSelector.getSelected()).to.equal(listOne.getElementAtIndex(2));
      testSelector.stop();
    });
  };
  describe("Will operate on settings set from constructor.", () => {
    beforeEach(() => {
      reset(normalList);
      keyboard.clearPressedKeys();
      keyboard.clearReleasedKeys();
    });
    iterationTest(normalList, (): SelectionHandler<ArrayList<number>> => selector(normalList), listOne);
    listOne.moveToFirstElement();
    singleDimensionLists(selector(listOne));
  });
  describe("Will operate on settings set from setSelections method.", () => {
    beforeEach(() => {
      reset(reversedList);
      keyboard.clearPressedKeys();
      keyboard.clearReleasedKeys();
    });
    iterationTest(reversedList, (): SelectionHandler<ArrayList<number>> => {
      return selector(normalList).setSelections(reversedList);
    }, listThree);
    listOne.moveToFirstElement();
    singleDimensionLists(selector(listThree).setSelections(listOne));
  });
});
