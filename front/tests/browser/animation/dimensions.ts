export interface Dimensions {

    width: number,
    height: number,
    scaleToGrid(baseSize: number): Dimensions
}

export default function createDimensions(width: number, height: number): Dimensions {

    const scaleToGridSquareSize = (dimension: number, baseSize: number): number => (dimension / baseSize) - 1;

    return {
        width: width,
        height: height,
        scaleToGrid(baseSize: number): Dimensions {

            return createDimensions(
                scaleToGridSquareSize(width, baseSize),
                scaleToGridSquareSize(height, baseSize)
            );
        }
    };
}