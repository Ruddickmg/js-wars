import appSettings from "../../settings/settings";
import {Dictionary} from "../../tools/dictionary";
import {Element} from "../dom/element";

export interface TypeWriter {

    reset(): void;
    restoreDefaults(): void;
    setSpeed(speed: number): void;
    type(element: any, sentence: string): void;
}

export default (function() {

    const scaleForSpeed: number = 10;
    const scaleUpSpeed = (speed: number) => speed * scaleForSpeed;
    const settings: Dictionary = appSettings();
    const typingSpeed: number = settings.get("typingSpeed");
    const defaultSpeed: number = scaleUpSpeed(typingSpeed);
    const sentenceChangedError: Error = Error("Sentence changed while typing.");

    return function(): TypeWriter {

        let speed: number = defaultSpeed;
        let writer: any;
        let text: string;

        const nothing: number = 0;
        const restoreDefaults = () => { speed = defaultSpeed; };
        const stillWritingTheSameSentence = (sentence: string): boolean => text === sentence;
        const setSpeed = (newSpeed: number): void => { speed = scaleUpSpeed(newSpeed); };
        const type = (element: Element<any>, sentence: string): Promise<any> => {

            const char = sentence[0];
            const remaining = sentence.slice(1);
            const moreToType = remaining.length > nothing;

            return new Promise((resolve, reject) => {

                writer = setTimeout(() => {

                    if (stillWritingTheSameSentence(sentence)) {

                        element.setText(element.getText() + char);
                        text = remaining;
                        return resolve(remaining);
                    }

                    return reject(sentenceChangedError);

                }, speed);

            })
                .then(() => moreToType ? type(element, remaining) : Promise.resolve(element))
                .catch((error: Error) => {

                    if (error === sentenceChangedError) {

                        return reset();
                    }

                    throw error;
                });
        };
        const reset = (): void => {

            clearTimeout(writer);
            text = undefined;
        };

        return {

            reset,
            restoreDefaults,
            setSpeed,
            type,
        };
    };
}());
