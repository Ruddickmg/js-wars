import single from "../../../src/tools/storage/singleton";
import capitalizeFirstLetter from "../../../src/tools/stringManipulation/capitalizeFirstLetter";
import createDimensions, {Dimensions} from "../../game/map/coordinates/dimensions";

export interface TextWidthChecker {
  attachToDom(): TextWidthChecker;
  removeFromDom(): TextWidthChecker;
  calculateTextWidth(text: string, fontSize: string | number): Dimensions;
}

export default single<TextWidthChecker>(function(): TextWidthChecker {
  const textContainer: any = document.createElement("div");
  const format = (element: any, dimension: string): number => {
    return Number(element[`client${capitalizeFirstLetter(dimension)}`]) + 1;
  };
  const attachToDom = function(): TextWidthChecker {
    document.body.appendChild(textContainer);
    return this;
  };
  const removeFromDom = function(): TextWidthChecker {
    document.body.removeChild(textContainer);
    return this;
  };
  const calculateTextWidth = function(text: string, fontSize: string | number = null): Dimensions {
    let dimensions: Dimensions;
    textContainer.style.fontSize = fontSize;
    textContainer.style.visibility = "hidden";
    textContainer.innerHTML = text;
    dimensions = createDimensions(
      format(textContainer, "width"),
      format(textContainer, "height"),
    );
    return dimensions;
  };
  textContainer.setAttribute("id", "textWidthChecker");
  return {
    attachToDom,
    calculateTextWidth,
    removeFromDom,
  };
});
