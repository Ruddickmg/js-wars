import {expect} from "chai";
import {SinonSpy, spy} from "sinon";
import handleLogin from "../../../../src/browser/menu/login/handleLoginAttempt";
const successfulConnection: string = "connected";
const unauthorizedConnection: string = "not authorized";
const unsuccessfulLoginMessage: string = "Invalid credentials entered, please try again.";
const loginMessage: string = "Please log in to play.";

describe("handleLoginAttempt", () => {
  let success: SinonSpy;
  let failure: SinonSpy;
  beforeEach(() => {
    success = spy();
    failure = spy();
  });
  it("Calls a method defining what to do on successful login", () => {
    handleLogin(success, failure, {status: successfulConnection});
    expect(success.calledWith(loginMessage)).to.equal(true);
  });
  it("Calls a method defining what to do on unsuccessful login", () => {
    handleLogin(success, failure, {status: unauthorizedConnection});
    expect(failure.calledWith(unsuccessfulLoginMessage)).to.equal(true);
  });
});
