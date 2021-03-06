import {Game, isGame} from "../../../game/game";
import {isMap, Map} from "../../../game/map/map";
import getAllowedRange from "../../../tools/calculations/getAllowedRange";
import createList, {ArrayList} from "../../../tools/storage/lists/arrayList/list";
import {isArray} from "../../../tools/validation/typeChecker";
import gameElementHandler, {MapRequestHandler} from "../../communication/requests/mapRequestHandler";
import {Element} from "../../dom/element/element";
import isElement from "../../dom/element/isElement";
import highlighter, {Highlighter} from "../../effects/highlighter";
import createScroller, {Scroller} from "../../effects/scrolling";
import getKeyboard, {KeyBoard} from "../../input/keyboard";
import createGameMenu, {GameMenu} from "../elements/gameMenu";
import createSelectionHandler, {SelectionHandler} from "../selectors/twoDimensionalSelector";
import createSelectionElement from "./selectionElement";

export interface GameSelector<Type> extends SelectionHandler<Element<Type>>, Scroller {
  menu: GameMenu<any>;
  elements: ArrayList<Element<Type>>;
  changeCategory(category: string): Promise<ArrayList<Element<Type>>>;
  changeSelection(current: Element<any>, previous: any): GameSelector<Type>;
  getSelected(): Element<Type>;
  moveToSelected(selected: Map | Game): GameSelector<Type>;
}

export default function <Type>(type: string, selectionType: string) {
  const selections: MapRequestHandler<Type> = gameElementHandler<Type>(`${selectionType}s`, type);
  const selector: SelectionHandler<Element<Type>> = createSelectionHandler<Element<Type>>();
  const keyboard: KeyBoard = getKeyboard();
  const classOfMapSelectionElement: string = "mapSelectionElement";
  const mapSelectionId: string = "mapSelection";
  const selectionMenuType: string = "section";
  const bufferAmountForMapScrolling: number = 1;
  const amountOfMapsToShowWhileScrolling: number = 5;
  const {highlight, deHighlight}: Highlighter = highlighter();
  const selectionScroller: (value: ArrayList<any>) => Scroller = createScroller(
    amountOfMapsToShowWhileScrolling,
    bufferAmountForMapScrolling,
  );
  const selectableElement = (element: any, category: string, count: number): any => {
    return createSelectionElement<Type>(`${category}${selectionType}#${count}`)
      .setClass(classOfMapSelectionElement)
      .setText(element.name)
      .setValue(element);
  };
  const changeCategory = function(category: string): Promise<ArrayList<Element<Type>>> {
    return selections.byCategory(category).then((response: any[] = []): Promise<ArrayList<Element<Type>>> => {
      let count: number = 1;
      let selectedElement: Element<Type>;
      let received: Element<Type>[] = [];
      menu = createGameMenu<any>(mapSelectionId, selectionMenuType);
      if (isArray(response) && response.length) {
        received = response.map((element: Type): Element<Type> => {
          const selectionElement: Element<Type> = selectableElement(element, category, count++);
          menu.appendChild(selectionElement);
          return selectionElement.hide();
        });
      }
      this.menu = menu;
      elements = createList<Element<Type>>(received);
      scroller = selectionScroller(elements);
      selectedElement = selector.setSelections(elements).getSelected();
      if (isElement(selectedElement)) {
        selectedElement.show();
        highlight(selectedElement);
      }
      return Promise.resolve(elements);
    });
  };
  const changeSelection = function(current: Element<any>, previous: any): GameSelector<Type> {
    if (isElement(current)) {
      if (isElement(previous)) {
        deHighlight(previous);
      }
      highlight(current);
      scroller.scroll(keyboard.pressedDown());
    }
    return this;
  };
  const moveToSelected = function(comparison: Map | Game): GameSelector<Type> {
    const neighboringElements: number = 2;
    const currentPosition: number = elements.getCurrentIndex();
    let position: number;
    if (isMap(comparison) || isGame(comparison)) {
      elements.moveToElement((element: Element<any>) => {
        return element.getValue().id === comparison.id;
      });
      position = elements.getCurrentIndex();
      if (currentPosition !== position) {
        elements.forEach((element: Element<Type>): any => element.hide());
        getAllowedRange(elements.length(), position - neighboringElements, position + neighboringElements)
          .forEach((index: number): any => elements.getElementAtIndex(index).show());
        selector.setSelections(elements);
      }
      return this;
    }
  };
  const getSelected = (): Element<Type> => elements.getCurrentElement();
  let elements: ArrayList<Element<Type>> = createList<Element<Type>>();
  let menu: GameMenu<any> = createGameMenu<any>(mapSelectionId, selectionMenuType);
  let scroller: Scroller = selectionScroller(elements);
  selector.vertical(changeSelection);
  return Object.assign(
    scroller,
    selector,
    {
      changeCategory,
      changeSelection,
      elements,
      getSelected,
      menu,
      moveToSelected,
    },
  );
}
