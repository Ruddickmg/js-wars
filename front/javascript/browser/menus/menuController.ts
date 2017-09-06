import createGame, {Game} from "../../game/game";
import {Map} from "../../game/map/map";
import testMap from "../../game/map/testMap";
import getSettings from "../../settings/settings";
import {Dictionary} from "../../tools/dictionary";
import notifications, {PubSub} from "../../tools/pubSub";
import requestMaker, {IncompleteRequest, Request} from "../communication/requests/request";
import createTitle, {Title} from "./elements/title";
import join from "./join/join";
import loginHandler, {LoginScreen} from "./login/login";
import getGameScreen, {GameScreen} from "./main/gameScreen";
import gameModeSelection from "./mode/modeMenu";

export default function() {

    const request: Request = requestMaker();
    const saveMap: IncompleteRequest = request.post("maps/save") as IncompleteRequest;
    const {subscribe}: PubSub = notifications();
    const login: LoginScreen = loginHandler();
    const settings: Dictionary = getSettings();
    const gameScreen: GameScreen = getGameScreen();
    const testing: boolean = settings.get("testing");
    const title: Title = createTitle();

    subscribe("login", () => testing ? login.skip() : login.display());

    subscribe("beginGameSetup", () => {

        gameScreen.add("title", title);

        gameModeSelection();
    });

    subscribe("joinNewGame", (): any => join<Game>("open"));
    subscribe("joinContinuingGame", (): any => join<Game>("running"));
    subscribe("startNewGame", (): any => join<Map>("type", createGame()));
    subscribe("resumeSavedGame", (): any => join<Map>("saved"));
    subscribe("createNewMap", (): void => {

        const amountOfMaps: number = 10;

        let mapNumber: number = 1;

        for (mapNumber; mapNumber <= amountOfMaps; mapNumber += 1) {

            saveMap(testMap(mapNumber)).then((response: any): void => console.log(response))
                .catch((error: Error): void => console.log(error));
        }
    });
    subscribe("editCo", (): void => {

        alert("editing my co!");
    });
    subscribe("logOut", (): void => {

        alert("logging out!");
    });
    subscribe("gameStore", (): void => {

        alert("going to the store!");
    });
}
