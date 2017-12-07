import {Game} from "../../../game/game";
import {Building} from "../../../game/map/elements/building/building";
import {Map} from "../../../game/map/map";
import countBuildings from "../../../tools/array/propertyValueCounter";
import notifications, {PubSub} from "../../../tools/pubSub";
import createList, {ArrayList} from "../../../tools/storage/lists/arrayList/list";
import capitalizeFirstLetter from "../../../tools/stringManipulation/capitalizeFirstLetter";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import validator, {Validator} from "../../../tools/validation/validator";
import {Element} from "../../dom/element/element";
import isElement from "../../dom/element/isElement";
import highlighter, {Highlighter} from "../../effects/highlighter";
import createScroller, {Scroller, ScrollHandler} from "../../effects/scrolling";
import keyboardInput, {KeyBoard} from "../../input/keyboard";
import createGameMenu, {GameMenu} from "../elements/gameMenu";
import getGameScreen from "../screen/gameScreen";
import selectionHandler, {SelectionHandler} from "../selectors/twoDimensionalSelector";
import createBuildingsDisplay, {BuildingsDisplay} from "./buildingsDisplay/buildingsDisplay";
import createCategorySelector, {CategorySelector} from "./categorySelection";
import gameElementHandler, {MapRequestHandler} from "./mapRequestHandler";
import createSelectionElement from "./selectionElement";

export interface JoinMenu<Type> {
  goBack(): JoinMenu<Type>;
  remove(): JoinMenu<Type>;
  update(category: string): Promise<Type[]>;
}

export default (function() {

  const idOfTitle: string = "title";
  const defaultCategory: string = "two";
  const mapSelectionId: string = "mapSelection";
  const classOfMapSelectionElement: string = "mapSelectionElement";
  const mapSelectionType = "map";
  const gameSelectionType = "game";
  const className: string = "join";
  const bufferAmountForMapScrolling: number = 1;
  const amountOfMapsToShowWhileScrolling: number = 5;
  const selectionMenuType: string = "section";

  const {isDefined, isArray, isString}: TypeChecker = typeChecker();
  const {validateString}: Validator = validator(className);
  const {subscribe, publish, unsubscribe}: PubSub = notifications();
  const {highlight, deHighlight}: Highlighter = highlighter();
  const keyBoard: KeyBoard = keyboardInput();
  const setupScreen: Element<any> = getGameScreen();
  const createSelectionMenu = (): GameMenu<any> => createGameMenu(mapSelectionId, selectionMenuType) as GameMenu<any>;
  const buildingsDisplay: BuildingsDisplay = createBuildingsDisplay();
  const categorySelector: CategorySelector = createCategorySelector();

  return function<Type>(type: string, game?: Game): JoinMenu<Type> {

    let selectionMenu: GameMenu<any> = createSelectionMenu();
    let scrollThroughSelectionMenu: Scroller;
    let selections: MapRequestHandler<Type>;

    const subscriptions: number[] = [];
    const selectionMenuScroller: ScrollHandler = createScroller(
      amountOfMapsToShowWhileScrolling,
      bufferAmountForMapScrolling,
    );
    const selectingMaps: boolean = isDefined(game);
    const selectionType: string = selectingMaps ? mapSelectionType : gameSelectionType;
    const finishedSelecting: string = `finishedSelecting${capitalizeFirstLetter(selectionType)}`;
    const title: Element<any> = setupScreen.get(idOfTitle);
    const getMap = (element: any): Map => selectingMaps ? element : element.map;
    const selector: SelectionHandler<Element<Type>> = selectionHandler<Element<Type>>();
    const categorySelection: SelectionHandler<Element<string>> = selectionHandler<Element<string>>(categorySelector.elements)
      .selectHorizontally();
    const selectableElement = <Type>(element: any, category: string, count: number): any => {
      return createSelectionElement<Type>(`${category}${selectionType}#${count}`)
        .setClass(classOfMapSelectionElement)
        .setText(element.name)
        .setValue(element);
    };
    const updateBuildingsDisplay = ({buildings}: Map): void => {
      buildingsDisplay.set(countBuildings(buildings, ({name}: Building): string => name));
    };
    const remove = function(): JoinMenu<Type> {
      setupScreen.removeChild(selectionMenu);
      setupScreen.removeChild(categorySelector);
      setupScreen.removeChild(buildingsDisplay);
      categorySelection.stop();
      selector.stop();
      subscriptions.forEach((subscription: number): any => unsubscribe(subscription));
      return this;
    };
    const goBack = function(): JoinMenu<Type> {
      remove();
      setupScreen.removeChild(setupScreen.get(idOfTitle));
      publish(["beginGameSetup", "settingUpGame"], true);
      return this;
    };
    const update = function(category: string): Promise<Type[]> {
      const current: Element<Type> = selector.getSelected();
      return selections.byCategory(category).then((response: any[] = []): any => {
        let count: number = 1;
        let newSelections: ArrayList<Element<Type>>;
        let selectedElement: Element<Type>;
        selectionMenu = createSelectionMenu();
        if (isArray(response) && response.length) {
          newSelections = createList<Element<Type>>(response.map((element: Type): Element<Type> => {
            const selectionElement: Element<Type> = selectableElement<Type>(element, category, count++);
            selectionMenu.appendChild(selectionElement);
            return selectionElement.hide();
          })).moveToElement(current);
          scrollThroughSelectionMenu = selectionMenuScroller(newSelections);
          selectedElement = selector.setSelections(newSelections).getSelected();
          highlight(selectedElement);
          updateBuildingsDisplay(getMap(selectedElement.getValue()));
        } else {
          buildingsDisplay.clearCount();
        }
        setupScreen.refresh(selectionMenu);
        return Promise.resolve(response);
      }).catch((error) => console.log(error));
    };
    const verticalSelection = (current: Element<any>, previous: any) => {
      if (isElement(current)) {
        if (isElement(previous)) {
          deHighlight(previous);
        }
        highlight(current);
        updateBuildingsDisplay(getMap(current.getValue()));
        scrollThroughSelectionMenu.scroll(keyBoard.pressedDown());
      }
    };
    const horizontalSelection = (current: Element<any>): void => {
      let category: string;
      if (isElement(current)) {
        category = current.getValue();
        if (isString(category)) {
          categorySelector.switchCategory(keyBoard.pressedRight());
          update(category).catch(({message}: Error): any => {
            publish("customError", {className, method: "horizontalSelection", input: category, message});
          });
        }
      }
    };
    const category: string = categorySelection.horizontal(horizontalSelection)
      .listen()
      .getSelected()
      .show()
      .getValue();

    if (validateString(type, "constructor")) {
      subscriptions.push(subscribe("pressedEnterKey", () => {
        const selected: Element<Type> = selector.getSelected();
        let element: Type;
        if (isDefined(selected)) {
          element = selected.getValue();
          if (selectingMaps) {
            game.map = getMap(element);
          }
          remove();
          publish(finishedSelecting, game || element);
        }
      }) as number);
      subscriptions.push(subscribe("pressedEscKey", goBack) as number);
      selections = gameElementHandler<Type>(`${selectionType}s`, type);
      selector.vertical(verticalSelection).listen();
      update(category).catch(({message}: Error): any => {
        publish("customError", {
          className,
          input: defaultCategory,
          message,
          method: "update",
        });
      });
      categorySelector.switchCategory();
      setupScreen.appendChild(selectionMenu);
      setupScreen.appendChild(buildingsDisplay);
      setupScreen.appendChild(categorySelector);
      title.setText(`Select*${selectionType}`);
      return {
        goBack,
        update,
        remove,
      };
    }
  };
}());
