import {subscribe} from "../../../tools/pubSub";
import createElement, {Element} from "../../dom/element/element";
import createGameMenu, {GameMenu} from "../elements/gameMenu";

export interface Footer extends GameMenu<string> {
  description: Element<string>;
  chat: Element<any>;
  setDescription(description: string): void;
}

export default function() {
  const footer: GameMenu<string> = createGameMenu<string>("footer", "section");
  const description: Element<string> = createElement<string>("descriptions", "h1");
  const chat: Element<any> = createElement("chat", "ul");
  const textField = footer.innerScreen;
  const setDescription = (text: string): void => {
    description.setText(text);
    footer.setValue(text);
  };
  textField.appendChild(chat);
  textField.appendChild(description);
  subscribe("setFooterDescription", setDescription);
  return Object.assign(footer, {
    chat,
    description,
    setDescription,
  });
}
