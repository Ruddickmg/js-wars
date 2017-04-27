"use strict";

const binaryHeap = require('../../public/js/tools/binaryHeap.js');

function identity(initialId=0) {

    const
        usableIds = binaryHeap().setToMax(),
        recycleId = () => usableIds.pop(),
        outOfStoredIds = () => !usableIds.size();

    let id = initialId;

    return {

        get: () => outOfStoredIds() ? ++id : recycleId(),
        remove(usableId) {

            id > usableId ? usableIds.push(usableId) : id -= 1;

            return this;
        },
        reserveIds(reservedIds) {

            const heap = binaryHeap();

            reservedIds.forEach(key => heap.push(key));

            heap.forEach((usedId) => {

                id += 1;

                while (id < usedId) {

                    usableIds.push(id++);
                }

                id = usedId;
            });

            return this;
        }
    };
}

module.exports = identity;



