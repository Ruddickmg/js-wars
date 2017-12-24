import {expect} from "chai";
import createArrayStack from "../../../../../src/tools/storage/stack/arrayStack";
import createListStack, {Stack} from "../../../../../src/tools/storage/stack/listStack";

describe("stack", () => {
  const firstValue: number = 1;
  const secondValue: number = 2;
  const thirdValue: number = 3;
  const arrayStack: Stack<number> = createArrayStack<number>();
  const listStack: Stack<number> = createListStack<number>();
  const stackTest = (stack: Stack<number>): void => {
    it("Can tell when it is empty.", () => {
      expect(stack.isEmpty()).to.equal(true);
    });
    it("Adds an element to the stack.", () => {
      stack.push(firstValue);
      expect(stack.isEmpty()).to.equal(false);
    });
    it("Reports the correct size of the stack.", () => {
      expect(stack.size()).to.equal(firstValue);
      stack.push(secondValue);
      expect(stack.size()).to.equal(2);
    });
    it("Pops the top element off the stack.", () => {
      expect(stack.pop()).to.equal(secondValue);
      expect(stack.size()).to.equal(1);
      expect(stack.isEmpty()).to.equal(false);
    });
    it("Reports the value on the top of the stack.", () => {
      expect(stack.top()).to.equal(firstValue);
      expect(stack.isEmpty()).to.equal(false);
      expect(stack.size()).to.equal(1);
    });
    it("Clears all elements from the stack", () => {
      stack.push(secondValue);
      stack.push(thirdValue);
      expect(stack.top()).to.equal(thirdValue);
      stack.clear();
      expect(stack.isEmpty()).to.equal(true);
      expect(stack.size()).to.equal(0);
      expect(stack.top).to.throw("Cannot perform top on empty stack.");
    });
  };
  describe("listStack", () => stackTest(listStack));
  describe("arrayStack", () => stackTest(arrayStack));
});
