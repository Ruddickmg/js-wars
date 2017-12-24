import {expect} from "chai";
import * as sinon from "sinon";
import {SinonFakeTimers} from "sinon";
import timedIterator, {TimedIterator} from "../../../src/tools/timedIterator";

describe("timedIterator", () => {
  const iterable: string = "Hello!";
  const speedInMilliseconds: number = 10;
  const iterator: TimedIterator = timedIterator();
  let clock: SinonFakeTimers;
  iterator.setSpeed(speedInMilliseconds);
  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });
  afterEach(() => {
    clock.restore();
  });
  it("Iterates over each value of a container over time.", () => {
    return iterator.iterate(iterable, (value: any, index: number) => {
      expect(value).to.equal(iterable[index]);
      clock.tick(speedInMilliseconds);
    });
  });
});
