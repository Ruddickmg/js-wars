export interface TypeChecker {

    isDefined(object: any): boolean;
    isNull(object: any): boolean;
    isArray(object: any): boolean;
    isBoolean(object: any): boolean;
    isFunction(object: any): boolean;
    isObject(object: any): boolean;
    isString(object: any): boolean;
}

export default (function(): TypeChecker {

    const myUndefined: undefined = void 0;
    const isDefined = (object: any): boolean => object !== myUndefined;
    const isNull = (object: any): boolean => object === null;
    const isArray = (object: any): boolean => {

        return !isNull(object) && isDefined(object)  && object.constructor === Array;
    };
    const isBoolean = (object: any): boolean => object === false || object === true;
    const isFunction = (object: any): boolean => {

        return !isNull(object) && isDefined(object)  && object.constructor === Function;
    };
    const isObject = (object: any): boolean => {

        const call = Object.prototype.toString.call(object);
        const objectString = "[object Object]";

        return !isNull(object) && isDefined(object)  && call === objectString;
    };

    const isString = (object: any): boolean => {

        return !isNull(object) && isDefined(object)  && object.constructor === String;
    };

    return {

        isDefined,
        isNull,
        isArray,
        isBoolean,
        isFunction,
        isObject,
        isString,
    };
}());
