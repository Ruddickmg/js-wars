export type LineController = (x: number, y: number) => DrawingTool

export interface DrawingTool {

    random(min: number, max: number): number
    moveRight(number: number): number
    moveLeft(number: number): number
    moveDown(number: number): number
    moveUp(number: number): number
    width: number
    height: number
    x: number
    y: number
}

export default function (screenWidth: number, screenHeight: number, base: number): LineController {

    const scaleAnimationToBaseSize = (dimension: number, value: number=1): number => (dimension / base) * value;

    return function(x: number, yAxis: number): DrawingTool {

        const y = yAxis + screenHeight;

        return {

            random: (min, max) => (Math.random() * (max - min)) + min,
            moveRight: (number: number): number => x + scaleAnimationToBaseSize(screenWidth, number),
            moveLeft: (number: number): number => x - scaleAnimationToBaseSize(screenWidth, number),
            moveDown: (number: number): number => y + scaleAnimationToBaseSize(screenHeight, number),
            moveUp: (number: number): number => y - scaleAnimationToBaseSize(screenHeight, number),
            width: screenWidth,
            height: screenHeight,
            x, y
        };
    };
}