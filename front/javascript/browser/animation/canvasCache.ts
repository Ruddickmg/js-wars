import createCache, {Cache} from "../../tools/cache";
import notifications, {PubSub} from "../../tools/pubSub";
import typeChecker, {TypeChecker} from "../../tools/typeChecker";
import createCanvas, {Canvas} from "./canvas";

export interface CanvasCache extends Cache<Canvas> {

    initialize(...canvases: any[]): CanvasCache;
    formatCanvasName(name: string): string;
}

export default function(...initialCanvasNames: string[]): CanvasCache {

    const errorChannel: string = "animationError";
    const nameOfClass: string = "canvasCache";
    const {isString}: TypeChecker = typeChecker();
    const {publish}: PubSub = notifications();
    const formatCanvasName = (name: string): string => `${name}Canvas`;
    const initialize = function(...canvasNames: string[]): CanvasCache {

        canvasNames.forEach((canvasName: string) => {

            if (isString(canvasName)) {

                this.add(canvasName, createCanvas(formatCanvasName(canvasName)));

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

    const cache: CanvasCache = Object.assign(createCache<Canvas>(), {
        initialize,
        formatCanvasName,
    });

    if (initialCanvasNames.length) {

        cache.initialize(...initialCanvasNames);
    }

    return cache;
}
