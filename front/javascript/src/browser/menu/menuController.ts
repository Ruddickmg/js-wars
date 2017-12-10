import createGame, {Game} from "../../game/game";
import testMap from "../../game/map/testMap";
import getSettings from "../../settings/settings";
import notifications, {PubSub} from "../../tools/pubSub";
import {Dictionary} from "../../tools/storage/dictionary";
import single from "../../tools/storage/singleton";
import requestMaker, {IncompleteRequest, Request} from "../communication/requests/request";
import {Element} from "../dom/element/element";
import join from "./join/joinMenu";
import loginHandler, {LoginScreen} from "./login/login";
import handleGameModeSelection from "./mode/modeSelection";
import getGameScreen from "./screen/gameScreen";
import createTitle from "./screen/title";
import handleSettingsSelection from "./settings/settings";
export default single<any>(function() {
  const request: Request = requestMaker();
  const saveMap: IncompleteRequest = request.post("maps/save") as IncompleteRequest;
  const {publish, subscribe}: PubSub = notifications();
  const login: LoginScreen = loginHandler();
  const settings: Dictionary = getSettings();
  const gameScreen: Element<any> = getGameScreen();
  const testing: boolean = settings.get("testing");
  const title: Element<string> = createTitle();
  const gameSelection = (type: string, game: Game): any => join<Game>(type, game).listen();
  subscribe("login", (): any => testing ? login.skip() : login.display());
  subscribe("beginGameSetup", () => {
    gameScreen.appendChild(title);
    handleGameModeSelection().listen();
  });
  subscribe("finishedSelectingMap", (game: Game) => handleSettingsSelection(game));
  subscribe("joinNewGame", (game: Game): any => gameSelection("open", game));
  subscribe("joinContinuingGame", (game: Game): any => gameSelection("running", game));
  subscribe("startNewGame", (game: Game = createGame()): any => gameSelection("type", game));
  subscribe("resumeSavedGame", (game: Game): any => gameSelection("saved", game));
  subscribe("createNewMap", (): void => {
    const amountOfMaps: number = 10;
    let mapNumber: number = 1;
    for (mapNumber; mapNumber <= amountOfMaps; mapNumber += 1) {
      saveMap(testMap(mapNumber))
        .catch(({message}: Error): void => publish("serverError", message));
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
