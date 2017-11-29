import request = require("request-promise-native");
import {expect} from "chai";
import {mock, SinonMock} from "sinon";
import createGame, {Game} from "../../../../src/game/game";
import {Map} from "../../../../src/game/map/map";
import testMap from "../../../../src/game/map/testMap";
import createUser, {User} from "../../../../src/game/users/user";
import createClient, {Client} from "../../../../src/server/clients/client";
import clientHandler, {ClientHandler} from "../../../../src/server/clients/clients";
import initBackend, {Backend} from "../../../../src/server/connections/backend";
import getConnections, {Connections} from "../../../../src/server/connections/connections";
import routes from "../../../../src/server/connections/routes";
import createRoom, {Room} from "../../../../src/server/rooms/room";
import roomsController, {Rooms} from "../../../../src/server/rooms/rooms";
import gamesAreEqual from "../../../utilities/gameEquality";
import mapsAreEqual from "../../../utilities/mapEquality";

describe("routes", function() {
  const connection: Connections = getConnections({
    IP: "127.0.9.4",
    PORT: "8050",
  });
  const get = "get";
  const post = "post";
  const del = "delete";
  const name: string = "testing";
  const category: string = "two";
  const id: number = 1;
  const userProperties: any = {
    email: "joejohn@jswars.com",
    first_name: "joe",
    gender: "male",
    id: 1,
    last_name: "john",
    link: "https://www.whereareyourpantsjoe.com",
    name: "joe",
  };
  const frontEnd: any = connection.frontend();
  const url: string = frontEnd.url;
  const backendUrl = connection.backend().url;
  const rooms: Rooms = roomsController(url);
  const backend: Backend = initBackend(backendUrl);
  const clients: ClientHandler = clientHandler();
  const client: Client = createClient({});
  const mockRooms: SinonMock = mock(rooms);
  const mockBackend: SinonMock = mock(backend);
  const mockClients: SinonMock = mock(clients);
  const mockClient: SinonMock = mock(client);
  const pathToRootDirectory: string = `${__dirname}/../../../../../`;
  const user: User = createUser(userProperties, name);
  const map: Map = testMap(id);
  const game: Game = createGame(name, category, map);
  const room: Room = createRoom(id, game);
  const createUrlCall = (method: string, target: string, input?: any): any => {
    return {
      body: input,
      json: true,
      method: method.toUpperCase(),
      uri: `${url}${target}`,
    };
  };
  let server: any;
  beforeEach(() => {
    server = routes(rooms, clients, backend, pathToRootDirectory);
    server.listen(frontEnd.port, frontEnd.ip);
  });
  afterEach(() => {
    server.close();
    [mockRooms, mockBackend, mockClients, mockClient]
      .forEach((mockery: SinonMock) => mockery.restore());
  });
  it("Retrieves open games from rooms.", () => {
    const roomArray: any[] = ["room"];
    mockRooms.expects("getOpenRooms").once().withExactArgs(category).returns(roomArray);
    return request(createUrlCall(get, `/games/open/${category}`)).then((response: any[]) => {
      expect(response).to.deep.equal(roomArray);
      mockRooms.verify();
    });
  });
  it("Retrieves running games from rooms.", () => {
    const roomArray: any[] = ["room"];
    mockRooms.expects("getRunningRooms").once().withExactArgs(category).returns(roomArray);
    return request(createUrlCall(get, `/games/running/${category}`)).then((response: any[]) => {
      expect(response).to.deep.equal(roomArray);
      mockRooms.verify();
    });
  });
  it("Retrieves saved games from database and matches it with rooms.", () => {
    const userId: string = "1";
    const roomArray: any[] = ["room"];
    mockBackend.expects("getGames").once().withExactArgs(userId).resolves(roomArray);
    mockRooms.expects("matchRunningGames").once().withExactArgs(roomArray).returns(roomArray);
    return request(createUrlCall(get, `/games/saved/${userId}`)).then((response: any[]) => {
      expect(response).to.deep.equal(roomArray);
      mockBackend.verify();
      mockRooms.verify();
    });
  });
  it("Retrieves maps from database by category.", () => {
    const roomArray: any[] = ["room"];
    mockBackend.expects("getMaps").once().withExactArgs(category).resolves(roomArray);
    return request(createUrlCall(get, `/maps/type/${category}`)).then((response: any[]) => {
      expect(response).to.deep.equal(roomArray);
      mockBackend.verify();
    });
  });
  it("Saves maps to the database.", () => {
    mockBackend.expects("saveMap").once().resolves(map);
    return request(createUrlCall(post, "/maps/save", map)).then((response: Map) => {
      mapsAreEqual(response, map);
      mockBackend.verify();
    });
  });
  it("Saves a user to the database.", () => {
    mockBackend.expects("saveUser").once().withExactArgs(user).resolves(user);
    mockClients.expects("updateUser").once().withExactArgs(user, user.id);
    return request(createUrlCall(post, `/users/save`, user)).then((response: User) => {
      expect(response).to.deep.equal(user);
      mockBackend.verify();
      mockClients.verify();
    });
  });
  it("Saves a game to the database.", () => {
    mockClients.expects("byId").once().withExactArgs(user.id).returns(client);
    mockClient.expects("getRoom").once().returns(room);
    mockBackend.expects("saveGame").once().resolves(game);
    return request(createUrlCall(post, "/games/save", {game, user})).then((response: Game) => {
      gamesAreEqual(game, response);
      mockClients.verify();
      mockClient.verify();
      mockBackend.verify();
    });
  });
  it("Reports remote errors and returns them after they are received.", () => {
    const testError = ["missing stuff"];
    return request(createUrlCall(post, "/errors", testError))
      .then((response: string) => expect(response).to.deep.equal(testError));
  });
  it("Deletes games from the database.", () => {
    mockBackend.expects("deleteGame").once().withExactArgs(`${id}`).resolves(game);
    return request(createUrlCall(del, `/games/remove/${id}`)).then((response: Game) => {
      gamesAreEqual(game, response);
      mockBackend.verify();
    });
  });
  it("Deletes maps from the database.", () => {
    mockBackend.expects("deleteMap").once().withExactArgs(`${id}`).resolves(map);
    return request(createUrlCall(del, `/maps/remove/${id}`)).then((response: Map) => {
      mapsAreEqual(map, response);
      mockBackend.verify();
    });
  });
  it("Deletes users from the database.", () => {
    mockBackend.expects("deleteUser").once().withExactArgs(`${id}`).resolves(user);
    return request(createUrlCall(del, `/users/remove/${id}`)).then((response: User) => {
      expect(response).to.deep.equal(user);
      mockBackend.verify();
    });
  });
  it("Responds to its home route with appropriate html.", () => {
    return request(createUrlCall(get, "/")).then((response: string) => expect(response).to.equal(`<!DOCTYPE html>

<head>
	    <meta charset="UTF-8"/>
	    <title>JS Wars</title>
	    <link rel="stylesheet" type="text/css" href="base.css">
</head>

<body>

	<canvas class="gameScreen" id="background"></canvas>
	<canvas class="gameScreen" id="landforms"></canvas>
	<canvas class="gameScreen" id="buildings"></canvas>
	<canvas class="gameScreen" id="weather"></canvas>
	<canvas class="gameScreen" id="effects"></canvas>
	<canvas class="gameScreen" id="units"></canvas>
	<canvas class="gameScreen" id="cursor">
		"You can play this game as soon as your computer can process javascript and html5."
	</canvas>
	<article class="gameScreen" id="gameScreen"></article>

	<script src="/socket.io/socket.io.js"></script>
	<script src="index.js"></script>
</body>`));
  });
});
