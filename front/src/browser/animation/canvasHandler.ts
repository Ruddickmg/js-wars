import {default as createCanvas, CanvasController} from "./canvas.js";

interface Canvases {

    [index: string]: CanvasController
}

export interface CanvasHandler {

    get(name: string): CanvasController
    add(name: string, contextType?: string): CanvasHandler
    remove(name: string): CanvasController
}

export default function(): CanvasHandler {

    const canvases: Canvases = {};

    return {

        get:(name: string): CanvasController => canvases[name],
        add(name: string, contextType?: string): CanvasHandler {

            canvases[name] = createCanvas(`${name}Canvas`, contextType);

            return this;
        },
        remove(name: string): CanvasController {

            const canvas: CanvasController = canvases[name];

            delete canvases[name];

            return canvas;
        }
    };
}