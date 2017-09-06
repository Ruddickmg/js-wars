import isValidIndex from "../../tools/nonNegativeIndex";

export default function(): string {

    const url = window.location.toString();
    const indexOfParameterList = url.indexOf("?");

    return isValidIndex(indexOfParameterList) ? url.slice(indexOfParameterList) : "";
}