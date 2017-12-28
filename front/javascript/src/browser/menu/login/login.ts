import {guest} from "../../../game/users/credentials";
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
const createStatusBar = (): Element<any> => createElement(statusBarId, statusBarType);
export const skip = (): void => gameSetup(guest, "testing");
export function display(): void {
  gameScreen.appendChild(createLoginForm());
  gameScreen.appendChild(createStatusBar());
  gameScreen.get(loginScreenId).hide();
  setupLogin(handleLoginAttempt);
}
