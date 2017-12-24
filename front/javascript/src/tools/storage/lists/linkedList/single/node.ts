export interface LinkedListNode<Type> {
  next: LinkedListNode<Type>;
  value: Type;
}

export default function <Type>(value: Type = null) {
  const next: LinkedListNode<Type> = null;
  return {
    next,
    value,
  };
}
