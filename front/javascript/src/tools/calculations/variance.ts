import summation, {Summer} from "./sum";

export default (array: number[], isSample: boolean = false): number => {

  const summer: Summer = summation();
  const amount: number = array.length;
  const total: number = summer.add(array);
  const mean: number = total / amount;
  const differences: number[] = array.map((num: number) => num - mean);
  const squares: number = summer.square(differences);

  return squares / (isSample ? amount - 1 : amount);
};
