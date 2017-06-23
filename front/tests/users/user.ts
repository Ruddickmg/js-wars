import {expect} from "chai";
import createUser, {User} from "../../src/users/user";

describe("user", () => {

    const mockLoginSite = "www.mock.com";
    const testString = "testString";
    const desiredParameters = [
        "id",
        "name",
        "first_name",
        "last_name",
        "gender",
        "email",
        "link",
    ];
    const mockLoginData = {

        email: testString,
        first_name: testString,
        gender: testString,
        id: testString,
        last_name: testString,
        link: testString,
        mumbaJumba: testString,
        name: testString,
        screenName: testString,
        someOtherLoginData: testString,
        thisAndThat: testString,
    };

    it("Creates a User object.", () => {

        const user: User = createUser(mockLoginData, mockLoginSite);

        expect(user.loginWebsite).to.equal(mockLoginSite);

        desiredParameters.forEach((property) => expect(user[property]).to.equal(testString));

        expect(Object.keys(user).length).to.equal(desiredParameters.length + 1);
    });
});

