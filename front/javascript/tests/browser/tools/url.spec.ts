import {expect} from "chai";
import getUrl, {Url} from "../../../src/browser/tools/url";

describe("url", () => {

  const currentUrl: string =  window.top.location.href;
  const mockWindow = {top: {location: {href: currentUrl}}};
  const url: Url = getUrl(mockWindow);
  const sign: string = currentUrl.includes("?") ? "&" : "?";
  const parameterKey: string = "redirected";
  const parameterValue: boolean = true;
  const redirectedUrl: string = `currentUrl${currentUrl}${sign}${parameterKey}=${parameterValue}`;

  it("Returns its current location as a string.", () => {

    expect(url.toString()).to.equal(currentUrl);
  });
  it("Redirects to another page.", () => {

    expect(url.redirect(redirectedUrl).toString()).to.equal(redirectedUrl);
  });
  it("Gets all parameters from a url", () => {

    url.redirect(redirectedUrl);

    expect(url.parameters()[parameterKey]).to.equal(`${parameterValue}`);
  });
});
