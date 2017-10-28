import createCache, {Cache} from "../../tools/storage/cache";
import validator, {Validator} from "../../tools/validation/validator";
import createCanvas, {Canvas} from "./canvas";
export interface CanvasCache extends Cache<Canvas<any>> {

  initialize(...canvases: any[]): CanvasCache;
}
export default function(...initialCanvasNames: string[]): CanvasCache {

  const {validateString}: Validator = validator("canvasCache");
  const initialize = function(...canvasNames: string[]): CanvasCache {

    const cache: CanvasCache = this;

    canvasNames.forEach((canvasName: string) => {

      if (validateString(canvasName, "initialize")) {

        cache.add(canvasName, createCanvas<any>(canvasName, undefined, document.getElementById(canvasName)));
      }
    });

    return this;
  };
  const cache: CanvasCache = Object.assign(createCache<Canvas<any>>(), {initialize});

  if (initialCanvasNames.length) {

    cache.initialize(...initialCanvasNames);
  }
  return cache;
}
