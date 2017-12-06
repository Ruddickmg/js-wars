import createGame, {Game} from "../../game/game";
import {Map} from "../../game/map/map";
import testMap from "../../game/map/testMap";
import getSettings from "../../settings/settings";
import notifications, {PubSub} from "../../tools/pubSub";
import {Dictionary} from "../../tools/storage/dictionary";
import single from "../../tools/storage/singleton";
import requestMaker, {IncompleteRequest, Request} from "../communication/requests/request";
import {Element} from "../dom/element/element";
import join from "./join/join";
import loginHandler, {LoginScreen} from "./login/login";
import handleGameModeSelection from "./mode/modeElements/modeMenu";
import getGameScreen from "./screen/gameScreen";
import createTitle from "./screen/title";
import handleSettingsSelection from "./settings/settings";
export default single<any>(function() {
  const request: Request = requestMaker();
  const saveMap: IncompleteRequest = request.post("maps/save") as IncompleteRequest;
  const {subscribe}: PubSub = notifications();
  const login: LoginScreen = loginHandler();
  const settings: Dictionary = getSettings();
  const gameScreen: Element<any> = getGameScreen();
  const testing: boolean = settings.get("testing");
  const title: Element<string> = createTitle();
  subscribe("login", (): any => testing ? login.skip() : login.display());
  subscribe("beginGameSetup", () => {
    gameScreen.appendChild(title);
    handleGameModeSelection();
  });
  subscribe("finishedSelectingMap", (game: Game) => handleSettingsSelection(game));
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
});
