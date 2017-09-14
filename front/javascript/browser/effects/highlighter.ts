import {Element} from "../dom/element/element";

export interface Highlighter {
    highlight(element: Element<any>): Highlighter;
    deHighlight(element: Element<any>): Highlighter;
}

export default (function() {

    const highlighted: string = "highlighted";
    const highlight = function(element: Element<any>): Highlighter {

        element.setAttribute(highlighted, "true");

        return this;
    };
    const deHighlight =  function(element: Element<any>): Highlighter {

        element.removeAttribute(highlighted);

        return this;
    };

    return function(): Highlighter {

        return {

            highlight,
            deHighlight,
        };
    };
}());
