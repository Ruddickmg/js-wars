import curry from "../../../tools/curry";
import single from "../../../tools/singleton";

export interface Arrow {

    background: any;
    direction: string;
    outline: any;
    setColor(color: string): void;
    setHeight(position: number): void;
    setLeft(position: number): void;
    setTop(position: number): void;
    setPosition(x: number, y: number): void;
    setSize(size: any): void;
    display(visibility: string): void;
    remove(): any;
}

export type ArrowFactory = (direction: string) => Arrow;

export default single(function() {

    const top = "borderTopWidth";
    const bottom = "borderBottomWidth";
    const left = "borderLeftWidth";
    const right = "borderRightWidth";
    const triangleShapeProperties = {

        down: [left, right, bottom],
        left: [left, bottom, top],
        right: [bottom, right, top],
        up: [bottom, right, top],
    };
    const side: any = {

        down: "Top",
        left: "Right",
        right: "Left",
        up: "Bottom",
    };
    const setSizeOfShape = curry((shapeProperties: string[], element: any, formattedPixelSize: string): any => {

        shapeProperties.forEach((property: string) => {

            element.style[property] = formattedPixelSize;
        });
    });
    const setSizeOfUpwardFacingArrow = setSizeOfShape(triangleShapeProperties.up);
    const setSizeOfDownwardFacingArrow = setSizeOfShape(triangleShapeProperties.down);
    const setSizeOfLeftFacingArrow = setSizeOfShape(triangleShapeProperties.left);
    const setSizeOfRightFacingArrow = setSizeOfShape(triangleShapeProperties.right);
    const modifyArrowByDirection: any = {

        down: setSizeOfDownwardFacingArrow,
        left: setSizeOfLeftFacingArrow,
        right: setSizeOfRightFacingArrow,
        up: setSizeOfUpwardFacingArrow,
    };
    const formatNumericalSizeToPixelString = (size: number) => `${size}px`;
    const offsetBorderForPositioning = (element: any, borderSize: string): any => {

        element.style.moveLeft = borderSize;
    };
    const percentage = (n: number): number => n / 100;
    const isLeftOrRight = (direction: string): boolean => direction === "left" || direction === "right";
    const augmentBottomSizeForArrowShape = (element: any, formattedSize: string): any => {

        element.style.borderBottomWidth = formattedSize;
    };

    const arrowPrototype: any = {

        display(visibility: string) {

            this.outline.style.display = visibility;
        },
        setColor(color: string) {

            const edge = side[this.direction];

            this.background.style[`border${edge}Color`] = color;
        },
        setHeight(position: number) {

            this.outline.style.top = formatNumericalSizeToPixelString(position);
        },
        setLeft(position: number) {

            this.outline.style.moveLeft = formatNumericalSizeToPixelString(position);
        },
        setTop(position: number) {

            this.outline.style.top = formatNumericalSizeToPixelString(position);
        },
        setPosition(x: number, y: number) {

            this.setLeft(x);
            this.setTop(y);
        },
        remove() {

            const outline = this.outline;

            outline.parentNode.removeChild(outline);
        },
        setSize(size: any) {

            const background = this.background;
            const arrow = this.outline;
            const type = this.direction;

            const borderWidthAsPercentageOfSize = percentage(25);
            const borderWidth = size * borderWidthAsPercentageOfSize;
            const formattedSize = formatNumericalSizeToPixelString(size);
            const formattedBackgroundSize = formatNumericalSizeToPixelString(size - borderWidth);
            const borderOffset = formatNumericalSizeToPixelString(borderWidth - size);
            const augmentedBottomSize = formatNumericalSizeToPixelString(size - 2);
            const setSizeOfArrow = modifyArrowByDirection[type];

            this.setWidth(size);

            offsetBorderForPositioning(background, borderOffset);

            setSizeOfArrow(arrow, formattedSize);
            setSizeOfArrow(background, formattedBackgroundSize);

            if (isLeftOrRight(type)) {

                augmentBottomSizeForArrowShape(background, augmentedBottomSize);
            }
        },
    };

    return function createArrow(direction: string): Arrow {

        const methods = Object.create(arrowPrototype);
        const background = document.createElement(`div`);
        const outline = document.createElement(`div`);

        background.setAttribute(`id`, `${direction}ArrowBackground`);
        background.setAttribute(`class`, `${direction}Arrow`);

        outline.setAttribute(`id`, `${direction}ArrowOutline`);
        outline.setAttribute(`class`, `${direction}Arrow`);
        outline.appendChild(background);

        return Object.assign(methods, {

            background,
            direction,
            outline,

        }) as Arrow;
    };
});
