import {expect} from "chai";
import {SinonFakeXMLHttpRequest} from "sinon";
import * as sinon from "sinon";
import requestMaker, {Request} from "../../../../src/browser/communication/requests/request";
import createRequestHandler, {RequestHandler} from "../../../../src/browser/communication/requests/requestHandler";

describe("requestHandler", () => {
  let handlerRequests: Promise<any>[];
  const requests: SinonFakeXMLHttpRequest[] = [];
  const routes: string[] = ["going", "to", "your", "house"];
  const dataObject: any[] = ["hey dude"];
  const baseUrl: string = "https://leaving";
  const xhr: SinonFakeXMLHttpRequest = sinon.useFakeXMLHttpRequest();
  const request: Request = requestMaker(this.xhr);
  const requestHandler: RequestHandler = createRequestHandler(baseUrl, routes, request);
  xhr.onCreate = (newXhr: SinonFakeXMLHttpRequest): any => requests.push(newXhr);
  it("Makes an object with properties named by their routes that are their corresponding get requests.", () => {
    routes.forEach((route: string): any => expect(requestHandler[route]).to.be.a("function"));
  });
  handlerRequests = routes.map((route: string): Promise<any> => {
    return requestHandler[route]("dummy");
  });
  handlerRequests.forEach((response: Promise<any>, index: number) => {
    it("Will make get requests from each of its methods.", () => {
      requests[index].respond(200, {"Content-Type": "application/json"}, JSON.stringify(dataObject));
      return response.then((data: any) => expect(data).to.deep.equal(dataObject));
    });
  });
});
