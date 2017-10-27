import setName from "../function/setName";
import single from "../storage/singleton";
import capitalizeFirstLetter from "../stringManipulation/capitalizeFirstLetter";

export interface TypeChecker {

  isDefined(element: any): boolean;
  isError(element: any): boolean;
  isNull(element: any): boolean;
  isNumber(element: any): boolean;
  isArray(element: any): boolean;
  isBoolean(element: any): boolean;
  isFunction(element: any): boolean;
  isObject(element: any): boolean;
  isString(element: any): boolean;
  register(type: string, typeCheck: (object: any) => boolean): TypeChecker;
  [index: string]: any;
}

export default single<TypeChecker>(function(): TypeChecker {

  const numberType = "number";
  const myUndefined: undefined = void 0;
  const isDefined = (object: any): boolean => object !== myUndefined;
  const isError = (object: any): boolean => !isNull(object) && isDefined(object) && object.constructor === Error;
  const isNull = (object: any): boolean => object === null;
  const isNumber = (object: any): boolean => typeof object === numberType;
  const isArray = (object: any): boolean => {

    return !isNull(object) && isDefined(object) && object.constructor === Array;
  };
  const isBoolean = (object: any): boolean => object === false || object === true;
  const isFunction = (object: any): boolean => {

    return !isNull(object) && isDefined(object) && object.constructor === Function;
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

    const formattedName: string = formatToIsType(type);

    if (isString(type) && isFunction(typeCheck)) {

      this[formattedName] = setName(typeCheck, formattedName);
    }

    return this;
  };

  return {

    isDefined,
    isError,
    isNull,
    isNumber,
    isArray,
    isBoolean,
    isFunction,
    isObject,
    isString,
    register,
  };
});
