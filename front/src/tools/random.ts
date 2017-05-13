export default {

    array(length: number, min: number = 0, max: number = 1): number[] {

        let l = length;
        const array: number[] = [];

        while (l--) {

            array.push(this.inRange(min, max));
        }

        return array;
    },

    inRange(min: number, max: number): number {

        return Math.random() * (max - min) + min;
    },
};
