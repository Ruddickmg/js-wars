import createCache, {Cache} from "../../tools/cache";
import notifications, {PubSub} from "../../tools/pubSub";
import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";
import createCanvas, {Canvas} from "./canvas";

export interface CanvasCache extends Cache<Canvas<any>> {

    initialize(...canvases: any[]): CanvasCache;
}

export default function(...initialCanvasNames: string[]): CanvasCache {

    const errorChannel: string = "animationError";
    const nameOfClass: string = "canvasCache";
    const {isString}: TypeChecker = typeChecker();
    const {publish}: PubSub = notifications();
    const initialize = function(...canvasNames: string[]): CanvasCache {

        const cache: CanvasCache = this;

        canvasNames.forEach((canvasName: string) => {

            if (isString(canvasName)) {

                cache.add(canvasName, createCanvas<any>(canvasName, undefined, document.getElementById(canvasName)));

            } else {

                publish(["invalidInput", errorChannel], {
                    className: nameOfClass,
                    input: canvasName,
                    method: "initialize",
                });
            }
        });

        return this;
    };

    const cache: CanvasCache = Object.assign(createCache<Canvas<any>>(), {
        initialize,
    });

    if (initialCanvasNames.length) {

        cache.initialize(...initialCanvasNames);
    }

    return cache;
}
