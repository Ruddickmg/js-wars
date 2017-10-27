import single from "../storage/singleton";
import validator, {Validator} from "../validation/validator";

export interface PixelStringConversion {

  formatPixelString(numericalValue: number): string;
  getNumericalValue(pixelString: string): number;
}

export default single<PixelStringConversion>(function(): PixelStringConversion {

  const {validateNumber, validateString}: Validator = validator("pixelString");

  const formatPixelString = (numericalValue: number): string => {

    if (validateNumber(numericalValue, "formatPixelString")) {

      return `${numericalValue}px`;
    }
  };

  const getNumericalValue = (pixelString: string): number => {

    if (validateString(pixelString, "removePx")) {

      return Number(pixelString.replace("px", ""));
    }
  };

  return {
    formatPixelString,
    getNumericalValue,
  };
});
