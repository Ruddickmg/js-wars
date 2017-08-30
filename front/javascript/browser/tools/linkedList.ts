export interface LinkedList {

    value: any;
    next: LinkedList;
}

export default function() {

    const findMiddle = (list: LinkedList) => {

        let middle = list;
        let endFinder = list;

        while (endFinder) {

            if (endFinder.next) {

                endFinder = endFinder.next.next;
                middle = middle.next;

            } else {

                return middle;
            }
        }
    };

    const reverse = function(list: LinkedList) {

        let next = null;
        let current = list;
        let previous = current;

        if (list) {

            while (previous) {

                previous = current.next;
                current.next = next;
                next = current;
                current = previous;
            }
        }

        return next;
    };

    return {

        reverse,
        findMiddle,
    };
}
