import {login} from "../../oath/facebook";
import getGameScreen from "../screen/gameScreen";
import gameSetup from "./gameSetup";
import handleLoginAttempts from "./handleLoginAttempt";

const gameScreen = getGameScreen();
const statusBarId: string = "status";
const loginScreenId: string = "login";

export default handleLoginAttempts(
  () => login(gameSetup),
  (message: string) => {
    gameScreen.get(statusBarId).setText(message);
    gameScreen.get(loginScreenId).show();
  },
);
