export default function indexExists(index: number): boolean {

  const nonExistentIndex = -1;

  return index > nonExistentIndex;
}
