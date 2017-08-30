import createElement, {Element} from "../../dom/element";

export interface Title extends Element<any> {

    change(name: string): void;
}

export default function(initialTitle: string): Title {

    const element: Element<any> = createElement("title", "h1");
    const change = (title: string): void => {

        element.setText(title);
    };

    change(initialTitle);

    return Object.assign(element, {change});
}
