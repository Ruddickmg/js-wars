export default function(

    firstInputArray: any[],
    secondInputArray: any[],
    callback: (firstValue?: any, secondValue?: any, index?: number, firstArray?: any[], secondArray?: any[]) => any,

): any[] {

    let firstValue: any;
    let secondValue: any;
    let index: number;

    const length: number = Math.min(firstInputArray.length, secondInputArray.length);
    const firstArray: any[] = firstInputArray.slice();
    const secondArray: any[] = secondInputArray.slice();
    const zippedArray: any[] = [];

    for (index = 0; index < length; index += 1) {

        firstValue = firstInputArray[index];
        secondValue = secondInputArray[index];

        zippedArray[index] = callback(firstValue, secondValue, index, firstArray, secondArray);
    }

    return zippedArray;
}
