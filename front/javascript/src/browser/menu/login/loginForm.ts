import createElement, {Element} from "../../dom/element/element";
import createTextInput from "../../input/text";
import {createButton} from "../../oath/facebook";
import handleFacebookLoginAttempt from "./handleFBLogin";

const loginFormType: string = "section";
const loginFormId: string = "loginForm";
const inputElementId: string = "loginText";
const defaultText: string = "Guest name input.";

export default function createLoginForm(): Element<any> {
  const loginForm: Element<any> = createElement(loginFormId, loginFormType);
  const form = createTextInput(inputElementId, defaultText);
  const facebookButton: Element<any> = createButton(handleFacebookLoginAttempt);
  loginForm.appendChild(form);
  loginForm.appendChild(facebookButton);
  return loginForm;
}
