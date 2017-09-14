import notifications, {PubSub} from "../pubSub";
import typeChecker, {TypeChecker} from "../validation/typeChecker";

type Callback = (currentNumber: number) => void;

export default (function() {

    const {isNumber, isFunction}: TypeChecker = typeChecker();
    const {publish}: PubSub = notifications();

    return (minimum: number, maximum: number, callback: Callback, increment: number = 1): void => {

        let currentNumber: number = minimum;

        if (isNumber(minimum) && isNumber(maximum) && isFunction(callback)) {

            for (currentNumber; currentNumber < maximum; currentNumber += increment) {

                callback(currentNumber);
            }
        } else {

            publish("invalidInputError", {
                className: "iterateThroughRange",
                input: {minimum, maximum, increment, callback},
                method: "iterateThroughRange",
            });
        }
    };
}());
