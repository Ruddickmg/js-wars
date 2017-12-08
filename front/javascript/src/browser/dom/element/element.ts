import createPosition, {Position} from "../../../game/map/coordinates/position";
import notifications, {PubSub} from "../../../tools/pubSub";
import createCache, {Cache} from "../../../tools/storage/cache";
import capitalizeFirstLetter from "../../../tools/stringManipulation/capitalizeFirstLetter";
import pixelStringConverter, {PixelStringConversion} from "../../../tools/stringManipulation/pixelStringConversion";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import validator, {Validator} from "../../../tools/validation/validator";
import isElement from "./isElement";

export interface ElementPosition extends Position {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface ElementMethods<Type> {
  addEventListener(id: string, listener: any): Element<Type>;
  appendChild(myElement: Element<Type>): Element<Type>;
  appendClass(...className: string[]): Element<Type>;
  removeChildren(): Element<Type>[];
  display(displaySetting?: string): Element<Type>;
  get(id: string): Element<Type>;
  getChildren(): Element<Type>[];
  getClass(): string;
  getInput(): any;
  getTag(): string;
  getText(): string;
  getValue(): Type;
  getWidth(width?: string): number;
  getTop(): number;
  hide(): Element<Type>;
  makeInvisible(): Element<Type>;
  makeVisible(): Element<Type>;
  position(): ElementPosition;
  prependClass(...className: string[]): Element<Type>;
  refresh(replacement: Element<any>): Element<Type>;
  removeAttribute(attribute: string): Element<Type>;
  removeChild(removed: Element<any>): Element<Type>;
  removeClass(...className: string[]): Element<Type>;
  removeEventListener(id: string, listener?: any): Element<Type>;
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
  setTop(position: number): Element<Type>;
  setValue(value: Type): Element<Type>;
  setWidth(width: any): Element<Type>;
  show(): Element<Type>;
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
  const {formatPixelString, getNumericalValue}: PixelStringConversion = pixelStringConverter();
  const {isString, isDefined, isNull, isFunction}: TypeChecker = typeChecker().register("element", isElement);
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
  const getDimension = function(element: Element<any>, type: string, dimension: string) {
    const capitalizedDimension: string = capitalizeFirstLetter(dimension);
    if (["client", "offset"].indexOf(type) > -1) {
      return element[`${type}${capitalizedDimension}`];
    }
    publish(inputError, {className, method: `get${capitalizedDimension}`, input: type});
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
    appendClass(...additionalClassName: string[]): Element<any> {
      additionalClassName.forEach((name: string): any => {
        if (validateString(name, "appendClass") && name.length) {
          this.element.className += ` ${name}`;
        }
      });
      return this;
    },
    removeChildren(): Element<any>[] {
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
    getClass(): string {
      return this.element.className;
    },
    getHeight(type: string = "client"): number {
      return getDimension(this.element, type, "height");
    },
    getInput(): any {
      return this.element.value;
    },
    getText(): string {
      return this.currentlySetText;
    },
    getTag(): string {
      return this.element.tagName.toLowerCase();
    },
    getTop(): number {
      return this.element.style.top;
    },
    getValue(): any {
      return this.value;
    },
    getWidth(type: string = "client"): number {
      return getDimension(this.element, type, "width");
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
      const x: number = getNumericalValue(left);
      const y: number = getNumericalValue(top);
      return Object.assign(createPosition(x, y), {
        bottom: getNumericalValue(bottom),
        left: getNumericalValue(left),
        right: getNumericalValue(right),
        top: getNumericalValue(top),
      });
    },
    prependClass(...additionalClassName: string[]): Element<any> {
      additionalClassName.forEach((name: string): any => {
        if (validateString(name, "prependClass") && name.length) {
          this.element.className = `${name} ` + this.element.className;
        }
      });
      return this;
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
    removeClass(...classesToRemove: string[]): Element<any> {
      const emptyString: string = "";
      const emptySpace: string = " ";
      const element: any = this.element;
      classesToRemove.forEach((classToRemove: string) => {
        let classNameOfElement: string = element.className;
        if (validateString(classToRemove, "removeClass") && classNameOfElement.length) {
          classNameOfElement = classNameOfElement.replace(new RegExp("(?:^|\\s)" + classToRemove), emptyString);
          element.className = classNameOfElement[0] === emptySpace ?
            classNameOfElement.slice(1) :
            classNameOfElement;
        }
      });
      return this;
    },
    removeEventListener(id: string, listener?: any): Element<any> {
      const methodName: string = "addEventListener";
      if (validateString(id, methodName) && (isFunction(listener) || !isDefined(listener))) {
        this.element.removeEventListener(id, listener);
      }
      return this;
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
        this.element.style.height = height ? formatPixelString(height) : height;
      }
      return this;
    },
    setId(idType: string): any {
      if (validateString(idType, "setId")) {
        this.element.setAttribute("id", idType);
        this.id = idType;
      }
      return this;
    },
    setLeft(left: number = null): void {
      if (validateNumberOrNull(left, "setLeft")) {
        this.element.style.left = left ? formatPixelString(left) : left;
      }
    },
    setOpacity(opacity: number): Element<any> {
      changeOpacity(this.element, opacity);
      return this;
    },
    setSpacing(spacing: number = null): Element<any> {
      if (validateNumberOrNull(spacing, "setSpacing")) {
        this.element.style.letterSpacing = spacing ? formatPixelString(spacing) : spacing;
      }
      return this;
    },
    setText(text: string): Element<any> {
      if (validateString(text, "setText")) {
        this.element.textContent = text;
        this.currentlySetText = text;
      }
      return this;
    },
    setTextColor(color: string): Element<any> {
      if (validateStringOrNull(color, "setTextColor")) {
        this.element.style.color = color;
      }
      return this;
    },
    setTop(position: number): Element<any> {
      this.element.style.top = formatPixelString(position);
      return this;
    },
    setValue(newValue: any): any {
      this.value = newValue;
      return this;
    },
    setWidth(width: number = null): Element<any> {
      if (validateNumberOrNull(width, "setWidth")) {
        this.element.style.width = width ? formatPixelString(width) : width;
      }
      return this;
    },
    show(): any {
      this.display(null);
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
