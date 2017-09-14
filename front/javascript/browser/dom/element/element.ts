import notifications, {PubSub} from "../../../tools/pubSub";
import createCache, {Cache} from "../../../tools/storage/cache";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import validator, {Validator} from "../../../tools/validation/validator";
import isElement from "./isElement";

export interface ElementPosition {

    left: number;
    right: number;
    top: number;
    bottom: number;
}

interface ElementMethods<Type> {

    addEventListener(id: string, listener: any): Element<Type>;
    appendChild(myElement: Element<Type>): Element<Type>;
    clear(): Element<Type>[];
    display(displaySetting?: string): Element<Type>;
    get(id: string): Element<Type>;
    getChildren(): Element<Type>[];
    getInput(): any;
    getText(): string;
    getValue(): Type;
    getWidth(width?: string): number;
    hide(): Element<Type>;
    makeInvisible(): Element<Type>;
    makeVisible(): Element<Type>;
    position(): ElementPosition;
    refresh(replacement: Element<any>): Element<Type>;
    removeAttribute(attribute: string): Element<Type>;
    removeChild(removed: Element<any>): Element<Type>;
    setAttribute(attribute: string, value: string): Element<Type>;
    setBackgroundColor(color: string): Element<Type>;
    setBorderColor(color: string): Element<Type>;
    setClass(classType: string): Element<Type>;
    setHeight(height?: number): Element<Type>;
    setId(idType: string): Element<Type>;
    setLeft(left?: string | number): void;
    setOpacity(opacity?: number): Element<Type>;
    setSpacing(spacing?: number): Element<Type>;
    setText(text: string): Element<Type>;
    setTextColor(color?: string): Element<Type>;
    setValue(value: Type): Element<Type>;
    setWidth(width: any): Element<Type>;
    show(): Element<Type>;
    transform(transformation: number): Element<Type>;
    [index: string]: any;
}

export interface Element<Type> extends ElementMethods<Type> {

    id: string;
    value?: Type;
    type?: string;
    element: any;
    children: Cache<Element<Type>>;
    parent?: Element<any>;
}

