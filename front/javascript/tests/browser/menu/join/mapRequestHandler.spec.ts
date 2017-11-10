import {expect} from "chai";
import * as sinon from "sinon";
import {SinonFakeXMLHttpRequest} from "sinon";
import requestMaker, {IncompleteRequest, Request} from "../../../../src/browser/communication/requests/request";
import {RequestHandler} from "../../../../src/browser/communication/requests/requestHandler";
import mapRequestHandler, {MapRequestHandler} from "../../../../src/browser/menu/join/mapRequestHandler";
import {Coordinates} from "../../../../src/game/map/coordinates/position";
import testMap from "../../../../src/game/map/testMap";
import range from "../../../../src/tools/array/range";
import {Map} from "../../../node/game/map/map";

describe("mapRequestHandler", () => {

  let requests: SinonFakeXMLHttpRequest[];
  let request: Request;
  let requestMap: MapRequestHandler<Map>;
  let requestHandler: (route: string, type: string) => RequestHandler;
  let xhr: SinonFakeXMLHttpRequest;
  const category: string = "Two player";
  const checkIfMapElementsAreEqual = (one: any[], two: any[]) => {

    one.forEach((element: any, index: number) => {

      const elementTwo: any = two[index];
      const position: Coordinates = element.position;
      const positionTwo: Coordinates = element.position;
      element.position = undefined;
      elementTwo.position = undefined;
      expect(position.x).to.equal(positionTwo.x);
      expect(position.y).to.equal(positionTwo.y);
      expect(element).to.deep.equal(elementTwo);
      element.position = position;
      elementTwo.position = positionTwo;
    });
  };
  const testRequestMethod = (method: any): any => {

    const maps: Map[] = range(1, 12).map((id: number): Map => testMap(id));
    const data: string = JSON.stringify(maps);
    const response = method(category);
    expect(requests.length).to.equal(1);
    requests[0].respond(200, { "Content-Type": "application/json" }, data);

    return response.then((received: Map[]): any => {

      maps.forEach((map: Map, index: number): any => {

        const receivedMap = received[index];

        expect(receivedMap.id).to.equal(map.id);
        expect(receivedMap.dimensions).to.deep.equal(map.dimensions);
        expect(receivedMap.creator).to.equal(map.creator);
        expect(receivedMap.category).to.equal(map.category);
        expect(receivedMap.name).to.equal(map.name);
        expect(receivedMap.maximumAmountOfPlayers).to.equal(map.maximumAmountOfPlayers);
        checkIfMapElementsAreEqual(receivedMap.buildings, map.buildings);
        checkIfMapElementsAreEqual(receivedMap.units, map.units);
        checkIfMapElementsAreEqual(receivedMap.terrain, map.terrain);
      });
    });
  };
  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = (newXhr: SinonFakeXMLHttpRequest): any => requests.push(newXhr);
    request = requestMaker(xhr);
    requestHandler = (route: string, routes: string) => {
      const incompleteRequest: IncompleteRequest = request.get(route) as IncompleteRequest;
      return {
        [routes]: (type: string): Promise<any> => {
          return incompleteRequest(type) as Promise<any>;
        },
      };
    };
    requestMap = mapRequestHandler("maps", "get", requestHandler);
  });
  afterEach((): any => xhr.restore());

  it("Retrieves maps or games from server.", (): any => testRequestMethod(requestMap.byCategory));
  it("Retrieves maps from a random category", (): any => testRequestMethod(requestMap.randomCategory));
});
