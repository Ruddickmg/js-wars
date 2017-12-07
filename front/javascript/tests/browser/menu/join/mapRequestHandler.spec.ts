import {expect} from "chai";
import * as sinon from "sinon";
import {SinonFakeXMLHttpRequest} from "sinon";
import requestMaker, {Request} from "../../../../src/browser/communication/requests/request";
import mapRequestHandler, {MapRequestHandler} from "../../../../src/browser/menu/join/mapRequestHandler";
import testMap from "../../../../src/game/map/testMap";
import range from "../../../../src/tools/array/range";
import {Map} from "../../../node/game/map/map";
import checkEqualityBetweenTwoMaps from "../../../utilities/mapEquality";

describe("mapRequestHandler", () => {

  let requests: SinonFakeXMLHttpRequest[];
  let request: Request;
  let requestMap: MapRequestHandler<Map>;
  let xhr: SinonFakeXMLHttpRequest;
  const category: string = "Two player";
  const testRequestMethod = (method: any): any => {
    const maps: Map[] = range(1, 12).map((id: number): Map => testMap(id));
    const data: string = JSON.stringify({success: true, response: maps});
    const response = method(category);
    expect(requests.length).to.equal(1);
    requests[0].respond(200, { "Content-Type": "application/json" }, data);
    return response.then((received: Map[]): any => {
      maps.forEach((map: Map, index: number): any => {
        checkEqualityBetweenTwoMaps(received[index], map);
      });
    });
  };
  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = (newXhr: SinonFakeXMLHttpRequest): any => requests.push(newXhr);
    request = requestMaker(xhr);
    requestMap = mapRequestHandler("maps", "get", request);
  });
  afterEach((): any => xhr.restore());

  it("Retrieves maps or games from server.", (): any => testRequestMethod(requestMap.byCategory));
  it("Retrieves maps from a random category", (): any => testRequestMethod(requestMap.randomCategory));
});
