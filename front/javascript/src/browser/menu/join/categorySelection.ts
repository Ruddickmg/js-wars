import getSettings from "../../../settings/settings";
import zipWith from "../../../tools/array/zipWith";
import createList, {ArrayList} from "../../../tools/storage/lists/arrayList/list";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import {Element} from "../../dom/element/element";
import isElement from "../../dom/element/isElement";
import createScroller, {Scroller} from "../../effects/scrolling";
import getKeyboard, {KeyBoard} from "../../input/keyboard";
import createGameMenu, {GameMenu} from "../elements/gameMenu";
import createSelectionHandler, {SelectionHandler} from "../selectors/twoDimensionalSelector";
import createSelectionElement from "./selectionElement";

export interface CategorySelector extends Element<any>, Scroller, SelectionHandler<any> {
  elements: ArrayList<Element<string>>;
  getCategory(): string;
  moveToCategory(category: string): CategorySelector;
  switchCategory(movingForward?: boolean): CategorySelector;
}

export default function() {
  const keyboard: KeyBoard = getKeyboard();
  const {isString}: TypeChecker = typeChecker();
  const amountOfCategoriesToShow: number = 1;
  const amountOfCategoryNeighbors: number = 2;
  const positionAttribute = "position";
  const classOfCategoryScreen: string = "categorySelectionElement";
  const selectionMenuType: string = "section";
  const categorySelectionId: string = "categorySelection";
  const categorySelectionMenu: GameMenu<any> = createGameMenu(categorySelectionId, selectionMenuType);
  const {list: categories, definitions: categoryDefinitions, positions} = getSettings().toObject("map", "categories");
  const categoryPositions: string[] = positions.slice();
  const buffer: number = 1;
  const elements: ArrayList<Element<string>> = createList<Element<string>>(
    categories.map((category: string): Element<string> => {
      return createSelectionElement<string>(category)
        .setClass(classOfCategoryScreen)
        .setText(categoryDefinitions[category])
        .setValue(category)
        .hide();
    }));
  const categorySelection: SelectionHandler<Element<string>> = createSelectionHandler<Element<string>>(elements)
    .selectHorizontally();
  const categoryScroller: Scroller = createScroller(amountOfCategoriesToShow, buffer, elements);
  const switchCategory = function(movingForward: boolean = true): CategorySelector {
    const neighbors: Element<string>[] = elements.getNeighboringElements(amountOfCategoryNeighbors);
    const firstElement: Element<string> = neighbors.shift();
    const lastElement: Element<string> = neighbors.pop();
    (movingForward ? firstElement : lastElement)
      .removeAttribute(positionAttribute);
    categoryScroller.scroll(movingForward);
    zipWith(neighbors, categoryPositions, (element: Element<string>, position: string): Element<string> => {
      return element.setAttribute(positionAttribute, position);
    });
    return this;
  };
  const moveToCategory = function(category: string): CategorySelector {
    if (isString(category)) {
      categories.elements.moveToElement((element: Element<string>): any => {
        return element.getValue() === category;
      });
    }
    return this;
  };
  const horizontalSelection = (current: Element<any>): void => {
    let category: string;
    if (isElement(current)) {
      category = current.getValue();
      if (isString(category)) {
        switchCategory(keyboard.pressedRight());
      }
    }
  };
  const getCategory = (): string => elements.getCurrentElement().getValue();
  categorySelection.horizontal(horizontalSelection);
  elements.forEach((element: any): any => categorySelectionMenu.appendChild(element));
  return Object.assign(
    categoryScroller,
    categorySelection,
    categorySelectionMenu,
    {
      elements,
      getCategory,
      moveToCategory,
      switchCategory,
    },
  );
}
