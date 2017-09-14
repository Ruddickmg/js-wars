import createElement, {Element} from "../../dom/element/element";

export interface TextElement extends Element<any> {

    background: Element<any>;
}

export default (function() {

    let counter: number = 1;

    return function(text: string): TextElement {

        const count: number = counter++;
        const background: Element<any> = createElement(`background#${count}`, "span").setClass("textBackground");
        const element: Element<any> = createElement(`textElement#${count}`, "h1").setClass("text");

        background.setText(text);

        element.appendChild(background);

        return Object.assign(element, {background, text});
    };
}());
