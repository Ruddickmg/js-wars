export interface Animator {

    start(): Animator;
    stop(): Animator;
}

export default (function() {

    const millisecondsInASecond: number = 1000;
    const framesInASecond: number = 60;
    const millisecondsInAFrame: number = millisecondsInASecond / framesInASecond;

    return function(callback: any, framesPerSecond: number = 0): Animator {

        let id: number;
        let animating: boolean = false;
        let previousTime: any = Date.now();

        const timeBetweenAnimations: number = millisecondsInAFrame * framesPerSecond;
        const stop = function(): Animator {

            cancelAnimationFrame(id);
            animating = false;

            return this;
        };
        const start = function(): Animator {

            if (!animating) {

                animating = true;
                recurse();
            }

            return this;
        };
        const recurse = (): any => {

            const now: any = Date.now();

            if (animating) {

                id = requestAnimationFrame(recurse.bind(this));

                if (now - previousTime >= timeBetweenAnimations) {

                    previousTime = now;

                    console.log("time between animations: " + timeBetweenAnimations);

                    callback(id);
                }
            }
        };

        console.log("fps: " + framesPerSecond);
        return {
            start,
            stop,
        };
    };
}());
