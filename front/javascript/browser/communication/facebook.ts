import single from "../../tools/singleton";
import dom from "../dom/dom";
import createElement, {Element} from "../dom/element";

export interface FacebookApi {

    login(callback: any): void;
    createButton(verifyLogin: any): any;
    setupLogin(onLogin: (response: any) => void): void;
}

export default single<FacebookApi>(() => {

    const appId = "1481194978837888";
    // const facebookLoginVersion = "2.3";
    const scope = "public_profile";
    const redirectUri = "http://localhost/";
    const facebookOauthUrl = "https://graph.facebook.com/oauth/authorize";
    const facebookOauthParameters = `client_id=${appId}&scope=${scope}&email&redirect_uri=${redirectUri}`;
    const oauthString = `${facebookOauthUrl}?${facebookOauthParameters}`;
    // const version = `v${facebookLoginVersion}`;
    const scriptTag = "script";
    const facebookElementId = "facebook-jssdk";
    const facebookElementSource = "//connect.facebook.net/en_US/sdk.js";
    const onClick = "click";
    const onLogin = "login";

    // const settings = {
    //
    //     appId,
    //     cookie: true,
    //     oauth: true,
    //     version,
    //     xfbml: true, // parse social plugins on the page
    // };

    const send = function() {

        const parameters = dom.getUrlParameters();
        const url = `${oauthString}${parameters}`;

        dom.redirectTo(url);
    };

    const createButton = (verifyLogin: any): Element<any> => {

        const button: Element<any> = createElement("fbButton", "button");

        button.setAttribute("scope", "public_profile, email");
        button.addEventListener(onClick, send);
        button.addEventListener(onLogin, () => FB.getLoginStatus(verifyLogin));

        return button;
    };

    const login = (handleLogin: any): void => {

        FB.api("/me", (response: any): any => handleLogin(response, "facebook"));
    };

    const setupLogin = (logUserIn: (response: any) => void): void => {

        // window.fbAsyncInit = function() {
        //
        //     console.log("doing async...");
        //
        //     try {
        //
        //         FB.init(settings);
        //         FB.getLoginStatus(logUserIn);
        //
        //     } catch (e) {
        //
        //         console.log(e);
        //     }
        // };

        (function(doc, tag, id) {

            const firstScript = dom.getFirst(tag);

            let fbElement = doc.getElementById(facebookElementId);

            if (!fbElement) {

                fbElement = doc.createElement(tag);
                fbElement.id = id;
                fbElement.src = facebookElementSource;
                firstScript.parentNode.insertBefore(fbElement, firstScript);
            }

        } (document, scriptTag, facebookElementId));

        logUserIn(false);
    };

    return {

        createButton,
        login,
        send,
        setupLogin,
    };
});
