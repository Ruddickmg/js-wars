import createIterator, {iteratorFactory, IteratorFactory, LinkedListIterator} from "./iterator";
import createNode, {LinkedListNode} from "./node";

type Mapping<Type> = (value: Type, node: LinkedListNode<Type>, list: SinglyLinkedList<Type>) => any;
type Reducing<Type> = (
  container: any,
  value: Type,
  node: LinkedListNode<Type>,
  list: SinglyLinkedList<Type>,
) => any;

export interface SinglyLinkedList<Type> {
  back(): Type;
  clear(): SinglyLinkedList<Type>;
  filter(callback: Mapping<Type>): SinglyLinkedList<Type>;
  find(callback: Mapping<Type>): Type;
  forEach(callback: Mapping<Type>): SinglyLinkedList<Type>;
  front(): Type;
  isEmpty(): boolean;
  iterator(): LinkedListIterator<Type>;
  map(callback: Mapping<Type>): SinglyLinkedList<Type>;
  pop(): Type;
  push(value: Type): SinglyLinkedList<Type>;
  reduce(callback: Reducing<Type>, accumulator: any): any;
  reverse(): SinglyLinkedList<Type>;
  shift(): Type;
  unshift(value: Type): SinglyLinkedList<Type>;
  length(): number;
}

export default function createLinkedList<Type>(): SinglyLinkedList<Type> {
  let amountOfNodes: number = 0;
  const throwErrorIfEmpty = (method: string): void => {
    if (isEmpty()) {
      throw Error(`Cannot perform ${method} on empty list.`);
    }
  };
  const incrementLength = function() {
    amountOfNodes += 1;
  };
  const decrementLength = function() {
    amountOfNodes -= 1;
  };
  const head: LinkedListNode<Type> = createNode<Type>();
  const tail: LinkedListNode<Type> = createNode<Type>();
  const getIterator: IteratorFactory = iteratorFactory<Type>(
    createIterator,
    head,
    tail,
    incrementLength,
    decrementLength,
  );
  const length = (): number => amountOfNodes;
  const isEmpty = (): boolean => head.next === tail;
  const moveToLast = (): LinkedListIterator<Type> => {
    const listIterator: LinkedListIterator<Type> = getIterator<Type>();
    const end: LinkedListNode<Type> = listIterator.end();
    let node: LinkedListNode<Type> = head;
    while (node.next !== end) {
      node = listIterator.next();
    }
    return listIterator;
  };
  const back = (): Type => {
    throwErrorIfEmpty("back");
    return moveToLast().value();
  };
  const front = (): Type => {
    throwErrorIfEmpty("front");
    return head.next.value;
  };
  const pop = (): Type => {
    throwErrorIfEmpty("pop");
    return moveToLast().remove().value;
  };
  const shift = (): Type => {
    const first: LinkedListNode<Type> = head.next;
    throwErrorIfEmpty("shift");
    amountOfNodes -= 1;
    head.next = first.next;
    first.next = null;
    return first.value;
  };
  const iterator = (): LinkedListIterator<Type> => getIterator<Type>();
  const clear = function(): SinglyLinkedList<Type> {
    forEach((_: any, node: LinkedListNode<Type>): void => {
      node.next = null;
    });
    amountOfNodes = 0;
    head.next = tail;
    return this;
  };
  const filter = function(callback: Mapping<Type>): SinglyLinkedList<Type> {
    const list: SinglyLinkedList<Type> = createLinkedList<Type>();
    const listIterator: LinkedListIterator<Type> = list.iterator();
    this.forEach((value: Type, node: LinkedListNode<Type>, oldList: SinglyLinkedList<Type>): any => {
      if (callback(value, node, oldList)) {
        listIterator.insert(value).next();
      }
    });
    return list;
  };
  const find = function(callback: Mapping<Type>): Type {
    const {next, value, current, end}: LinkedListIterator<Type> = getIterator<Type>();
    const endOfList: LinkedListNode<Type> = end();
    let currentValue: Type;
    while (next() !== endOfList) {
      currentValue = value();
      if (callback(currentValue, current(), this)) {
        return currentValue;
      }
    }
  };
  const forEach = function(callback: Mapping<Type>): SinglyLinkedList<Type> {
    return reduce((_: any, value: Type, node: LinkedListNode<Type>, list: SinglyLinkedList<Type>): void => {
      callback(value, node, list);
    });
  };
  const map = function(callback: Mapping<Type>): SinglyLinkedList<Type> {
    const list: SinglyLinkedList<Type> = createLinkedList<Type>();
    const listIterator: LinkedListIterator<Type> = list.iterator();
    forEach((value: Type, node: LinkedListNode<Type>, oldList: SinglyLinkedList<Type>): any => {
      listIterator.insert(callback(value, node, oldList)).next();
    });
    return list;
  };
  const push = function(value: Type): SinglyLinkedList<Type> {
    moveToLast().insert(value);
    return this;
  };
  const reduce = function(callback: Reducing<Type>, accumulator?: any): any {
    let accumulation: any = accumulator;
    let current: LinkedListNode<Type> = head.next;
    let next: LinkedListNode<Type>;
    while (current !== tail) {
      next = current.next;
      accumulation = callback(accumulation, current.value, current, this);
      current = next;
    }
    return accumulation;
  };
  const unshift = function(value: Type): SinglyLinkedList<Type> {
    const node: LinkedListNode<Type> = createNode<Type>(value);
    amountOfNodes += 1;
    node.next = head.next;
    head.next = node;
    return this;
  };
  const reverse = function(): SinglyLinkedList<Type> {
    const first: LinkedListNode<Type> = head.next;
    let next: LinkedListNode<Type> = first;
    let current: LinkedListNode<Type> = first;
    let previous = first.next;
    if (!isEmpty()) {
      while (current !== tail) {
        previous = current.next;
        current.next = next;
        next = current;
        current = previous;
      }
      head.next = next;
      first.next = tail;
    }
    return this;
  };
  head.next = tail;
  return Object.assign({
    back,
    clear,
    filter,
    find,
    forEach,
    front,
    isEmpty,
    iterator,
    length,
    map,
    pop,
    push,
    reduce,
    reverse,
    shift,
    unshift,
  });
}
