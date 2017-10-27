import generateTruthTable from "./generateTruthTable";

export default function(firstArray: any[], secondArray: any[]): any[] {

  const elementsInSecondArray = generateTruthTable(...secondArray);
  return firstArray.filter((element: any): boolean => !elementsInSecondArray[element]);
}
