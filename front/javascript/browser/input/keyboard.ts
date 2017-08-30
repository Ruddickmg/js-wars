import allSettings from "../../settings/settings";
import capitalizeFirstLetter from "../../tools/capitalizeFirstLetter";
import checkForTruthInArray from "../../tools/checkForTruthInArray";
import invert from "../../tools/invertObject";
import notifications, {PubSub} from "../../tools/pubSub";
import single from "../../tools/singleton";
import typeChecker, {TypeChecker} from "../../tools/typeChecker";

interface Keys {

    [index: string]: boolean;
}

interface KeysOfKeyCodes {

    [key: string]: number;
}

interface KeyCodesOfKeys {

    [keyCode: number]: string;
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

    const check: TypeChecker = typeChecker();
    const {publish, subscribe}: PubSub = notifications();
    const settings = allSettings();
    const keys: KeysOfKeyCodes = settings.get("keys");
    const keysByKeyCode: KeyCodesOfKeys = invert(keys);
    const factorsAllowingKeyboardInput: string[] = settings.get("factorsAllowingKeyboardInput");
    const factorsDenyingKeyboardInput: string[] = settings.get("factorsDenyingKeyboardInput");
    const factorsToAllowKeyPress = factorsAllowingKeyboardInput.map((): boolean => false);
    const factorsThatDenyKeyPress = factorsDenyingKeyboardInput.map((): boolean => false);
    const isEmpty = (specifiedKeys: Keys): boolean => {

        const empty = 0;

        return Object.keys(specifiedKeys).length <= empty;
    };
    const assignKey = (key: string, keyCode: number): void => {

        const keyIsString = check.isString(key);

        if (keyIsString && check.isNumber(keyCode)) {

            delete keysByKeyCode[keyCode];

            keys[key] = keyCode;
            keysByKeyCode[keyCode] = key;

        } else {

            throw Error(`Invalid ${keyIsString ? "key code" : "key name"} entered for keyboard assignment`);
        }
    };
    const canPressKeys = (): boolean => {

        return checkForTruthInArray(factorsToAllowKeyPress)
            && !checkForTruthInArray(factorsThatDenyKeyPress);
    };
    const input = (key: any): number => isNaN(key) ? keys[key] : key;
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
    const pressing = (key: number | string): boolean => pressedKeys[input(key)];
    const pressingAnyKey = (): boolean => !isEmpty(pressedKeys);
    const releasedAnyKey = (): boolean => !isEmpty(releasedKeys);
    const keyReleased = ({keyCode}: any): void => {

        releasedKeys[keyCode] = true;

        removePressedKey(keyCode);

        publish("keyReleased", keyCode);
    };
    const keyPressed = ({keyCode}: any): void => {

        if (canPressKeys() || keyCode === keys.esc) {

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

    Object.keys(keys).forEach((keyName: string) => {

        const key = keys[keyName];
        const capitalizedKey: string = capitalizeFirstLetter(keyName);
        const pressedKey: string = `pressed${capitalizedKey}`;
        const releasedKey: string = `released${capitalizedKey}`;

        keyMap[keyName] = (): number => key;
        keyPressedMap[pressedKey] = (): boolean => pressed(key);
        keyPressedMap[releasedKey] = (): boolean => released(key);
    });

    factorsAllowingKeyboardInput.concat(factorsAllowingKeyboardInput)
        .forEach((factor: string, indexOfFactor: number) => {

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
