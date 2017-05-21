import {default as draw, DrawingController}  from "./drawingController.js";
import {default as createDimensions, ScreenDimensions} from "./screenDimensions";

export interface CanvasController {

    pixels(): number
    get(): any
    context(): any
    render(nameForClassOfAnimations: string, hide: boolean, gridSquareSize?: number): CanvasController
    dimensions(): ScreenDimensions
}

export default function(elementName: string, contextType: string="2d"): CanvasController {

    const
        canvas: any = document.getElementById(elementName),
        context: any = canvas.getContext(contextType),
        style: any = window.getComputedStyle(canvas),
        leftPadding: number = parseFloat(style.paddingLeft),
        rightPadding: number = parseFloat(style.paddingRight),
        padding: number = leftPadding + rightPadding,
        width: number = canvas.clientWidth - padding,
        height: number = canvas.clientHeight - padding,
        dimensions: ScreenDimensions = createDimensions(width, height),
        drawingsForEachClassOfAnimation: DrawingController = draw(canvas, context, dimensions),
        clearScreen = (): void => context.clearRect(0, 0, width, height);

    let animations: any;

    return {
        get:(): any => canvas,
        context:(): any => context,
        pixels:(): number => width * height,

        render(nameForClassOfAnimations: string, hideDrawings: boolean): CanvasController {

            const draw: any = drawingsForEachClassOfAnimation[nameForClassOfAnimations];

            if (draw === undefined) {

                throw new Error(`Invalid name for animations passed to render on canvas: ${nameForClassOfAnimations} does not exist in draw module.`)
            }

            clearScreen();

            if (hideDrawings) {

                drawingsForEachClassOfAnimation.hideCurrentElement();
            }

            draw();

            return this;
        },
        dimensions:(): ScreenDimensions => createDimensions(width, height)
    };
}