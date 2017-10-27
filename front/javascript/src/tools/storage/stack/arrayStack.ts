import {Stack} from "./listStack";

export default function <Type>(): Stack<Type> {

  let container: Type[] = [];

  const minimumLength: number = 1;
  const isEmpty = (): boolean => size() < minimumLength;
  const size = (): number => container.length;
  const throwErrorIfEmpty = (): void => {

    if (isEmpty()) {

      throw Error("Cannot perform top on empty stack.");
    }
  };
  const push = function(value: Type): Stack<Type> {

    container.push(value);

    return this;
  };
  const pop = (): Type => {

    throwErrorIfEmpty();

    return container.pop();
  };
  const top = (): Type => {

    throwErrorIfEmpty();

    return container[size() - 1];
  };
  const clear = function(): Stack<Type> {

    container = [];

    return this;
  };

  return {

    clear,
    isEmpty,
    pop,
    push,
    size,
    top,
  };
}
