import single from "./singleton";

interface TruthTable {

    [index: string]: boolean;
}

export interface Composer<OutputType> {

    functions(...arrayOfFunctions: Array<((input: any) => any)>): (input: any) => any;
    including(parameters: string[], ...objects: any[]): OutputType;
    excluding(elements: string[], ...objects: any[]): OutputType;
    combine(...objects: any[]): OutputType;
}

export default single(function<OutputType>(): Composer<OutputType> {

    const checkIfParameterExists = (parameter: any): boolean => parameter !== undefined;
    const checkIfParameterDoesNotExist = (parameter: any): boolean => !parameter;
    const conditionalCombination = (

        baseObject: any,
        objectToCombineWith: any,
        conditions: TruthTable,
        isAllowed: (parameter: any) => boolean,

    ): OutputType => {

        const modifiedBaseObject = Object.assign({}, baseObject);
        const parametersToCombine = Object.keys(objectToCombineWith);

        return parametersToCombine.reduce((composed, nameOfParameter) => {

            const parameter = conditions[nameOfParameter];
            const doesNotAlreadyExist = !composed[nameOfParameter];

            if (isAllowed(parameter) && doesNotAlreadyExist) {

                composed[nameOfParameter] = objectToCombineWith[nameOfParameter];
            }

            return composed;

        }, modifiedBaseObject);
    };
    const exclusiveCombination = (

        unwantedParameters: TruthTable,
        baseObject: object,
        objectToCombineWith: object,

    ): OutputType => {

        return conditionalCombination(
            baseObject,
            objectToCombineWith,
            unwantedParameters,
            checkIfParameterDoesNotExist,
        );
    };
    const inclusiveCombination = (

        desiredParameters: TruthTable,
        baseObject: object,
        objectToCombineWith: object,

    ): OutputType => {

        return conditionalCombination(
            baseObject,
            objectToCombineWith,
            desiredParameters,
            checkIfParameterExists,
        );
    };
    const createTruthTableFromObject = (parameters: string[]): TruthTable => {

        return parameters.reduce((parameterHolder: TruthTable, parameter: string): TruthTable => {

            parameterHolder[parameter] = true;

            return parameterHolder;

        }, {}) as TruthTable;
    };
    const functions = (...arrayOfFunctions: Array<(input: any) => any>): (input: any) => any => {

        return (input: any): OutputType => arrayOfFunctions
            .slice()
            .reverse()
            .reduce((value, currentFunction) => currentFunction(value), input);
    };
    const combineAll = (

        parametersToInclude: TruthTable,
        parametersToExclude: TruthTable,
        objects: any[],

    ): OutputType => {

        const empty = 0;
        const baseObject: object = Object.assign({}, objects[0]);
        const isInclusive: boolean = Object.keys(parametersToInclude).length > empty;
        const objectsToCombineWith: object = objects
            .slice(1)
            .reduce((combined, object) => Object.assign(combined, object), {});

        if (isInclusive) {

            return inclusiveCombination(parametersToInclude, baseObject, objectsToCombineWith);
        }

        return exclusiveCombination(parametersToExclude, baseObject, objectsToCombineWith);
    };
    const including = (parameters: string[], ...objects: any[]): OutputType => {

        const includedParameters = createTruthTableFromObject(parameters);

        return combineAll(includedParameters, {}, objects);
    };
    const excluding = (parameters: string[], ...objects: any[]): OutputType => {

        const excludedParameters = createTruthTableFromObject(parameters);

        return combineAll({}, excludedParameters, objects);
    };
    const combine = (...objects: any[]): OutputType => combineAll({}, {}, objects);

    return {

        combine,
        excluding,
        functions,
        including,
    };
});
