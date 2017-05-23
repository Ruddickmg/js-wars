import {expect} from "chai";
import createGame, {Game} from "../../src/game/game";
import createRoom, {Room} from "../../src/rooms/room";
import createAiPlayer, {AiPlayer} from "../../src/users/ai/aiPlayer";
import createPlayer, {Player} from "../../src/users/players/player";
import createUser from "../../src/users/user";
import map from "../game/map/testMap";

describe("room", () => {

    const name: string = "szechuan sauce";
    const category: string = "twoPlayer";
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

    const aiPlayer: AiPlayer = createAiPlayer(createUser({

        id: 2,
        name: "aiPlayer",
        first_name: "testAi",
        last_name: "AiMcTesterson",
        gender: "computer",
        email: "none",
        link: "none",
    }), "max");

    describe("category", () => {

        const game: Game = createGame(name, category, map());
        const room: Room = createRoom(roomId, game);

        it("returns the category of the room", () => {

            expect(room.category()).to.equal(category);
        });
    });

    describe("id", () => {

        const game: Game = createGame(name, category, map());
        const room: Room = createRoom(roomId, game);

        it("Returns the id of the room.", () => {

            expect(room.id()).to.equal(roomId);
        });
    });

    describe("name", () => {

        const game: Game = createGame(name, category, map());
        const room: Room = createRoom(roomId, game);

        it("Returns the name of the room.", () => {

            expect(room.name()).to.equal(name);
        });
    });

    describe("size", () => {

        const game: Game = createGame(name, category, map());
        const room: Room = createRoom(roomId, game);

        it("Returns the amount of players in the room.", () => {

            room.addPlayer(userOne);
            room.addPlayer(userTwo);

            expect(room.size()).to.equal(2);
        });
    });

    describe("addPlayer", () => {

        const game: Game = createGame(name, category, map());
        const room = createRoom(roomId, game);

        it("Adds a player to the room.", () => {

            room.addPlayer(userOne);
            expect(room.getUsers()[0]).to.equal(userOne);
        });
    });

    describe("addAi", () => {

        const game: Game = createGame(name, category, map());
        const room: Room = createRoom(roomId, game);

        it("Adds an ai player to the room.", () => {

            room.addPlayer(userOne);
            room.addPlayer(userTwo);

            expect(room.getUsers()[1]).to.equal(userTwo);

            room.addAi(aiPlayer);

            expect(room.getPlayers()[1]).to.equal(aiPlayer);
        });
    });

    describe("getPlayers", () => {

        const game: Game = createGame(name, category, map());
        const room: Room = createRoom(roomId, game);

        room.addPlayer(userOne);
        room.addPlayer(userTwo);

        it("Returns an array of all players in the room.", () => {

            const players = room.getPlayers();

            expect(players[0]).to.equal(userOne);
            expect(players[1]).to.equal(userTwo);
            expect(players.length).to.equal(2);
        });
    });

    describe("getAiPlayers", () => {

        const game: Game = createGame(name, category, map());
        const room: Room = createRoom(roomId, game);

        room.addPlayer(userOne);
        room.addPlayer(userTwo);
        room.addPlayer(aiPlayer);

        it("Returns an array of all ai players in the room.", () => {

            const aiPlayers = room.getAiPlayers();

            expect(aiPlayers[0]).to.equal(aiPlayer);
            expect(aiPlayers.length).to.equal(1);
        });
    });

    describe("getPlayer", () => {

        const game: Game = createGame(name, category, map());
        const room: Room = createRoom(roomId, game);

        room.addPlayer(userOne);
        room.addPlayer(userTwo);
        room.addPlayer(aiPlayer);

        it("Returns a specified player by their id.", () => {

            expect(room.getPlayer(userTwo.id)).to.equal(userTwo);
        });
    });

    describe("getGame", () => {

        const game: Game = createGame(name, category, map());
        const room: Room = createRoom(roomId, game);

        it("Returns the game being hosted by the room.", () => {

            expect(room.getGame()).to.equal(game);
        });
    });

    describe("isSaved", () => {

        const game: Game = createGame(name, category, map());
        const room: Room = createRoom(roomId, game);

        it("Returns a boolean indicating whether a game was saved or not.", () => {

            expect(room.isSaved()).to.equal(false);

            game.saved = true;

            expect(room.isSaved()).to.equal(true);
        });
    });

    describe("isEmpty", () => {

        const game: Game = createGame(name, category, map());
        const room: Room = createRoom(roomId, game);

        it("Returns a boolean indicating whether the room contains players or not.", () => {

            room.addPlayer(aiPlayer);

            expect(room.isEmpty()).to.equal(true);

            room.addPlayer(userTwo);

            expect(room.isEmpty()).to.equal(false);
        });
    });

    describe("isFull", () => {

        const game: Game = createGame(name, category, map());
        const room: Room = createRoom(roomId, game);
        let numberOfPlayersNeededToFill = game.max;

        it("Returns a boolean indicating whether the game is full or not.", () => {

            expect(room.isFull()).to.equal(false);

            while (numberOfPlayersNeededToFill--) {

                room.addPlayer(userTwo);
            }

            expect(room.isFull()).to.equal(true);
        });
    });

    describe("hasStarted", () => {

        const game: Game = createGame(name, category, map());
        const room: Room = createRoom(roomId, game);

        room.addPlayer(userOne);
        room.addPlayer(userTwo);

        it("Returns a boolean indicating whether the game has started or not.", () => {

            expect(room.hasStarted()).to.equal(false);

            game.started = true;

            expect(room.hasStarted()).to.equal(true);
        });
    });

    describe("isSameAs", () => {

        const roomTwoId: number = roomId + 1;
        const roomTwoName: string = name + "Two";
        const game: Game = createGame(name, category, map());
        const gameTwo: Game = createGame(roomTwoName, category, map());
        const room: Room = createRoom(roomId, game);
        const roomTwo: Room = createRoom(roomTwoId, gameTwo);

        it("Returns a boolean indicating whether a game is the same as the current or not.", () => {

            expect(room.isSameAs(room)).to.equal(true);
            expect(room.isSameAs(roomTwo)).to.equal(false);
        });
    });

    describe("getUsers", () => {

        const game: Game = createGame(name, category, map());
        const room: Room = createRoom(roomId, game);

        room.addPlayer(aiPlayer);
        room.addPlayer(userOne);

        it("Returns an array of all actual users in game room (no ai players).", () => {

            expect(room.getUsers()[0]).to.equal(userOne);
        });
    });

    describe("removePlayer", () => {

        const game: Game = createGame(name, category, map());
        const room: Room = createRoom(roomId, game);

        room.addPlayer(userTwo);
        room.addPlayer(userOne);

        it("Removes a player from the room by their id.", () => {

            expect(room.getPlayers()[1]).to.equal(userOne);
            expect(room.getPlayers()[0]).to.equal(userTwo);
            expect(room.size()).to.equal(2);
            room.removePlayer(userOne.id);
            expect(room.getPlayers()[0]).to.equal(userTwo);
            expect(room.size()).to.equal(1);
        });
    });

    describe("replacePlayer", () => {

        const game: Game = createGame(name, category, map());
        const room: Room = createRoom(roomId, game);

        room.addPlayer(userOne);

        it("Removes a player then inserts another in its place.", () => {

            expect(room.getPlayers()[0]).to.equal(userOne);

            room.replacePlayer(userOne.id, userTwo);

            expect(room.getPlayers()[0]).to.equal(userTwo);
            expect(room.size()).to.equal(1);
        });
    });
});
