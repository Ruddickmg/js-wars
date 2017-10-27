import notifications from "../tools/pubSub";
import initializeMenuController from "./menu/menuController";
import initializeErrorHandler from "../tools/validation/errorHandler";

window.onload = () => {

  initializeErrorHandler();
  initializeMenuController();
  notifications().publish("login");
};

// window.addEventListener("wheel", (wheel: any) => app.scroll.wheel(wheel.deltaY, new Date()));
