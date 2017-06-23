import {Position} from "../../../coordinates/position";
import settings from "../../../settings/settings";
import single from "../../../tools/singleton";
import check, {TypeChecker} from "../../../tools/typeChecker";
import createHsl, {Hsl} from "../../color/hsl";
import createModeElement, {ModeElement} from "./modeElement";
import createOptionElement, {OptionElement} from "./optionElement";
import createTextElement, {TextElement} from "./textElement";

interface ModesElementPrototype {

    setBackground(background: any): void;
    setText(text: string): void;
    setMode(element: any): void;
    setOptions(options: any): void;
    setPosition(position: Position): void;
    setOutline(outline: any): void;
    setColor(color: Hsl): void;
    outlineDisplay(type: string): void;
    hideOutline(): void;
    showOutline(): void;
    setIndex(index: number): void;
    select(): ModesElement;
    deselect(): ModesElement;
}

export interface ModesElement extends ModesElementPrototype {

    id: number;
    outline: any;
    background: any;
    mode: ModeElement;
    index: number;
    color: Hsl;
    element: any;
}

export default single<ModesElement>(() => {

    const createOption = (option: string, idOfOption: string, index: number): any => {

        const element = document.createElement("li");

        element.setAttribute("class", "modeOption");
        element.setAttribute("modeOptionIndex", index + 1);
        element.setAttribute("id", option + idOfOption);
        element.innerHTML = option;

        return element;
    };

    const createBackground = (classOfElement: string): any => {

        const background = document.createElement("div");

        background.setAttribute("class", classOfElement);

        return background;
    };

    const createOutline = (classOfElement: string): any => {

        const outline = document.createElement("div");

        outline.setAttribute("class", classOfElement);

        return outline;
    };

    const modesElementPrototype: ModesElementPrototype = {

        setBackground(background: any): void {

            this.background = background;
        },
        setText(text: string): void {

            this.text = text;
        },
        setMode(element: any): void {

            this.mode = element;
        },
        setOptions(options: any): void {

            this.options = options;
        },
        setPosition(position: Position): void {

            this.element.setAttribute("pos", position);

            this.position = position;
        },
        setOutline(outline: any): void {

            this.outline = outline;
        },
        setColor(color: Hsl): void {

            this.outline.style.backgroundColor = color.format();
            this.color = color;
            this.text.setColor(color);
        },
        outlineDisplay(type: string): void {

            this.outline.style.display = type;
        },
        hideOutline(): void {

            this.outlineDisplay("none");
        },
        showOutline(): void {

            this.outlineDisplay(null);
        },
        setIndex(index: number): void {

            this.index = index;
        },
        select(): any {

            if (this.options) {

                this.options.show();
            }

            this.text.select();
            this.hideOutline();

            return this;
        },
        deselect(): any {

            if (this.options) {

                this.options.hideCurrentElement();
            }

            this.text.deselect();
            this.showOutline();

            return this;
        },
    };

    return function(id: string, options: string[], index: number): ModesElement {

        const modesElementMethods = Object.create(modesElementPrototype);
        const {isDefined}: TypeChecker = check();
        const {hue, saturation, lightness} = settings.get("colors", id);
        const mode: ModeElement = createModeElement("modeItem", id);
        const outline = createOutline("block");
        const background = createBackground("modeBackground");
        const color: Hsl = createHsl(hue, saturation, lightness);
        const optionsElement = createOptionElement("modeOptions").hideCurrentElement();
        const text = createTextElement(mode);
        const element = mode.element;

        mode.add(background)
            .add(outline)
            .add(text.element)
            .setColor(color.format());

        // app.touch(text).changeMode().doubleTap();
        // app.touch(background).changeMode().doubleTap();
        // app.touch(li.element()).scroll();
        //
        // app.click(text).changeMode().doubleClick();
        // app.click(background).changeMode().doubleClick();
        // app.click(li.element()).scroll();

        if (isDefined(options)) {

            options.forEach((option: string, index: number): void => {

                const optionElement = createOption(option, id, index);

                optionsElement.add(optionElement);

                // app.touch(optionElement).modeOptions().doubleTap();
                // app.click(optionElement).modeOptions().doubleClick();
            });

            mode.add(optionsElement.element);
        }

        return Object.assign(modesElementMethods, {

            id,
            outline,
            background,
            mode,
            index,
            color,
            element,
        });
    };
})();
