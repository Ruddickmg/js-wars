import notifications, {PubSub} from "../../../tools/pubSub";
import single from "../../../tools/storage/singleton";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import createElement, {Element} from "../../dom/element/element";
import keyboardInput, {KeyBoard} from "../../input/keyboard";

export interface NameInput extends Element<any> {

  listen(): NameInput;

  stop(): NameInput;
}

export type NameInputFactory = (defaultText: string) => NameInput;

export default single<NameInputFactory>(function(): NameInputFactory {

  const inputHolderType: string = "p";
  const inputHolderId: string = "nameForm";
  const inputHolderClass: string = "inputForm";
  const inputId: string = "nameInput";
  const inputType: string = "input";
  const inputClass: string = "textInput";
  const nameWasSelectedEvent: string = "nameInput";
  const {isString, isNumber}: TypeChecker = typeChecker();
  const {subscribe, unsubscribe, publish}: PubSub = notifications();
  const keyboard: KeyBoard = keyboardInput();
  const inputHolder = createElement<any>(inputHolderId, inputHolderType).setClass(inputHolderClass);
  const input = createElement<any>(inputId, inputType).setClass(inputClass);

  return function(defaultText: string): NameInput {

    let subscription: number;

    const listen = function(): NameInput {

      subscription = subscribe("keyPress", () => {

        let name: string;

        if (keyboard.pressedEnter()) {

          name = input.getText();

          if (isString(name)) {

            stop();
          }

          publish(nameWasSelectedEvent, true);

        } else if (keyboard.pressedEscape()) {

          stop();
          publish(nameWasSelectedEvent, false);
        }

      }) as number;

      return this;
    };

    const stop = function(): NameInput {

      if (isNumber(subscription) || isString(subscription)) {

        unsubscribe(subscription);
      }

      return this;
    };

    inputHolder.appendChild(input);

    if (isString(defaultText)) {

      input.setAttribute("placeholder", defaultText);
    }

    return Object.assign(inputHolder, {
      listen,
      stop,
    });
  };
});
