import {Element} from "../dom/element";

export interface Highlighter {
    highlight(element: Element<any>): Highlighter;
    deHighlight(element: Element<any>): Highlighter;
}

export default (function() {

    const highlighted: string = "highlighted";
    const setHighlight = (element: Element<any>, highlight: string): void => {

        element.setAttribute(highlighted, highlight);
    };
    const highlight = function(element: Element<any>): Highlighter {

        setHighlight(element, "true");

        return this;
    };
    const deHighlight =  function(element: Element<any>): Highlighter {

        setHighlight(element, null);

        return this;
    };

    return function(): Highlighter {

        return {

            highlight,
            deHighlight,
        };
    };
}());
