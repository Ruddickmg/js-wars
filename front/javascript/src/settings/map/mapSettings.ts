import definitions from "./categories/definitions";
import list from "./categories/list";
import positions from "./categories/positions";
import elements from "./elements";
import elementTypes from "./elementTypes";
import numberToCategoryMappings from "./numberToCategoryMapping";
import terrainRestriction from "./terrainRestriction";

export default {
  categories: {
    list,
    definitions,
    positions,
  },
  elementTypes,
  elements,
  numberToCategoryMappings,
  terrainRestriction,
};
