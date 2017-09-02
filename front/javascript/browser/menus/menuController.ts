import getSettings from "../../settings/settings";
import {Dictionary} from "../../tools/dictionary";
import notifications, {PubSub} from "../../tools/pubSub";
import createTitle, {Title} from "./elements/title";
import loginHandler, {LoginScreen} from "./login/login";
import getGameScreen, {GameScreen} from "./main/gameScreen";
import gameModeSelection from "./mode/modeMenu";

export default function() {

    const {subscribe}: PubSub = notifications();
    const login: LoginScreen = loginHandler();
    const settings: Dictionary = getSettings();
    const gameScreen: GameScreen = getGameScreen();
    const testing: boolean = settings.get("testing");
    const title: Title = createTitle();

    subscribe("login", () => testing ? login.skip() : login.display());

    subscribe("beginGameSetup", () => {

        gameScreen.add(title.id, title);

        gameModeSelection();
    });

    subscribe("joinNewGame", (): void => {

        alert("joining new game!");
    });

    subscribe("joinContinuingGame", (): void => {

        alert("joining on going game!");
    });

    subscribe("startNewGame", (): void => {

        alert("starting new game!");
    });

    subscribe("editCo", (): void => {

        alert("editing my co!");
    });

    subscribe("logOut", (): void => {

        alert("logging out!");
    });

    subscribe("resumeSavedGame", (): void => {

        alert("resuming a saved game!");
    });

    subscribe("gameStore", (): void => {

        alert("going to the store!");
    });

    subscribe("createNewMap", (): void => {

        alert("editing a map!");
    });
}
