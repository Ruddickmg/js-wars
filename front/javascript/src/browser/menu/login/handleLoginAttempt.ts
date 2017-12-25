import curry from "../../../tools/function/curry";

const successfulConnection: string = "connected";
const unsuccessfulLoginMessage: string = "Invalid credentials entered, please try again.";
const loginMessage: string = "Please log in to play.";

export default curry((onSuccess, onError, {status}: any): any => {
  return status === successfulConnection ? onSuccess(loginMessage) : onError(unsuccessfulLoginMessage);
});
