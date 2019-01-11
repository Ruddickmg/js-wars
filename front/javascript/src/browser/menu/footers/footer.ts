import createElement, {Element} from "../../dom/element/element";
import createInput, {TextInput} from "../../input/textInput";
import createGameMenu, {GameMenu} from "../elements/gameMenu";
import createDescription, {FooterDescription} from "./footerElements/description";

export interface Footer extends GameMenu<string> {
  chat: Element<any>;
  description: FooterDescription;
  input: TextInput;
}

export default function() {

  const footer: GameMenu<string> = createGameMenu<string>("footer", "section");
  const description: FooterDescription = createDescription();
  const chat: Element<any> = createElement("chat", "ul");
  const input: TextInput = createInput();
  const textField = footer.innerScreen;

  textField.appendChild(chat);
  textField.appendChild(description);
  textField.appendChild(input);

  return Object.assign(footer, {
    chat,
    description,
    input,
  });
}
