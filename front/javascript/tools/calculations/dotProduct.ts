import typeChecker, {TypeChecker} from "../validation/typeChecker";

export default (function() {

    const {isArray}: TypeChecker = typeChecker();

    return function(firstArray: number[], secondArray: number[]): number[] {

        const length = firstArray.length;

        if (isArray(firstArray) && isArray(secondArray)) {

            if (length <= secondArray.length) {

                return firstArray.map((value: number, index: number) => value * secondArray[index]);
            }
            throw Error("The second array of dot product must be greater or equal in length to the first.");
        }
        throw TypeError("Input into dot product must be two numerical arrays");
    };
}());
