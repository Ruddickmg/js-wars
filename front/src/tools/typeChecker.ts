import capitalizeFirstLetter from "./capitalizeFirstLetter";
import single from "./singleton";

export interface TypeChecker {

    isDefined(element: any): boolean;
    isError(element: any): boolean;
    isNull(element: any): boolean;
    isArray(element: any): boolean;
    isBoolean(element: any): boolean;
    isFunction(element: any): boolean;
    isObject(element: any): boolean;
    isString(element: any): boolean;
    register(type: string, typeCheck: (object: any) => boolean): TypeChecker;
    registerChecksOnProperty(property: string, types: string[]): TypeChecker;
    [index: string]: any;
}

export default single<TypeChecker>(function(): TypeChecker {

    const myUndefined: undefined = void 0;
    const isDefined = (object: any): boolean => object !== myUndefined;
    const isError = (object: any): boolean => !isNull(object) && isDefined(object) && object.constructor === Error;
    const isNull = (object: any): boolean => object === null;
    const isArray = (object: any): boolean => {

        return !isNull(object) && isDefined(object) && object.constructor === Array;
    };
    const isBoolean = (object: any): boolean => object === false || object === true;
    const isFunction = (object: any): boolean => {

        return !isNull(object) && isDefined(object)  && object.constructor === Function;
    };
    const isObject = (object: any): boolean => {

        const call = Object.prototype.toString.call(object);
        const objectString = "[object Object]";

        return !isNull(object) && isDefined(object) && call === objectString;
    };

    const isString = (object: any): boolean => {

        return !isNull(object) && isDefined(object) && object.constructor === String;
    };

    const formatToIsType = (type: string): string => `is${capitalizeFirstLetter(type)}`;

    const register = function(type: string, typeCheck: (object: any) => boolean): TypeChecker {

        this[formatToIsType(type)] = typeCheck;

        return this;
    };

    const registerChecksOnProperty = function(property: string, types: string[]) {

        types.forEach((type: string): void => {

            this[formatToIsType(type)] = (element: any): boolean => element[property] === type;
        });

        return this;
    };

    return {

        isDefined,
        isError,
        isNull,
        isArray,
        isBoolean,
        isFunction,
        isObject,
        isString,
        register,
        registerChecksOnProperty,
    };
});
