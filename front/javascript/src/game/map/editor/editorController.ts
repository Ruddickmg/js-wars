import animationHandler, {CanvasCache} from "../../../browser/canvas/canvasCache";
import keyBoardInput, {KeyBoard} from "../../../browser/input/keyboard";
import notifications, {PubSub} from "../../../tools/pubSub";
// import cursorController, {CursorController} from "../../interaction/cursor/controller";

export default function() {

  const {subscribe, publish}: PubSub = notifications();
  // const cursor: CursorController = cursorController();
  const keyboard: KeyBoard = keyBoardInput();
  const animation: CanvasCache = animationHandler();

  const editing: boolean = false;

  const build = (selected: any) => {

    if (keyboard.pressedEnter()) {

      publish("build", selected);
      animation.show("unit", "building", "terrain");
    }
  };

  const copy = (selected: any) => {

    if (editing && keyboard.pressedCopy()) {

      publish("copy", selected);
    }
  };

  subscribe("keyPress", (pressed: number) => {

    build();
    copy();
  });

  return {

    copy,
    build,
  };
}
