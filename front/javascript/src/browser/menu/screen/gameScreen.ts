import single from "../../../tools/storage/singleton";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import createElement, {Element} from "../../dom/element/element";
import findFirstElementWithTag from "../../dom/findFirstElemenWithTag";

const className: string = "gameScreen";
const screenType: string = "article";
const scriptTag: string = "script";
const {isDefined}: TypeChecker = typeChecker();

export default single<Element<any>>(function(): Element<any> {
  const existingGameScreen: any = document.getElementById(className);
  const gameScreen: Element<any> = createElement<any>(className, existingGameScreen || screenType);
  const firstScript: any = findFirstElementWithTag(scriptTag);
  if (!isDefined(gameScreen)) {
    window.document.body.insertBefore(gameScreen.element, firstScript);
  }
  return gameScreen;
});
