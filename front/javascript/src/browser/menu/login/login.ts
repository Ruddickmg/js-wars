import createUser, {isUser, User} from "../../../game/users/user";
import notifications, {PubSub} from "../../../tools/pubSub";
import single from "../../../tools/storage/singleton";
import createElement, {Element} from "../../dom/element/element";
import createTextInput from "../../input/text";
import facebookApi, {FacebookApi} from "../../oath/facebook";
import getGameScreen from "../screen/gameScreen";

export interface LoginScreen {
  skip(): void;
  display(): void;
}

export default single<LoginScreen>(function() {
  const gameScreen: Element<any> = getGameScreen();
  const loginScreenId: string = "login";
  const loginFormType: string = "section";
  const statusBarType: string = "div";
  const statusBarId: string = "status";
  const loginFormId: string = "loginForm";
  const inputElementId: string = "loginText";
  const defaultText: string = "Guest name input.";
  const successfulConnection: string = "connected";
  const unauthorizedConnection: string = "not authorized";
  const unsuccessfulLoginMessage: string = "Invalid credentials entered, please try again.";
  const loginMessage: string = "Please log in to play.";
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
  const {publish}: PubSub = notifications();
  const facebook: FacebookApi = facebookApi();
  const createStatusBar = (): Element<any> => createElement(statusBarId, statusBarType);
  const createLoginForm = function(): Element<any> {
    const loginForm: Element<any> = createElement(loginFormId, loginFormType);
    const form = createTextInput(inputElementId, defaultText);
    const facebookButton: Element<any> = facebook.createButton(handleStatusChanges);
    loginForm.appendChild(form);
    loginForm.appendChild(facebookButton);
    return loginForm;
  };
  const setup = function(received: any, origin: string = ""): void {
    const user: User = createUser(received, origin);
    if (isUser(user)) {
      gameScreen.removeChildren();
      publish("addUser", user);
      publish(["beginGameSetup", "settingUpGame"], true);
    } else {
      publish("invalidInput", {className: "login", input: received, method: "setup"});
    }
  };
  const handleStatusChanges = ({status}: any): void => { // TODO test and verify once able.
    const unauthorized: boolean = status === unauthorizedConnection;
    const message: string = unauthorized ? unsuccessfulLoginMessage : loginMessage;
    if (status === successfulConnection) {
      facebook.login(setup);
    } else {
      gameScreen.get(statusBarId).setText(message);
      gameScreen.get(loginScreenId).show();
    }
  };
  const skip = (): void => setup(testUser, "testing");
  const display = function(): void {
    gameScreen.appendChild(createLoginForm());
    gameScreen.appendChild(createStatusBar());
    gameScreen.get(loginScreenId).hide();
    facebook.setupLogin(handleStatusChanges);
  };
  return {
    display,
    skip,
  };
});
