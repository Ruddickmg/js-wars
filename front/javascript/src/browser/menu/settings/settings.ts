import {Game} from "../../../game/game";
import getSettings from "../../../settings/settings";
import zipWith from "../../../tools/array/zipWith";
import {publish, subscribe, unsubscribe} from "../../../tools/pubSub";
import {Dictionary} from "../../../tools/storage/dictionary";
import createList, {ArrayList} from "../../../tools/storage/lists/arrayList/list";
import {isArray, isString} from "../../../tools/validation/typeChecker";
import validator, {Validator} from "../../../tools/validation/validator";
import createElement, {Element} from "../../dom/element/element";
import isElement from "../../dom/element/isElement";
import createTypeWriter, {TypeWriter} from "../../effects/typing";
import createArrows, {Arrows} from "../arrows/arrows";
import createFooter, {Footer} from "../footers/footer";
import getGameScreen from "../screen/gameScreen";
import createSelector, {SelectionHandler} from "../selectors/twoDimensionalSelector";
import gameNameInput, {NameInput, NameInputFactory} from "./gameNameInput";
import createSettingElement, {SettingElement} from "./settingElement";

export interface SettingsMenu {
  goBack(): SettingsMenu;
  remove(): SettingsMenu;
  listen(): SettingsMenu;
}

export default (function() {
  const offScreen: number = 4;
  const typingSpeed: number = 30;
  const distanceBetweenArrows: number = 40;
  const settingsMenuId: string = "settings";
  const settingsMenuType: string = "section";
  const titleId: string = "title";
  const titleText: string = "rules";
  const widthType: string = "offset";
  const classOfSettingOptions: string = "settingOptions";
  const defaultTextForNameInput: string = "Enter name here.";
  const settingSelector: SelectionHandler<SettingElement> = createSelector<SettingElement>();
  const setupScreen: Element<any> = getGameScreen();
  const settings: Dictionary = getSettings();
  const settingProperties: any = settings.toObject(settingsMenuId);
  const settingsElementDefinitions: any = settingProperties.elements;
  const namesOfEachSetting = settingProperties.names;
  const settingsSelectionMenu: Element<any> = createElement<any>(settingsMenuId, settingsMenuType);
  const footer: Footer = createFooter();
  const height: number = setupScreen.getHeight(widthType);
  const middle: number = height / 2;
  const getNameInput: NameInputFactory = gameNameInput();
  const arrows: Arrows = createArrows();
  const {validateBoolean}: Validator = validator("settingsSelection");
  const typeWriter: TypeWriter = createTypeWriter();
  const upOnScreen: string = "moveUpOnScreen";
  const downOnScreen: string = "moveDownOnScreen";
  const downOffScreen: string = "moveDownOffScreen";
  typeWriter.setSpeed(typingSpeed);
  return function(game: Game, selectingSettings: boolean = true, movingForward: boolean = true): SettingsMenu {
    let nameInput: NameInput;
    const subscriptions: number[] = [];
    const isSettingOption = (settingOption: Element<any>): boolean => {
      return isElement(settingOption)
        && isElement(settingOption.parent)
        && settingOption.parent.getClass() === classOfSettingOptions;
    };
    const settingElements: Element<string>[] = namesOfEachSetting.map((settingName: string) => {
      const setting: SettingElement = createSettingElement(settingName, settingsElementDefinitions[settingName]);
      settingsSelectionMenu.appendChild(setting);
      setting.setClass(`${settingName}-${movingForward ? downOnScreen : upOnScreen}`);
      return setting;
    });
    const listOfSettingElements: ArrayList<SettingElement> = createList<SettingElement>(settingElements);
    const typeTextIntoFooter = (descriptions: any, option?: any) => {
      const element: Element<any> = footer.description;
      const description: string = isString(descriptions) ? descriptions : descriptions[option];
      let text: string = "";
      return typeWriter.type(description, (character: string): any => {
        text += character;
        element.setText(text);
      });
    };
    const stop = function(): SettingsMenu {
      subscriptions.forEach((subscription: number): any => unsubscribe(subscription));
      settingSelector.stop();
      if (selectingSettings) {
        arrows.hide().stopFading();
      }
      return this;
    };
    const continueSelection = function(): SettingsMenu {
      listen();
      settingSelector.listen();
      arrows.show().fade();
      return this;
    };
    const remove = function(): SettingsMenu {
      stop();
      setupScreen.removeChild(footer);
      setupScreen.removeChild(settingsSelectionMenu);
      if (selectingSettings) {
        // setupScreen.removeChild(arrows.topArrow);
        // setupScreen.removeChild(arrows.bottomArrow);
        unsubscribe(nameInputSubscription);
      }
      return this;
    };
    const publishError = (error: Error): any => publish("error", error);
    const nameInputSubscription: number = subscribe("nameInputSelected", (nameWasSelected: boolean) => {
      if (validateBoolean(nameWasSelected, "nameInputSubscription")) {
        if (nameWasSelected) {
          nameInput.stop();
          publish("finishedSettingsSelection");
        } else {
          continueSelection();
        }
      }
    }) as number;
    const verticalSelection = (current: Element<any>, previous: Element<any>, parent: SettingElement) => {
      const description: any = parent.description;
      if (selectingSettings) {
        if (isSettingOption(previous)) {
          previous.setClass("invisible");
          previous.display("none");
        }
        current.display(null);
        current.setClass("visible");
        if (isArray(description)) {
          typeTextIntoFooter(description, parent.getCurrentIndex())
            .catch(publishError);
        }
      }
    };
    const horizontalSelection = (current: SettingElement) => {
      const description: any = current.description;
      if (selectingSettings) {
        arrows.setPosition(current.position());
      }
      typeTextIntoFooter(description, current.getCurrentIndex())
        .catch(publishError);
    };
    const selected = () => {
      // if (selectingSettings) {
      //   stop();
      //   footer.appendChild(nameInput);
      // }
      settingElements.forEach((element: Element<any>) => {
        element.setClass(`${element.getValue()}-${downOffScreen}`);
      });
    };
    const goBack = function(): SettingsMenu {
      remove();
      publish("startNewGame", game);
      return this;
    };
    const listen = function(): SettingsMenu {
      zipWith(["pressedEscKey", "pressedEnterKey"], [goBack, selected], (eventId: string, method: any) => {
        subscriptions.push(subscribe(eventId, method) as number);
      });
      return this;
    };
    settingSelector.setSelections(listOfSettingElements)
      .vertical(verticalSelection)
      .horizontal(horizontalSelection)
      .selectHorizontally()
      .listen();
    setupScreen.appendChild(footer);
    setupScreen.get(titleId).setText(titleText);
    typeTextIntoFooter(listOfSettingElements.getCurrentElement().description)
      .catch((error: Error): any => publish("error", error));
    if (selectingSettings) {
      nameInput = getNameInput(defaultTextForNameInput);
      arrows.setSpaceBetweenArrows(distanceBetweenArrows)
        .setTop((movingForward ? -offScreen : offScreen) + middle)
        .fade();
      setupScreen.appendChild(settingsSelectionMenu);
    }
    listen();
    return {
      goBack,
      listen,
      remove,
    };
  };
}());
