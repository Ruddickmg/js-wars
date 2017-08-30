import createElement, {Element} from "../../../dom/element";

export default function(option: string, idOfOption: string, index: number): any {

    const optionType: string = "li";
    const classOfElement: string = "modeOption";
    const element: Element<number> = createElement<number>(idOfOption, optionType).setClass(option + idOfOption);

    element.setClass(classOfElement);
    element.setValue(index + 1);
    element.setText(option);

    return element;
}
