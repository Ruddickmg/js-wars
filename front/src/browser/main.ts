import {AnimationHandler, default as animationHandler} from "./animation/animationHandler.js";
import createDimensions from "./animation/dimensions";
import {default as screenController, ScreenController} from "./animation/screenController.js";
import screenConfiguration from "./configuration/screenConfig";
import app = require("./configuration/settings/app.js");

const animation: AnimationHandler = animationHandler(...screenConfiguration.listOfCanvasAnimations);
const mapDimensions = createDimensions(50, 25); // replace with map dimensions
const gameScreen: ScreenController = screenController(mapDimensions, animation);
const cursorCanvas = animation.getCanvas("cursor");
const canvasDimensions = cursorCanvas.dimensions();
const calculateBase = (pixels: number, horizontalSquares: number, verticalSquares: number): number => {

    return (pixels / horizontalSquares) / verticalSquares;
};
const baseSizeForGridSquare = calculateBase(
    cursorCanvas.pixels(),
    screenConfiguration.numberOfHorizontalGridSquares,
    screenConfiguration.numberOfVerticalGridSquares,
);

gameScreen.setDimensions(canvasDimensions, baseSizeForGridSquare);

String.prototype.uc_first = function() {

    return this.charAt(0).toUpperCase() + this.slice(1);
};

window.addEventListener("wheel", (e) => app.scroll.wheel(e.deltaY, new Date()));

