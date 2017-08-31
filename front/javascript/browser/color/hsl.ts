import single from "../../tools/singleton";

interface HslPrototype {

    format(): string;
    setHue(hue: number): void;
    setSaturation(saturation: number): void;
    setLightness(lightness: number): void;
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

        setHue(hue: number): void {

            this.hue = hue;
        },

        setSaturation(saturation: number): void {

            this.saturation = saturation;
        },

        setLightness(lightness: number): void {

            this.lightness = lightness;
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
