import {Game} from "../../../game/game";
import getSettings from "../../../settings/settings";
import zipWith from "../../../tools/array/zipWith";
import {publish, subscribe, unsubscribe} from "../../../tools/pubSub";
import {Dictionary} from "../../../tools/storage/dictionary";
import createList, {ArrayList} from "../../../tools/storage/lists/arrayList/list";
import {isArray, isString} from "../../../tools/validation/typeChecker";
import createElement, {Element} from "../../dom/element/element";
import isElement from "../../dom/element/isElement";
import createTypeWriter, {TypeWriter} from "../../effects/typing";
import keyboardInput, {KeyBoard} from "../../input/keyboard";
import createArrows, {Arrows} from "../arrows/arrows";
import createFooter, {Footer} from "../footers/footer";
import {FooterDescription} from "../footers/footerElements/description";
import getGameScreen from "../screen/gameScreen";
import createSelector, {SelectionHandler} from "../selectors/twoDimensionalSelector";
import createSettingElement, {SettingElement} from "./settingElement";

export interface SettingsMenu {
  goBack(): SettingsMenu;
  remove(): SettingsMenu;
  listen(): SettingsMenu;
}

export default (function() {

  const minimumGameNameLength: number = 3;
  const offScreen: number = 4;
  const typingSpeed: number = 30;
  const distanceBetweenArrows: number = 40;
  const nameInputContainerId: string = "nameForm";
  const nameInputContainerClass: string = "inputForm";
  const nameInputClass: string = "textInput";
  const nameInputId: string = "nameInput";
  const settingsMenuId: string = "settings";
  const settingsMenuType: string = "section";
  const titleId: string = "title";
  const titleText: string = "rules";
  const widthType: string = "offset";
  const classOfSettingOptions: string = "settingOptions";
  const defaultTextForNameInput: string = "Enter name here";
  const enterNameMessage: string = "Enter a name for your game.";
  const upOnScreen: string = "moveUpOnScreen";
  const downOnScreen: string = "moveDownOnScreen";
  const downOffScreen: string = "moveDownOffScreen";
  const nameWasSelectedMessage: string = "finishedSettingsSelection";
  const finishedNameSelectionEvent: string = "nameInputSelected";
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
  const arrows: Arrows = createArrows();
  const typeWriter: TypeWriter = createTypeWriter();
  const keyboard: KeyBoard = keyboardInput();
  const {input: nameInput}: Footer = footer;

  typeWriter.setSpeed(typingSpeed);

  return function(game: Game, selectingSettings: boolean = true, movingForward: boolean = true): SettingsMenu {

    const subscriptions: number[] = [];
    const publishError = (error: Error): any => publish("error", error);

    const isSettingOption = (settingOption: Element<any>): boolean => {
      return isElement(settingOption) &&
        isElement(settingOption.parent) &&
        settingOption.parent.getClass() === classOfSettingOptions;
    };

    const settingElements: Element<string>[] = namesOfEachSetting.map((settingName: string) => {
      const setting: SettingElement = createSettingElement(settingName, settingsElementDefinitions[settingName]);
      settingsSelectionMenu.appendChild(setting);
      setting.setClass(`${settingName}-${movingForward ? downOnScreen : upOnScreen}`);
      return setting;
    });

    const listOfSettingElements: ArrayList<SettingElement> = createList<SettingElement>(settingElements);

    const typeTextIntoFooter = (descriptions: any, option?: any) => {
      const element: FooterDescription = footer.description;
      const textDescription: string = isString(descriptions) ? descriptions : descriptions[option];
      let text: string = "";
      return typeWriter.type(textDescription, (character: string): any => {
        text += character;
        element.setDescription(text);
      });
    };

    const stop = function(): SettingsMenu {
      settingSelector.stop();
      subscriptions.forEach((subscription: number): any => unsubscribe(subscription));
      if (selectingSettings) {
        arrows.hide().stopFading();
      }
      return this;
    };

    const continueSelection = function(): SettingsMenu {
      listen();
      footer.description.activate().center();
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

    const handleNameEntry = (name: string): void | Promise<any> => {
      if (isString(name) && name.length >= minimumGameNameLength) {
        console.log("name entered correctly");
        publish(nameWasSelectedMessage, name);
        moveElementsDownOffScreen();
      } else if (keyboard.pressedEsc()) {
        console.log("exit name input");
        continueSelection();
        typeTextIntoFooter(settingSelector.getSelected().description)
          .catch(publishError);
      } else {
        console.log("error in name");
        return typeTextIntoFooter("Game name must be at least three letters long.")
          .catch(publishError);
      }
      nameInput.stop();
      keyboard.clearPressedKeys();
    };

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

    const moveElementsDownOffScreen = function(): void {
      settingElements.forEach((element: Element<any>) => {
        element.setClass(`${element.getValue()}-${downOffScreen}`);
      });
    };

    const selected = () => {
      const {description}: Footer = footer;
      if (selectingSettings) {
        stop();
        keyboard.clearPressedKeys();
        description.moveUp();
        nameInput.setDefaultText(defaultTextForNameInput)
          .activate()
          .listen();
        typeTextIntoFooter(enterNameMessage)
            .catch(publishError);
      }
    };

    const goBack = function(): SettingsMenu {
      if (selectingSettings) {
        remove();
        publish("startNewGame", game);
      }
      return this;
    };

    const listen = function(): SettingsMenu {
      zipWith(["pressedEscKey", "pressedEnterKey"], [goBack, selected], (eventId: string, method: any) => {
        subscriptions.push(subscribe(eventId, method) as number);
      });
      return this;
    };

    const nameInputSubscription: number = subscribe(finishedNameSelectionEvent, handleNameEntry) as number;

    settingSelector.setSelections(listOfSettingElements)
      .vertical(verticalSelection)
      .horizontal(horizontalSelection)
      .selectHorizontally()
      .listen();

    nameInput.setEventName(finishedNameSelectionEvent)
      .setClass(nameInputContainerClass)
      .setId(nameInputContainerId)
      .input.setClass(nameInputClass)
        .setId(nameInputId);

    footer.description.activate();
    setupScreen.appendChild(footer);
    setupScreen.get(titleId).setText(titleText);

    typeTextIntoFooter(listOfSettingElements.getCurrentElement().description)
      .catch(publishError);

    if (selectingSettings) {
      arrows.setSpaceBetweenArrows(distanceBetweenArrows)
        .setTop((movingForward ? -offScreen : offScreen) + middle)
        .fade();
      setupScreen.appendChild(settingsSelectionMenu);
    }

    return {
      goBack,
      listen,
      remove,
    };
  };
}());
