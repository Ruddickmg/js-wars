import createNode, {LinkedListNode} from "../lists/linkedList/single/node";

export interface Stack<Type> {
  isEmpty(): boolean;
  clear(): Stack<Type>;
  push(value: Type): Stack<Type>;
  pop(): Type;
  top(): Type;
  size(): number;
}

export default function <Type>(): Stack<Type> {
  let amountOfNodes: number = 0;
  const throwErrorIfEmpty = (method: string): void => {
    if (isEmpty()) {
      throw Error(`Cannot perform ${method} on empty stack.`);
    }
  };
  const head: LinkedListNode<Type> = createNode<Type>();
  const tail: LinkedListNode<Type> = createNode<Type>();
  const size = (): number => amountOfNodes;
  const isEmpty = (): boolean => {
    return head.next === tail;
  };
  const top = (): Type => {
    throwErrorIfEmpty("top");
    return head.next.value;
  };
  const pop = (): Type => {
    const first: LinkedListNode<Type> = head.next;
    throwErrorIfEmpty("pop");
    amountOfNodes -= 1;
    head.next = first.next;
    first.next = null;
    return first.value;
  };
  const clear = function(): Stack<Type> {
    let current: LinkedListNode<Type> = head;
    let removed: LinkedListNode<Type>;
    while (current !== tail) {
      removed = current.next;
      current.next = null;
      current = removed;
    }
    amountOfNodes = 0;
    head.next = tail;
    return this;
  };
  const push = function(value: Type): Stack<Type> {
    const node: LinkedListNode<Type> = createNode<Type>(value);
    amountOfNodes += 1;
    node.next = head.next;
    head.next = node;
    return this;
  };
  head.next = tail;
  return {
    clear,
    isEmpty,
    pop,
    push,
    size,
    top,
  };
}
