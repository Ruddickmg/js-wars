export default {

  defaults: {

    capt: "off",
    fog: "off",
    funds: 1000,
    power: "on",
    turn: "off",
    visuals: "off",
    weather: "random",
  },
  elements: {
    capture: {
      def: "OFF",
      description: "Set number of properties needed to win.",
      off: "OFF",
      range: {increment: 1, maximum: 45, minimum: 7},
    },
    fog: {
      description: "Set ON to limit vision with fog of war.",
      off: "OFF",
      on: "ON",
    },
    funds: {
      description: "Set funds recieved per allied base.",
      range: {increment: 500, maximum: 9500, minimum: 1000},
    },
    power: {
      description: "Select ON to enamble CO powers.",
      off: "OFF",
      on: "ON",
    },
    turn: {
      def: "OFF",
      description: "Set number of days to battle.",
      off: "OFF",
      range: {increment: 1, maximum: 99, minimum: 5},
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
  },
};
