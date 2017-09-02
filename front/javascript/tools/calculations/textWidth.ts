import createDimensions, {Dimensions} from "../../game/coordinates/dimensions";
import capitalizeFirstLetter from "../capitalizeFirstLetter";
import single from "../singleton";

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
    const attachToDom = (): any => document.body.appendChild(textContainer);
    const removeFromDom = (): any => document.body.removeChild(textContainer);

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
