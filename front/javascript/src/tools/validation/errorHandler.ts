import settings from "../../settings/settings";
import {publish, subscribe} from "../pubSub";
import single from "../storage/singleton";

interface PublishedError {
  className: string;
  method: string;
  fatal?: boolean;
  message?: string;
  input?: any;
}

export interface ErrorHandler {
  error(message: string): void;
  invalidInput(error: PublishedError): void;
  notFound(error: PublishedError): void;
  customError(error: PublishedError): void;
}

export default single<ErrorHandler>(function(): ErrorHandler {
  const debugging: boolean = settings().get("debug");
  const handleError = (message: string, fatal: boolean = false): void => {
    if (debugging) {
      throw Error(message);
    } else {
      publish("sendErrorToServer", message);
      if (fatal) {
        throw Error("An error has occurred.");
      }
    }
  };
  const error = (message: string): void => handleError(message);
  const customError = ({message, className, method, fatal}: PublishedError): void => {
    handleError(`${message} from method ${method}, in ${className}`, fatal);
  };
  const invalidInput = ({className, method, input, fatal}: PublishedError): void => {
    handleError(`Invalid input: ${input} found on call to ${method} in ${className}.`, fatal);
  };
  const notFound = ({className, message, input, method, fatal}: PublishedError): void => {
    const locationString: string = method ? " in " + method : "";
    handleError(`Unable to ${message} from ${className}. ${input} was not found${locationString}.`, fatal);
  };
  subscribe("error", error);
  subscribe("customError", customError);
  subscribe("invalidInputError", invalidInput);
  subscribe("notFoundError", notFound);
  return {
    customError,
    error,
    invalidInput,
    notFound,
  };
});
