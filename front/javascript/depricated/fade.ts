import createOscillator, {Oscillator} from "../src/tools/motion/oscillator";
import notifications, {PubSub} from "../src/tools/pubSub";
import typeChecker, {TypeChecker} from "../src/tools/validation/typeChecker";
import validateCallbacks from "../src/tools/validation/validateCallbacks";
import createHsl, {Hsl, isColor} from "./color/hsl";

export interface Fader extends Oscillator {

  start(): Fader;

  stop(): Fader;

  clear(): Fader;

  isFading(): boolean;

  addCallbacks(callback: FaderCallback): Fader;

  setCallbacks(...callbacks: FaderCallback[]): Fader;

  setColor(color: Hsl): Fader;
}

type FaderCallback = (color: string) => void;

export default (function() {

  const {isFunction}: TypeChecker = typeChecker();
  const {publish}: PubSub = notifications();
  const minimumLightness = 50;
  const fullLightness = 100;

  return function(speed: number = 60, increment: number = 5): Fader {

    let color: Hsl;
    let callbacks: FaderCallback[] = [];

    const oscillator: Oscillator = createOscillator(minimumLightness, fullLightness);
    const isFading = oscillator.isOscillating;
    const setLightness = (lightness: number): void => {

      color.setLightness(lightness);

      callbacks.forEach((callback: FaderCallback): void => callback(color.format()));
    };
    const methods: any = {

      setColor(newColor: Hsl): Fader {

        if (isColor(newColor)) {

          color = createHsl(newColor.hue, newColor.saturation, newColor.lightness);

        } else {

          publish("invalidInput", {className: "fader", method: "setColor", input: newColor});
        }

        return this;
      },
      addCallbacks(callback: FaderCallback): Fader {

        if (isFunction(callback)) {

          callbacks.push(callback);

          oscillator.setCallback((lightness: number): void => setLightness(lightness));

        } else {

          publish("invalidInput", {className: "fader", method: "addCallback", input: callback});
        }

        return this;
      },
      setCallbacks(...callback: FaderCallback[]): Fader {

        callbacks = validateCallbacks(callback, "fader", "setCallback");
        oscillator.setCallback((lightness: number): void => setLightness(lightness));

        return this;
      },
      clear(): Fader {

        oscillator.clear();
        callbacks = [];

        return this;
      },
      start(): Fader {

        if (isColor(color)) {

          oscillator.setPosition(color.lightness);
          oscillator.start();

        } else {

          publish("invalidInput", {className: "fader", method: "start", input: color});
        }

        return this;
      },
      stop(): Fader {

        oscillator.stop();
        callbacks.forEach((callback: FaderCallback): void => callback(null));

        return this;
      },
    };

    oscillator.setSpeed(speed);
    oscillator.setIncrement(increment);

    return Object.assign({isFading}, oscillator, methods);
  };
}());
