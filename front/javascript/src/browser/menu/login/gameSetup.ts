import {LoginCredentials} from "../../../game/users/credentials";
import {User} from "../../../game/users/user";
import createUser from "../../../game/users/user";
import {publish} from "../../../tools/pubSub";
import validation, {Validator} from "../../../tools/validation/validator";
import getGameScreen from "../screen/gameScreen";

const {validateUser}: Validator = validation("gameSetup");
const gameScreen = getGameScreen();

export default function gameSetup(loginCredentials: LoginCredentials, origin: string = ""): void {
  const user: User = createUser(loginCredentials, origin);
  if (validateUser(user)) {
    gameScreen.removeChildren();
    publish(["addUser", "beginGameSetup", "settingUpGame"], user);
  }
}
