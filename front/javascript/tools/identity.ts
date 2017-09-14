import binaryHeap, {BinaryHeap} from "./storage/heaps/binaryHeap";

export interface Identifier<Id> {

    get(): Id;
    remove(usableId: Id): Id;
    reserveIds(reservedIds: Id[]): Identifier<Id>;
}

export default function<Id>(initialId: Id, incrementId: (id: Id) => Id, decrementId: (id: Id) => Id): Identifier<Id> {

    let id: Id = initialId;

    const usableIds: BinaryHeap<Id> = binaryHeap<Id>().setToMax();
    const recycleId = (): Id => usableIds.pop();
    const outOfStoredIds = (): boolean => !usableIds.size();
    const get = (): Id => {

        const currentId: any = id;

        if (outOfStoredIds()) {

            id = incrementId(id);

            return currentId;
        }

        return recycleId();
    };
    const remove = (usableId: Id): Id => {

        if (id > usableId) {

            usableIds.push(usableId);

        } else {

            id = decrementId(id);
        }

        return id;
    };
    const reserveIds = (reservedIds: Id[]): Identifier<Id> => {

        const heap: BinaryHeap<Id> = binaryHeap<Id>();

        reservedIds.forEach((key: Id): BinaryHeap<Id> => heap.push(key));

        heap.forEach((usedId: Id): void => {

            while (id < usedId) {

                usableIds.push(id);

                id = incrementId(id);
            }

            id = incrementId(usedId);
        });

        return this;
    };

    return {
        get,
        remove,
        reserveIds,
    };
}
