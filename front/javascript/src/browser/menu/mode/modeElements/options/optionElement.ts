import capitalizeFirstLetter from "../../../../../tools/stringManipulation/capitalizeFirstLetter";
import typChecker, {TypeChecker} from "../../../../../tools/validation/typeChecker";
import createElement, {Element} from "../../../../dom/element/element";
import isElement from "../../../../dom/element/isElement";

export interface OptionElement<Type> extends Element<Type> {
  border: Element<any>;
  fadeBorderColor(): OptionElement<Type>;
  stopFading(): OptionElement<Type>;
}

export function isOption(element: any): boolean {
  const {isFunction}: TypeChecker = typChecker();
  const optionType: string = "modeOption";
  return isElement(element)
    && isFunction(element.fadeBorderColor)
    && isFunction(element.stopFading)
    && element.type === optionType;
}

export default function(option: string, idOfOption: string): OptionElement<string> {
  const optionType: string = "li";
  const classOfElement: string = "modeOption";
  const fadingClass: string = "fadeToWhite";
  const hoveredOver: string = "fading";
  const action: string = option + capitalizeFirstLetter(idOfOption);
  const element: Element<string> = createElement<string>(action, optionType).setClass(classOfElement);
  const border: Element<any> = createElement<any>(`${action}Border`, "div").setClass(`${classOfElement}Border`);
  element.setClass(classOfElement);
  element.setValue(option + idOfOption);
  element.setText(option);
  return Object.assign(element, {
    fadeBorderColor(): Element<any> {
      border.appendClass(fadingClass);
      element.appendClass(hoveredOver);
      return this;
    },
    stopFading(): Element<any> {
      border.removeClass(fadingClass);
      element.removeClass(hoveredOver);
      return this;
    },
    border,
  });
}
