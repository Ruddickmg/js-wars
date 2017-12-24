import single from "../../../tools/storage/singleton";
import createPosition, {Position} from "../../map/coordinates/position";

export interface Cursor {
  getPosition(): Position;
  setPosition({x, y}: Position): Position;
}

export default single<Cursor>(function(defaultStartingPosition: Position = createPosition(7, 5)) {
  let position = defaultStartingPosition;
  const getPosition = () => {
    const {x, y}: Position = position;
    return createPosition(x, y);
  };
  const setPosition = ({x, y}: Position) => {
    position = createPosition(x, y);
  };
  return {
    getPosition,
    setPosition,
  };
}());
