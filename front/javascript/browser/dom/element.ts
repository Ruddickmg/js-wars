import createCache, {Cache} from "../../tools/cache";
import notifications, {PubSub} from "../../tools/pubSub";
import typeChecker, {TypeChecker} from "../../tools/typeChecker";

export interface ElementPosition {

    left: number;
    right: number;
    top: number;
    bottom: number;
}

interface ElementMethods<ValueType> {

    addEventListener(id: string, listener: any): Element<ValueType>;
    appendChild(myElement: Element<ValueType>): Element<ValueType>;
    display(): Element<ValueType>;
    getChildren(): Array<Element<ValueType>>;
    getInput(): any;
    getText(): string;
    getValue(): ValueType;
    getWidth(width?: string): number;
    hide(): Element<ValueType>;
    makeInvisible(): Element<ValueType>;
    makeVisible(): Element<ValueType>;
    removeChild(removed: Element<any>): Element<ValueType>;
    setAttribute(attribute: string, value: string): Element<ValueType>;
    setBackgroundColor(color: string): Element<ValueType>;
    setBorderColor(color: string): Element<ValueType>;
    setClass(classType: string): Element<ValueType>;
    setTextColor(color: string): Element<ValueType>;
    setHeight(height: number): Element<ValueType>;
    setId(idType: string): Element<ValueType>;
    setLeft(left: string | number): void;
    setOpacity(opacity: number): Element<ValueType>;
    setSpacing(spacing?: number): Element<ValueType>;
    setText(text: string): Element<ValueType>;
    setValue(value: ValueType): Element<ValueType>;
    setWidth(width: any): Element<ValueType>;
    show(): Element<ValueType>;
    transform(transformation: number): Element<ValueType>;
    position(): ElementPosition;
}

export interface Element<ValueType> extends ElementMethods<ValueType> {

    id: string;
    value?: ValueType;
    text?: string;
    type?: string;
    element: any;
    children: Cache<Element<ValueType>>;
    parent?: Element<any>;
}

export function isElement(element: any) {

    return element.makeInvisible !== undefined;
}

export default (function() {

    const visible: number = 1;
    const invisible: number = 0;
    const {isNumber}: TypeChecker = typeChecker();
    const {publish}: PubSub = notifications();
    const changeOpacity = (element: any, opacity: number): void => {

        element.style.opacity = opacity;
    };
    const removePx = (amountInPixels: string): number => {

        return Number(amountInPixels.replace("px", ""));
    };
    const methods: ElementMethods<any> = {

        addEventListener(id: string, listener: any): Element<any> {

            this.element.addEventListener(id, listener);

            return this;
        },
        appendChild(newAddition: Element<any>): Element<any> {

            const {children, element}: any = this;

            children.add(newAddition);
            element.appendChild(newAddition.element);
            newAddition.parent = this;

            return this;
        },
        display(elementDisplaySetting: string = null): Element<any> {

            this.element.style.display = elementDisplaySetting;

            return this;
        },
        getChildren(): Array<Element<any>> {

            return this.children.reduce((elements: Array<Element<any>>, element: Element<any>): Array<Element<any>> => {

                elements.push(element);

                return elements;

            }, []);
        },
        getInput(): any {

            return this.element.value;
        },
        getText(): string {

            return this.text;
        },
        getValue(): any {

            return this.value;
        },
        getWidth(type: string = "client"): number {

            if (["client", "offset"].indexOf(type) > -1) {

                return this.element[`${type}Width`];
            }

            publish("invalidInput", {className: "element", method: "getWidth", input: type});
        },
        hide(): any {

            this.display("none");

            return this;
        },
        makeInvisible(): Element<any> {

            changeOpacity(this.element, invisible);

            return this;
        },
        makeVisible(): Element<any> {

            changeOpacity(this.element, visible);

            return this;
        },
        removeChild(removed: Element<any>): Element<any> {

            const {children, element}: Element<any> = this;
            const removedChild: Element<any> = children.remove(removed.id);

            if (element) {

                element.removeChild(removedChild.element);
                element.parent = undefined;
            }

            return removedChild;
        },
        setAttribute(attribute: string, value: string): any {

            this.element.setAttribute(attribute, value);

            return this;
        },
        setBackgroundColor(color: string = null): Element<any> {

            this.element.style.backgroundColor = color;

            return this;
        },
        setBorderColor(color: string = null): Element<any> {

            this.element.style.borderColor = color;

            return this;
        },
        setClass(classType: string): any {

            this.element.setAttribute("class", classType);
            this.type = classType;

            return this;
        },
        setTextColor(color: string): Element<any> {

            this.element.style.color = color;

            return this;
        },
        setHeight(height: number | string) {

            this.element.style.height = height;

            return this;
        },
        setId(idType: string): any {

            this.element.setAttribute("id", idType);

            return this;
        },
        setLeft(left: string | number): void {

            this.element.style.left = `${left}px`;
        },
        setOpacity(opacity: number): Element<any> {

            changeOpacity(this.element, opacity);

            return this;
        },
        setSpacing(spacing?: number): Element<any> {

            this.element.style.letterSpacing = isNumber(spacing) ? `${spacing}px` : null;

            return this;
        },
        setText(text: string): Element<any> {

            this.element.textContent = text;
            this.text = text;

            return this;
        },
        setValue(newValue: any): any {

            this.value = newValue;

            return this;
        },
        setWidth(width: number): Element<any> {

            this.element.style.width = width;

            return this;
        },
        show(): any {

            this.display(this.element);

            return this;
        },
        transform(transformation: number): Element<any> {

            this.element.style.transform = transformation;

            return this;
        },
        position(): ElementPosition {

            const {left, right, bottom, top}: any = this.element.style;

            return {

                bottom: removePx(bottom),
                left: removePx(left),
                right: removePx(right),
                top: removePx(top),
            };
        },
    };

    return function<ValueType>(id: string, type: string, value?: ValueType): Element<ValueType> {

        const element: any = document.createElement(type);
        const children: Cache<Element<ValueType>> = createCache<Element<ValueType>>();

        element.setAttribute("id", id);

        return Object.assign({
            children,
            element,
            id,
            value,
        }, methods);
    };
}());
