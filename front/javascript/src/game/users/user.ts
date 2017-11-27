import composer, {Composer} from "../../tools/object/composer";
import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";

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

export function isUser(element: any): boolean {
  const {isString, isNumber}: TypeChecker = typeChecker();
  const id: UserId = element.id;
  const origin: string = element.loginWebsite;
  const loginWebsites: string[] = ["facebook", "testing"];
  return (isNumber(id) || isString(id))
    && isString(element.name)
    && isString(element.first_name)
    && isString(element.last_name)
    && isString(element.email)
    && isString(element.link)
    && isString(origin)
    && loginWebsites.indexOf(origin) > -1;
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
