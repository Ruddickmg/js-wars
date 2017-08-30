export default (

    callback: (accumulator: any, value: any, index: number, container: any) => any,
    indices: any[],
    container: any,
    initialValue?: any,

): any => {

    const length: number = indices.length;
    const increment: number = 1;

    let accumulation: any = initialValue;
    let index: number = 0;

    for (index; index < length; index += increment) {

        accumulation = callback(accumulation, indices[index], index, container);
    }

    return accumulation;
};
