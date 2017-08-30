import settings from "../../settings/settings";
import single from "../../tools/singleton";
import createUser, {User} from "../../users/user";
import facebookApi, {FacebookApi} from "../communication/facebook";
import transmit from "../communication/sockets/transmitter";
// import game from "../controller/gamesHandler";
import dom from "../dom/dom";
import userInput from "../input/input";

Menu = require("./elements/menu.js");

export interface LoginScreen {

    skip(): void;
    display(): void;
}

export default single<LoginScreen>(function() {

    const input = userInput();
    const idType = "id";
    const loginFormType = "section";
    const loginFormId = "loginForm";
    const inputFormName = "loginText";
    const formText = "Guest name input.";
    const successfulConnection = "connected";
    const unauthorizedConnection = "not authorized";
    const unsuccessfulLoginMessage = "Invalid credentials entered, please try again.";
    const loginMessage = "Please log in to play.";
    const loginElementId = "status";
    const testUser = {

        email: "testUser@test.com",
        first_name: "Testy",
        gender: "male",
        id: "10152784238931286",
        last_name: "McTesterson",
        link: "https://www.facebook.com/app_scoped_user_id/10156284235761286/",
        locale: "en_US",
        name: "Testy McTesterson",
    };

    const facebook: FacebookApi = facebookApi();
    const menu = Object.create(Menu);

    const createLoginScreen = function() {

        const loginScreen = this.createScreen(loginElementId);
        const loginForm = document.createElement(loginFormType);
        const form = input.form(inputFormName, loginForm, formText);
        const facebookButton = facebook.createButton(handleStatusChanges);
        const facebookStatus = facebook.createStatus();

        loginForm.setAttribute(idType, loginFormId);
        loginForm.appendChild(form);
        loginForm.appendChild(facebookButton);

        loginScreen.appendChild(loginForm);
        loginScreen.appendChild(facebookStatus);

        return loginScreen;
    };
    const loginScreenDisplay = (type: any): void => {

        menu.loginScreen.style.display = type;
    };
    const setup = function(received: any, origin: string = "") {

        const user: User = createUser(received, origin);

        if (user && user.id) {

            transmit.addUser(user);

            dom.removeElement(menu.loginScreen);

            // game.setUser(user);
            // game.setup();

            console.log(user);
            alert("game setup!");
        }
    };
    const handleStatusChanges = ({status}: any): void => {

        const element = document.getElementById(loginElementId);
        const unauthorized: boolean = status === unauthorizedConnection;

        if (status === successfulConnection) {

            facebook.login(setup);

        } else {

            loginScreenDisplay(null);

            element.innerHTML = unauthorized ? unsuccessfulLoginMessage : loginMessage;
        }
    };
    const skip = (): void => setup(testUser);
    const display = function(): void {

        const insertLocation = settings().get("domInsertLocation");
        const loginScreen = createLoginScreen();

        facebook.setupLogin(handleStatusChanges);

        document.body.appendChild(loginScreen, insertLocation);

        loginScreen.style.display = "none";

        this.loginScreen = loginScreen;
    };

    return {

        display,
        skip,
    };
});
