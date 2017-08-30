export default function(direction: string, movement: number): number {

    const negative = ["up", "left"];
    const positive = ["down", "right"];
    const smallestPositiveNumber = 0;
    const isIn = (value: any, values: any[]): boolean => values.indexOf(value) > -1;
    const isNegative = movement < smallestPositiveNumber;

    if (isIn(direction, negative)) {

        return isNegative ? movement : -movement;

    } else if (isIn(direction, positive)) {

        return isNegative ? -movement : movement;
    }

    throw TypeError(`Invalid direction: ${direction}, passed to "moveInDirection".`);
}
