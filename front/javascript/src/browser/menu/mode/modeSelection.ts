import getSettings from "../../../settings/settings";
import notifications, {PubSub} from "../../../tools/pubSub";
import {Dictionary} from "../../../tools/storage/dictionary";
import {ArrayList} from "../../../tools/storage/lists/arrayList/list";
import single from "../../../tools/storage/singleton";
import validator, {Validator} from "../../../tools/validation/validator";
import {Element} from "../../dom/element/element";
import keyboardInput, {KeyBoard} from "../../input/keyboard";
import createScrollBar, {ScrollBar} from "../footers/scrollBar";
import getGameScreen from "../screen/gameScreen";
import createSelector, {SelectionHandler} from "../selectors/modeSelector";
import {ModeElement} from "./modeElements/modeElement";
import createModeMenu, {ModeMenu} from "./modeElements/modeMenu";
import {isOption} from "./modeElements/options/optionElement";

export interface ModeSelection {
  listen(): ModeSelection;
  stop(): ModeSelection;
  remove(): ModeSelection;
  switchOptions(current: any, previous: any): ModeSelection;
  switchMode(selected: ModeElement, previous: ModeElement, selections: ArrayList<ModeElement>): ModeSelection;
  rotateMenuElements(list: ArrayList<ModeElement>): ModeSelection;
}

export default single<ModeSelection>(function(): ModeSelection {
  let subscription: number;
  const keyEvent: string = "keyPressed";
  const screenName: string = "setupScreen";
  const titleOfScreen: string = "Select*Mode";
  const modeSettings: string = "mode";
  const nonSelectableElements: any = {
    design: true,
    game: true,
    join: true,
  };
  const settings: Dictionary = getSettings();
  const {validateString}: Validator = validator("modeSelection");
  const keyboard: KeyBoard = keyboardInput();
  const {publish, subscribe, unsubscribe}: PubSub = notifications();
  const setupScreen: Element<any> = getGameScreen();
  const {positions, messages, events}: any = settings.toObject(modeSettings);
  const scrollBar: ScrollBar = createScrollBar().listen();
  const menu: ModeMenu<any> = createModeMenu<any>();
  const modeElements: ArrayList<ModeElement> = menu.elements;
  const selector: SelectionHandler<any> = createSelector<any>(modeElements);
  const isSelectable = (mode: string): boolean => !nonSelectableElements[mode];
  const getDescriptionOf = ({id}: Element<any>): string => {
    if (validateString(id, "getDescriptionOf")) {
      return messages[id.toLowerCase()];
    }
  };
  const rotateMenuElements = function(list: ArrayList<ModeElement>): ModeSelection {
    let position = 0;
    list.getNeighboringElements(2)
      .forEach((element: any) => element.setPosition(positions[position++]));
    return this;
  };
  const stop = function(): ModeSelection {
    scrollBar.stop();
    selector.stop();
    unsubscribe(subscription, keyEvent);
    return this;
  };
  const remove = function(): ModeSelection {
    stop();
    setupScreen.removeChild(scrollBar);
    setupScreen.removeChild(menu);
    return this;
  };
  const switchOptions = function(current: any, previous: any): ModeSelection {
    const mode: string = current.getValue();
    previous.stopFading();
    current.fadeBorderColor();
    scrollBar.setText(messages[mode]);
    return this;
  };
  const switchMode = function(
    selected: ModeElement,
    previous: ModeElement,
    selections: ArrayList<ModeElement>,
  ): ModeSelection {
    if (!isOption(selected)) {
      rotateMenuElements(selections);
    }
    switchOptions(selected, previous);
    return this;
  };
  const listen = function(): ModeSelection {
    const current: Element<any> = selector.getSelected();
    subscription = subscribe(keyEvent, (): void => {
      const mode: any = selector.getSelected().getValue();
      if (keyboard.pressedEnter() && isSelectable(mode)) {
        remove();
        publish(events[mode], mode);
      }
    }) as number;
    switchOptions(current, current);
    scrollBar.setText(getDescriptionOf(current));
    setupScreen.appendChild(menu);
    setupScreen.appendChild(scrollBar);
    setupScreen.setClass(screenName);
    setupScreen.get("title").setText(titleOfScreen);
    selector.listen();
    return this;
  };
  selector.vertical(switchMode).horizontal(switchOptions);
  rotateMenuElements(modeElements);
  return {
    listen,
    stop,
    remove,
    switchOptions,
    switchMode,
    rotateMenuElements,
  };
});
