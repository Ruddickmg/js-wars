import {expect} from "chai";
import frameCounter, {FrameCounter} from "../../../../src/tools/calculations/frameCounter";

describe("frameCounter", () => {

  const fps: number = 60;
  const startingPoint: number = 0;
  const counter: FrameCounter = frameCounter(fps);
  const countThroughFrames = (amountOfFrames: number): void => {
    let frames: number = amountOfFrames;
    while (frames--) {

      counter.increment();
    }
  };

  it("Increments a counter to track how many times it has been called.", () => {

    countThroughFrames(fps);

    expect(counter.current()).to.be.above(startingPoint);
  });

  it("Counts the amount of times it has been incremented.", () => {

    counter.reset();
    countThroughFrames(fps);

    expect(counter.current()).to.equal(fps);
  });

  it("Resets its counter.", () => {

    counter.reset();
    countThroughFrames(fps);
    expect(counter.current()).to.equal(fps);
    expect(counter.reset().current()).to.equal(startingPoint);
  });

  it("Reports when it has reached the end of its cycle.", () => {

    countThroughFrames(fps);
    expect(counter.reached(fps)).to.equal(true);
  });
});
