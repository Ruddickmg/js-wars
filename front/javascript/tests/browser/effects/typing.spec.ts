import {expect} from "chai";
import * as sinon from "sinon";
import {SinonFakeTimers} from "sinon";
import typeWriter, {TypeWriter} from "../../../src/browser/effects/typing";

describe("typing", () => {
  const message: string = "Hello!";
  const speedInMilliseconds: number = 10;
  const typewriter: TypeWriter = typeWriter();
  const clock: SinonFakeTimers = sinon.useFakeTimers();

  typewriter.setSpeed(speedInMilliseconds);

  afterEach(() => {
    clock.restore();
    typewriter.reset();
  });

  it ("Types a message to an element over time.", () => {
    let i: number = 1;
    return typewriter.type(message, (text: string) => {
      expect(text).to.equal(message.slice(0, i++));
      clock.tick(speedInMilliseconds);
    });
  });
});
