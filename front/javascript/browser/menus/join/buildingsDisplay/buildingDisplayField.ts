import capitalizeFirstLetter from "../../../../tools/stringManipulation/capitalizeFirstLetter";
import createCanvasLi from "../../../canvas/canvasLi";
import createElement, {Element} from "../../../dom/element/element";

export default function(field: string): Element<number> {

    const classOfFields: string = "numberOfBuildingsItem";
    const classOfItem: string = "numberOf";

    const canvas: Element<any> = createCanvasLi(`${field}Canvas`);
    const element: Element<number> = createElement<number>(field, "ul")
        .setClass(classOfFields)
        .setValue(0)
        .setText("0");

    const displayedItem: Element<any> = createElement(`${classOfItem}${capitalizeFirstLetter(field)}`, "li")
        .setClass(classOfItem);

    element.appendChild(displayedItem);
    element.appendChild(canvas);

    return element;
}
