import {expect} from "chai";
import createLobby, {Lobby} from "../../src/rooms/lobby";
import createPlayer, {Player} from "../../src/users/players/player";
import createUser from "../../src/users/user";

describe("lobby", () => {

    const name: string = "lobby";
    const roomId: number = 0;
    const userOne: Player = createPlayer(createUser({

        id: 1,
        name: "yoMan",
        first_name: "firstOne",
        last_name: "lastOne",
        gender: "male",
        email: "test@email.com",
        link: "www.testy.com",
    }, "facebook"), "andy");

    const userTwo: Player = createPlayer(createUser({

        id: 2,
        name: "testy",
        first_name: "test",
        last_name: "McTesterson",
        gender: "female",
        email: "test@emailScheme.com",
        link: "www.testLink.com",
    }, "twitter"), "max");

    describe("id", () => {

        const room: Lobby = createLobby(roomId);

        it("Returns the id of the room.", () => {

            expect(room.id()).to.equal(roomId);
        });
    });

    describe("name", () => {

        const room: Lobby = createLobby(roomId);

        it("Returns the name of the room.", () => {

            expect(room.name()).to.equal(name);
        });
    });

    describe("size", () => {

        const room: Lobby = createLobby(roomId);

        it("Returns the amount of players in the room.", () => {

            room.addPlayer(userOne);
            room.addPlayer(userTwo);

            expect(room.size()).to.equal(2);
        });
    });

    describe("addPlayer", () => {

        const room = createLobby(roomId);

        it("Adds a player to the room.", () => {

            const players: any = room.getPlayers();

            room.addPlayer(userOne);

            expect(players[userOne.id]).to.equal(userOne);
        });
    });

    describe("getPlayers", () => {

        const room: Lobby = createLobby(roomId);

        room.addPlayer(userOne);
        room.addPlayer(userTwo);

        it("Returns an array of all players in the room.", () => {

            const players: any = room.getPlayers();

            expect(players[userOne.id]).to.equal(userOne);
            expect(players[userTwo.id]).to.equal(userTwo);
            expect(Object.keys(players).length).to.equal(2);
        });
    });

    describe("getPlayer", () => {

        const room: Lobby = createLobby(roomId);

        room.addPlayer(userOne);
        room.addPlayer(userTwo);

        it("Returns a specified player by their id.", () => {

            expect(room.getPlayer(userTwo.id)).to.equal(userTwo);
        });
    });

    describe("removePlayer", () => {

        const room: Lobby = createLobby(roomId);

        room.addPlayer(userTwo);
        room.addPlayer(userOne);

        it("Removes a player from the room by their id.", () => {

            const players: any = room.getPlayers();

            expect(players[userOne.id]).to.equal(userOne);
            expect(players[userTwo.id]).to.equal(userTwo);
            expect(room.size()).to.equal(2);

            room.removePlayer(userOne.id);

            expect(players[userTwo.id]).to.equal(userTwo);
            expect(players[userOne.id]).to.equal(undefined);
            expect(room.size()).to.equal(1);
        });
    });
});
