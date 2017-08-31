import allSettings from "../../settings/settings";
import timeKeeper, {Time} from "../../tools/calculations/time";
import {Dictionary} from "../../tools/dictionary";
import single from "../../tools/singleton";
import createHsl, {Hsl} from "../color/hsl";

interface FaderPrototype {

    fadeBackground(): Fader;
    fadeBorder(): Fader;
    isFading(): boolean;
    makeBorderTransparent(): Fader;
    setColor(color: string, element: any): void;
    setElement(element: any): any;
    start(colorShifter: any): Fader;
    stop(): Fader;
    toSolid(): void;
    toWhite(): void;
}

export interface Fader extends FaderPrototype {

    color: Hsl;
    elements: any[];
    elementPropertiesToFade: any[];
    fading: boolean;
    increment: number;
    speed: number;
}

export type FaderFactory = (elements: any[], color: Hsl, speed?: number, increment?: number ) => Fader;

export default single<FaderFactory>(function() {

    const settings: Dictionary = allSettings();
    const time: Time = timeKeeper();
    const minimumLightness = 50;
    const fullLightness = 100;
    const validIndexLimit = 0;
    const colors = settings.get("colors");

    const fadeElementWith = (colorSetter: any, elementPropertiesToFade: any[]): void => {

        if (elementPropertiesToFade.indexOf(colorSetter) < validIndexLimit) {

            elementPropertiesToFade.push(colorSetter);
        }
    };
    const setBorderColor = (element: any, formattedColor: string, transparent: boolean = false): void => {

        element.style.borderColor = `${formattedColor}${transparent ? " transparent" : ""}`;
    };
    const setBackgroundColor = (element: any, formattedColor: string): void => {

        element.style.backgroundColor = formattedColor;
    };
    const increaseLightnessOfColor = ({setLightness, lightness}: Hsl, increment: number): void => {

        return setLightness(lightness + increment);
    };
    const decreaseLightnessOfColor = ({setLightness, lightness}: Hsl, increment: number): void => {

        return setLightness(lightness - increment);
    };
    const fade = (

        fader: Fader,
        color: Hsl,
        changeColor: any,
        previousLightness: number = minimumLightness,

    ): void => {

        const {elements, speed, increment, fading} = fader;
        const upperBrightnessLimit = fader.color.lightness;
        const maximumLightness = fullLightness + increment;
        const currentLightness = color.lightness;
        const nextStepDown = currentLightness - increment;
        const nextStepUp = currentLightness + increment;
        const decrementing = currentLightness < previousLightness;
        const incrementing = currentLightness > previousLightness;
        const newColor = fading ? color : null;

        time.wait(speed)
            .then(() => {

                changeColor(newColor, elements);

                if (fading) {

                    if (nextStepUp <= maximumLightness && decrementing || nextStepDown < minimumLightness) {

                        increaseLightnessOfColor(color, increment);

                    } else if (nextStepDown >= upperBrightnessLimit && incrementing || nextStepUp > fullLightness) {

                        decreaseLightnessOfColor(color, increment);
                    }

                    fade(fader, color, currentLightness, changeColor);
                }
            });
    };

    const faderPrototype: FaderPrototype = {

        fadeBackground(): Fader {

            this.fadeElementWith(setBackgroundColor, this.elementPropertiesToFade);

            return this;
        },
        fadeBorder(): Fader {

            fadeElementWith(setBorderColor, this.elementPropertiesToFade);

            return this;
        },
        isFading(): boolean {

            return this.fading;
        },
        makeBorderTransparent(): Fader {

            this.transparent = true;

            return this;
        },
        setColor(color: string, elements: any[]): void {

            this.elementPropertiesToFade.forEach((setColorOfProperty: any) => {

                elements.forEach((element) => setColorOfProperty(element, color));
            });
        },
        setElement(element: any): any {

            return this.stop()
                .setElement(element)
                .start();
        },
        start(colorShifter: any): Fader {

            const {hue, saturation, lightness}: Hsl = this.color;

            this.fading = true;

            fade(this, createHsl(hue, saturation, lightness), colorShifter);

            return this;
        },
        stop(): Fader {

            this.fading = false;

            return this;
        },
        toSolid(): void {

            const {elements, color, setColor}: Fader = this;

            elements.forEach((element) => setColor(color.format(), element));
        },
        toWhite(): void {

            const {setColor, elements}: Fader = this;

            elements.forEach((element) => setColor(colors.white.format(), element));
        },
    };

    return function(elements: any[], color: Hsl, speed: number = 10, increment: number = 1): Fader {

        const fadeMethods = Object.create(faderPrototype);
        const fading = false;
        const elementPropertiesToFade: any[] = [];

        return Object.assign(fadeMethods, {

            color,
            elements,
            elementPropertiesToFade,
            fading,
            increment,
            speed,
        });
    };
})();
