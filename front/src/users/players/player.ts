import {CO} from "../co/co";
import {User, RoomId} from "../user";

export interface Player {

    id: RoomId;
    name: string;
    ready: boolean;
    co: CO;
    gold: number;
    special: number;
    score: number;
    isComputer: boolean;
    mode: string;
    number: number;
    [index: string]: any;
}

export default function(user: User, co?: CO): Player {

    return {

        co,
        gold: 0,
        id: user.id,
        isComputer: false,
        mode: "",
        name: user.screenName || user.first_name,
        number: 0,
        ready: false,
        score: 0,
        special: 0,
    };
}
