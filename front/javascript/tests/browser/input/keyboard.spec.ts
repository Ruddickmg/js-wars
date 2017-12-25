import {expect} from "chai";
import keyboardInput, {KeyBoard} from "../../../src/browser/input/keyboard";
import getSettings from "../../../src/settings/settings";
import {Dictionary} from "../../../src/tools/storage/dictionary";
import capitalizeFirstLetter from "../../../src/tools/stringManipulation/capitalizeFirstLetter";
import {isFunction} from "../../../src/tools/validation/typeChecker";

describe("keyboard", () => {
  const upKey: string = "up";
  const downKey: string = "down";
  const keyboard: KeyBoard = keyboardInput();
  const settings: Dictionary = getSettings();
  const keyboardMappings: any = settings.toObject("keyboard", "keyCodeMappings");
  const keys: string[] = Object.keys(keyboardMappings);
  const getMethodName = (key: string, type: string): string => `${type}${capitalizeFirstLetter(key)}`;
  it("Starts without any pressed keys.", () => expect(keyboard.pressingAnyKey()).to.equal(false));
  it("Starts without any released keys.", () => expect(keyboard.releasedAnyKey()).to.equal(false));
  it("Can manually press a key.", () => {
    keyboard.press(upKey);
    expect(keyboard.pressingAnyKey()).to.equal(true);
  });
  it("Can manually release a key.", () => {
    keyboard.release(upKey);
    expect(keyboard.releasedAnyKey()).to.equal(true);
  });
  it("Reports when any keys have been pressed.", () => {
    expect(keyboard.pressingAnyKey()).to.equal(false);
    keyboard.press(upKey);
    expect(keyboard.pressingAnyKey()).to.equal(true);
  });
  it("Reports when any keys have been released.", () => {
    keyboard.clearReleasedKeys();
    expect(keyboard.releasedAnyKey()).to.equal(false);
    keyboard.release(upKey);
    expect(keyboard.releasedAnyKey()).to.equal(true);
  });
  it("Reports whether a specific key has been pressed.", () => {
    expect(keyboard.pressed(upKey)).to.equal(false);
    keyboard.press(upKey);
    expect(keyboard.pressed(upKey)).to.equal(true);
  });
  it("Reports whether a specific key has been released.", () => {
    keyboard.release(upKey);
    expect(keyboard.released(upKey)).to.equal(true);
  });
  it("Can undo key presses.", () => {
    keyboard.press(downKey);
    keyboard.undoPress(downKey);
    expect(keyboard.pressed(downKey)).to.equal(false);
  });
  it("Can undo a key release.", () => {
    keyboard.release(downKey);
    keyboard.undoRelease(downKey);
    expect(keyboard.released(downKey)).to.equal(false);
  });
  it("Can assign a key.", () => {
    const keyCode: number = 65;
    keyboard.assignKey(downKey, keyCode);
    expect(keyboard.getAssignment(keyCode)).to.equal(downKey);
  });
  it("Can clear all pressed keys.", () => {
    keyboard.press(downKey);
    keyboard.press(upKey);
    keyboard.clearPressedKeys();
    expect(keyboard.pressingAnyKey()).to.equal(false);
  });
  it("Can clear all released keys.", () => {
    keyboard.release(upKey);
    keyboard.release(downKey);
    keyboard.clearReleasedKeys();
    expect(keyboard.releasedAnyKey()).to.equal(false);
  });
  it("Populates itself with key pressed methods specific to its key mappings.", () => {
    keys.forEach((key: string): void => {
      const methodName: string = getMethodName(key, "pressed");
      expect(isFunction(keyboard[methodName])).to.equal(true);
    });
  });
  it("Populates itself with key released key methods specific to its key mappings.", () => {
    keys.forEach((key: string): void => {
      const methodName: string = getMethodName(key, "released");
      expect(isFunction(keyboard[methodName])).to.equal(true);
    });
  });
  it("Populates itself with press key methods specific to its key mappings.", () => {
    keys.forEach((key: string): void => {
      const methodName: string = getMethodName(key, "press");
      expect(isFunction(keyboard[methodName])).to.equal(true);
    });
  });
  it("Populates itself with release key methods specific to its key mappings.", () => {
    keys.forEach((key: string): void => {
      const methodName: string = getMethodName(key, "release");
      expect(isFunction(keyboard[methodName])).to.equal(true);
    });
  });
  it("Populates itself with undo press key methods specific to its key mappings.", () => {
    keys.forEach((key: string): void => {
      const methodName: string = getMethodName(key, "undoPress");
      expect(isFunction(keyboard[methodName])).to.equal(true);
    });
  });
  it("Populates itself with undo release key methods specific to its key mappings.", () => {
    keys.forEach((key: string): void => {
      const methodName: string = getMethodName(key, "undoRelease");
      expect(isFunction(keyboard[methodName])).to.equal(true);
    });
  });
});
