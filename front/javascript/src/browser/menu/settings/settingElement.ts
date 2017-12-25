import truthTable, {TruthTable} from "../../../tools/array/generateTruthTable";
import generateRange from "../../../tools/array/range";
import createList, {ArrayList} from "../../../tools/storage/lists/arrayList/list";
import {isDefined} from "../../../tools/validation/typeChecker";
import createElement, {Element} from "../../dom/element/element";
import createBackground from "./background";
import createOutline from "./outline";

export interface SettingElement extends Element<string>, ArrayList<Element<any>> {
  background: Element<any>;
  outline: Element<any>;
  text: Element<string>;
  settings: Element<any>;
  description: string | string[];
}

export default (function() {
  const allowed: TruthTable = truthTable("on", "off", "num", "clear", "rain", "snow", "random", "a", "b", "c");
  const hide: string = "invisible";
  const show: string = "visible";
  return function(setting: string, defaults: any): SettingElement {
    let numberOfSettings: number = 1;
    const generateNameOfSetting = (): string => `${setting}Setting#${numberOfSettings++}`;
    const {description, range, defaultSetting}: any = defaults;
    const element: Element<string> = createElement<string>(`${setting}Settings`, "section");
    const text: Element<string> = createElement<string>(`${setting}Text`, "h1");
    const background: Element<any> = createBackground(setting);
    const outline: Element<any> = createOutline(setting);
    const settings: Element<any> = createElement(`${setting}Settings`, "ul").setClass("settingOptions");
    const type: string = setting;
    const defaultSettings: string[] = Object.keys(defaults);
    const list: ArrayList<Element<any>> = createList<Element<any>>(defaultSettings.reduce((
      container: Element<any>[],
      currentSetting: string,
    ): Element<string>[] => {
      let settingElement: Element<any>;
      if (allowed[currentSetting]) {
        settingElement = createElement(generateNameOfSetting(), "li")
          .setValue(currentSetting)
          .setText(currentSetting)
          .setClass(hide);
        settings.appendChild(settingElement);
        container.push(settingElement);
      }
      return container;
    }, []));
    if (isDefined(range)) {
      generateRange(range.minimum, range.maximum, range.increment)
        .forEach((currentNumber: number) => {
          const numericalSelection: Element<number> = createElement<number>(generateNameOfSetting(), "li")
            .setValue(currentNumber)
            .setText(`${currentNumber}`)
            .setClass(hide);
          settings.appendChild(numericalSelection);
          list.addElement(numericalSelection);
        });
    }
    text.setText(setting).setValue(setting);
    list.moveToElement((currentSetting: any) => currentSetting === defaultSetting)
      .getCurrentElement()
      .setClass(show);
    outline.appendChild(text)
      .appendChild(settings);
    element.appendChild(outline)
      .appendChild(background)
      .setClass(setting)
      .setValue(type);
    return Object.assign(element, list, {
      background,
      description,
      outline,
      settings,
      text,
      type,
    });
  };
}());
// app.touch(this.background())
//     .element()
//     .scroll(list);
// app.click(this.background())
//     .element()
//     .scroll(list);
