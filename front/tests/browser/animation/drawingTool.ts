import {default as createDrawingTool, DrawingTool} from "./lineTool";
import canvasAnimations from "./animations.js";
import {Dimensions} from "./dimensions";

export interface DrawingCache {

    hide(): void
    get(name: string): any
    isCached(name: string): boolean
    draw(name): any
    createCanvas(): any
    cache(name: string, canvas: any): DrawingCache
}

export default function (screenCanvas: any, context: any, {width, height}: Dimensions, base: number, offsetNeededToCenterDrawing: number=0): DrawingCache {

    const
        cache = {},
        animateDrawing: any = canvasAnimations(width, height),
        drawingTool = createDrawingTool(width, height, base);

    return {

        hide:(): void => animateDrawing.hideCurrentElement(),
        get:(name: string): any => cache[name],
        isCached:(name: string): boolean => cache[name] !== undefined,
        draw(name: string, canvas: any=screenCanvas): any {

            const
                x: number  = width / offsetNeededToCenterDrawing, // may not work for normal canvas drawings <-- check here first if problems
                y: number = height / offsetNeededToCenterDrawing,
                drawing: any = canvas.getContext(context),
                line: DrawingTool = drawingTool(x, y);

            animateDrawing[name](drawing, line);

            return drawing;
        },
        createCanvas(): any {

            const gridSquareCanvas = document.createElement('canvas');

            gridSquareCanvas.width = width * offsetNeededToCenterDrawing;
            gridSquareCanvas.height = height * offsetNeededToCenterDrawing;

            return gridSquareCanvas;
        },
        cache(name: string, canvas: any): DrawingCache {

            cache[name] = canvas;

            return this;
        }
    }
}