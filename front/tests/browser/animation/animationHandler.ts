import {default as canvasHandler, CanvasHandler} from "./canvasHandler.js";
import {CanvasController} from "./canvas";
import {Dimensions} from "./dimensions";

export interface AnimationHandler {

    getCanvas(name: string): CanvasController
    show(...objectName: string[]): AnimationHandler
    hide(...objectName: string[]): AnimationHandler
    dimensions(objectName: string): Dimensions
    initialize(...canvases: any[]): AnimationHandler
}

export default function(...initialCanvasNames: string[]): AnimationHandler {

    const

        canvas: CanvasHandler = canvasHandler(),
        initialize = (canvasNames: string[]): void => canvasNames.forEach((name: string): CanvasHandler => canvas.addPlayer(name)),
        animate = (hide: boolean, objectNames: string[]): void => {

            window.requestAnimationFrame(() => {

                objectNames.forEach((nameOfCanvasToBeRedrawn: string): void => {

                    const currentCanvas: CanvasController = canvas.getPlayer(nameOfCanvasToBeRedrawn);

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

        getCanvas:(name: string): CanvasController => canvas.getPlayer(name),
        show(...objectName: string[]): AnimationHandler {

            animate(false, objectName);

            return this;
        },
        hide(...objectName: string[]): AnimationHandler {

            animate(true, objectName);

            return this;
        },
        dimensions(objectName: string): Dimensions {

            const storedCanvas = canvas.getPlayer(objectName);

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