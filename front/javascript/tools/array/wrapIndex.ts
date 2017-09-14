import notifications, {PubSub} from "../pubSub";
import typeChecker, {TypeChecker} from "../validation/typeChecker";

export default (function() {

    const {publish}: PubSub = notifications();
    const {isNumber}: TypeChecker = typeChecker();
    const minimumIndex: number = 0;

    return (unwrappedIndex: number, limit: number): number => {

        const indexIsANumber: boolean = isNumber(unwrappedIndex);

        let index: number = unwrappedIndex;

        if (indexIsANumber && isNumber(limit) ) {

            if (limit > minimumIndex) {

                while (index >= limit) {

                    index -= limit;
                }

                while (index < minimumIndex) {

                    index += limit;
                }
            }

            return index;
        }

        publish("invalidInputError", {
            className: "wrapIndex",
            input: indexIsANumber ? index : limit,
            method: "wrapIndex",
        });
    };
}());
