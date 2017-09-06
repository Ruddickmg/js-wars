export default function() {

    const pow = Math.pow;
    const sum = (elements: any[], getValue: (element: any) => number): number => {

        if (elements.constructor !== Array) {

            throw TypeError("The first argument of sum must be an array");
        }

        return elements.reduce((previous, current) => previous + getValue(current), 0);
    };
    const add = (array: number[]) => sum(array, (value: any) => value);
    const square = (array: number[]) => sum(array, (value: number) => pow(value, 2));
    const exp = (array: number[]) => sum(array, (value: number) => Math.exp(value));
    const variance = (array: number[], amount: number) => sum(array, (v: number) => v * amount);

    return {

        sum,
        add,
        square,
        exp,
        variance,
    };
}
