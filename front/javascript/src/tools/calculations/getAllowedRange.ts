import range from "../array/range";
export default function(length: number, beginning: number, end: number): number[] {
  const amount: number = Math.abs(end - beginning);
  const firstIndex: number = 0;
  const lastIndex: number = length - 1;
  const first: number = end >= lastIndex ? lastIndex - amount : Math.max(beginning, firstIndex);
  const last: number = beginning < firstIndex ? amount : Math.min(end, lastIndex);
  return range(first, last);
}
