import {expect} from "chai";
import createGame, {Game} from "../../../javascript/game/game";
import {Room} from "../../../javascript/server/rooms/room";
import roomHandler, {Rooms} from "../../../javascript/server/rooms/rooms";
import createPlayer from "../../javascript/users/players/player";
import createUser from "../../javascript/users/user";
import map from "../../../javascript/game/map/testMap";

describe("rooms", () => {

    const backendUrl = "www.test.com";
    const category: string = "twoPlayer";

    describe("add", () => {

        const rooms = roomHandler(backendUrl);
        const game: Game = createGame("szechuan sauce", category, map());

        it("Adds a room to the rooms handler.", () => {

            const room = rooms.add(game);

            expect(rooms.get(room.id())).to.equal(room);
        });
    });

    describe("addReservedIds", () => {

        const rooms = roomHandler(backendUrl);
        const ids = [2, 3, 4, 5, 6, 7];

        it("reserves ids that are already being used", () => {

            let name = "szechuan sauce";

            rooms.addReservedIds(ids);

            ids.forEach(() => {

                name += " sauce!.";

                rooms.add(createGame(name, category, map()));
            });

            ids.forEach((id) => expect(rooms.get(id)).to.equal(undefined));
        });
    });

    describe("category", () => {

        const rooms: Rooms = roomHandler(backendUrl);
        const categoryOne: string = "onePlayer";
        const categoryTwo: string = "twoPlayer";
        const categoryThree: string = "threePlayer";

        it("Retrieves all games of a specified category.", () => {

            const firstRoom: Room = rooms.add(createGame(categoryOne, categoryOne, map()));
            const secondRoom: Room = rooms.add(createGame(categoryTwo, categoryTwo, map()));

            expect(rooms.category(categoryOne)[firstRoom.id()]).to.equal(firstRoom);
            expect(rooms.category(categoryTwo)[secondRoom.id()]).to.equal(secondRoom);
            expect(Object.keys(rooms.category(categoryThree)).length).to.equal(0);
        });
    });

    describe("get", () => {

        const rooms: Rooms = roomHandler(backendUrl);

        it("Returns a specified game", () => {

            const room: Room = rooms.add(createGame(category, category, map()));

            expect(rooms.get(room.id())).to.equal(room);
        });
    });

    describe("getOpenRooms", () => {

        const rooms: Rooms = roomHandler(backendUrl);

        it("Retrieves all open/non-full/non-running games.", () => {

            const closedGame = createGame(category, category, map());
            const firstRoom: Room = rooms.add(closedGame);
            const secondRoom: Room = rooms.add(createGame(category + "Two", category, map()));
            const numberOfRoomsExpectedToBeFound = 1;

            let openRooms;

            closedGame.started = true;

            openRooms = rooms.getOpenRooms(category);

            expect(openRooms[0]).to.equal(secondRoom.getGame());
            expect(openRooms.indexOf(firstRoom.getGame())).is.below(0);
            expect(openRooms.length).to.equal(numberOfRoomsExpectedToBeFound);
        });
    });

    describe("getRunningRooms", () => {

        const rooms: Rooms = roomHandler(backendUrl);

        it("Retrieves all running games that are open to join.", () => {

            const runningGame = createGame(category, category, map());
            const fullRunningGame = createGame(category + "Three", category, map());
            const firstRoom: Room = rooms.add(runningGame);
            const secondRoom: Room = rooms.add(createGame(category + "Two", category, map()));
            const thirdRoom: Room = rooms.add(fullRunningGame);
            const numberOfRoomsExpectedToBeFound = 1;

            let numberOfPlayersNeededToFillGame = fullRunningGame.max;
            let openRooms;

            runningGame.started = true;
            fullRunningGame.started = true;

            while (numberOfPlayersNeededToFillGame--) {

                thirdRoom.addPlayer(createPlayer(createUser({

                    email: "test@email.com",
                    first_name: "firstOne",
                    gender: "male",
                    id: 1,
                    last_name: "lastOne",
                    link: "www.testy.com",
                    name: "yoMan",

                }, "facebook"), "andy"));
            }

            openRooms = rooms.getRunningRooms(category);

            expect(openRooms[0]).to.equal(firstRoom.getGame());
            expect(openRooms.indexOf(secondRoom.getGame())).is.below(0);
            expect(openRooms.indexOf(thirdRoom.getGame())).is.below(0);
            expect(openRooms.length).to.equal(numberOfRoomsExpectedToBeFound);
        });
    });

    describe("lobby", () => {

        it("Retrieves the lobby room.", () => {

            // TODO
        });
    });

    describe("matchRunningGames", () => {

        const rooms: Rooms = roomHandler(backendUrl);

        it("matches running or open games with loaded saved games so that they may be rejoined.", () => {

            const runningGame = createGame(category, category, map());
            const savedGame = Object.assign({}, runningGame);
            const firstRoom: Room = rooms.add(runningGame);
            const secondRoom: Room = rooms.add(createGame(category + "Two", category, map()));
            const numberOfRoomsExpectedToBeFound = 1;

            let matchedGames;

            runningGame.started = true;
            savedGame.id = firstRoom.id();

            matchedGames = rooms.matchRunningGames([savedGame]);

            expect(matchedGames[0]).to.equal(firstRoom.getGame());
            expect(matchedGames.indexOf(secondRoom.getGame())).is.below(0);
            expect(matchedGames.length).to.equal(numberOfRoomsExpectedToBeFound);
        });
    });

    describe("remove", () => {

        const rooms: Rooms = roomHandler(backendUrl);

        it("Removes a game from the room list.", () => {

            const room: Room = rooms.add(createGame(category, category, map()));

            rooms.remove(room);

            expect(rooms.get(room.id())).to.equal(undefined);
        });
    });
});
