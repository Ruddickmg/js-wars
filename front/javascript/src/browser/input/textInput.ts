import {publish, subscribe, unsubscribe} from "../../tools/pubSub";
import {isNumber, isString} from "../../tools/validation/typeChecker";
import createElement, {Element} from "../dom/element/element";
import keyboardInput, {KeyBoard} from "./keyboard";

export interface TextInput extends Element<any> {
  input: Element<string>;
  activate(): TextInput;
  listen(): TextInput;
  setDefaultText(text: string): TextInput;
  setEventName(eventName: string): TextInput;
  stop(): TextInput;
}

export type TextInputFactory = (event?: string, defaultText?: string) => TextInput;

export default (function(): TextInputFactory {

  const placeHolder: string = "placeHolder";
  const activationClassName = "active";
  const inputHolderType: string = "div";
  const inputType: string = "input";
  const keyboard: KeyBoard = keyboardInput();

  return function(event?: string, defaultText?: string): TextInput {

    let subscription: number;
    let eventNameMessage: string = event;

    const inputHolder: Element<any> = createElement<string>("", inputHolderType);
    const input: Element<any> = createElement<string>("", inputType);

    const listen = function(): TextInput {
      subscription = subscribe("keyPressed", () => {
        let text: string;
        if (keyboard.pressedEnter()) {
          text = input.getInput() || "";
          publish(eventNameMessage, text);
        } else if (keyboard.pressedEsc()) {
          publish(eventNameMessage);
        }
      }) as number;
      return this;
    };

    const setEventName = function(eventName: string): TextInput {
      eventNameMessage = eventName;
      return this;
    };

    const activate = function(): TextInput {
      inputHolder.appendClass(activationClassName);
      return this;
    };

    const setDefaultText = function(text: string): TextInput {
      input.setAttribute(placeHolder, text);
      return this;
    };

    const stop = function(): TextInput {
      if (isNumber(subscription) || isString(subscription)) {
        unsubscribe(subscription);
      }
      inputHolder.removeClass(activationClassName);
      return this;
    };

    inputHolder.appendChild(input);

    if (isString(defaultText)) {
      input.setAttribute("placeholder", defaultText);
    }

    return Object.assign(inputHolder, {
      activate,
      input,
      listen,
      setDefaultText,
      setEventName,
      stop,
    });
  };
}());
