import createDimensions, {Dimensions} from "../../game/coordinates/dimensions";
import {Position} from "../../game/coordinates/position";
import notifications, {PubSub} from "../../tools/pubSub";
import typeChecker, {TypeChecker} from "../../tools/typeChecker";

export interface Canvas {

    clear(): void;
    context(): any;
    dimensions(): Dimensions;
    get(): any;
    name(): string;
    pixels(): number;
    render(image: any, {x, y}: Position): void;
}

export default function(

    elementName?: string,
    canvasDimensions?: Dimensions,
    contextType: string = "2d",

): Canvas {

    const {publish}: PubSub = notifications();
    const {isString}: TypeChecker = typeChecker();
    const canvas: any = document.getElementById(elementName) || document.createElement("canvas");
    const currentContext: any = canvas.getContext(contextType);
    const style: any = window.getComputedStyle(canvas);
    const leftPadding: number = parseFloat(style.paddingLeft || 0);
    const rightPadding: number = parseFloat(style.paddingRight || 0);
    const padding: number = leftPadding + rightPadding;
    const width: number = canvasDimensions ? canvasDimensions.width : canvas.clientWidth - padding;
    const height: number = canvasDimensions ? canvasDimensions.height : canvas.clientHeight - padding;
    const clear = (): void => currentContext.clearRect(0, 0, width, height);
    const get = (): any => canvas;
    const context = (): any => currentContext;
    const pixels = (): number => width * height;
    const dimensions = (): Dimensions => createDimensions(width, height);
    const render = (image: any, {x, y}: Position): void => currentContext.drawImage(image, x, y);
    const name = (): string => elementName;

    if (isString(elementName)) {

        canvas.setAttribute("id", elementName);

        return {

            clear,
            context,
            dimensions,
            get,
            name,
            pixels,
            render,
        };
    }

    publish("invalidInput", {
        className: "canvas",
        input: elementName,
        method: "constructor",
    });
}
