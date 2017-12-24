import appSettings from "../../settings/settings";
import {Dictionary} from "../../tools/storage/dictionary";
import timedIterator, {TimedIterator} from "../../tools/timedIterator";

type CallBack = (text: string, index: number, wholeString: string) => any;

export interface TypeWriter extends TimedIterator {
  restoreDefaults(): TypeWriter;
  type(sentence: string, callback?: CallBack): Promise<string>;
}

export default (function() {
  const settings: Dictionary = appSettings();
  const defaultSpeed: number = settings.get("typingSpeed");
  const iterator: TimedIterator = timedIterator();
  return function(): TypeWriter {
    const type = (sentence: string, callback: CallBack): Promise<string> => iterator.iterate(sentence, callback);
    const restoreDefaults = function(): TypeWriter {
      iterator.setSpeed(defaultSpeed);
      return this;
    };
    return Object.assign(iterator, {
      restoreDefaults,
      type,
    });
  };
}());
