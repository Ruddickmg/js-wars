import createElement, {Element} from "../../dom/element/element";

export interface GameMenu<Type> extends Element<Type> {

    innerScreen: Element<Type>;
}

export default function<Type>(id: string, type: string, value?: any): GameMenu<Type> {

    const display: Element<Type> = createElement<Type>(id, type, value).setClass("menuScreen");
    const innerScreen: Element<Type> = createElement<Type>(`${id}InnerScreen`, "div")
        .setClass("innerScreen");

    display.appendChild(innerScreen);
    display.appendChild = function(child: Element<Type>): GameMenu<Type> {

        innerScreen.appendChild(child);

        return this;
    };

    return Object.assign(display, {innerScreen});
}
