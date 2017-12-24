import createNode, {LinkedListNode} from "./node";

export interface LinkedListIterator<Type> {
  current(): LinkedListNode<Type>;
  end(): LinkedListNode<Type>;
  insert(value: Type): LinkedListIterator<Type>;
  insertBefore(value: Type): LinkedListIterator<Type>;
  next(): LinkedListNode<Type>;
  remove(): LinkedListNode<Type>;
  value(): Type;
}

export type IteratorFactory = <Type>() => LinkedListIterator<Type>;

export function iteratorFactory<Type>(
  iteratorConstructor: (
    head: LinkedListNode<Type>,
    tail: LinkedListNode<Type>,
    increment: any,
    decrement: any,
  ) => LinkedListIterator<Type>,
  head: LinkedListNode<Type>,
  tail: LinkedListNode<Type>,
  increment?: any,
  decrement?: any,
): IteratorFactory {
  return (): LinkedListIterator<Type> => iteratorConstructor(head, tail, increment, decrement);
}

export default function <Type>(
  head: LinkedListNode<Type>,
  tail: LinkedListNode<Type>,
  increment?: any,
  decrement?: any,
): LinkedListIterator<Type> {
  let currentNode: LinkedListNode<Type> = head;
  let previousNode: LinkedListNode<Type> = tail;
  const insertIntoNode = (element: Type, insertLocation: LinkedListNode<Type>): void => {
    const node: LinkedListNode<Type> = createNode<Type>(element);
    increment();
    node.next = insertLocation.next;
    insertLocation.next = node;
  };
  const next = (): LinkedListNode<Type> => {
    previousNode = currentNode;
    currentNode = currentNode.next;
    return currentNode;
  };
  const end = (): LinkedListNode<Type> => tail;
  const current = (): LinkedListNode<Type> => currentNode;
  const insert = function(element: Type): LinkedListIterator<Type> {
    insertIntoNode(element, currentNode);
    return this;
  };
  const insertBefore = function(element: Type): LinkedListIterator<Type> {
    insertIntoNode(element, previousNode);
    return this;
  };
  const remove = (): LinkedListNode<Type> => {
    decrement();
    previousNode.next = currentNode.next;
    return currentNode;
  };
  const value = (): Type => currentNode.value;
  return {
    current,
    end,
    insert,
    insertBefore,
    next,
    remove,
    value,
  };
}
