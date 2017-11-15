import {expect} from "chai";
import {Element} from "../../../../src/browser/dom/element/element";
import createTitle from "../../../../src/browser/menu/screen/title";
import getSettings from "../../../../src/settings/settings";
import notifications, {PubSub} from "../../../../src/tools/pubSub";
import {Dictionary} from "../../../../src/tools/storage/dictionary";

describe("title", () => {

  const {subscribe}: PubSub = notifications();
  const settings: Dictionary = getSettings();
  const tag: string = "h1";
  const text: string = "title";
  const title: Element<any> = createTitle(text);

  beforeEach(() => settings.set("debug", true));
  afterEach(() => settings.set("debug", false));

  it("Should contain the text that was assigned to it.", () => expect(title.getText()).to.equal(text));
  it(`Should be of type "${tag}"`, () => expect(title.element.tagName.toLowerCase()).to.equal("h1"));
  it("Will send an error message if passed a non string value.", () => {
    const incorrectInput: any = {};
    subscribe("invalidInputError", ({method, className, input}) => {

      expect(input).to.equal(incorrectInput);
      expect(className).to.equal("title");
      expect(method).to.equal("createTitle");
    });
    createTitle(incorrectInput);
  });
});
