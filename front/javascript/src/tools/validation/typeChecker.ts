import setName from "../function/setName";
import capitalizeFirstLetter from "../stringManipulation/capitalizeFirstLetter";

export interface TypeChecker {
  isDomElement(element: any): boolean;
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

const numberType = "number";
const myUndefined: undefined = void 0;
export const isDefined = (object: any): boolean => object !== myUndefined;
export const isError = (object: any): boolean => !isNull(object) && isDefined(object) && object.constructor === Error;
export const isNull = (object: any): boolean => object === null;
export const isNumber = (object: any): boolean => typeof object === numberType;
export const isArray = (object: any): boolean => {
  return !isNull(object) && isDefined(object) && object.constructor === Array;
};
export const isBoolean = (object: any): boolean => object === false || object === true;
export const isFunction = (object: any): boolean => {
  return !isNull(object) && isDefined(object) && object.constructor === Function;
};
export const isObject = (object: any): boolean => {
  const call = Object.prototype.toString.call(object);
  const objectString = "[object Object]";
  return !isNull(object) && isDefined(object) && call === objectString;
};
export const isDomElement = (object: any): boolean => {
  const objectString = "[object HTML";
  const call = Object.prototype.toString.call(object).slice(0, objectString.length);
  return !isNull(object) && isDefined(object) && call === objectString;
};
export const isString = (object: any): boolean => {
  return !isNull(object) && isDefined(object) && object.constructor === String;
};
export const formatToIsType = (type: string): string => `is${capitalizeFirstLetter(type)}`;
export const register = function(type: string, typeCheck: (object: any) => boolean): TypeChecker {
  const formattedName: string = formatToIsType(type);
  if (isString(type) && isFunction(typeCheck)) {
    typeChecker[formattedName] = setName(typeCheck, formattedName);
  }
  return typeChecker;
};

const typeChecker: TypeChecker = {
  isArray,
  isBoolean,
  isDefined,
  isDomElement,
  isError,
  isFunction,
  isNull,
  isNumber,
  isObject,
  isString,
  register,
};

export default typeChecker;
