import {expect} from "chai";
import {SinonFakeXMLHttpRequest} from "sinon";
import * as sinon from "sinon";
import requestMaker, {Request} from "../../../../src/browser/communication/requests/request";

describe("requests", () => {

  let requests: SinonFakeXMLHttpRequest[];
  let request: Request;
  let xhr: SinonFakeXMLHttpRequest;

  const checkIfThrowsError = (method: any): Promise<any> => {
    const promise: Promise<any> = method("/hello/bob", "hey bob!") as Promise<any>;
    expect(requests.length).to.equal(1);
    requests[0].respond(500, "", "");
    return promise.then(() => "error")
      .catch((error) => expect(error).to.be.an("error"));
  };

  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = (newXhr: SinonFakeXMLHttpRequest): any => requests.push(newXhr);
    request = requestMaker(this.xhr);
  });

  afterEach((): any => xhr.restore());

  it("Makes get requests.", () => {
    const promise: Promise<any> = request.get("/hello/bob", "hey bob!") as Promise<any>;
    expect(requests.length).to.equal(1);
    requests[0].respond(200, {"Content-Type": "application/json"}, '[{ "id": 12, "comment": "Hey there" }]');
    return promise.then((response: any) => expect(response).to.deep.equal([{id: 12, comment: "Hey there"}]));
  });
  it("Makes post requests that post json data.", () => {
    const data: any[] = ["hello", 43110, "friend", {a: true}];
    const json: string = JSON.stringify(data);
    request.post("/target/hoop", data);
    expect(requests[0].requestBody).to.equal(json);
  });
  it("Makes delete requests.", () => {
    const promise: Promise<any> = request.del("/hello/bob", "hey bob!") as Promise<any>;
    expect(requests.length).to.equal(1);
    requests[0].respond(200, {"Content-Type": "application/json"}, JSON.stringify("success"));
    return promise.then((response: any) => expect(response).to.deep.equal("success"));
  });
  it("Get should reject with error if a request fails.", () => checkIfThrowsError(request.get));
  it("Post should reject with error if a request fails.", () => checkIfThrowsError(request.post));
  it("Delete should reject with error if a request fails.", () => checkIfThrowsError(request.del));
});
