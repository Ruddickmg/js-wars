import {ArrayList} from "../../../tools/storage/lists/arrayList/list";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import {Element} from "../../dom/element/element";
import createScroller, {Scroller, ScrollHandler} from "../../effects/scrolling";
import createGameMenu, {GameMenu} from "../elements/gameMenu";

export default function() {
  const {isArray}: TypeChecker = typeChecker();
  const mapSelectionId: string = "mapSelection";
  const selectionMenuType: string = "section";
  const bufferAmountForMapScrolling: number = 1;
  const amountOfMapsToShowWhileScrolling: number = 5;
  const selectionMenu: GameMenu<any> = createGameMenu<any>(mapSelectionId, selectionMenuType);
  const selectionScroller: ScrollHandler = createScroller(
    amountOfMapsToShowWhileScrolling,
    bufferAmountForMapScrolling,
  );
  const changeCategory = function(category: string): Promise<Type[]> {
    // const current: Element<Type> = selector.getSelected();
    return selections.byCategory(category).then((response: any[] = []): any => {
      let count: number = 1;
      let newSelections: ArrayList<Element<Type>>;
      let selectedElement: Element<Type>;
      if (isArray(response) && response.length) {
        newSelections = createList<Element<Type>>(response.map((element: Type): Element<Type> => {
          const selectionElement: Element<Type> = selectableElement<Type>(element, category, count++);
          selectionMenu.appendChild(selectionElement);
          return selectionElement.hide();
        })).moveToElement(current);
        scroller = selectionScroller(newSelections);
        selectedElement = selector.setSelections(newSelections).getSelected();
        highlight(selectedElement);
        // updateBuildingsDisplay(getMap(selectedElement.getValue()));
      } else {
        // buildingsDisplay.clearCount();
      }
      setupScreen.refresh(selectionMenu);
      return Promise.resolve(response);
    }).catch((error) => console.log(error));
  };
  let scroller: Scroller = selectionScroller(elements);
}
