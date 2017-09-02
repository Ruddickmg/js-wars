import reduceF from "./reduce";

export interface Cache<Type> {

    add(name: string, canvas: any): Type;
    contains(name: string): boolean;
    filter(callback: (item: any, key: string, self: Cache<Type>) => void): Cache<Type>;
    find(callback: (item: Type, key: string, self: Cache<Type>) => boolean): Type;
    forEach(callback: (item: any, key: string, self: Cache<Type>) => void): void;
    get(name: string): Type;
    map(callback: (item: any, key: string, self: Cache<Type>) => Cache<Type>): Cache<Type>;
    reduce(callback: any, initialAccumulator: any): any;
    remove(name: string): Type;
}

export default function createCache<Type>(): Cache<Type> {

    const cached: any = {};
    const getKeys = (): any[] => Object.keys(cached);
    const add = (name: string, item: Type): Type => {

        cached[name] = item;

        return item;
    };
    const get = (name: string): any => cached[name];
    const contains = (name: string): boolean => cached[name] !== undefined;
    const remove = (name: string): any => {

        const item: any = cached[name];

        delete cached[name];

        return item;
    };
    const reduce = function(callback: any, initialAccumulator: any): any {

        return reduceF((accumulator: Cache<Type>, value: any): any => {

            return callback(accumulator, cached[value], value, this);

        }, getKeys(), initialAccumulator);
    };
    const map = function(callback: (item: any, key: string, self: Cache<Type>) => Cache<Type>): Cache<Type> {

        return this.reduce((newCache: Cache<Type>, value: any, key: string, self: Cache<Type>) => {

            newCache.add(key, callback(value, key, self));

            return newCache;

        }, createCache<Type>());
    };
    const forEach = function(callback: (item: any, key: string, self: Cache<Type>) => void): void {

        this.reduce((_: any, item: any, key: string, self: Cache<Type>): any => callback(item, key, self));
    };
    const filter = function(callback: (item: any, key: string, self: Cache<Type>) => void): Cache<Type> {

        return this.reduce((newCache: Cache<Type>, item: any, key: string, self: Cache<Type>): any => {

            if (callback(item, key, self)) {

                newCache.add(key, item);
            }

            return newCache;

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

    return {

        add,
        contains,
        filter,
        find,
        forEach,
        get,
        map,
        reduce,
        remove,
    };
}
