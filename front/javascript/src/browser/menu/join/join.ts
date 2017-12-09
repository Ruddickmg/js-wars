import {Game, isGame} from "../../../game/game";
import {Building} from "../../../game/map/elements/building/building";
import {isMap, Map} from "../../../game/map/map";
import countBuildings from "../../../tools/array/propertyValueCounter";
import zipWith from "../../../tools/array/zipWith";
import getAllowedRange from "../../../tools/calculations/getAllowedRange";
import notifications, {PubSub} from "../../../tools/pubSub";
import {ArrayList} from "../../../tools/storage/lists/arrayList/list";
import capitalizeFirstLetter from "../../../tools/stringManipulation/capitalizeFirstLetter";
import validator, {Validator} from "../../../tools/validation/validator";
import {Element} from "../../dom/element/element";
import isElement from "../../dom/element/isElement";
import highlighter, {Highlighter} from "../../effects/highlighter";
import getGameScreen from "../screen/gameScreen";
import createBuildingsDisplay, {BuildingsDisplay} from "./buildingsDisplay/buildingsDisplay";
import createCategorySelector, {CategorySelector} from "./categorySelection";
import createGameSelector, {GameSelector} from "./gameSelection";

export interface JoinMenu<Type> {
  categories: CategorySelector;
  selections: GameSelector<Type>;
  goBack(): JoinMenu<Type>;
  listen(): JoinMenu<Type>;
  remove(): JoinMenu<Type>;
  select(): JoinMenu<Type>;
  stop(): JoinMenu<Type>;
  update(): Promise<any>;
}

export default (function() {

  const idOfTitle: string = "title";
  const mapSelectionType = "map";
  const gameSelectionType = "game";
  const className: string = "join";
  const mapSelection: string = "type";
  const {highlight, deHighlight}: Highlighter = highlighter();
  const {validateString}: Validator = validator(className);
  const {subscribe, publish, unsubscribe}: PubSub = notifications();
  const setupScreen: Element<any> = getGameScreen();
  const buildingsDisplay: BuildingsDisplay = createBuildingsDisplay();
  const categories: CategorySelector = createCategorySelector();
  const isSelectingMaps = (selectionType: string): boolean => selectionType === mapSelection;

  return function<Type>(type: string, game?: Game): JoinMenu<Type> {
    const horizontalKeys: string[] = ["pressedLeftKey", "pressedRightKey"];
    const selectingMaps: boolean = isSelectingMaps(type);
    const selectionType: string = selectingMaps ? mapSelectionType : gameSelectionType;
    const selections: GameSelector<Type> = createGameSelector<Type>(type, selectionType);
    const finishedSelecting: string = `finishedSelecting${capitalizeFirstLetter(selectionType)}`;
    const title: Element<any> = setupScreen.get("title");
    const getMap = (element: any): Map => {
      if (isGame(element)) {
        return element.map;
      } else if (isMap(element)) {
        return element;
      }
    };
    const updateBuildingsDisplay = ({buildings}: Map): void => {
      buildingsDisplay.set(countBuildings(buildings, ({name}: Building): string => name));
    };
    const stop = function(): JoinMenu<Type> {
      categories.stop();
      selections.stop();
      subscriptions.forEach((subscription: number): any => unsubscribe(subscription));
      return this;
    };
    const remove = function(): JoinMenu<Type> {
      stop();
      setupScreen.removeChild(selections.menu);
      setupScreen.removeChild(categories);
      setupScreen.removeChild(buildingsDisplay);
      return this;
    };
    const goBack = function(): JoinMenu<Type> {
      remove();
      setupScreen.removeChild(setupScreen.get(idOfTitle));
      publish(["beginGameSetup", "settingUpGame"], true);
      return this;
    };
    const updateSelections = (selection: ArrayList<Element<Type>>): Promise<ArrayList<Element<Type>>> => {
      const current: Element<Type> = selection.getCurrentElement();
      if (isElement(current)) {
        updateBuildingsDisplay(getMap(current.getValue()));
      } else {
        buildingsDisplay.clearCount();
      }
      selection.moveToElement((currentElement: Element<Type>): boolean => {
        return currentElement === current;
      });
      setupScreen.refresh(selections.menu);
      return Promise.resolve(selection);
    };
    const update = function(): Promise<any> {
      const category: string = categories.getCategory();
      return selections.changeCategory(category).then(updateSelections);
    };
    const select = function(): JoinMenu<Type> {
      const selected: Element<Type> = selections.getSelected();
      let element: Type;
      if (isElement(selected)) {
        element = selected.getValue();
        if (isMap(element) && isGame(game)) {
          game.map = getMap(element);
        }
        remove();
        publish(finishedSelecting, game || element);
      }
      return this;
    };
    const moveToSelected = (elements: ArrayList<Element<Type>>) => {
      const comparison: Map | Game = selectingMaps ? getMap(game) : game;
      const neighboringElements: number = 2;
      let position: number;
      if (isMap(comparison) || isGame(comparison)) {
        deHighlight(elements.getCurrentElement());
        elements.moveToElement((element: Element<any>) => {
          return element.getValue().id === comparison.id;
        });
        position = elements.getCurrentIndex();
        highlight(elements.getCurrentElement());
        elements.forEach((element: Element<Type>): any => element.hide());
        getAllowedRange(elements.length(), position - neighboringElements, position + neighboringElements)
          .forEach((index: number): any => elements.getElementAtIndex(index).show());
      }
    };
    const listen = function(): JoinMenu<Type> {
      categories.switchCategory().listen();
      selections.listen();
      validateString(type, "constructor");
      selections.changeCategory(isGame(game) ? game.category : categories.getCategory())
        .then(updateSelections)
        .then(moveToSelected);
      zipWith(["pressedEscKey", "pressedEnterKey"], [goBack, select], (eventId: string, method: any) => {
        subscriptions.push(subscribe(eventId, method) as number);
      });
      subscriptions = subscriptions.concat(subscribe(horizontalKeys, update));
      setupScreen.appendChild(selections.menu);
      setupScreen.appendChild(buildingsDisplay);
      setupScreen.appendChild(categories);
      title.setText(`Select*${selectionType}`);
      return this;
    };
    let subscriptions: number[] = [];

    return {
      categories,
      goBack,
      listen,
      remove,
      select,
      selections,
      stop,
      update,
    };
  };
}());
