import typeChecker, {TypeChecker} from "../validation/typeChecker";

export interface Cache<Type> {

  add(name: string, canvas: any): Cache<Type>;
  clear(): Cache<Type>;
  contains(name: string): boolean;
  filter(callback: (item: any, key: string, self: Cache<Type>) => void): Cache<Type>;
  find(callback: (item: Type, key: string, self: Cache<Type>) => boolean): Type;
  forEach(callback: (item: any, key: string, self: Cache<Type>) => void): void;
  get(name: string): Type;
  map(callback: (item: any, key: string, self: Cache<Type>) => Type): Cache<Type>;
  reduce(callback: any, initialAccumulator: any): any;
  remove(name: string): Type;
  size(): number;
}

export default function createCache<Type>(): Cache<Type> {

  let cached: any = {};
  let amount: number = 0;

  const size = (): number => amount;
  const {isDefined}: TypeChecker = typeChecker();
  const getKeys = (): any[] => Object.keys(cached);
  const add = function(name: string, item: Type): Cache<Type> {

    cached[name] = item;
    amount += 1;

    return this;
  };
  const get = (name: string): any => cached[name];
  const contains = (name: string): boolean => cached[name] !== undefined;
  const remove = (name: string): any => {

    const item: any = cached[name];

    if (isDefined(item)) {

      amount -= 1;
    }

    delete cached[name];

    return item;
  };
  const reduce = function(callback: any, initialAccumulator: any): any {

    const keys: string[] = getKeys();
    const length: number = keys.length;

    let accumulator: any = initialAccumulator;
    let index: number = 0;
    let key: string;

    for (index; index < length; index += 1) {
      key = keys[index];
      accumulator = callback(accumulator, cached[key], key, this);
    }
    return accumulator;
  };
  const map = function(callback: (item: any, key: string, self: Cache<Type>) => Type): Cache<Type> {

    return this.reduce((cache: Cache<Type>, value: any, key: string, self: Cache<Type>) => {

      cache.add(key, callback(value, key, self));

      return cache;

    }, createCache<Type>());
  };
  const forEach = function(callback: (item: any, key: string, self: Cache<Type>) => void): void {

    this.reduce((_: any, item: any, key: string, self: Cache<Type>): any => callback(item, key, self));
  };
  const filter = function(callback: (item: any, key: string, self: Cache<Type>) => void): Cache<Type> {

    return this.reduce((cache: Cache<Type>, item: any, key: string, self: Cache<Type>): any => {

      if (callback(item, key, self)) {

        cache.add(key, item);
      }

      return cache;

    }, createCache<Type>());
  };
  const find = function(callback: (item: Type, key?: string, self?: Cache<Type>) => boolean): Type {

    const keys: string[] = Object.keys(cached);

    let indexOfKey: number = keys.length;
    let element: Type;
    let key: string;

    while (indexOfKey--) {

      key = keys[indexOfKey];
      element = cached[key];

      if (callback(element, key, this)) {

        return element;
      }
    }
  };
  const clear = function(): Cache<Type> {

    cached = {};
    amount = 0;

    return this;
  };

  return {

    add,
    clear,
    contains,
    filter,
    find,
    forEach,
    get,
    map,
    reduce,
    remove,
    size,
  };
}
