import setName from "../function/setName";
import {publish} from "../pubSub";
import typeChecker, {TypeChecker} from "./typeChecker";

type Validation = (input: any, methodName?: string) => boolean;

export interface Validator {
  [type: string]: Validation;
}

export default (function() {
  const typeCheckerPrefix: string = "is";
  const publishInputError = (className: string, method: string, input: any): void => {
    publish("invalidInputError", {className, method, input});
  };
  return function(className: string): Validator {
    const {isString}: TypeChecker = typeChecker;
    const validations: any = Object.keys(typeChecker);
    if (isString(className)) {
      return validations.reduce((validation: Validator, property: string): Validator => {
        const prefix: string = property.slice(0, 2);
        const type: string = property.slice(2);
        const validationName: string = `validate${type}`;
        if (prefix === typeCheckerPrefix) {
          validation[validationName] = setName((input: any, method: string = className): boolean => {
            if (typeChecker[property](input)) {
              return true;
            }
            publishInputError(className, method, input);
            return false;
          }, validationName);
        }
        return validation;
      }, {});
    }
    publishInputError("function", "validator", className);
  };
}());
