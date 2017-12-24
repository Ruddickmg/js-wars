export default {
  array(length: number, min: number = 0, max: number = 1): number[] {
    let l = length;
    const array: number[] = [];
    while (l--) {
      array.push(this.inRange(min, max));
    }
    return array;
  },
  inRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  },
  index(array: any[]): number {
    const lastIndex = array.length - 1;
    const firstIndex = 0;
    return Math.floor(this.inRange(lastIndex, firstIndex));
  },
  boolean() {
    const threshHold = 0.5;
    return this.inRange(0, 1) > threshHold;
  },
};
