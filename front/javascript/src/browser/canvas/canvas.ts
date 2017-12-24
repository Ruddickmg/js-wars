import createDimensions, {Dimensions} from "../../game/map/coordinates/dimensions";
import {Position} from "../../game/map/coordinates/position";
import getSettings from "../../settings/settings";
import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";
import validator, {Validator} from "../../tools/validation/validator";
import createElement, {Element} from "../dom/element/element";

export interface Canvas<Type> extends Element<Type> {
  clear(): Canvas<Type>;
  context(): any;
  dimensions(): Dimensions;
  pixels(): number;
  render(image: any, {x, y}: Position): Canvas<Type>;
}

export function isCanvas(element: any) {
  const {isDefined, isFunction}: TypeChecker = typeChecker();
  return isDefined(element)
    && isFunction(element.clear)
    && isFunction(element.context)
    && isFunction(element.dimensions)
    && isFunction(element.pixels)
    && isFunction(element.render);
}

export default (function() {
  const {validateString}: Validator = validator("canvas");
  const animationContext: string = getSettings().get("canvas", "context");
  const {isDefined, isNull}: TypeChecker = typeChecker();
  return function <Type>(elementName: string, canvasDimensions?: Dimensions, existing?: any): Canvas<Type> {
    const canvas: Element<Type> = createElement<Type>(elementName, existing || "canvas").setClass("canvas");
    const currentContext: any = canvas.element.getContext(animationContext);
    const {paddingLeft, paddingRight}: any = window.getComputedStyle(canvas.element);
    const leftPadding: number = parseFloat(paddingLeft || 0);
    const rightPadding: number = parseFloat(paddingRight || 0);
    const padding: number = leftPadding + rightPadding;
    const elementWidth: number = canvas.element.style.width
      || canvas.element.width
      || canvas.element.clientWidth - padding;
    const elementHeight: number = canvas.element.style.height
      || canvas.element.height
      || canvas.element.clientHeight - padding;
    const width: number = canvasDimensions ? canvasDimensions.width : elementWidth;
    const height: number = canvasDimensions ? canvasDimensions.height : elementHeight;
    const clear = function(): Canvas<Type> {
      currentContext.clearRect(0, 0, width, height);
      return this;
    };
    const context = (): any => currentContext;
    const pixels = (): number => width * height;
    const dimensions = (): Dimensions => createDimensions(width, height);
    const render = function(image: any, {x, y}: Position): Canvas<Type> {
      currentContext.drawImage(image, x, y);
      return this;
    };
    if (validateString(elementName, "constructor")) {
      if (isDefined(existing) && !isNull(existing)) {
        canvas.element = existing;
      } else {
        canvas.setWidth(width);
        canvas.setHeight(height);
      }
      return Object.assign(canvas, {
        clear,
        context,
        dimensions,
        pixels,
        render,
      });
    }
  };
}());
