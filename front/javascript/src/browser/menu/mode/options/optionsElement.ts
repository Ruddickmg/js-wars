import createList, {List} from "../../../../tools/storage/arrayList/list/list";
import createElement, {Element} from "../../../dom/element/element";

export interface OptionsElement extends List<any>, Element<any> {
}

export default (function() {

  let count: number = 1;

  return function(): OptionsElement {

    const id: string = `OptionElement#${count++}`;
    const type: string = "ul";
    const classOfOption: string = "modeOptions";
    const element: Element<any> = createElement(id, type)
      .setClass(classOfOption);

    return Object.assign(element, createList());
  };
}());
