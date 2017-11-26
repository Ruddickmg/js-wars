import {Coordinates} from "../../src/game/map/coordinates/position";

export default function(radius: number, degree: number): Coordinates {

  return {
    x: radius * Math.cos(degree),
    y: radius * Math.sin(degree),
  };
}
