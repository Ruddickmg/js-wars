import composer from "../tools/composer";

export type RoomId = number | string;

export interface Login {

    id: RoomId;
    name: string;
    first_name: string;
    last_name: string;
    screenName?: string;
    gender: string;
    email: string;
    link: string;
}

export interface User extends Login {

    loginSite: string;
}

export default function(loginData: Login, loginWebsite: string): User {

    const compose = composer();

    return compose.including(
        ["id", "name", "first_name", "last_name", "gender", "email", "link"],
        {loginWebsite},
        loginData,
    );
}
