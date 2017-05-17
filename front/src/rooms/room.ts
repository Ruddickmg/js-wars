import {Game} from "../game/game";
import {AiPlayer} from "../users/ai/aiPlayer";
import {Player} from "../users/players/player";
import {AnyPlayer, isAiPlayer} from "../users/players/playerSocketListener";
import {RoomId} from "../users/user";

export type RoomId = number | string;

export interface Room {

    id(): RoomId;
    getGame(): Game;
    name(): string;
    hasStarted(): boolean;
    hasBeenSaved(): boolean;
    category(): string;
    isEmpty(): boolean;
    isFull(): boolean;
    size(): number;
    all(): AnyPlayer[];
    users(): Player[];
    getPlayer(id: RoomId): AnyPlayer;
    addAi(aiPlayer: AiPlayer): AiPlayer;
    isSameAs(room: Room): boolean;
    add(player: Player): Room;
    getAiPlayers(): AiPlayer[];
    removePlayer(id: RoomId): AnyPlayer;
    replacePlayer(id: RoomId, replacement: AnyPlayer): AnyPlayer;
}

export default function(id: RoomId, game: Game): Room {

    const category: string = game.category;
    const players: AnyPlayer[] = game.players;
    const invalidIndex = -1;
    const indexOf = (roomId: RoomId): number => players.reduce((desiredIndex, player, index) => {

        const foundMatchingId: boolean = player.id === roomId;
        const indexHasNotBeenChanged: boolean = desiredIndex <= invalidIndex;

        return foundMatchingId && indexHasNotBeenChanged ? index : desiredIndex;

    }, invalidIndex);

    return {

        add(player: Player): Room {

            players.push(player);

            return this;
        },
        addAi: (aiPlayer: AiPlayer): AiPlayer => {

            const index: number = indexOf(aiPlayer.id);

            players.splice(index, 0, aiPlayer);

            return aiPlayer;
        },
        all: (): Player[] => players.slice(),
        category: (): string => category,
        getAiPlayers(): AiPlayer[] {

            return players.reduce((aiPlayers: AiPlayer[], player: AnyPlayer): AiPlayer[] => {

                if (isAiPlayer(player)) {

                    aiPlayers.push(player);
                }

                return aiPlayers;

            }, []);
        },
        getGame: (): Game => game,
        getPlayer: (roomId: RoomId): AnyPlayer => players[indexOf(roomId)],
        hasBeenSaved: (): boolean => game.saved,
        hasStarted: (): boolean => game.started,
        id: (): RoomId => id,
        isEmpty: (): boolean => !this.users().length,
        isFull: (): boolean => players.length >= game.max,
        isSameAs(room: any): boolean {

            return ["id", "name", "created"].reduce((isTheSame: boolean, property: string) => {

                return this[property] === room[property] && isTheSame;

            }, true);
        },
        name: (): string => game.name,
        size: (): number => players.length,
        users(): Player[] {

            return players.reduce((users: Player[], player: Player): Player[] => {

                if (!player.isComputer) {

                    users.push(player);
                }

                return users;

            }, []);
        },
        removePlayer(userId: RoomId): AnyPlayer {

            const index: number = indexOf(userId);

            if (!isNaN(index)) {

                return players.splice(index, 1)[0];
            }
        },
        replacePlayer(userId: RoomId, replacement: AnyPlayer): AnyPlayer {

            const index: number = indexOf(userId);

            if (!isNaN(index)) {

                return players.splice(index, 1, replacement)[0];
            }
        },
    };
}
