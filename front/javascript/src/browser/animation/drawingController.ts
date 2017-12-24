import createDimensions, {Dimensions} from "../../game/map/coordinates/dimensions";
import createPosition, {Position} from "../../game/map/coordinates/position";
import getSettings from "../../settings/settings";
import {subscribe} from "../../tools/pubSub";
import createCache, {Cache} from "../../tools/storage/cache";
import createCanvas, {Canvas} from "../canvas/canvas";
import animations, {Animations} from "./animations";
import createLineTool, {DrawingTool, LineController} from "./lineTool";

export interface DrawingController {
  [key: string]: any;
}

export default function(dimensions: Dimensions, currentScreenPosition: Position): DrawingController {
  const screenConfiguration: any = getSettings().toObject("screenConfiguration");
  let offset: Dimensions;
  let gridSquare: Dimensions;
  let screenPosition: Position = currentScreenPosition;
  let numberOfVerticalGridSquares: number = screenConfiguration.numberOfVerticalGridSquares;
  let numberOfHorizontalGridSquares: number = screenConfiguration.numberOfHorizontalGridSquares;
  const animation: Animations = animations(dimensions);
  const lineTool: LineController = createLineTool(dimensions, 64);
  const offsetNeededToCenterDrawing: number = 2;
  const max = Math.max;
  const drawings: Cache<any> = createCache<any>();
  const offsetDrawing = (dimension: number): number => dimension * offsetNeededToCenterDrawing;
  const centerDrawing = (dimension: number): number => dimension / offsetNeededToCenterDrawing;
  const changeGridDimensions = (gridDimensions: Dimensions): void => {
    numberOfVerticalGridSquares = gridDimensions.height;
    numberOfHorizontalGridSquares = gridDimensions.width;
  };
  const changeScreenDimensions = (screenDimensions: Dimensions): void => {
    const pixelWidthOfGridSquare = screenDimensions.width / numberOfHorizontalGridSquares;
    const pixelHeightOfGridSquare = screenDimensions.height / numberOfVerticalGridSquares;
    const widthOffset = centerDrawing(pixelWidthOfGridSquare);
    const heightOffset = centerDrawing(pixelHeightOfGridSquare);
    offset = createDimensions(widthOffset, heightOffset);
    gridSquare = createDimensions(pixelWidthOfGridSquare, pixelHeightOfGridSquare);
  };
  const changeScreenPosition = (position: Position): void => {
    screenPosition = position;
  };
  const modifyCoordinatesForScrolling = (coordinate: number, position: number, dimension: number): number => {
    return (coordinate * dimension) - (position * dimension);
  };
  const drawToCanvas = (name: string, {x, y}: Position, canvas: Canvas<any>): Canvas<any> => {
    const drawing: any = canvas.context();
    const line: DrawingTool = lineTool(x, y);
    const drawAnimation: any = animation[name];
    drawAnimation(drawing, line);
    return canvas;
  };
  const createImage = (name: string): Canvas<any> => {
    const width: number = offsetDrawing(gridSquare.width);
    const height: number = offsetDrawing(gridSquare.height);
    return createCanvas(name, createDimensions(width, height));
  };
  const drawImage = (name: string): Canvas<any> => {
    const x: number = centerDrawing(gridSquare.width);
    const y: number = centerDrawing(gridSquare.height);
    return drawToCanvas(name, createPosition(x, y), createImage(name));
  };
  const drawImageToCanvas = (name: any, {x, y}: Position, canvas: Canvas<any>): void => {
    const image: any = cacheOrCreateDrawing(name);
    const position: Position = createPosition(
      modifyCoordinatesForScrolling(x, screenPosition.x, gridSquare.width) - offset.width,
      modifyCoordinatesForScrolling(y, screenPosition.y, gridSquare.height) - offset.height,
    );
    canvas.render(image, position);
  };
  const cacheOrCreateDrawing = (name: string): void => {
    if (!drawings.contains(name)) {
      drawings.add(name, drawImage(name));
    }
    return drawings.get(name);
  };
  const getScreenDimensions = () => {
    const beginning: number = 0;
    const screenX: number = screenPosition.x;
    const screenY: number = screenPosition.y;
    const right = screenX + numberOfHorizontalGridSquares;
    const bottom = screenY + numberOfVerticalGridSquares;
    const left: number = max(beginning, screenX);
    const top: number = max(beginning, screenY);
    return {left, right, top, bottom};
  };
  const fill = (drawing: any, canvas: Canvas<any>): void => {
    const {left, right, top, bottom}: any = getScreenDimensions();
    let position: Position;
    let x: number;
    let y: number;
    for (x = right; x >= left; x -= 1) {
      for (y = bottom; y >= top; y -= 1) {
        position = createPosition(x * gridSquare.width, y * gridSquare.height);
        drawToCanvas(drawing, position, canvas);
      }
    }
  };
  subscribe("changeScreenDimensions", changeScreenDimensions);
  subscribe("changeGridDimensions", changeGridDimensions);
  subscribe("screenMovement", changeScreenPosition);
  changeScreenDimensions(dimensions);
  return {
    changeGridDimensions,
    changeScreenDimensions,
    changeScreenPosition,
    drawImageToCanvas,
    drawToCanvas,
    fill,
  };
}
