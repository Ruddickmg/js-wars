import {isCo} from "../co/co";
import {User, UserId} from "../user";

export interface Player {

    id: UserId;
    name: string;
    ready: boolean;
    co: string;
    gold: number;
    special: number;
    score: number;
    isComputer: boolean;
    mode: string;
    number: number;
    [index: string]: string | boolean | number;
}

export default function(user: User, co?: string): Player {

    if (co && !isCo(co)) {

        throw new TypeError("Invalid co passed in player object creation.");
    }

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
