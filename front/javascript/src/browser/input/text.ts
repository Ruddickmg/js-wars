import createElement, {Element} from "../dom/element/element";

export default (name: string, defaultText?: string): Element<any> => {
  const input: Element<any> = createElement(`${name}Form`, "p");
  const text: Element<any> = createElement(`${name}Input`, "input");
  input.setClass("inputForm");
  input.appendChild(text);
  text.setClass("textInput");
  text.setAttribute("autocomplete", "off");
  text.setAttribute("type", "text");
  if (defaultText) {
    text.setAttribute("placeholder", defaultText);
  }
  return input;
};
