import {default as createDimensions, Dimensions} from "../../coordinates/dimensions.";

export interface ScreenDimensions extends Dimensions {

    width: number;
    height: number;
    scaleToGrid(baseSize: number): ScreenDimensions;
}

export default function createScreenDimensions(width: number, height: number): ScreenDimensions {

    const dimensions = createDimensions(width, height);
    const scaleToGridSquareSize = (dimension: number, baseSize: number): number => (dimension / baseSize) - 1;
    const scaleToGrid = (baseSize: number): ScreenDimensions => {

        return createScreenDimensions(
            scaleToGridSquareSize(width, baseSize),
            scaleToGridSquareSize(height, baseSize),
        );
    };

    return Object.assign(dimensions, {scaleToGrid});
}