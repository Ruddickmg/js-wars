export default function(...arrays: any[][]): any[] {

  return arrays.reduce((longestArray, currentArray) => {

    return longestArray.length < currentArray.length ? currentArray : longestArray;

  }, []);
}
