import notifications, {PubSub} from "../pubSub";
import typeChecker, {TypeChecker} from "./typeChecker";

export default (function() {

    const {isFunction}: TypeChecker = typeChecker();
    const {publish}: PubSub = notifications();

    return function<Type>(callbacks: Type[], className: string, method: string): Type[] {

        return callbacks.filter((callback: Type): boolean => {

            const isValid: boolean = isFunction(callback);

            if (!isValid) {

                publish("invalidInput", {className, method, input: callback});
            }

            return isValid;
        });
    };
}());
