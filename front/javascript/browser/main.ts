import notifications, {PubSub} from "../tools/pubSub";
import initializeMenuController from "./menus/menuController";
import initializeErrorHandler from "./tools/errorHandler";

window.onload = () => {

    const {publish}: PubSub = notifications();

    initializeErrorHandler();
    initializeMenuController();

    publish("login");
};

// window.addEventListener("wheel", (wheel: any) => app.scroll.wheel(wheel.deltaY, new Date()));
