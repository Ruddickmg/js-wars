import modeMenuItem from "../../browser/menus/mode/modeMenuItem";

export default {

    heightOfSelected: 75,
    menuSpacing: 20,
    messages: {

        COdesign: "Customize the look of your CO",
        continuegame: "Resume a saved game",
        continuejoin: "Re-Join a saved game started at an earlier time",
        design: "Design maps or edit CO appearance",
        game: "Create or continue a saved game",
        join: "Join a new or saved game",
        logout: "select to log out of the game",
        mapdesign: "Create your own custom maps",
        newgame: "Set up a new game",
        newjoin: "Find and join a new game",
        store: "Purchase maps, CO\"s, and other game goods",
    },
    positions: [

        "twoAbove",
        "oneAbove",
        "selected",
        "oneBelow",
        "twoBelow",
    ],
    selections: [
        modeMenuItem("game", ["new", "continue"], "setup"),
        modeMenuItem("join", ["new", "continue"]), // used to have param: `color:"yellow"`
        modeMenuItem("design", ["map", "co"]),
        modeMenuItem("store"),
        modeMenuItem("logout", null, "exit"),
    ],
};
