export default function(array: any[], check?: (element: any) => boolean): boolean {
  let i = array.length;
  let value: any = false;
  while (i--) {
    value = array[i];
    if (check ? check(value) : value) {
      return true;
    }
  }
  return false;
}
