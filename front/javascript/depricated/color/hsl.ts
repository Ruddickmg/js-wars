import single from "../../src/tools/storage/singleton";
import {isDefined, isFunction, isNumber} from "../../src/tools/validation/typeChecker";

interface HslPrototype {

  format(): string;
  setHue(hue: number): Hsl;
  setSaturation(saturation: number): Hsl;
  setLightness(lightness: number): Hsl;
}

export interface Hsl extends HslPrototype {

  hue: number;
  saturation: number;
  lightness: number;
}

export type HslFactory = (hue: number, saturation: number, lightness: number) => Hsl;

export default single<HslFactory>(function() {

  const hslPrototype = {

    format() {

      const {hue, saturation, lightness} = this;

      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    },

    setHue(hue: number): Hsl {

      this.hue = hue;

      return this;
    },

    setSaturation(saturation: number): Hsl {

      this.saturation = saturation;

      return this;
    },

    setLightness(lightness: number): Hsl {

      this.lightness = lightness;

      return this;
    },
  };

  return function(hue: number = 0, saturation: number = 0, lightness: number = 0): Hsl {

    const hslMethods = Object.create(hslPrototype);

    return Object.assign(hslMethods, {

      hue,
      lightness,
      saturation,
    });
  };
})();

export function isColor(element: any): boolean {
  return isDefined(element)
    && isNumber(element.hue)
    && isNumber(element.lightness)
    && isNumber(element.saturation)
    && isFunction(element.format)
    && isFunction(element.setLightness)
    && isFunction(element.setHue)
    && isFunction(element.setLightness);
}
