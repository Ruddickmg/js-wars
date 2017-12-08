import {Game} from "../../../game/game";
import {Building} from "../../../game/map/elements/building/building";
import {Map} from "../../../game/map/map";
import countBuildings from "../../../tools/array/propertyValueCounter";
import zipWith from "../../../tools/array/zipWith";
import notifications, {PubSub} from "../../../tools/pubSub";
import {ArrayList} from "../../../tools/storage/lists/arrayList/list";
import capitalizeFirstLetter from "../../../tools/stringManipulation/capitalizeFirstLetter";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import validator, {Validator} from "../../../tools/validation/validator";
import {Element} from "../../dom/element/element";
import isElement from "../../dom/element/isElement";
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
  update(): JoinMenu<Type>;
}

export default (function() {

  const idOfTitle: string = "title";
  const mapSelectionType = "map";
  const gameSelectionType = "game";
  const className: string = "join";
  const {isDefined}: TypeChecker = typeChecker();
  const {validateString}: Validator = validator(className);
  const {subscribe, publish, unsubscribe}: PubSub = notifications();
  const setupScreen: Element<any> = getGameScreen();
  const buildingsDisplay: BuildingsDisplay = createBuildingsDisplay();
  const categories: CategorySelector = createCategorySelector();

  return function<Type>(type: string, game?: Game): JoinMenu<Type> {
    const horizontalKeys: string[] = ["pressedLeftKey", "pressedRightKey"];
    const selectingMaps: boolean = isDefined(game);
    const selectionType: string = selectingMaps ? mapSelectionType : gameSelectionType;
    const selections: GameSelector<Type> = createGameSelector<Type>(type, selectionType);
    const finishedSelecting: string = `finishedSelecting${capitalizeFirstLetter(selectionType)}`;
    const title: Element<any> = setupScreen.get("title");
    const getMap = (element: any): Map => selectingMaps ? element : element.map;
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
    const updateSelections = (selection: ArrayList<Element<Type>>): void => {
      const current: Element<Type> = selection.getCurrentElement();
      if (isElement(current)) {
        updateBuildingsDisplay(getMap(current.getValue()));
      } else {
        buildingsDisplay.clearCount();
      }
      selection.moveToElement(current);
      setupScreen.refresh(selections.menu);
    };
    const update = function(): JoinMenu<Type> {
      const category: string = categories.getCategory();
      selections.changeCategory(category).then(updateSelections);
      return this;
    };
    const select = function(): JoinMenu<Type> {
      const selected: Element<Type> = selections.getSelected();
      let element: Type;
      if (isElement(selected)) {
        element = selected.getValue();
        if (selectingMaps) {
          game.map = getMap(element);
        }
        remove();
        publish(finishedSelecting, game || element);
      }
      return this;
    };
    const listen = function(): JoinMenu<Type> {
      categories.switchCategory().listen();
      selections.listen();
      update();
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
    validateString(type, "constructor");
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
