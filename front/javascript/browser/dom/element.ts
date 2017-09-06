import createCache, {Cache} from "../../tools/cache";
import notifications, {PubSub} from "../../tools/pubSub";
import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";

export interface ElementPosition {

    left: number;
    right: number;
    top: number;
    bottom: number;
}

interface ElementMethods<Type> {

    addEventListener(id: string, listener: any): Element<Type>;
    appendChild(myElement: Element<Type>): Element<Type>;
    clear(): Element<Type>;
    display(): Element<Type>;
    getChildren(): Array<Element<Type>>;
    getInput(): any;
    getText(): string;
    getValue(): Type;
    getWidth(width?: string): number;
    hide(): Element<Type>;
    makeInvisible(): Element<Type>;
    makeVisible(): Element<Type>;
    removeAttribute(attribute: string): Element<Type>;
    removeChild(removed: Element<any>): Element<Type>;
    setAttribute(attribute: string, value: string): Element<Type>;
    setBackgroundColor(color: string): Element<Type>;
    setBorderColor(color: string): Element<Type>;
    setClass(classType: string): Element<Type>;
    setTextColor(color: string): Element<Type>;
    setHeight(height: number): Element<Type>;
    setId(idType: string): Element<Type>;
    setLeft(left: string | number): void;
    setOpacity(opacity: number): Element<Type>;
    setSpacing(spacing?: number): Element<Type>;
    setText(text: string): Element<Type>;
    setValue(value: Type): Element<Type>;
    setWidth(width: any): Element<Type>;
    show(): Element<Type>;
    transform(transformation: number): Element<Type>;
    position(): ElementPosition;
    [index: string]: any;
}

export interface Element<Type> extends ElementMethods<Type> {

    id: string;
    value?: Type;
    text?: string;
    type?: string;
    element: any;
    children: Cache<Element<Type>>;
    parent?: Element<any>;
}

export function isElement(element: any) {

    return element.makeInvisible !== undefined;
}

export default (function() {

    const visible: number = 1;
    const invisible: number = 0;
    const {isNumber, isString}: TypeChecker = typeChecker();
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

            children.add(newAddition.id, newAddition);
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

            this.display(null);

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
        clear(): Element<any> {

            const element: any = this.element;

            while (element.firstChild) {

                element.removeChild(element.firstChild);
            }

            return this;
        },
        removeAttribute(attribute: string): Element<any> {

            if (isString(attribute)) {

                this.element.setAttribute(attribute);
            }
            return this;
        },
    };

    return function<Type>(id: string, type: string, value?: Type): Element<Type> {

        const element: any = document.createElement(type);
        const children: Cache<Element<Type>> = createCache<Element<Type>>();

        element.setAttribute("id", id);

        return Object.assign({
            children,
            element,
            id,
            value,
        }, methods);
    };
}());
