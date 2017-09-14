import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import validator, {Validator} from "../../../tools/validation/validator";
import createElement, {Element} from "../../dom/element/element";

export default (function() {

    const {validateString}: Validator = validator("title");
    const {isDefined}: TypeChecker = typeChecker();

    return function(initialTitle?: string): Element<any> {

        const element: Element<string> = createElement<string>("title", "h1");

        if (isDefined(initialTitle) && validateString(initialTitle, "createTitle")) {

            element.setText(initialTitle);
        }

        return element;
    };
}());
