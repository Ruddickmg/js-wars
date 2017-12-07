import {Game} from "../../../game/game";
import getSettings from "../../../settings/settings";
import notifications, {PubSub} from "../../../tools/pubSub";
import {Dictionary} from "../../../tools/storage/dictionary";
import createList, {ArrayList} from "../../../tools/storage/lists/arrayList/list";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import validator, {Validator} from "../../../tools/validation/validator";
import createElement, {Element} from "../../dom/element/element";
import isElement from "../../dom/element/isElement";
import movementOfDomElements, {DomElementMover} from "../../effects/movementOfDomElements";
import createTypeWriter, {TypeWriter} from "../../effects/typing";
import keyboardInput, {KeyBoard} from "../../input/keyboard";
import createArrows, {Arrows} from "../arrows/arrows";
import createFooter, {Footer} from "../footers/footer";
import getGameScreen from "../screen/gameScreen";
import createSelector, {SelectionHandler} from "../selectors/twoDimensionalSelector";
import gameNameInput, {NameInput, NameInputFactory} from "./gameNameInput";
import createSettingElement, {SettingElement} from "./settingElement";

export interface SettingsMenu {

  remove(): SettingsMenu;

  listenForSelection(): SettingsMenu;
}

export default (function() {

  const offScreen: number = 4;
  const distanceBetweenArrows: number = 40;
  const settingsMenuId: string = "settings";
  const settingsMenuType: string = "section";
  const titleId: string = "title";
  const titleText: string = "rules";
  const widthType: string = "offset";
  const classOfSettingOptions: string = "settingOptions";
  const exitingSettingsEvent: string = "exitingSettingSelection";
  const defaultTextForNameInput: string = "Enter name here.";
  const keyboard: KeyBoard = keyboardInput();
  const settingSelector: SelectionHandler<SettingElement> = createSelector<SettingElement>();
  const setupScreen: Element<any> = getGameScreen();
  const settings: Dictionary = getSettings();
  const settingProperties: any = settings.toObject(settingsMenuId);
  const settingsElementDefinitions: any = settingProperties.elements;
  const namesOfEachSetting = ["fog", "weather", "funds", "turn", "capture", "power", "visuals"];
  const settingsSelectionMenu: Element<any> = createElement<any>(settingsMenuId, settingsMenuType);
  const footer: Footer = createFooter();
  const {subscribe, unsubscribe, publish}: PubSub = notifications();
  const {isString}: TypeChecker = typeChecker();
  const height: number = setupScreen.getHeight(widthType);
  const middle: number = height / 2;
  const getNameInput: NameInputFactory = gameNameInput();
  const arrows: Arrows = createArrows();
  const elementMover: DomElementMover = movementOfDomElements();
  const {validateBoolean}: Validator = validator("settingsSelection");
  const typeWriter: TypeWriter = createTypeWriter();

  return function(game: Game, selectingSettings: boolean = true, movingForward: boolean = true): SettingsMenu {

    let nameInput: NameInput;
    let subscription: number;

    const isSettingOption = (settingOption: Element<any>): boolean => {

      return isElement(settingOption)
        && isElement(settingOption.parent)
        && settingOption.parent.getClass() === classOfSettingOptions;
    };
    const positionOfElements: string = movingForward ? "above" : "below";
    const settingElements: Element<string>[] = namesOfEachSetting.map((settingName: string) => {

      const setting: SettingElement = createSettingElement(settingName, settingsElementDefinitions[settingName]);

      settingsSelectionMenu.appendChild(setting);
      setting.setClass(settingName);

      return setting;
    });
    const listOfSettingElements: ArrayList<SettingElement> = createList<SettingElement>(settingElements);
    const typeTextIntoFooter = (descriptions: any, option?: string) => {

      const element: Element<any> = footer.description;
      const description: string = isString(descriptions) ? descriptions : descriptions[option];

      element.setText("");
      typeWriter.type(element, description);
    };
    const stopSelection = function(): SettingsMenu {

      unsubscribe(subscription);
      settingSelector.stop();

      if (selectingSettings) {

        arrows.hide().stopFading();
      }

      return this;
    };
    const continueSelection = function(): SettingsMenu {

      listenForSelection();
      settingSelector.listen();
      arrows.show().fade();

      return this;
    };
    const remove = function(): SettingsMenu {

      stopSelection();

      setupScreen.removeChild(footer);
      setupScreen.removeChild(settingsSelectionMenu);

      if (selectingSettings) {

        setupScreen.removeChild(arrows.topArrow);
        setupScreen.removeChild(arrows.bottomArrow);
        unsubscribe(nameInputSubscription);
      }

      return this;
    };
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
    const verticalSelection = (current: Element<any>, previous: Element<any>) => {

      console.log("current vertical: ", current);
      console.log("previous vertical: ", previous);

      if (selectingSettings) {

        if (isSettingOption(previous)) {

          previous.setClass("invisible");
        }

        current.setClass("visible");
      }
    };
    const horizontalSelection = (current: SettingElement) => {

      const option: string = current.getCurrentElement().getValue();

      console.log("current horizontal: ", current);

      if (selectingSettings) {

        arrows.setPosition(current.position());
      }

      typeTextIntoFooter(current.description, option);
    };
    const listenForSelection = function(): SettingsMenu {

      subscription = subscribe("keyPress", () => {

        if (keyboard.pressedEscape()) {

          remove();
          publish(exitingSettingsEvent);

        } else if (keyboard.pressedEnter() && selectingSettings) {

          stopSelection();
          footer.appendChild(nameInput);
        }
      }) as number;

      return this;
    };

    console.log(listOfSettingElements);

    settingSelector.setSelections(listOfSettingElements)
      .vertical(verticalSelection)
      .horizontal(horizontalSelection)
      .selectHorizontally()
      .listen();

    setupScreen.appendChild(footer);
    setupScreen.get(titleId).setText(titleText);
    typeTextIntoFooter(listOfSettingElements.getCurrentElement().description);

    if (selectingSettings) {

      nameInput = getNameInput(defaultTextForNameInput);
      arrows.setSpaceBetweenArrows(distanceBetweenArrows)
        .setTop((movingForward ? -offScreen : offScreen) + middle)
        .fade();

      elementMover.instantly()
        .moveElementsOffScreen(positionOfElements, ...settingElements)
        .then((elements: Element<any>[]) => {
          setupScreen.appendChild(settingsSelectionMenu);
          elementMover.animate()
            .moveElementsOnScreen(positionOfElements, ...elements)
            .then(() => {
              arrows.setPosition(listOfSettingElements.getCurrentElement().position());
              setupScreen.appendChild(arrows.bottomArrow);
              setupScreen.appendChild(arrows.topArrow);
            });
        });
    }

    listenForSelection();

    return {

      remove,
      listenForSelection,
    };
  };
}());
