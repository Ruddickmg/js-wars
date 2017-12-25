import {publish} from "../pubSub";
import {isFunction} from "./typeChecker";

export default (function() {
  return function <Type>(callbacks: Type[], className: string, method: string): Type[] {
    return callbacks.filter((input: Type): boolean => {
      if (isFunction(input)) {
        return true;
      }
      publish("invalidInputError", {className, method, input});
    });
  };
}());
