import {publish} from "../tools/pubSub";
import initializeErrorHandler from "../tools/validation/errorHandler";
import initializeMenuController from "./menu/menuController";

window.onload = () => {

  initializeErrorHandler();
  initializeMenuController();
  publish("login");
};

// window.addEventListener("wheel", (wheel: any) => app.scroll.wheel(wheel.deltaY, new Date()));
