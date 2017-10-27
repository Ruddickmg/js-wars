import {Position} from "../../../game/coordinates/position";
import curry from "../../../tools/function/curry";
import capitalizeFirstLetter from "../../../tools/stringManipulation/capitalizeFirstLetter";
import validator, {Validator} from "../../../tools/validation/validator";
import createElement, {Element, ElementPosition} from "../../dom/element/element";
import pixelStringConverter, {PixelStringConversion} from "../../../tools/stringManipulation/pixelStringConversion";

export interface Arrow extends Element<any> {

  background: any;
  direction: string;
  outline: any;

  setColor(color: string): Arrow;

  setPosition(x: number, y: number): Arrow;

  setSize(size: any): Arrow;
}

export default (function() {

  const {validateString, validateNumber}: Validator = validator("arrow");
  const {formatPixelString}: PixelStringConversion = pixelStringConverter();
  const percentageOfScreenSize: number = 25;
  const amountToAugmentBorderBy: number = 2;
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
  const offsetBorderForPositioning = (element: Element<any>, borderSize: string): any => {

    element.setLeft(borderSize);
  };
  const percentage = (numericalValue: number): number => numericalValue / 100;
  const isLeftOrRight = (direction: string): boolean => ["left", "right"].indexOf(direction) > -1;
  const augmentBottomSizeForArrowShape = (element: Element<any>, formattedSize: string): any => {

    element.element.style.borderBottomWidth = formattedSize;
  };
  const methods: any = {

    setColor(color: string): Arrow {

      const edge = capitalizeFirstLetter(side[this.direction]);

      if (validateString(color, "setColor")) {

        this.background.element.style[`border${edge}Color`] = color;
      }

      return this;
    },
    setPosition(position: Position | ElementPosition): Arrow {
      const methodName: string = "setPosition";
      const {x, y}: Position = position;
      if (validateNumber(x, methodName) && validateNumber(y, methodName)) {

        this.setLeft(x);
        this.setTop(y);
      }
      return this;
    },
    setSize(size: number): Arrow {

      const background = this.background;
      const arrow = this.outline;
      const type = this.direction;
      const borderWidthAsPercentageOfSize = percentage(percentageOfScreenSize);
      const borderWidth = size * borderWidthAsPercentageOfSize;
      const formattedSize = formatPixelString(size);
      const setSizeOfArrow = modifyArrowByDirection[type];

      let formattedBackgroundSize: string;
      let borderOffset: string;
      let augmentedBottomSize: string;

      if (validateNumber(size, "setSize")) {

        formattedBackgroundSize = formatPixelString(size - borderWidth);
        borderOffset = formatPixelString(borderWidth - size);
        augmentedBottomSize = formatPixelString(size - amountToAugmentBorderBy);

        this.setWidth(size);

        offsetBorderForPositioning(background, borderOffset);

        setSizeOfArrow(arrow, formattedSize);
        setSizeOfArrow(background, formattedBackgroundSize);

        if (isLeftOrRight(type)) {

          augmentBottomSizeForArrowShape(background, augmentedBottomSize);
        }
      }
      return this;
    },
  };
  return function(direction: string): Arrow {

    const arrowElementType: string = "div";
    const arrowElementClass: string = `${direction}Arrow`;
    const outline = createElement(`${direction}ArrowOutline`, arrowElementType).setClass(arrowElementClass);
    const background: Element<any> = createElement(`${direction}ArrowBackground`, arrowElementType)
      .setClass(arrowElementClass);

    if (validateString(direction, "constructor")) {

      outline.appendChild(background);

      return Object.assign(outline, methods, {

        background,
        direction,

      }) as Arrow;
    }
  };
}());
