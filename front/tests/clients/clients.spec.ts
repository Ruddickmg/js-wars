import {expect} from "chai";
import {Client} from "../../src/clients/client";
import clientHandler, {ClientHandler} from "../../src/clients/clients";
import createGame, {Game} from "../../src/game/game";
import createRoom, {Room} from "../../src/rooms/room";
import createPlayer, {Player} from "../../src/users/players/player";
import createUser, {User} from "../../src/users/user";
import map from "../game/map/testMap";

describe("clients", () => {

    const sinon = require("sinon");
    const testId = 1;
    const category = "testCategory";
    const testRoomName = "testRoom";
    const testGame: Game = createGame(testRoomName, category, map());
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
            moveTo: (roomName: string): any => {
                moveTo(roomName);
                return {emit};
            },
        },
        id: 1,
        name: "mock socket",
        emit,
        join,
        leave,
    });
    const testEmitter: any = sinon.spy();
    const testSocket: any = mockSocket(testEmitter);
    describe("add", () => {

        const clients: ClientHandler = clientHandler();

        it("Adds a client to the client handler.", () => {

            const client: Client = clients.add(testSocket, testId);

            expect(clients.byId(testId)).to.equal(client);
            expect(clients.bySocket(testSocket)).to.equal(client);
        });
    });

    describe("byId", () => {

        const clients: ClientHandler = clientHandler();

        it("Returns a client by their assigned id.", () => {

            const client = clients.add(testSocket, testId);

            expect(clients.byId(testId)).to.equal(client);
        });
    });

    describe("bySocket", () => {

        const clients: ClientHandler = clientHandler();

        it("Returns a client by the socket it uses.", () => {

            const client: Client = clients.add(testSocket, testId);

            expect(clients.bySocket(testSocket)).to.equal(client);
        });
    });

    describe("disconnect", () => {

        const clients: ClientHandler = clientHandler();
        const client: Client = clients.add(testSocket, testId);

        client.joinRoom(testRoom);
        client.setPlayer(testPlayer);

        it("disconnects a client based on the socket it uses.", () => {

            clients.disconnect(testSocket);

            expect(clients.bySocket(testSocket)).to.equal(undefined);
            expect(clients.byId(testId)).to.equal(undefined);
        });
    });

    describe("reconnect", () => {

        const clients: ClientHandler = clientHandler();
        const client: Client = clients.add(testSocket, testId);

        client.joinRoom(testRoom);
        client.setPlayer(testPlayer);

        it("Reconnects a client that had been disconnected", () => {

            clients.disconnect(testSocket);

            expect(clients.bySocket(testSocket)).to.equal(undefined);
            expect(clients.byId(testId)).to.equal(undefined);
            expect(clients.reconnect(testId)).to.equal(client);
            expect(clients.bySocket(testSocket)).to.equal(client);
            expect(clients.byId(testId)).to.equal(client);
        });
    });

    describe("remove", () => {

        const clients: ClientHandler = clientHandler();
        const client: Client = clients.add(testSocket, testId);

        it("Removes a client by their id", () => {

            expect(clients.byId(testId)).to.equal(client);
            clients.remove(testId);
            expect(clients.byId(testId)).to.equal(undefined);
        });
    });

    describe("removeTimedOutDisconnections", () => {

        const clients: ClientHandler = clientHandler();
        const client: Client = clients.add(testSocket, testId);

        client.joinRoom(testRoom);
        client.setPlayer(testPlayer);

        it("Removes all clients that have been disconnected for a certain time period", () => {

            clients.disconnect(testSocket);

            expect(clients.wasDisconnected(testId)).to.equal(true);

            clients.removeTimedOutDisconnections(0);

            expect(clients.wasDisconnected(testId)).to.equal(false);
            expect(clients.reconnect(testId)).to.equal(undefined);
        });
    });

    describe("updateUser", () => {

        const clients: ClientHandler = clientHandler();
        const client: Client = clients.add(testSocket, testId);
        const numberOfExpectedPlayersInRoom = 1;
        client.joinRoom(testRoom);
        client.setPlayer(testPlayer);

        it("Updates client user data for real time synchronization.", () => {

            let updatedPlayer;

            expect(clients.byId(testId).getPlayer()).to.equal(testPlayer);

            updatedPlayer = clients.updateUser(secondTestUser, testId);

            expect(clients.byId(testId).getRoom().size()).to.equal(numberOfExpectedPlayersInRoom);
            expect(clients.byId(testId).getPlayer()).to.equal(updatedPlayer);
            expect(updatedPlayer !== testPlayer).to.equal(true);
            expect(join.calledWith(testRoomName)).to.equal(true);
        });
    });

    describe("wasDisconnected", () => {

        const clients: ClientHandler = clientHandler();
        const client: Client = clients.add(testSocket, testId);

        client.joinRoom(testRoom);
        client.setPlayer(testPlayer);

        it("Checks list of disconnected clients to see if a client is reconnecting.", () => {

            clients.disconnect(testSocket);

            expect(clients.wasDisconnected(testId)).to.equal(true);
        });
    });
});
