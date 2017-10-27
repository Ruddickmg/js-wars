import variance from "./variance";

export default (array: number[], isSample: boolean = false): number => Math.sqrt(variance(array, isSample));
