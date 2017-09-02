import notifications, {PubSub} from "../../../tools/pubSub";
import createElement, {Element} from "../../dom/element";
import createGameMenu, {GameMenu} from "../elements/gameMenu";

export interface Footer extends GameMenu<string> {

    setDescription(description: string): void;
}

export default function() {

    const {subscribe}: PubSub = notifications();
    const footer: GameMenu<string> = createGameMenu("footer", "section");
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

        setDescription,
    });
}