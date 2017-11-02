import createList, {ArrayList} from "../../../../tools/storage/lists/arrayList/list";
import createElement, {Element} from "../../../dom/element/element";

export interface OptionsElement extends ArrayList<any>, Element<any> {
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
