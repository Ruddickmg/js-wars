import {isUser, User} from "../../../game/users/user";
import createUser from "../../../game/users/user";
import {publish} from "../../../tools/pubSub";
import getGameScreen from "../screen/gameScreen";
const gameScreen = getGameScreen();
export default function gameSetup(currentUser: any, origin: string = ""): void {
  const user: User = createUser(currentUser, origin);
  if (isUser(user)) {
    gameScreen.removeChildren();
    publish("addUser", user);
    publish(["beginGameSetup", "settingUpGame"], true);
  } else {
    publish("invalidInput", {
      className: "login",
      input: currentUser,
      method: "gameSetup",
    });
  }
}
