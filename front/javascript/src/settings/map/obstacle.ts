export default {
  stats: {
    infantry: {
      mountain: 2,
      plain: 1,
      unit: 1000,
      wood: 1,
    },
    mountain: {
      apc: 2,
      infantry: 2,
    },
    plain: {
      apc: 1,
      infantry: 1,
    },
    unit: {
      apc: 1,
      infantry: 1,
    },
    wood: {
      apc: 2,
      infantry: 1,
    },
  },
  types: ["unit", "terrain"],
  unelectable: ["terrain", "hq", "city"],
};
