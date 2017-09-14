import createPosition, {Position} from "../../game/coordinates/position";
import single from "../../tools/storage/singleton";

export interface Cursor {

    getPosition(): Position;
    setPosition({x, y}: Position): Position;
}

export default single<Cursor>(function(defaultStartingPosition: Position = createPosition(7, 5)) {

    let position = defaultStartingPosition;

    const getPosition = () => position;
    const setPosition = ({x, y}: Position) => {

        position = createPosition(x, y);
    };

    return {

        getPosition,
        setPosition,
    };

}());
