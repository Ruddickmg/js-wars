import {Position} from "../../../game/coordinates/position";
import single from "../../../tools/storage/singleton";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import createElement, {Element} from "../../dom/element/element";
import createOption from "./options/optionElement";
import createOptionElement, {OptionsElement} from "./options/optionsElement";
import createTextElement, {TextElement} from "./textElement";

interface ModesElementPrototype {

    setBorderColor(color: string): Element<any>;
    setPosition(position: Position): void;
    hasOptions(): boolean;
    hideOutline(): void;
    showOutline(): void;
}

export interface ModeElement extends ModesElementPrototype, Element<any> {

    outline: Element<any>;
    background: Element<any>;
}

export type ModeElementFactory = (id: string, options?: string[]) => ModeElement;

export default single<ModeElementFactory>(() => {

    let counter: number = 1;

    const positionTag: string = "position";
    const {isDefined, isNull}: TypeChecker = typeChecker();
    const outlineDisplay = (outline: any, type: string): void => {

        outline.display(type);
    };
    const methods: ModesElementPrototype = {

        setBorderColor(color: string): Element<any> {

            this.background.setBorderColor(color);

            return this;
        },
        setPosition(position: Position): void {

            this.element.setAttribute(positionTag, position);
            this.position = position;
        },
        hasOptions(): boolean {

            return isDefined(this.options);
        },
        hideOutline(): void {

            outlineDisplay(this.outline, "none");
        },
        showOutline(): void {

            outlineDisplay(this.outline, null);
        },
    };

    return function(id: string, modeOptions?: string[]): ModeElement {

        const count: number = counter++;
        const mode: Element<string> = createElement<string>(id, "li").setClass("modeItem");
        const outline: Element<any> = createElement<any>(`modesElementOutline#${count}`, "div").setClass("block");
        const background: Element<any> = createElement(`modesElementBackground#${count}`, "div")
            .setClass("modeBackground");
        const options: OptionsElement = createOptionElement();
        const text: TextElement = createTextElement(id);

        mode.setValue(id);
        mode.appendChild(background)
            .appendChild(outline)
            .appendChild(text);

        // app.touch(text).changeMode().doubleTap();
        // app.touch(background).changeMode().doubleTap();
        // app.touch(li.element()).scroll();
        //
        // app.click(text).changeMode().doubleClick();
        // app.click(background).changeMode().doubleClick();
        // app.click(li.element()).scroll();

        if (isDefined(modeOptions) && !isNull(modeOptions)) {

            modeOptions.forEach((option: string): void => {

                const optionElement: Element<string> = createOption(option, id);

                options.addElement(optionElement);
                options.appendChild(optionElement);

                // app.touch(optionElement).modeOptions().doubleTap();
                // app.click(optionElement).modeOptions().doubleClick();
            });

            mode.appendChild(options);
        }

        return Object.assign({

            outline,
            background,
            text,
        }, options, mode, methods);
    };
})();
