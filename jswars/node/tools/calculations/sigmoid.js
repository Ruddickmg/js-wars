/* ----------------------------------------------------------------------------------- *\

	Sigmoid is an object whose methods are sigmoid functions.
	sigmoid functions scale their input to between 0 and 1, or -1 and 1.
	
	@input x: number
	
	@signum: basic smooth line sigmoid function
	@fast: faster sigmoid function at the cost of accuracy (less smooth)
	@tanh: sigmoid function that scales from -1 to 1, rather then 0 to 1

\* ----------------------------------------------------------------------------------- */

module.exports = {
	signum: (x) => 1 / (1 + Math.exp(-x)),
	signumPrime: (x) => this.signum(x) / (1 - this.signum(x)),
	fast: (x) => x / (1 + Math.abs(x)),
	tanh: (x) => (2 * this.signum(x)) - 1,
	bp: (x, y) => (2 / (y + Math.exp(-x))) - y,
    bipolar: (x) => this.bp(x, 1),
    primeBp(x, y) {

		const b = this.modifiedBipolar(x);

		return ((y + b) * (y - b)) / 2;
	},
	modifiedBipolar: (x) => this.bp(x, 0.8),
	bipolarPrime: (x) => this.primeBp(x, 1),
	modifiedBipolarPrime: (x) => this.primeBp(x, 0.8),
};