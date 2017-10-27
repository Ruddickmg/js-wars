import map from "../../game/map/map";
import notifications, {PubSub} from "../../tools/pubSub";
import animationHandler, {CanvasCache} from "../canvas/canvasCache";
import keyBoardInput, {default as keyboard, KeyBoard} from "../input/keyboard";
import cursorController from "./cursorController";

export default function() {

  const {subscribe, publish}: PubSub = notifications();
  const cursor: CursorController = cursorController();
  const keyBoard: KeyBoard = keyBoardInput();
  const animation: CanvasCache = animationHandler();

  const editing: boolean = false;

  const build = (selected: any) => {

    if (keyboard.pressedEnter()) {

      publish("build", selected);
      animation.show("unit", "building", "terrain");
    }
  };

  const copy = (selected: any) => {

    if (editing && keyBoard.pressedCopy()) {

      publish("copy", selected);
    }
  };

  subscribe("keyPress", (pressed: number) => {

    build();
    copy();
  });

  const publicMethods = {

    copy,
    build,
  };

  return Object.assign();
}
)
;