export default (function() {

    const inputError = "invalidInputError";
    const className: string = "element";
    const visible: number = 1;
    const invisible: number = 0;

    const {isString, isDefined, isNull}: TypeChecker = typeChecker().register("element", isElement);
    const {
        validateString,
        validateDefined,
        validateNumber,
        validateFunction,
        validateElement,
    }: Validator = validator(className);
    const {publish}: PubSub = notifications();
    const validateStringOrNull = (element: any, methodName: string): boolean => {

        return isNull(element) || validateString(element, methodName);
    };
    const validateNumberOrNull = (element: any, methodName: string): boolean => {

        return isNull(element) || validateNumber(element, methodName);
    };
    const changeOpacity = (element: any, opacity: number): void => {

        if (validateNumber(opacity, "changeOpacity")) {

            element.style.opacity = opacity;
        }
    };
    const removePx = (amountInPixels: string): number => {

        if (validateString(amountInPixels, "removePx")) {

            return Number(amountInPixels.replace("px", ""));
        }
    };
    const methods: ElementMethods<any> = {

        addEventListener(id: string, listener: any): Element<any> {

            const methodName: string = "addEventListener";

            if (validateString(id, methodName) && validateFunction(listener, methodName)) {

                this.element.addEventListener(id, listener);
            }

            return this;
        },
        appendChild(newAddition: Element<any>): Element<any> {

            const {children, element}: any = this;

            if (validateElement(newAddition, "appendChild")) {

                children.add(newAddition.id, newAddition);
                element.appendChild(newAddition.element);
                newAddition.parent = this;
            }

            return this;
        },
        clear(): Element<any>[] {

            const {element, children}: any = this;

            while (element.firstChild) {

                element.removeChild(element.firstChild);
            }

            return children.clear();
        },
        display(elementDisplaySetting: string = null): Element<any> {

            if (validateStringOrNull(elementDisplaySetting, "display")) {

                this.element.style.display = elementDisplaySetting;
            }

            return this;
        },
        get(id: string): Element<any> {

            if (validateString(id, "get")) {

                return this.children.get(id);
            }
        },
        getChildren(): Element<any>[] {

            return this.children.reduce((elements: Element<any>[], element: Element<any>): Element<any>[] => {

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

            publish(inputError, {className, method: "getWidth", input: type});
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
        position(): ElementPosition {

            const {left, right, bottom, top}: any = this.element.style;

            return {

                bottom: removePx(bottom),
                left: removePx(left),
                right: removePx(right),
                top: removePx(top),
            };
        },
        refresh(replacement: Element<any>): Element<any> {

            const old: Element<any> = this.get(replacement.id);

            if (isDefined(old) && isElement(replacement)) {

                this.element.replaceChild(replacement.element, old.element);
                this.children.remove(old.id);
                this.children.add(replacement.id, replacement);

            } else {

                publish(inputError, {className, method: "replaceChild", input: replacement});
            }

            return this;
        },
        removeAttribute(attribute: string): Element<any> {

            if (validateString(attribute, "removeAttribute")) {

                this.element.removeAttribute(attribute);
            }

            return this;
        },
        removeChild(removed: Element<any>): Element<any> {

            const {children, element}: Element<any> = this;
            const removedChild: Element<any> = children.remove(removed.id);

            if (validateElement(removed, "removeChild")) {

                element.removeChild(removed.element);
                element.parent = undefined;

                return removedChild;
            }
        },
        setAttribute(attribute: string, value: string): any {

            const methodName: string = "setAttribute";

            if (validateString(attribute, methodName) && validateString(value, methodName)) {

                this.element.setAttribute(attribute, value);
            }

            return this;
        },
        setBackgroundColor(color: string = null): Element<any> {

            if (validateStringOrNull(color, "setBackgroundColor")) {

                this.element.style.backgroundColor = color;
            }

            return this;
        },
        setBorderColor(color: string = null): Element<any> {

            if (validateStringOrNull(color, "setBorderColor")) {

                this.element.style.borderColor = color;
            }

            return this;
        },
        setClass(classType: string): any {

            if (validateString(classType, "setClass")) {

                this.element.setAttribute("class", classType);
                this.type = classType;
            }

            return this;
        },
        setHeight(height: number) {

            if (validateNumberOrNull(height, "setHeight")) {

                this.element.style.height = height ? `${height}px` : height;
            }
            return this;
        },
        setId(idType: string): any {

            if (validateString(idType, "setId")) {

                this.element.setAttribute("id", idType);
            }

            return this;
        },
        setLeft(left: number = null): void {

            if (validateNumberOrNull(left, "setLeft")) {

                this.element.style.left = left ? `${left}px` : left;
            }
        },
        setOpacity(opacity: number): Element<any> {

            changeOpacity(this.element, opacity);

            return this;
        },
        setSpacing(spacing: number = null): Element<any> {

            if (validateNumberOrNull(spacing, "setSpacing")) {

                this.element.style.letterSpacing = spacing ? `${spacing}px` : spacing;
            }

            return this;
        },
        setText(text: string): Element<any> {

            if (validateString(text, "setText")) {

                this.element.textContent = text;
            }

            return this;
        },
        setTextColor(color: string): Element<any> {

            if (validateStringOrNull(color, "setTextColor")) {

                this.element.style.color = color;
            }

            return this;
        },
        setValue(newValue: any): any {

            this.value = newValue;

            return this;
        },
        setWidth(width: number = null): Element<any> {

            if (validateNumberOrNull(width, "setWidth")) {

                this.element.style.width = width ? `${width}px` : width;
            }

            return this;
        },
        show(): any {

            this.display(null);

            return this;
        },
        transform(transformation: number = null): Element<any> {

            if (validateNumberOrNull(transformation, "transform")) {

                this.element.style.transform = transformation;
            }

            return this;
        },
    };

    return function <Type>(id: string, elementOrType: any): Element<Type> {

        const methodName: any = "createElement";
        const element: any = isString(elementOrType) ? document.createElement(elementOrType) : elementOrType;
        const children: Cache<Element<Type>> = createCache<Element<Type>>();

        if (validateString(id, methodName) && validateDefined(element, methodName)) {

            element.setAttribute("id", id);

            return Object.assign({
                children,
                element,
                id,
            }, methods);
        }
    };
}());
