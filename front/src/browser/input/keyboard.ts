import allSettings from "../../settings/settings";
import capitalizeFirstLetter from "../../tools/capitalizeFirstLetter";
import checkForTruthInArray from "../../tools/checkForTruthInArray";
import notifier, {PubSub} from "../../tools/pubSub";
import single from "../../tools/singleton";

interface Keys {

    [index: string]: boolean;
}

export default single(() => {

    let pressedKeys: Keys = {};
    let releasedKeys: Keys = {};

    const {publish, subscribe}: PubSub = notifier();
    const settings = allSettings();
    const keys = settings.get("keys");
    const factorsAllowingKeyboardInput: string[] = settings.get("factorsAllowingKeyboardInput");
    const factorsDenyingKeyboardInput: string[] = settings.get("factorsDenyingKeyboardInput");
    const factorsToAllowKeyPress = factorsAllowingKeyboardInput.map((): boolean => false);
    const factorsThatDenyKeyPress = factorsDenyingKeyboardInput.map((): boolean => false);
    const isEmpty = (specifiedKeys: Keys): boolean => {

        const empty = 0;

        return Object.keys(specifiedKeys).length <= empty;
    };
    const assignKey = (key: string, keyCode: number) => {

        keys[key] = keyCode;
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
    const pressing = (key?: number): boolean => pressedKeys[key];
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
    const keyUp = (key: any): boolean => releasedKeys[key] || !isEmpty(releasedKeys);
    const remove = (key: number | string, specifiedKeys: Keys): number => {

        const keyCode: number = input(key);

        delete specifiedKeys[keyCode];

        return keyCode;
    };
    const undo = (key: number | string) => remove(key, pressedKeys);
    const undoKeyUp = (key: number | string) => remove(key, releasedKeys);

    const keyMap: any = {};
    const keyPressedMap: any = {};

    Object.keys(keys).forEach((keyName: string) => {

        const key = keys[keyName];

        keyMap[keyName] = (): number => key;
        keyPressedMap[`pressed${capitalizeFirstLetter(keyName)}Key`] = (): boolean => pressed(key);
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
        keyUp,
        press,
        pressed,
        pressingAnyKey,
        releasedAnyKey,
        undo,
        undoKeyUp,
    });
});
