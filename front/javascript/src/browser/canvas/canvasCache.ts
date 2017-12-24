import createCache, {Cache} from "../../tools/storage/cache";
import validator, {Validator} from "../../tools/validation/validator";
import createCanvas, {Canvas} from "./canvas";

export interface CanvasCache extends Cache<Canvas<any>> {
  initialize(...canvases: any[]): CanvasCache;
}

export default function(...initialCanvasNames: string[]): CanvasCache {
  const {validateString}: Validator = validator("canvasCache");
  const canvasCache: any = createCache<Canvas<any>>();
  canvasCache.initialize = function(...canvasNames: string[]): CanvasCache {
    const cache: CanvasCache = this;
    canvasNames.forEach((canvasName: string) => {
      if (validateString(canvasName, "initialize")) {
        cache.add(canvasName, createCanvas<any>(canvasName, null, document.getElementById(canvasName)));
      }
    });
    return this;
  };
  if (initialCanvasNames.length) {
    canvasCache.initialize(...initialCanvasNames);
  }
  return canvasCache;
}
