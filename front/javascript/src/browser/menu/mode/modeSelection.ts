import getSettings from "../../../settings/settings";
import {publish, subscribe, unsubscribe} from "../../../tools/pubSub";
import {Dictionary} from "../../../tools/storage/dictionary";
import {ArrayList} from "../../../tools/storage/lists/arrayList/list";
import single from "../../../tools/storage/singleton";
import validator, {Validator} from "../../../tools/validation/validator";
import {Element} from "../../dom/element/element";
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

  const keyEvent: string = "pressedEnterKey";
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
  const setupScreen: Element<any> = getGameScreen();
  const {positions, messages, events}: any = settings.toObject(modeSettings);
  const scrollBar: ScrollBar = createScrollBar().listen();
  const menu: ModeMenu<any> = createModeMenu<any>();
  const modeElements: ArrayList<ModeElement> = menu.elements;
  const modeSelector: SelectionHandler<any> = createSelector<any>(modeElements);

  const modeIsSelectable = (mode: string): boolean => !nonSelectableElements[mode];
  const getModeDescription = ({id}: Element<any>): string => {
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
  const stopListening = function(): ModeSelection {
    scrollBar.stop();
    modeSelector.stop();
    unsubscribe(subscription, keyEvent);
    return this;
  };
  const clearPage = function(): ModeSelection {
    stopListening();
    setupScreen.removeChild(scrollBar);
    setupScreen.removeChild(menu);
    return this;
  };
  const switchBetweenModeOptions = function(current: any, previous: any): ModeSelection {
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
    switchBetweenModeOptions(selected, previous);
    return this;
  };

  /* Initialize page and Listen for user input */
  const listen = function(): ModeSelection {

    const currentMode: Element<any> = modeSelector.getSelected();

    subscription = subscribe(keyEvent, (): void => {
      const mode: any = modeSelector.getSelected().getValue();
      if (modeIsSelectable(mode)) {
        clearPage();
        publish(events[mode]);
      }
    }) as number;

    switchBetweenModeOptions(currentMode, currentMode);

    scrollBar.setText(getModeDescription(currentMode));
    setupScreen.appendChild(menu);
    setupScreen.appendChild(scrollBar);
    setupScreen.setClass(screenName);
    setupScreen.get("title").setText(titleOfScreen);
    modeSelector.listen();

    return this;
  };

  /* Initialize mode selector */
  modeSelector.vertical(switchMode).horizontal(switchBetweenModeOptions);
  rotateMenuElements(modeElements);

  return {
    listen,
    remove: clearPage,
    rotateMenuElements,
    stop: stopListening,
    switchMode,
    switchOptions: switchBetweenModeOptions,
  };
});
