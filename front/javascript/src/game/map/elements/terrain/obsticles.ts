import obstacle from "./obsticle";

export default {

  building: obstacle("building", 2),
  mountain: obstacle("mountain", 2),
  plain: obstacle("plain", 1),
  snow: obstacle("snow", 1),
  unit: obstacle("unit", 0),
  wood: obstacle("wood", 3),
};
