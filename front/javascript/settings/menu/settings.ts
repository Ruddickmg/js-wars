export default {

    capt: {
        def: "OFF",
        description: "Set number of properties needed to win.",
        inc: 1,
        max: 45,
        min: 7,
        off: "OFF",
    },
    fog: {
        description: "Set ON to limit vision with fog of war.",
        off: "OFF",
        on: "ON",
    },
    funds: {
        description: "Set funds recieved per allied base.",
        inc: 500,
        max: 9500,
        min: 1000,
    },
    power: {
        description: "Select ON to enamble CO powers.",
        off: "OFF",
        on: "ON",
    },
    turn: {
        def: "OFF",
        description: "Set number of days to battle.",
        inc: 1,
        max: 99,
        min: 5,
        off: "OFF",
    },
    visuals: {
        a: "Type A",
        b: "Type B",
        c: "Type C",
        description: [
            "No animation.",
            "Battle and capture animation.",
            "Battle animation only.",
            "Battle animation for players only.",
        ],
        off: "OFF",
    },
    weather: {
        clear: "Clear",
        description: "RANDOM causes climate to change.",
        rain: "Rain",
        random: "Random",
        snow: "Snow",
    },
};
