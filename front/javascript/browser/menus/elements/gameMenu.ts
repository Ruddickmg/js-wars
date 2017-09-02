import createElement, {Element} from "../../dom/element";

export interface GameMenu<Type> extends Element<Type> {

    innerScreen: Element<Type>;
}

export default (function(): any {

    let counter: number = 1;

    return function<Type>(id: string, type: string, value?: any): GameMenu<Type> {

        const display: Element<Type> = createElement<Type>(id, type, value);
        const innerScreen: Element<Type> = createElement<Type>(`innserScreen#${counter++}`, "div")
            .setClass("innerScreen");

        display.appendChild(innerScreen);

        return Object.assign(display, {innerScreen});
    };
}());
