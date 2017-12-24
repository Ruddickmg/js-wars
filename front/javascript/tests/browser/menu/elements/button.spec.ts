import {expect} from "chai";
import * as sinon from "sinon";
import {SinonSpy} from "sinon";
import {Element} from "../../../../src/browser/dom/element/element";
import createButton from "../../../../src/browser/menu/elements/button";

describe("button", () => {
  const id: string = "testButton";
  const className: string = "button";
  const clickHandler: SinonSpy = sinon.spy();
  const button: Element<any> = createButton(id, clickHandler);
  it("Starts out hidden.", () => expect(button.element.style.display).to.equal("none"));
  it(`Starts with its class set to "${className}".`, () => expect(button.getClass()).to.equal(className));
  it("Starts with its value set to its click handler.", () => expect(button.getValue()).to.equal(clickHandler));
  it("Can be clicked.", () => {
    button.element.click();
    expect(clickHandler.calledOnce).to.equal(true);
  });
});
