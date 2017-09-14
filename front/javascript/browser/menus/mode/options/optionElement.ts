import capitalizeFirstLetter from "../../../../tools/stringManipulation/capitalizeFirstLetter";
import createElement, {Element} from "../../../dom/element/element";

export default function(option: string, idOfOption: string): Element<string> {

    const optionType: string = "li";
    const classOfElement: string = "modeOption";
    const action: string = option + capitalizeFirstLetter(idOfOption);

    const element: Element<string> = createElement<string>(action, optionType).setClass(classOfElement);

    element.setClass(classOfElement);
    element.setValue(option + idOfOption);
    element.setText(option);

    return element;
}
