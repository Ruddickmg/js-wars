import createNode, {LinkedListNode} from "./node";

export interface LinkedListIterator<Type> {

    beginning(): LinkedListNode<Type>;
    current(): LinkedListNode<Type>;
    end(): LinkedListNode<Type>;
    insert(value: Type): LinkedListIterator<Type>;
    insertBefore(value: Type): LinkedListIterator<Type>;
    next(): LinkedListNode<Type>;
    remove(): Type;
    value(): Type;
}

export type IteratorFactory = <Type>() => LinkedListIterator<Type>;

export function iteratorFactory<Type>(

    iteratorConstructor: (head: LinkedListNode<Type>, tail: LinkedListNode<Type>) => LinkedListIterator<Type>,
    head: LinkedListNode<Type>,
    tail: LinkedListNode<Type>,

): IteratorFactory { return (): LinkedListIterator<Type> => iteratorConstructor(head, tail); }

export default function<Type>(head: LinkedListNode<Type>, tail: LinkedListNode<Type>): LinkedListIterator<Type> {

    let currentNode: LinkedListNode<Type> = head;
    let previousNode: LinkedListNode<Type> = tail;

    const insertIntoNode = (value: Type, insertLocation: LinkedListNode<Type>): void => {

        const node: LinkedListNode<Type> = createNode<Type>(value);

        node.next = insertLocation.next;
        insertLocation.next = node;
    };
    const next = (): LinkedListNode<Type> => {

        previousNode = currentNode;
        currentNode = currentNode.next;

        return currentNode;
    };
    const beginning = (): LinkedListNode<Type> => head;
    const end = (): LinkedListNode<Type> => tail;
    const current = (): LinkedListNode<Type> => currentNode;
    const insert = function(value: Type): LinkedListIterator<Type> {

        insertIntoNode(value, currentNode);

        return this;
    };
    const insertBefore = function(value: Type): LinkedListIterator<Type> {

        insertIntoNode(value, previousNode);

        return this;
    };
    const remove = (): Type => {

        previousNode.next = currentNode.next;

        return currentNode.value;
    };
    const value = (): Type => currentNode.value;

    return {

        next,
        beginning,
        current,
        end,
        insert,
        insertBefore,
        remove,
        value,
    };
}
