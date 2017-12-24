export interface FrameCounter {
  frames: number;
  limit: number;
  current(): number;
  increment(): FrameCounter;
  reached(limit?: number): boolean;
  reset(): FrameCounter;
}

export default (function(): any {
  const prototype = {
    current(): number {
      return this.frames;
    },
    increment(): FrameCounter {
      this.frames += 1;
      return this;
    },
    reached(limit: number = 0) {
      return this.frames >= (limit ? limit : this.limit);
    },
    reset(): FrameCounter {
      if (this.reached()) {
        this.frames = 0;
      }
      return this;
    },
  };
  return function(limit: number) {
    return Object.assign(Object.create(prototype), {
      frames: 0,
      limit,
    });
  };
})();
