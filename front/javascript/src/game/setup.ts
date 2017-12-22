import {subscribe} from "../tools/pubSub";
import single from "../tools/storage/singleton";
import {Map} from "./map/map";
import {Player} from "./users/players/player";
import {User} from "./users/user";

export interface GameSetup {

  setUser(currentUser: User): void;
}

export default single<GameSetup>(function() {

  let user: User;
  let map: Map;

  const players: Player[] = [];
  const isFull = (): boolean => map.maximumAmountOfPlayers <= players.length;
  const setUser = (currentUser: User): void => {

    user = currentUser;
  };
  const setMap = (selectedMap: Map): void => {

    map = selectedMap;
  };
  const addPlayer = (player: Player): void => {

    if (!isFull()) {

      players.push(player);
    }
  };

  subscribe("addUser", setUser);
  subscribe("setGameMap", setMap);
  subscribe("addPlayer", addPlayer);

  return {

    isFull,
    players,
    setMap,
    setUser,
  };
});
