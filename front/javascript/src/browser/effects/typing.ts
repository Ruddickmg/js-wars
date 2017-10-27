import appSettings from "../../settings/settings";
import {Dictionary} from "../../tools/storage/dictionary";
import {Element} from "../dom/element/element";

export interface TypeWriter {

  reset(): void;

  restoreDefaults(): void;

  setSpeed(speed: number): void;

  type(element: any, sentence: string): void;
}

export default (function() {

  const empty: string = "";
  const scaleForSpeed: number = 10;
  const scaleUpSpeed = (speed: number) => speed * scaleForSpeed;
  const settings: Dictionary = appSettings();
  const typingSpeed: number = settings.get("typingSpeed");
  const defaultSpeed: number = scaleUpSpeed(typingSpeed);

  return function(): TypeWriter {

    let speed: number = defaultSpeed;
    let writer: any;
    let text: string;

    const nothing: number = 0;
    const restoreDefaults = () => {
      speed = defaultSpeed;
    };
    const stillWritingTheSameSentence = (sentence: string): boolean => text === sentence || !text;
    const setSpeed = (newSpeed: number): void => {
      speed = scaleUpSpeed(newSpeed);
    };
    const type = (element: Element<any>, sentence: string): Promise<any> => {

      const char = sentence[0];
      const remaining = sentence.slice(1);
      const moreToType = remaining.length > nothing;
      const currentText: string = (element.getText() || empty) + char;
      const changedSentences: boolean = !stillWritingTheSameSentence(sentence);

      return new Promise((resolve) => {

        writer = setTimeout(() => {

          if (changedSentences) {

            reset();
            element.setText(empty);
          }

          element.setText(currentText);
          text = remaining;
          return resolve(remaining);

        }, speed);
      }).then(() => moreToType ? type(element, remaining) : Promise.resolve(element))
        .catch((error: Error) => {

          throw error;
        });
    };
    const reset = (): void => {

      clearTimeout(writer);
      text = empty;
    };

    return {

      reset,
      restoreDefaults,
      setSpeed,
      type,
    };
  };
}());
