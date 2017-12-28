import {expect} from "chai";
import gameSetup from "../../../../src/browser/menu/login/gameSetup";
import {test} from "../../../../src/game/users/credentials";
import {subscribe, unsubscribe} from "../../../../src/tools/pubSub";

describe("gameSetup", () => {
  const loginWebsite: string = "test";
  let ids: any = [];
  afterEach(() => ids.forEach((id: any) => unsubscribe(id)));
  it("Signals app start up and creates user for game.", () => {
    const credentials = Object.assign({}, test, {loginWebsite});
    delete credentials.origin;
    ids = subscribe(["addUser", "beginGameSetup", "settingUpGame"], (user) => {
      expect(user).to.deep.include(credentials);
    });
    gameSetup(credentials, loginWebsite);
  });
});
