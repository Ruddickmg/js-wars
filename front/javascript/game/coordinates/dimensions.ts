import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";

export interface Dimensions {

    width: number;
    height: number;
    [index: string]: number;
}

export function areDimensions(element: any): boolean {

    const {isNumber}: TypeChecker = typeChecker();
    const {width, height}: any = element;

    return isNumber(width) && isNumber(height);
}

export default function(width: number, height: number): Dimensions {

    return {
        width,
        height,
    };
}
