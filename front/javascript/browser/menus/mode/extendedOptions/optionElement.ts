import createElement, {Element} from "../../../dom/element";
import createUList, {UList} from "../../../dom/ul";

export default (function() {

    let count: number = 1;

    return function(classOfOption: string): UList {

        const id: string = `OptionElement#${count++}`;
        const type: string = "ul";
        const ulParentElement: Element<any> = createElement(id, type).setClass(classOfOption);

        return createUList(ulParentElement);
    };
}());
