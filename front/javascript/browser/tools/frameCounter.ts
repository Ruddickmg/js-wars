export default (function(): any {

    const prototype = {

        increment() {

            this.frames += 1;
        },
        reached(limit: number = 0) {

            return this.frames > (limit ? limit : this.limit);
        },
        reset() {

            if (this.reached()) {

                this.frames = 0;
            }
        },
    };

    return function(limit: number) {

        return Object.assign(Object.create(prototype), {

            frames: 0,
            limit,
        });
    };
})();
