import {Player} from "../../../game/users/players/player";
import allSettings from "../../../settings/settings";
import {Dictionary} from "../../../tools/dictionary";
import single from "../../../tools/singleton";
import elementMovement from "../tools/movementOfDomElements";
import createArrows from "../../objects/arrows/arrows";
import createTitle, {Title} from "./title";

export interface Menu {

    withArrows(): Menu;
}

export default single(function() {

    const movement: any = elementMovement();
    const settings: Dictionary = allSettings();
    const playerColor = settings.get("playerColor"); // TODO assure these are working
    const color = settings.get("colors");
    const playerElements: any[] = [];

    const withArrows = function(): Menu {

        if (!this.arrows) {

            this.arrows = createArrows();
        }

        return this;
    };
    const getScreen = function() {

        return this.menuScreen;
    };
    const setScreen = function(menuScreen: any): any {

        this.menuScreen = menuScreen;
    };
    const rise = (speed: number) => {

        return movement.moveElementsOffScreen(this.element.childNodes, "up", speed);
    };
    const createMenuTitle = function(title: string) {

        const newTitle: Title = createTitle(title);
        const {element}: Title = newTitle;

        this.screen().appendChild(element);
        this.title = newTitle;

        return element;
    };
    const percentage = function(height: string) {

        return Number(height.replace("%", "")) / 100;
    };
    const screenHeight = function() {

        return this.menuScreen.offsetHeight;
    };
    const removeScreen = function() {

        const {menuScreen} = this;

        menuScreen.parentNode.removeChild(menuScreen);
    };
    const resetDefaults = (type: string, players: Player[]) => { // TODO figure this out

        players.forEach((player: Player) => {

            const playerNumber = player.number;
            const playerName = player.name;
            const playerElement = document.getElementById(`player${playerNumber}${type}`);
            const children = playerElement.childNodes;
            const childrenLength = children.length;

            let indexOfChildNode;
            let child;

            for (indexOfChildNode = 0; indexOfChildNode < childrenLength; indexOfChildNode += 1) {

                child = children[indexOfChildNode];

                if (child.getAttribute("class").toLowerCase() === playerName.toLowerCase()) {

                    child.setAttribute("default", true);

                } else if (child.getAttribute("default")) {

                    child.removeAttribute("default");
                }
            }
        });
    };
    const changeTitle = function(name: string) {

        this.title.change(name);
    };
    const fall = (speed: number) => {

        return movement.moveElementsOffScreen(this.element.childNodes, "down", speed);
    };

    return {

        color,
        playerElements,
        playerColor,
        withArrows,
        getScreen,
        setScreen,
        createMenuTitle,
        percentage,
        screenHeight,
        removeScreen,
        resetDefaults,
        changeTitle,
        rise,
        fall,
    };
}());
