import createElement, {Element} from "../../dom/element/element";
import {setupLogin} from "../../oath/facebook";
import getGameScreen from "../screen/gameScreen";
import gameSetup from "./gameSetup";
import handleLoginAttempt from "./handleLoginAttempt";
import createLoginForm from "./loginForm";

const gameScreen: Element<any> = getGameScreen();
const loginScreenId: string = "login";
const statusBarType: string = "div";
const statusBarId: string = "status";
const testUser: any = {
  email: "testUser@test.com",
  first_name: "Testy",
  gender: "male",
  id: "10152784238931286",
  last_name: "McTesterson",
  link: "https://www.facebook.com/app_scoped_user_id/10156284235761286/",
  locale: "en_US",
  name: "Testy McTesterson",
};
const createStatusBar = (): Element<any> => createElement(statusBarId, statusBarType);
export const skip = (): void => gameSetup(testUser, "testing");
export function display(): void {
  gameScreen.appendChild(createLoginForm());
  gameScreen.appendChild(createStatusBar());
  gameScreen.get(loginScreenId).hide();
  setupLogin(handleLoginAttempt);
}
