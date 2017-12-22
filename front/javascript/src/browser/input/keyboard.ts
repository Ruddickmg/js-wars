import allSettings from "../../settings/settings";
import checkForTruthInArray from "../../tools/array/checkForTruthInArray";
import invert from "../../tools/object/inverter";
import {publish, subscribe} from "../../tools/pubSub";
import {Dictionary} from "../../tools/storage/dictionary";
import single from "../../tools/storage/singleton";
import capitalizeFirstLetter from "../../tools/stringManipulation/capitalizeFirstLetter";
import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";

interface Keys {
  [index: string]: boolean;
}

interface KeysOfKeyCodes {
  [key: string]: number;
}

interface KeyCodesOfKeys {
  [keyCode: number]: string;
}

interface KeyboardSettings {
  keyCodeMappings: KeysOfKeyCodes;
  factorsAllowingKeyboardInput: string[];
  factorsDenyingKeyboardInput: string[];
}

export interface KeyBoard {
  assignKey(key: string, keyCode: number): void;
  clearPressedKeys(): void;
  clearReleasedKeys(): void;
  getAssignment(keyCode: number): string;
  press(key: number | string): void;
  pressed(...keysToCheck: any[]): boolean;
  pressingAnyKey(): boolean;
  release(key: number | string): boolean;
  release(key: number | string): void;
  released(key: number | string): boolean;
  releasedAnyKey(): boolean;
  undoPress(key: number | string): number;
  undoRelease(key: number | string): number;
  [index: string]: (...input: any[]) => any;
}

export default single<KeyBoard>(function() {

  let pressedKeys: Keys = {};
  let releasedKeys: Keys = {};

  const myUndefined: any = void 0;
  const {isNumber, isString, isDefined}: TypeChecker = typeChecker();
  const settings: Dictionary = allSettings();

  const {
    keyCodeMappings,
    factorsAllowingKeyboardInput,
    factorsDenyingKeyboardInput,
  }: KeyboardSettings = settings.toObject("keyboard");

  const keysByKeyCode: KeyCodesOfKeys = invert(keyCodeMappings);
  const factorsToAllowKeyPress: boolean[] = factorsAllowingKeyboardInput.map((): boolean => false);
  const factorsThatDenyKeyPress: boolean[] = factorsDenyingKeyboardInput.map((): boolean => false);
  const isEmpty = (specifiedKeys: Keys): boolean => {
    const empty = 0;
    return Object.keys(specifiedKeys).length <= empty;
  };
  const assignKey = (key: string, keyCode: number): void => {
    const keyIsString = isString(key);
    if (isNumber(keyCode)) {
      keysByKeyCode[keyCode] = myUndefined;
      keyCodeMappings[key] = keyCode;
      keysByKeyCode[keyCode] = key;
    } else {
      throw Error(`Invalid ${keyIsString ? "key code" : "key name"} entered for keyboard assignment`);
    }
  };
  const canPressKeys = (): boolean => {
    return checkForTruthInArray(factorsToAllowKeyPress)
      && !checkForTruthInArray(factorsThatDenyKeyPress);
  };
  const input = (key: any): number => isNumber(key) ? key : keyCodeMappings[key];
  const clearReleasedKeys = (): void => {
    releasedKeys = {};
  };
  const clearPressedKeys = (): void => {
    pressedKeys = {};
  };
  const removePressedKey = (key: number): number => {
    delete pressedKeys[key];
    return key;
  };
  const press = (key: number | string): void => {
    const pressedKey: number = input(key);
    const keyName: string = keysByKeyCode[pressedKey];
    if (!pressing(pressedKey) && isString(keyName)) {
      pressedKeys[pressedKey] = true;
      publish(`pressed${capitalizeFirstLetter(keyName)}Key`, pressedKey);
      publish("keyPressed", pressedKey);
    }
  };
  const release = (key: number | string): number => {
    const keyCode: number = input(key);
    keyReleased({keyCode});
    return keyCode;
  };
  const pressing = (key: number | string): boolean => {
    const received: any = input(key);
    if (isNumber(key) || isString(key)) {
      return pressedKeys[received];
    }
    publish("invalidInput", {className: "keyBoard", input: key, method: "pressing", fatal: true});
  };
  const pressingAnyKey = (): boolean => !isEmpty(pressedKeys);
  const releasedAnyKey = (): boolean => !isEmpty(releasedKeys);
  const keyReleased = ({keyCode}: any): void => {
    const keyName: string = keysByKeyCode[keyCode];
    if (isString(keyName)) {
      releasedKeys[keyCode] = true;
      removePressedKey(keyCode);
      publish(`released${capitalizeFirstLetter(keyName)}Key`, keyCode);
      publish("keyReleased", keyCode);
    }
  };
  const keyPressed = ({keyCode}: any): void => {
    if (canPressKeys() || keyCode === keyCodeMappings.esc) {
      press(keyCode);
    }
  };
  const pressed = (...keysToCheck: any[]): boolean => {
    return checkForTruthInArray(keysToCheck, (key: any): boolean => pressing(key));
  };
  const released = (key: number | string): boolean => isDefined(releasedKeys[input(key)]);
  const remove = (key: number | string, specifiedKeys: Keys): number => {
    const keyCode: number = input(key);
    specifiedKeys[keyCode] = myUndefined;
    return keyCode;
  };
  const undoPress = (key: number | string): number => remove(key, pressedKeys);
  const undoRelease = (key: number | string): number => remove(key, releasedKeys);
  const getAssignment = (keyCode: number): string => keysByKeyCode[keyCode];
  const keyMap: any = {};
  const keyPressedMap: any = {};
  const actions: any = {pressed, released, press, release, undoPress, undoRelease};

  Object.keys(keyCodeMappings).forEach((keyName: string) => {
    const key = keyCodeMappings[keyName];
    const capitalizedKey: string = capitalizeFirstLetter(keyName);
    keyMap[keyName] = (): number => key;
    Object.keys(actions).forEach((action: string): void => {
      keyPressedMap[`${action}${capitalizedKey}`] = (): boolean => actions[action](key);
    });
  });

  factorsAllowingKeyboardInput.forEach((factor: string, indexOfFactor: number) => {
    subscribe(factor, (status: boolean) => {
      factorsToAllowKeyPress[indexOfFactor] = status;
    });
  });

  window.addEventListener("keydown", keyPressed, false);
  window.addEventListener("keyup", keyReleased, false);

  return Object.assign(keyMap, keyPressedMap, {

    assignKey,
    clearPressedKeys,
    clearReleasedKeys,
    getAssignment,
    press,
    pressed,
    pressingAnyKey,
    release,
    released,
    releasedAnyKey,
    undoPress,
    undoRelease,
  });
}());
