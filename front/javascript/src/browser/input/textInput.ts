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
    let eventIdentifier: string = event;

    const inputHolder: Element<any> = createElement<string>("", inputHolderType);
    const input: Element<any> = createElement<string>("", inputType);

    const listen = function(): TextInput {
      console.log("subscribing");
      subscription = subscribe("keyPressed", () => {
        let text: string;
        if (keyboard.pressedEnter()) {
          console.log("pressed enter");
          text = input.getInput() || "";
          publish(eventIdentifier, text);
        } else if (keyboard.pressedEsc()) {
          console.log("pressed esc", eventIdentifier);
          publish(eventIdentifier);
        }
      }) as number;
      return this;
    };

    const setEventName = function(eventName: string): TextInput {
      eventIdentifier = eventName;
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
      console.log("stopping subscription", subscription);
      if (isNumber(subscription) || isString(subscription)) {
        console.log("unsubscribed from", unsubscribe(subscription, eventIdentifier));
        subscription = void 0;
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
