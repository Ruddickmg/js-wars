import createGame, {Game} from "../../../game/game";
import {Map} from "../../../game/map/map";
import settings from "../../../settings/settings";
import notifier, {PubSub, SubscriptionId} from "../../../tools/pubSub";
import mapsHandler, {MapsHandler} from "../../controller/mapsHandler";
import dom from "../../dom/dom";
import getKeyboard from "../../input/keyboard";
import createMenu from "../elements/menu";
import createTitle from "../elements/title";

export default function() {

    const configurations = settings();
    const mapScreen = configurations.get("selectMapScreen");
    const gameScreen = configurations.get("selectGameScreen");
    const categories = configurations.get("categories");
    const notifications: PubSub = notifier();
    const menu: any = Object.create(createMenu());
    const maps: MapsHandler = mapsHandler();
    const keys: any = getKeyboard();
    const horizontal = ["left", "right"];
    const vertical = ["right", "left"];
    const keyPressEvent = "keyPress";

    const isGame = (element: Game | Map) => {

        const mapOrGame = element as Game;

        return check.isDefined(mapOrGame.map);
    };
    const init = function(type: string, category: string, configuration: any) {

        this.category = category;
        this.type = type;
        this.element = configuration;
        this.display(type);
    };

    const subscription: SubscriptionId = notifications.subscribe(keyPressEvent, (pressedKey) => {

        const {selectCategory, buildings} = this;
        const {pressed, pressedEnterKey, pressedEscapeKey, undo}: any = keys;
        const map: Map = maps.getById(this.mapSelector.id());

        if (pressed(...horizontal)) {

            selectCategory();
        }

        if (pressed(...vertical)) {

            buildings.set(Select.vertical(this.mapSelector.deHighlight())
                .highlight()
                .currentPlayer());
        }

        if (pressedEnterKey()) {

            undo();

            return map ? this.setup(map) : this.goBack();
        }

        if (pressedEscapeKey()) {

            goBack();
        }
    });

    let categorySelector;
    let mapSelector;

    const goBack = function() {

        this.removePlayer();

        notifications.unsubscribe(subscription, keyPressEvent);
    };
    const game = (category: string) => {

        init("game", category, gameScreen);
    };
    const map = (category: string) => {

        init("map", category, mapScreen);
    };
    const display = function(type: string) {

        const setupScreen = this.createScreen("setupScreen");
        const title = createTitle(`Select*${type}`);

        return maps.getCategory(type)
            .then((receivedMaps: Map[]) => {

                const elements = {

                    div: "selectCategoryScreen",
                    section: "categorySelectScreen",
                };

                const mapSelectionMenu = dom.createMenu(receivedMaps, ["name"], this.element);
                const categorySelectionMenu = dom.createMenu(categories, [], elements);

                const buildingsDisplay = new BuildingsDisplay();

                categorySelector = createUList(categorySelectionMenu.firstChild)
                    .hideAll()
                    .show();

                mapSelector = createUList(mapSelectionMenu.firstChild)
                    .setScroll(0, 4)
                    .highlight();

                // app.touch(categories).swipe();
                // app.click(categories).swipe();

                setupScreen.appendChild(title);
                setupScreen.appendChild(buildingsDisplay.element());
                setupScreen.appendChild(categorySelectionMenu);
                setupScreen.appendChild(mapSelectionMenu);
                setupScreen.appendChild(setupScreen);

                return Promise.resolve(setupScreen);
            });
    };
    const host = function() {

        return this.height;
    };
    const selectCategory = function() {

        const categories = categorySelector.hideCurrentElement();

        Select.horizontal(categories)
            .show()
            .prepHorizontal();

        maps.getById(categorySelector.id());

        this.buildings.set(mapSelector.());
    };
    const update = function(type: string) {

        maps.getCategory(type)
            .then((receivedMaps: Map[]) => {

                const elements = dom.createMenu(receivedMaps, ["name"], this.element);

                dom.appendOrReplace(elements);

                // this.buildings.set(app.maps.info()); // TODO figure this out
                //
                // maps.setElement(elements.firstChild);
                // maps.highlight();
            });
    };
    const setupGame = ({name, map, players, id}: Game): Game => {

        const user = app.user.raw();
        const {category}: Map = map;

        players.push(user); // TODO figure this out

        // app.game.setSettings(received.settings);
        // app.game.setJoined(true);

        return createGame(name, category, map, id);
    };
    const setupJoinedGame = (game: Game): Game => {

        transmit.join(game);

        return setupGame(game);
    };
    const setup = function(received: Map | Game) {

        const map: Map = isGame(received) ? received.map : received;

        if (isGame(received)) {

            setupGame(received);
        }

        this.removePlayer();

        return received;
    };
    const leave = function() {

        const select = document.getElementById(this.element.section);
        const buildings = document.getElementById("buildingsDisplay");
        const categories = document.getElementById("categorySelectScreen");

        const joinMenu = this.screen();

        joinMenu.removeChild(select);
        joinMenu.removeChild(buildings);
        joinMenu.removeChild(categories);
    };

    return Object.assign(menu, {

        display,
        game,
        goBack,
        host,
        leave,
        map,
        selectCategory,
        setup,
        setupGame,
        setupJoinedGame,
        update,
    });
}
