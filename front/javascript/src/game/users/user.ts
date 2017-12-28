import composer, {Composer} from "../../tools/object/composer";
import {isNull, isNumber, isString} from "../../tools/validation/typeChecker";
import {register} from "../../tools/validation/typeChecker";
import {LoginCredentials} from "./credentials";

export type UserId = number | string;

export interface User extends LoginCredentials {
  loginWebsite: string;
}

export function isUser(element: any): boolean {
  const id: UserId = element.id;
  const origin: string = element.loginWebsite;
  const loginWebsites: string[] = ["facebook", "testing"];
  return (isNumber(id) || isString(id))
    && isString(element.name)
    && isString(element.first_name) || isNull(element.first_name)
    && isString(element.last_name) || isNull(element.last_name)
    && isString(element.email) || isNull(element.email)
    && isString(element.link) || isNull(element.link)
    && isString(origin)
    && loginWebsites.indexOf(origin) > -1;
}

export default function(loginData: LoginCredentials, loginWebsite?: string): User {
  const compose: Composer<User> = composer() as Composer<User>;
  return compose.including(
    [
      "id", "name", "first_name", "last_name", "gender", "email", "link",
    ],
    {loginWebsite},
    loginData,
  );
}

register("user", isUser);
