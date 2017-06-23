import composer, {Composer} from "../tools/composer";

export type UserId = number | string;

export interface Login {

    id: UserId;
    name: string;
    first_name: string;
    last_name: string;
    screenName?: string;
    gender: string;
    email: string;
    link: string;
    [index: string]: string | number;
}

export interface User extends Login {

    loginWebsite: string;
}

export default function(loginData: Login, loginWebsite?: string): User {

    const compose: Composer<User> = composer() as Composer<User>;

    return compose.including(
        [
            "id",
            "name",
            "first_name",
            "last_name",
            "gender",
            "email",
            "link",
        ],
        {loginWebsite},
        loginData,
    );
}
