import {Dimensions} from "../../game/coordinates/dimensions";

export type LineController = (x: number, y: number) => DrawingTool;

export interface DrawingTool {

  width: number;
  height: number;
  x: number;
  y: number;

  random(min: number, max: number): number;

  moveRight(amount?: number): number;

  moveLeft(amount?: number): number;

  moveDown(amount?: number): number;

  moveUp(amount?: number): number;
}

export default function({width, height}: Dimensions, numberOfPixels: number): LineController {

  const adjustMovementForPixelAmount = (dimension: number, value: number = 1): number => {

    return (numberOfPixels / dimension) * value;
  };

  return function(x: number, yAxis: number): DrawingTool {

    const y = yAxis + height;

    return {

      height,
      width,
      x, y,
      moveDown: (amount?: number): number => y + adjustMovementForPixelAmount(height, amount),
      moveLeft: (amount?: number): number => x - adjustMovementForPixelAmount(width, amount),
      moveRight: (amount?: number): number => x + adjustMovementForPixelAmount(width, amount),
      moveUp: (amount?: number): number => y - adjustMovementForPixelAmount(height, amount),
      random: (min, max) => (Math.random() * (max - min)) + min,
    };
  };
}
