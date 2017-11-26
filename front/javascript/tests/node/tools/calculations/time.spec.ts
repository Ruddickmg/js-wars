import {expect} from "chai";
import * as sinon from "sinon";
import {SinonFakeTimers, SinonSpy} from "sinon";
import timeKeeper, {Time} from "../../../../src/tools/calculations/time";

describe("time", () => {

  const time: Time = timeKeeper();
  const clock: SinonFakeTimers = sinon.useFakeTimers();
  const millisecondsInASecond: number = 1000;
  const secondsInAMinute: number = 60;
  const minutesInAnHour: number = 60;
  const hoursInADay: number = 24;
  const daysInAYear: number = 365;

  it("Converts seconds into milliseconds.", () => {

    expect(time.seconds(1)).to.equal(millisecondsInASecond);
  });

  it("Converts minutes into milliseconds.", () => {

    expect(time.minutes(1)).to.equal(millisecondsInASecond * secondsInAMinute);
  });

  it("Converts hours into milliseconds.", () => {

    expect(time.hours(1)).to.equal(millisecondsInASecond * secondsInAMinute * minutesInAnHour);
  });

  it("Converts days into milliseconds.", () => {

    expect(time.days(1)).to.equal(millisecondsInASecond * secondsInAMinute * minutesInAnHour * hoursInADay);
  });

  it("Converts years into milliseconds.", () => {

    expect(time.years(1)).to.equal(
      millisecondsInASecond *
      secondsInAMinute *
      minutesInAnHour *
      hoursInADay *
      daysInAYear);
  });
});
