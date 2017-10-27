import textWidthChecker, {TextWidthChecker} from "../../tests/tools/calculations/textWidth";
import cycle, {Cycle} from "../src/tools/motion/cycle";
import validator, {Validator} from "../src/tools/validation/validator";
import {Element} from "../browser/dom/element/element";

export interface TextScroller extends Cycle {

  left(): TextScroller;

  right(): TextScroller;

  start(): TextScroller;
}

export default (function() {

  const identity: number = 1;
  const scroller: Cycle = cycle();
  const className: string = "scrollingText";
  const methodName: string = "constructor";
  const widthType: string = "client";
  const calculator: TextWidthChecker = textWidthChecker();
  const {validateElement, validateString}: Validator = validator(className);
  const getWidth = (text: Element<any>, fontSize: string): number => {

    const width: number = calculator.attachToDom().calculateTextWidth(text.text, fontSize).width;

    calculator.removeFromDom();

    return width;
  };

  return function(text: Element<any>, container: Element<any>, fontSize: string = "30px"): TextScroller {

    let movingRight = true;

    const start = function(): TextScroller {

      const offScreenLeft: number = getWidth(text, fontSize) * -identity;
      const offScreenRight: number = container.getWidth(widthType);

      scroller.setBeginning(movingRight ? offScreenLeft : offScreenRight)
        .setEnd(movingRight ? offScreenRight : offScreenLeft)
        .start();

      return this;
    };
    const left = function(): TextScroller {

      movingRight = false;

      return this;
    };
    const right = function(): TextScroller {

      movingRight = true;

      return this;
    };

    scroller.setCallback((position: number): any => text.setLeft(position));

    if (
      validateElement(text, methodName)
      && validateElement(container, methodName)
      && validateString(fontSize, methodName)
    ) {
      return Object.assign(Object.create(scroller), {

        left,
        right,
        start,
      });
    }
  };
}());
