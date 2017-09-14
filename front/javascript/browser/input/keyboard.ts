import allSettings from "../../settings/settings";
import capitalizeFirstLetter from "../../tools/stringManipulation/capitalizeFirstLetter";
import checkForTruthInArray from "../../tools/array/checkForTruthInArray";
import {Dictionary} from "../../tools/storage/dictionary";
import invert from "../../tools/object/inverter";
import notifications, {PubSub} from "../../tools/pubSub";
import single from "../../tools/storage/singleton";
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

    getAssignment(keyCode: number): string;
    assignKey(key: string, keyCode: number): void;
    clearPressedKeys(): void;
    clearReleasedKeys(): void;
    press(key: number): void;
    pressed(...keysToCheck: any[]): boolean;
    pressingAnyKey(): boolean;
    released(key: number | string): boolean;
    releasedAnyKey(): boolean;
    undo(key: number | string): number;
    undoKeyUp(key: number | string): number;
    [index: string]: any;
}

export default single<KeyBoard>(function() {

    let pressedKeys: Keys = {};
    let releasedKeys: Keys = {};

    const {isNumber, isString}: TypeChecker = typeChecker();
    const {publish, subscribe}: PubSub = notifications();
    const settings: Dictionary = allSettings();

    const {
        keyCodeMappings,
        factorsAllowingKeyboardInput,
        factorsDenyingKeyboardInput,
    }: KeyboardSettings = settings.toObject("keys");

    const keysByKeyCode: KeyCodesOfKeys = invert(keyCodeMappings);
    const factorsToAllowKeyPress: boolean[] = factorsAllowingKeyboardInput.map((): boolean => false);
    const factorsThatDenyKeyPress: boolean[] = factorsDenyingKeyboardInput.map((): boolean => false);
    const isEmpty = (specifiedKeys: Keys): boolean => {

        const empty = 0;

        return Object.keys(specifiedKeys).length <= empty;
    };
    const assignKey = (key: string, keyCode: number): void => {

        const keyIsString = isString(key);

        if (keyIsString && isNumber(keyCode)) {

            delete keysByKeyCode[keyCode];

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
    const press = (key: number): void => {

        const pressedKey = input(key);

        if (!pressing(pressedKey)) {

            pressedKeys[pressedKey] = true;

            publish("keyPressed", pressedKey);
        }
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

        releasedKeys[keyCode] = true;

        removePressedKey(keyCode);

        publish("keyReleased", keyCode);
    };
    const keyPressed = ({keyCode}: any): void => {

        if (canPressKeys() || keyCode === keyCodeMappings.esc) {

            press(keyCode);
        }
    };
    const pressed = (...keysToCheck: any[]): boolean => {

        return checkForTruthInArray(keysToCheck, (key: any): boolean => pressing(key));
    };
    const released = (key: number | string): boolean => releasedKeys[input(key)] || !isEmpty(releasedKeys);
    const remove = (key: number | string, specifiedKeys: Keys): number => {

        const keyCode: number = input(key);

        delete specifiedKeys[keyCode];

        return keyCode;
    };
    const undo = (key: number | string): number => remove(key, pressedKeys);
    const undoKeyUp = (key: number | string) => remove(key, releasedKeys);
    const getAssignment = (keyCode: number): string => keysByKeyCode[keyCode];
    const keyMap: any = {};
    const keyPressedMap: any = {};

    Object.keys(keyCodeMappings).forEach((keyName: string) => {

        const key = keyCodeMappings[keyName];
        const capitalizedKey: string = capitalizeFirstLetter(keyName);
        const pressedKey: string = `pressed${capitalizedKey}`;
        const releasedKey: string = `released${capitalizedKey}`;

        keyMap[keyName] = (): number => key;
        keyPressedMap[pressedKey] = (): boolean => pressed(key);
        keyPressedMap[releasedKey] = (): boolean => released(key);
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
        released,
        releasedAnyKey,
        undo,
        undoKeyUp,
    });
}());
