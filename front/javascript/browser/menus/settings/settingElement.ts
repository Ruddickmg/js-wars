import iterateThroughRange from "../../../tools/calculations/iterateThroughRange";
import truthTable, {TruthTable} from "../../../tools/array/generateTruthTable";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import createElement, {Element} from "../../dom/element/element";
import createList, {List} from "../../dom/list/list";
import createBackground from "./background";
import createOutline from "./outline";

export interface SettingElement extends Element<string>, List<Element<any>> {

    background: Element<any>;
    outline: Element<any>;
    text: Element<string>;
    setPosition(left: number, top: number): SettingElement;
}

export default (function() {

    const {isDefined}: TypeChecker = typeChecker();
    const allowed: TruthTable = truthTable("on", "off", "num", "clear", "rain", "snow", "random", "a", "b", "c");

    return function(setting: string, defaults: any): SettingElement {

        let numberOfSettings: number = 1;

        const getNameForSetting = (): string => `${setting}Setting#${numberOfSettings++}`;
        const {description, range, defaultSetting}: any = defaults;
        const element: Element<string> = createElement<string>(`property${setting}`, "section");
        const text: Element<string> = createElement<string>(`${setting}Text`, "h1");
        const background: Element<any> = createBackground(setting);
        const outline: Element<any> = createOutline(setting);
        const settingsUl: Element<any> = createElement(`${setting}Settings`, "ul");
        const type: string = setting;
        const settings: string[] = Object.keys(defaults);
        const setHeight = (top: number): void => {
            background.element.style.top = top + "px";
            outline.element.style.top = top + "px";
            return this;
        };
        const setLeft = (left: number): void => {
            background.element.style.moveLeft = left + "px";
            outline.element.style.moveLeft = left + "px";
            return this;
        };
        const setPosition = function(left: number, top: number): SettingElement {
            setHeight(top);
            setLeft(left);
            return this;
        };
        const list: List<Element<any>> = createList<Element<any>>(settings.reduce((
            container: Element<any>[],
            currentSetting: string,
        ): Element<string>[] => {

            let settingElement: Element<any>;

            if (allowed[currentSetting]) {

                settingElement = createElement(getNameForSetting(), "li")
                    .setValue(currentSetting)
                    .setText(currentSetting);

                settingsUl.appendChild(settingElement);
                container.push(settingsUl);
            }

            return container;

        }, []));

        if (isDefined(range)) {

            iterateThroughRange(range.minimum, range.maximum, (currentNumber: number) => {

                const numericalSelection: Element<number> = createElement<number>(getNameForSetting(), "li")
                    .setValue(currentNumber)
                    .setText(`${currentNumber}`);

                list.addElement(numericalSelection);

            }, range.increment);
        }

        text.setValue(description);
        list.moveToElement(defaultSetting);
        outline.appendChild(text);
        element.appendChild(outline);
        element.appendChild(background);

        return Object.assign(element, list, {

            type,
            background,
            outline,
            text,
            setPosition,
        });
    };
}());

// app.touch(this.background())
//     .element()
//     .scroll(list);

// app.click(this.background())
//     .element()
//     .scroll(list);
