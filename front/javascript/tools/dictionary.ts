import typeChecker, {TypeChecker} from "./validation/typeChecker";

export interface Dictionary {

    add(...keysFollowedByValue: any[]): Dictionary;
    get(...keys: any[]): any;
    lookup(...keys: any[]): boolean;
    redefine(...keys: any[]): Dictionary;
    remove(...keys: any[]): any;
    map(callback: (value: any, index: string, object: any) => any): Dictionary;
    reduce(callback: (accumulator: any, value: any, index: string, object: any) => any, accumulator?: any): any;
    toObject(...path: any[]): any;
}

export default function createDictionary(initialValues?: any): Dictionary {

    const check: TypeChecker = typeChecker();
    const empty: any = void 0;
    const dictionary: any = initialValues || {};
    const minimumDepth: number = 1;
    const minimumAmountOfChildren: number = 1;

    const isValue = (element: any): boolean => {

        return !check.isObject(element);
    };

    const isEmpty = (element: any): boolean => {

        return element === undefined;
    };

    const findPath = (dict: any, keys: any[]): any => {

        const reversedListOfKeys = keys.reverse();
        let distanceFromLastKey = keys.length;
        let level = dict;
        let currentKey;

        if (distanceFromLastKey >= minimumDepth) {

            currentKey = keys.pop();

            while (level[currentKey] && distanceFromLastKey--) {

                level = level[currentKey];
                currentKey = keys.pop();
            }
        }

        return {level, currentKey, reversedListOfKeys};
    };

    const buildPath = (keys: any[], lastKey: any, value: any) => {

        const start: any = {};
        let end: any = start;
        let keysRemaining = keys.length;
        let key;

        while (keysRemaining--) {

            key = keys.pop();
            end[key] = {};
            end = end[key];
        }

        end[lastKey] = value;

        return start;
    };

    const add = function(...keysFollowedByValue: any[]): Dictionary {

        const value: any = keysFollowedByValue.pop();
        const lastKey = keysFollowedByValue.pop();
        const {level, currentKey, reversedListOfKeys} = findPath(dictionary, keysFollowedByValue);

        if (isEmpty(level[lastKey]) && !isValue(level)) {

            if (currentKey) {

                level[currentKey] = buildPath(reversedListOfKeys, lastKey, value);

            } else {

                level[lastKey] = value;
            }

        } else if (isValue(level) || isValue(level[lastKey])) {

            throw new RangeError(
                `Key "${currentKey}" is already defined, the "add" method cannot overwrite previously`
                + ` defined keys, use the "redefine" method if this is your intention.`,
            );
        }

        return this;
    };

    const getObject = (keys: any[]): any => {

        return keys.reduce((reference: any, key: any): any => {

            return reference ? reference[key] : reference;

        }, dictionary);
    };

    const get = (...keys: any[]): any | Dictionary => {

        const result = getObject(keys);

        if (result) {

            return isValue(result) ? result : createDictionary(result);
        }
    };

    const redefine = (...keysFollowedByValue: any[]): any => {

        const value: any = keysFollowedByValue.pop();
        const lastKey = keysFollowedByValue.pop();
        const {level} = findPath(dictionary, keysFollowedByValue);

        let previousValue: any;

        if (level[lastKey]) {

            previousValue = level[lastKey];
            level[lastKey] = value;
        }

        if (previousValue) {

            return isValue(previousValue) ? previousValue : createDictionary(previousValue);
        }
    };

    const lookup = (...keys: any[]): boolean => get(...keys) !== empty;

    const remove = (...keys: any[]): any => {

        const depthOfSearch = keys.length;
        const indexOfLastKey = depthOfSearch - 1;

        let levelToRemove: any = false;
        let level: any = dictionary;
        let indexOfKey: number = 0;
        let key: any = keys[indexOfKey++];
        let result: any;

        while (level[key] && indexOfKey < indexOfLastKey) {

            result = level[key];
            levelToRemove = getRemovalPoint(key, result, levelToRemove);
            level = result;
            key = keys[indexOfKey++];
        }

        if (levelToRemove) {

            level = levelToRemove.level;
            key = levelToRemove.key;
        }

        if (level[key]) {

            delete level[key];
        }

        return result && result.isValue ? result : empty;
    };

    const levelIsRemovable = (level: any): any => {

        const amountOfChildren: number = Object.keys(level).length;

        if (level && !isValue(level)) {

            return amountOfChildren < minimumAmountOfChildren;
        }
    };

    const getRemovalPoint = (key: any, level: any, previousRemoval: any): any => {

        if (levelIsRemovable(level)) {

            return previousRemoval ? previousRemoval : {key, level};
        }
    };

    const reduce = (

        callback: (accumulator: any, value: any, index: string, object: any) => any,
        accumulator?: any,

    ): any => {

        const keys = Object.keys(dictionary);
        let acc = accumulator;
        let indexOfKey = keys.length;
        let currentKey;

        while (indexOfKey--) {

            currentKey = keys[indexOfKey];
            acc = callback(acc, dictionary[currentKey], currentKey, dictionary);
        }

        return acc;
    };

    const map = (callback: (value: any, index: string, object: any) => any): Dictionary => {

        return createDictionary(reduce((acc: any, value: any, key: string, dict: any) => {

            acc[key] = callback(value, key, dict);

            return acc;

        }, {}));
    };

    const toObject = (...path: any[]): any => path.length ? getObject(path) : dictionary;

    return {

        add,
        get,
        lookup,
        redefine,
        reduce,
        map,
        remove,
        toObject,
    };
}
