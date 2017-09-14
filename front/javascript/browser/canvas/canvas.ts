import createDimensions, {Dimensions} from "../../game/coordinates/dimensions";
import {Position} from "../../game/coordinates/position";
import getSettings from "../../settings/settings";
import notifications, {PubSub} from "../../tools/pubSub";
import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";
import createElement, {Element} from "../dom/element/element";

export interface Canvas<Type> extends Element<Type> {

    clear(): Canvas<Type>;
    context(): any;
    dimensions(): Dimensions;
    pixels(): number;
    render(image: any, {x, y}: Position): Canvas<Type>;
}

export default (function() {

    const animationContext: string = getSettings().get("canvas", "context");
    const {publish}: PubSub = notifications();
    const {isString, isDefined}: TypeChecker = typeChecker();

    return function<Type>(elementName: string, canvasDimensions?: Dimensions, existing?: any): Canvas<Type> {

        const canvas: Element<Type> = createElement<Type>(elementName, "canvas").setClass("canvas");
        const currentContext: any = canvas.element.getContext(animationContext);
        const {paddingLeft, paddingRight}: any = window.getComputedStyle(existing || canvas.element);
        const leftPadding: number = parseFloat(paddingLeft || 0);
        const rightPadding: number = parseFloat(paddingRight || 0);
        const padding: number = leftPadding + rightPadding;
        const width: number = canvasDimensions ? canvasDimensions.width : canvas.clientWidth - padding;
        const height: number = canvasDimensions ? canvasDimensions.height : canvas.clientHeight - padding;
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

        if (isString(elementName)) {

            if (isDefined(existing)) {

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

        publish("invalidInput", {
            className: "canvas",
            input: elementName,
            method: "constructor",
        });
    };
}());
