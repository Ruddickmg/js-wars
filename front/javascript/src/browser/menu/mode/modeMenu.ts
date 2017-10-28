import getSettings from "../../../settings/settings";
import notifications, {PubSub} from "../../../tools/pubSub";
import {Dictionary} from "../../../tools/storage/dictionary";
import createList, {ArrayList} from "../../../tools/storage/lists/arrayList/list/list";
import createSelector, {SelectionHandler} from "../../../tools/storage/lists/arrayList/selector";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import validator, {Validator} from "../../../tools/validation/validator";
import createElement, {Element} from "../../dom/element/element";
import keyboardInput, {KeyBoard} from "../../input/keyboard";
import createScrollBar, {ScrollBar} from "../footers/scrollBar";
import getGameScreen from "../screen/gameScreen";
import createModeElement, {ModeElement} from "./modeElement";
import {ModeMenuItem} from "./modeItem";

export default (function() {

  let subscription: number;

  const keyEvent: string = "keyPressed";
  const screenName: string = "setupScreen";
  const modeMenuId: string = "selectModeMenu";
  const titleOfScreen: string = "Select*Mode";
  const modeMenuType: string = "ul";
  const modeSettings: string = "mode";
  const optionType = "modeOption";
  const nonSelectableElements: any = {
    design: true,
    game: true,
    join: true,
  };
  const settings: Dictionary = getSettings();
  const {isDefined}: TypeChecker = typeChecker();
  const {validateString}: Validator = validator("modeMenu");
  const keyboard: KeyBoard = keyboardInput();
  const {publish, subscribe, unsubscribe}: PubSub = notifications();
  const setupScreen: Element<any> = getGameScreen();
  const {modes, positions, messages, events}: any = settings.toObject(modeSettings);
  const scrollBar: ScrollBar = createScrollBar().listen();
  const menu: Element<any> = createElement(modeMenuId, modeMenuType);
  const gameModes: ModeElement[] = modes.map(({options, id}: ModeMenuItem): ModeElement => {

    return createModeElement(id, options);
  });
  const modeElements: ArrayList<ModeElement> = createList<ModeElement>(gameModes);
  const selector: SelectionHandler<ModeElement> = createSelector<ModeElement>(modeElements);

  const isOption = (list: any): boolean => isDefined(list) && list.type === optionType;
  const getDescriptionOf = ({id}: Element<any>): string => {

    if (validateString(id, "getDescriptionOf")) {

      return messages[id.toLowerCase()];
    }
  };
  const isSelectable = (mode: string): boolean => !nonSelectableElements[mode];
  const rotateMenuElements = (list: ArrayList<ModeElement>): void => {

    let position = 0;

    list.getNeighboringElements(2)
      .forEach((element: any) => element.setPosition(positions[position++]));
  };
  const remove = function() {

    scrollBar.stop();
    selector.stop();
    setupScreen.removeChild(scrollBar);
    setupScreen.removeChild(menu);
    unsubscribe(subscription, keyEvent);
  };

  const selectMode = (current: any, previous: any): void => {

    const mode: string = current.getValue();

    previous.stopFading();
    current.fadeBorderColor();

    scrollBar.setText(messages[mode]);
  };

  selector.vertical((selected: ModeElement, previous: ModeElement, selections: ArrayList<ModeElement>): void => {

    if (!isOption(selected)) {

      rotateMenuElements(selections);
    }

    selectMode(selected, previous);

  }).horizontal(selectMode);

  rotateMenuElements(modeElements);

  return function() {

    const current: Element<any> = selector.getSelected();

    subscription = subscribe(keyEvent, (): void => {

      const mode: any = selector.getSelected().getValue();

      if (keyboard.pressedEnter() && isSelectable(mode)) {

        remove();
        publish(events[mode], mode);
      }

    }) as number;

    selectMode(current, current);
    modeElements.forEach((modeElement: ModeElement) => menu.appendChild(modeElement));
    scrollBar.setText(getDescriptionOf(current));
    setupScreen.appendChild(menu);
    setupScreen.appendChild(scrollBar);
    setupScreen.setClass(screenName);
    setupScreen.get("title").setText(titleOfScreen);
    selector.start();
    return {remove};
  };
}());
