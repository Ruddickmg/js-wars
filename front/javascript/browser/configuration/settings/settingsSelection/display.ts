export default {

    capt: {
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
        description: {
            a: "Battle and capture animation.",
            b: "Battle animation only.",
            c: "Battle animation for players only.",
            off: "No animation.",
        },
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
