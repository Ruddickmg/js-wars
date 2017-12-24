import createElement, {Element} from "../../dom/element/element";

export default function <Type>(id: string): Element<Type> {
  const text: Element<any> = createElement<any>(`${id}Text`, "li").setClass("selectionText");
  const element: Element<Type> = createElement<Type>(id, "ul")
    .appendChild(text);
  element.setText = function(input: string): Element<Type> {
    text.setText(input);
    return this;
  };
  return element;
}
