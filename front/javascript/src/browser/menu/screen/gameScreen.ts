import single from "../../../tools/storage/singleton";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import createElement, {Element} from "../../dom/element/element";
import findFirstElementWithTag from "../../dom/findFirstElemenWithTag";

export default single<Element<any>>(function(): Element<any> {

  const className: string = "gameScreen";
  const screenType: string = "article";
  const scriptTag: string = "script";
  const {isDefined}: TypeChecker = typeChecker();
  const existingGameScreen: any = document.getElementById(className);
  const gameScreen: Element<any> = createElement<any>(className, existingGameScreen || screenType);
  const firstScript: any = findFirstElementWithTag(scriptTag);

  if (!isDefined(gameScreen)) {

    document.body.insertBefore(gameScreen.element, firstScript);
  }

  return gameScreen;
});
