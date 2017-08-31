import {Position} from "../../../game/coordinates/position";
import settings from "../../../settings/settings";
import single from "../../../tools/singleton";
import typeChecker, {TypeChecker} from "../../../tools/typeChecker";
import createHsl, {Hsl} from "../../color/hsl";
import createElement, {Element} from "../../dom/element";
import {UList} from "../../dom/ul";
import createOptionElement from "./extendedOptions/optionElement";
import createModeElement, {ModeElement} from "./modeElement";
import createOption from "./extendedOptions/option";
import createTextElement, {TextElement} from "./textElement";

interface ModesElementPrototype {

    setBackground(background: any): void;
    setMode(element: any): void;
    setOptions(options: any): void;
    setPosition(position: Position): void;
    setOutline(outline: any): void;
    outlineDisplay(type: string): void;
    hideOutline(): void;
    showOutline(): void;
    setIndex(index: number): void;
    select(): ModesElement;
    deselect(): ModesElement;
}

export interface ModesElement extends ModesElementPrototype, Element<any> {

    outline: Element<any>;
    background: Element<any>;
    mode: ModeElement<any>;
    index: number;
    // color: Hsl;
}

export type ModeElementFactory = (id: string, index: number, options?: string[]) => ModesElement;

export default single<ModeElementFactory>(() => {

    let counter: number = 1;

    const positionTag: string = "position";
    const modesElementPrototype: ModesElementPrototype = {

        setBackground(background: any): void {

            this.background = background;
        },
        setMode(element: any): void {

            this.mode = element;
        },
        setOptions(options: any): void {

            this.options = options;
        },
        setPosition(position: Position): void {

            this.element.setAttribute(positionTag, position);
            this.position = position;
        },
        setOutline(outline: any): void {

            this.outline = outline;
        },
        outlineDisplay(type: string): void {

            this.outline.display(type);
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

                this.options.currentElement().hide();
            }

            this.text.deselect();
            this.showOutline();

            return this;
        },
    };

    return function(id: string, index: number, options?: string[]): ModesElement {

        const count: number = counter++;
        const modesElementMethods = Object.create(modesElementPrototype);
        const {isDefined, isNull}: TypeChecker = typeChecker();
        const {hue, saturation, lightness} = settings().get("colors", id);
        const mode: ModeElement<any> = createModeElement(id, "modeItem");
        const outline: Element<any> = createElement(`modesElementOutline#${count}`, "div").setClass("block");
        const background: Element<any> = createElement(`modesElementBackground#${count}`, "div")
            .setClass("modeBackground");
        // const color: Hsl = createHsl(hue, saturation, lightness);
        const optionsList: UList = createOptionElement("modeOptions");
        const text: TextElement = createTextElement(id);

        optionsList.hide();

        mode.appendChild(background)
            .appendChild(outline)
            .appendChild(text.element);
            // .setColor(color.format());

        // app.touch(text).changeMode().doubleTap();
        // app.touch(background).changeMode().doubleTap();
        // app.touch(li.element()).scroll();
        //
        // app.click(text).changeMode().doubleClick();
        // app.click(background).changeMode().doubleClick();
        // app.click(li.element()).scroll();

        if (isDefined(options) && !isNull(options)) {

            options.forEach((option: string, currentIndex: number): void => {

                const optionElement: UList = createOption(option, id, currentIndex);

                optionsList.add(optionElement); // TODO this may be wrong

                // app.touch(optionElement).modeOptions().doubleTap();
                // app.click(optionElement).modeOptions().doubleClick();
            });

            mode.appendChild(optionsList.element);
        }

        return Object.assign(modesElementMethods, mode, {

            outline,
            background,
            mode,
            index,
            // color,
        });
    };
})();
