import capitalizeFirstLetter from "../../../../tools/stringManipulation/capitalizeFirstLetter";
import createElement, {Element} from "../../../dom/element/element";

export interface OptionElement extends Element<any> {

  border: Element<any>;

  fadeBorderColor(): Element<any>;

  stopFading(): Element<any>;
}

export default function(option: string, idOfOption: string): Element<string> {

  const optionType: string = "li";
  const classOfElement: string = "modeOption";
  const fadingClass: string = "fadeToWhite";
  const fadedOverClass: string = "fading";
  const action: string = option + capitalizeFirstLetter(idOfOption);
  const element: Element<string> = createElement<string>(action, optionType).setClass(classOfElement);
  const border: Element<any> = createElement<any>(`${action}Border`, "div").setClass(`${classOfElement}Border`);

  element.setClass(classOfElement);
  element.setValue(option + idOfOption);
  element.setText(option);

  return Object.assign(element, {
    setBorderColor(color: any): Element<any> {

      border.setBorderColor(color);

      return this;
    },
    fadeBorderColor(): Element<any> {

      border.appendClass(fadingClass);
      element.appendClass(fadedOverClass);

      return this;
    },
    stopFading(): Element<any> {

      border.removeClass(fadingClass);
      element.removeClass(fadedOverClass);

      return this;
    },
    border,
  });
}
