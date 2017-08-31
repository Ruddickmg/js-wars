import getSettings from "../settings/settings";
import {Dictionary} from "../tools/dictionary";
import notifications, {PubSub} from "../tools/pubSub";
import login, {LoginScreen} from "./menus/login/login";
import selectMode from "./menus/mode/modes";
import initializeErrorHandler from "./tools/errorHandler";

window.onload = () => {

    const loginScreen: LoginScreen = login();
    const settings: Dictionary = getSettings();
    const testingApplication: boolean = settings.get("testing");
    const {subscribe}: PubSub = notifications();

    initializeErrorHandler();

    subscribe("beginGameSetup", () => {

        console.log("setting up game.");

        selectMode().display();
    });

    if (testingApplication) {

        console.log("testing");

        loginScreen.skip();

    } else {

        console.log("displaying");

        loginScreen.display();
    }
};

// window.addEventListener("wheel", (wheel: any) => app.scroll.wheel(wheel.deltaY, new Date()));
