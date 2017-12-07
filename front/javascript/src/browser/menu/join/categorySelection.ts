import getSettings from "../../../settings/settings";
import zipWith from "../../../tools/array/zipWith";
import createList, {ArrayList} from "../../../tools/storage/lists/arrayList/list";
import {Element} from "../../dom/element/element";
import createScroller, {Scroller} from "../../effects/scrolling";
import createGameMenu, {GameMenu} from "../elements/gameMenu";
import createSelectionElement from "./selectionElement";

export interface CategorySelector extends Element<any>, Scroller {
  elements: ArrayList<Element<string>>;
  switchCategory(movingForward?: boolean): CategorySelector;
}

export default function() {
  const amountOfCategoriesToShow: number = 1;
  const amountOfCategoryNeighbors: number = 2;
  const positionAttribute = "position";
  const classOfCategoryScreen: string = "categorySelectionElement";
  const selectionMenuType: string = "section";
  const categorySelectionId: string = "categorySelection";
  const categorySelectionMenu: GameMenu<any> = createGameMenu(categorySelectionId, selectionMenuType);
  const {list: categories, definitions: categoryDefinitions, positions} = getSettings().toObject("map", "categories");
  const categoryPositions: string[] = positions.slice();
  const elements: ArrayList<Element<string>> = createList<Element<string>>(
    categories.map((category: string): Element<string> => {
      return createSelectionElement<string>(category)
        .setClass(classOfCategoryScreen)
        .setText(categoryDefinitions[category])
        .setValue(category)
        .hide();
    }));
  const categoryScroller: Scroller = createScroller(amountOfCategoriesToShow)(elements);
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
  elements.forEach((element: any): any => categorySelectionMenu.appendChild(element));
  return Object.assign(categorySelectionMenu, categoryScroller, {switchCategory, elements});
}
