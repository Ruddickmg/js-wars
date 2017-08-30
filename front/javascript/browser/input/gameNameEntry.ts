import notifications, {PubSub} from "../../tools/pubSub";
import {Element} from "../dom/element";
import typeWriter, {TypeWriter} from "../effects/typing";

export default (function() {

    const writer: TypeWriter = typeWriter();
    const {publish}: PubSub = notifications();
    const minimumNameLength = 3;
    const textElementId: string = "description";

    return (gameNameInput: Element<any>): string => {

        const name: string = gameNameInput.getInput();
        const textField: Element<any> = gameNameInput.children.get(textElementId);
        const errorMessage: string = name ?
            "A name must be entered for the game." :
            "Name must be at least three letters long.";

        if (name && name.length >= minimumNameLength) {

            publish("setGameName", name);

            return name;
        }

        writer.type(textField, errorMessage);
    };
}());
