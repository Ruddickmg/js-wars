import setName from "../function/setName";
import notifications, {PubSub} from "../pubSub";
import typeChecker, {TypeChecker} from "./typeChecker";

type Validation = (input: any, methodName?: string) => boolean;

export interface Validator {
  [type: string]: Validation;
}

export default (function() {
  const typeCheckerPrefix: string = "is";
  const {publish}: PubSub = notifications();
  const publishInputError = (className: string, method: string, input: any): void => {
    publish("invalidInputError", {className, method, input});
  };
  return function(className: string): Validator {
    const checker: TypeChecker = typeChecker();
    const {isString}: TypeChecker = checker;
    const validations: any = Object.keys(checker);
    if (isString(className)) {
      return validations.reduce((validation: Validator, property: string): Validator => {
        const prefix: string = property.slice(0, 2);
        const type: string = property.slice(2);
        const validationName: string = `validate${type}`;
        if (prefix === typeCheckerPrefix) {
          validation[validationName] = setName((input: any, method: string = className): boolean => {
            if (checker[property](input)) {
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
