import {default as canvasHandler, CanvasHandler} from "./canvasHandler.js";
import {CanvasController} from "./canvas";
import {ScreenDimensions} from "./screenDimensions";

export interface AnimationHandler {

    getCanvas(name: string): CanvasController
    show(...objectName: string[]): AnimationHandler
    hide(...objectName: string[]): AnimationHandler
    dimensions(objectName: string): ScreenDimensions
    initialize(...canvases: any[]): AnimationHandler
}

export default function(...initialCanvasNames: string[]): AnimationHandler {

    const

        canvas: CanvasHandler = canvasHandler(),
        initialize = (canvasNames: string[]): void => canvasNames.forEach((name: string): CanvasHandler => canvas.addElement(name)),
        animate = (hide: boolean, objectNames: string[]): void => {

            window.requestAnimationFrame(() => {

                objectNames.forEach((nameOfCanvasToBeRedrawn: string): void => {

                    const currentCanvas: CanvasController = canvas.get(nameOfCanvasToBeRedrawn);

                    if (currentCanvas) {

                        currentCanvas.render(nameOfCanvasToBeRedrawn, hide);
                    }
                });
            });
        };

    if (initialCanvasNames.length) {

        initialize(initialCanvasNames);
    }

    return {

        getCanvas:(name: string): CanvasController => canvas.get(name),
        show(...objectName: string[]): AnimationHandler {

            animate(false, objectName);

            return this;
        },
        hide(...objectName: string[]): AnimationHandler {

            animate(true, objectName);

            return this;
        },
        dimensions(objectName: string): ScreenDimensions {

            const storedCanvas = canvas.get(objectName);

            if (storedCanvas) {

                return storedCanvas.dimensions()
            }
        },
        initialize(...canvasNames: string[]): AnimationHandler {

            initialize(canvasNames);

            return this;
        }
    };
}