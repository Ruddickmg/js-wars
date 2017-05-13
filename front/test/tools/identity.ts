import {BinaryHeap, default as binaryHeap} from "./binaryHeap.test.js";

export interface Identifier<Id> {

    get(): Id;
    remove(usableId: Id): Id;
    reserveIds(reservedIds: Id[]): Identifier<Id>;
}

export default function<Id>(initialId: Id, incrementId: (id: Id) => Id, decrementId: (id: Id) => Id): Identifier<Id> {

    const usableIds: BinaryHeap<Id> = binaryHeap<Id>().setToMax();
    const recycleId = (): Id => usableIds.pop();
    const outOfStoredIds = (): boolean => !usableIds.size();
    const get = (): Id => {

        const newId = incrementId(id);

        return outOfStoredIds() ? newId : recycleId();
    };
    const remove = (usableId: Id): Id => {

        id > usableId ? usableIds.push(usableId) : decrementId(id);

        return id;
    };
    const reserveIds = (reservedIds: Id[]): Identifier<Id> => {

        const heap: BinaryHeap<Id> = binaryHeap<Id>();

        reservedIds.forEach((key: Id): BinaryHeap<Id> => heap.push(key));

        heap.forEach((usedId: Id): void => {

            id = incrementId(id);

            while (id < usedId) {

                usableIds.push(id);

                id = incrementId(id);
            }

            id = usedId;
        });

        return this;
    };

    let id: Id = initialId;

    return {
        get,
        remove,
        reserveIds,
    };
}
