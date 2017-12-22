import {publish} from "../../tools/pubSub";
import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";
import {Element} from "../dom/element/element";
import typeWriter, {TypeWriter} from "../effects/typing";

export default (function() {

  const writer: TypeWriter = typeWriter();
  const {isString, isDefined}: TypeChecker = typeChecker();
  const minimumNameLength = 3;
  const textElementId: string = "description";

  return (gameNameInput: Element<any>): string => {
    const name: string = gameNameInput.getInput();
    const textField: Element<any> = gameNameInput.children.get(textElementId);
    const errorMessage: string = isString(name) && name.length ?
      "Name must be at least three letters long." :
      "A name must be entered for the game.";

    if (isString(name) && name.length >= minimumNameLength) {
      publish("setGameName", name);
      return name;
    }
    if (isDefined(textField)) {
      writer.type(textField, errorMessage);
    }
    return errorMessage;
  };
}());
