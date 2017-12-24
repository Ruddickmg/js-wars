import {expect} from "chai";
import createGame, {Game} from "../../../../src/game/game";
import map from "../../../../src/game/map/testMap";
import createPlayer, {Player} from "../../../../src/game/users/players/player";
import createUser, {User} from "../../../../src/game/users/user";
import {Client} from "../../../../src/server/clients/client";
import clientHandler, {ClientHandler} from "../../../../src/server/clients/clients";
import createRoom, {Room} from "../../../../src/server/rooms/room";

describe("clients", () => {
  const sinon = require("sinon");
  const testId = 1;
  const category = "testCategory";
  const testRoomName = "testRoom";
  const testGame: Game = createGame(testRoomName, category, map(testId));
  const testRoom: Room = createRoom(testId, testGame);
  const join: any = sinon.spy();
  const leave: any = sinon.spy();
  const moveTo: any = sinon.spy();
  const testUser: User = createUser({
    email: "test@email.com",
    first_name: "firstOne",
    gender: "male",
    id: 1,
    last_name: "lastOne",
    link: "www.testy.com",
    name: "yoMan",
  }, "none");
  const secondTestUser: User = createUser({
    email: "test@email.com",
    first_name: "name",
    gender: "famale",
    id: 2,
    last_name: "lastOne",
    link: "www.testy.com",
    name: "secondTestUser",
  }, "none");
  const testPlayer: Player = createPlayer(testUser, "andy");
  const mockSocket: any = (emit: any) => ({
    broadcast: {
      to: (roomName: string): any => {
        moveTo(roomName);
        return {emit};
      },
    },
    emit,
    id: 1,
    join,
    leave,
    name: "mock socket",
  });
  const testEmitter: any = sinon.spy();
  const testSocket: any = mockSocket(testEmitter);
  const clients: ClientHandler = clientHandler();
  it("Adds a client to the client handler.", () => {
    const client: Client = clients.add(testSocket, testId);
    expect(clients.byId(testId)).to.equal(client);
    expect(clients.bySocket(testSocket)).to.equal(client);
  });
  it("Returns a client by their assigned id.", () => {
    const client = clients.add(testSocket, testId);
    expect(clients.byId(testId)).to.equal(client);
  });
  it("Returns a client by the socket it uses.", () => {
    const client: Client = clients.add(testSocket, testId);
    expect(clients.bySocket(testSocket)).to.equal(client);
  });
  it("disconnects a client based on the socket it uses.", () => {
    const client: Client = clients.add(testSocket, testId);
    client.joinRoom(testRoom);
    client.setPlayer(testPlayer);
    clients.disconnect(testSocket);
    expect(clients.bySocket(testSocket)).to.equal(undefined);
    expect(clients.byId(testId)).to.equal(undefined);
  });
  it("Reconnects a client that had been disconnected", () => {
    const client: Client = clients.add(testSocket, testId);
    client.joinRoom(testRoom);
    client.setPlayer(testPlayer);
    clients.disconnect(testSocket);
    expect(clients.bySocket(testSocket)).to.equal(undefined);
    expect(clients.byId(testId)).to.equal(undefined);
    expect(clients.reconnect(testId)).to.equal(client);
    expect(clients.bySocket(testSocket)).to.equal(client);
    expect(clients.byId(testId)).to.equal(client);
  });
  it("Removes a client by their id", () => {
    const client: Client = clients.add(testSocket, testId);
    expect(clients.byId(testId)).to.equal(client);
    clients.remove(testId);
    expect(clients.byId(testId)).to.equal(undefined);
  });
  it("Removes all clients that have been disconnected for a certain time period", () => {
    const client: Client = clients.add(testSocket, testId);
    client.joinRoom(testRoom);
    client.setPlayer(testPlayer);
    clients.disconnect(testSocket);
    expect(clients.wasDisconnected(testId)).to.equal(true);
    clients.removeTimedOutDisconnections(0);
    expect(clients.wasDisconnected(testId)).to.equal(false);
    expect(clients.reconnect(testId)).to.equal(undefined);
  });
  it("Updates client user data for real time synchronization.", () => {
    let updatedPlayer;
    const client: Client = clients.add(testSocket, testId);
    const numberOfExpectedPlayersInRoom = 1;
    client.joinRoom(testRoom);
    client.setPlayer(testPlayer);
    expect(clients.byId(testId).getPlayer()).to.equal(testPlayer);
    updatedPlayer = clients.updateUser(secondTestUser, testId);
    expect(clients.byId(testId).getRoom().size()).to.equal(numberOfExpectedPlayersInRoom);
    expect(clients.byId(testId).getPlayer()).to.equal(updatedPlayer);
    expect(updatedPlayer !== testPlayer).to.equal(true);
    expect(join.calledWith(testRoomName)).to.equal(true);
  });
  it("Checks list of disconnected clients to see if a client is reconnecting.", () => {
    const client: Client = clients.add(testSocket, testId);
    client.joinRoom(testRoom);
    client.setPlayer(testPlayer);
    clients.disconnect(testSocket);
    expect(clients.wasDisconnected(testId)).to.equal(true);
  });
});
