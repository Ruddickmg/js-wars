import {expect} from "chai";
import * as sinon from "sinon";
import {SinonSpy} from "sinon";
import createElement, {Element} from "../../../src/browser/dom/element/element";
import nameInput from "../../../src/browser/input/gameNameEntry";
import {subscribe} from "../../../src/tools/pubSub";

describe("gameNameEntry", () => {
  const element: Element<any> = createElement<any>("testing", "input");
  const allowedName: string = "This name is cool";
  const disallowedName: string = "ab";
  const channel: string = "setGameName";
  const emptyError: string = "A name must be entered for the game.";
  const lengthError: string = "Name must be at least three letters long.";

  it("Types a string stating that a name must be entered if none has", () => {
    expect(nameInput(element)).to.equal(emptyError);
  });
  it("Sets the game name if it is allowed", () => {
    const spy: SinonSpy = sinon.spy();
    element.element.value = allowedName;
    subscribe(channel, spy);
    expect(nameInput(element)).to.equal(allowedName);
    expect(spy.calledWith(allowedName)).to.equal(true);
  });
  it("Types a message reporting that the string is too short if necessary.", () => {
    element.element.value = disallowedName;
    expect(nameInput(element)).to.equal(lengthError);
  });
});
