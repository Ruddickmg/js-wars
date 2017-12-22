import {publish} from "../pubSub";
import typeChecker, {TypeChecker} from "./typeChecker";

export default (function() {
  const {isFunction}: TypeChecker = typeChecker();
  return function <Type>(callbacks: Type[], className: string, method: string): Type[] {
    return callbacks.filter((input: Type): boolean => {
      if (isFunction(input)) {
        return true;
      }
      publish("invalidInputError", {className, method, input});
    });
  };
}());
