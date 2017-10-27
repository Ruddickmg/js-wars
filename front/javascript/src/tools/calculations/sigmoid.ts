export interface Sigmoid {

  // bipolar(value: number): number;
  //
  // bipolarPrime(value: number): number;
  //
  // bp(x: number, y: number): number;
  //
  // fast(value: number): number;
  //
  // modifiedBipolar(value: number): number;
  //
  // modifiedBipolarPrime(value: number): number;
  //
  // primeBp(x: number, y: number): number;
  //
  log(value: number): number;
  //
  // logPrime(value: number): number;
  //
  tanh(value: number): number;
}

export default (function() {

  const exp = Math.exp;
  // const abs = Math.abs;

  return function(): Sigmoid {

    const log = (value: number) => 1 / (1 + exp(-value));
    const tanh = (value: number) => (2 * log(2 * value)) - 1;

    // const logPrime = (value: number) => log(value) / (1 - log(value));
    // const fast = (value: number) => value / (1 + abs(value));
    // const bp = (x: number, y: number) => (2 / (y + exp(-x))) - y;
    // const bipolar = (value: number) => bp(value, 1);
    // const primeBp = (x: number, y: number) => {
    //
    //   const bipole = modifiedBipolar(x);
    //
    //   return ((y + bipole) * (y - bipole)) / 2;
    // };
    // const modifiedBipolar = (value: number) => bp(value, 0.8);
    // const bipolarPrime = (value: number) => primeBp(value, 1);
    // const modifiedBipolarPrime = (value: number) => this.primeBp(value, 0.8);

    return {

      // bipolar,
      // bipolarPrime,
      // bp,
      // fast,
      // modifiedBipolar,
      // modifiedBipolarPrime,
      // primeBp,
      log,
      // logPrime,
      tanh,
    };
  };
}());
