import createElement, {Element} from "../../dom/element/element";

export default function(buttonId: string, action?: (event: any) => void) {
  const buttonClass: string = "button";
  const button: Element<any> = createElement<any>(buttonId, "button")
    .setClass(buttonClass)
    .setValue(action)
    .hide();
  button.addEventListener("click", (event: any): void => {
    event.preventDefault();
    if (action) {
      action(event);
    }
  });
  return button;
}
