import {Hsl} from "../../../../depricated/color/hsl";
import createFader, {Fader} from "../../../../depricated/fade";
// TODO remove fade: deprecated
import createPosition, {Position} from "../../../game/coordinates/position";
import settings from "../../../settings/settings";
import {ElementPosition} from "../../dom/element/element";
import createArrow, {Arrow} from "./arrow";

export interface Arrows {

  arrowWidth: number;
  bottomArrow: Arrow;
  fader: Fader;
  listOfArrows: Arrow[];
  positionOfBottomArrow: number;
  positionOfTopArrow: number;
  spaceBetweenArrows: number;
  topArrow: Arrow;

  attachToElement(element: any): Arrows;
  display(visibility: string): Arrows;
  fade(): Arrows;
  hide(): Arrows;
  setPosition(position: Position | ElementPosition): Arrows;
  setPositionOfBottomArrow(position: number): Arrows;
  setPositionOfTopArrow(position: number): Arrows;
  setSize(size: number): Arrows;
  setSpaceBetweenArrows(spaceBetweenArrows: number): Arrows;
  setTop(position: number): Arrows;
  show(): Arrows;
  stopFading(): Arrows;
}

export default (function() {

  const arrowColor: Hsl = settings().get("color", "white");
  const upFacingArrow = "up";
  const downFacingArrow = "down";
  const invisible = "none";
  const arrowsPrototype: any = {

    attachToElement(element: any): Arrows {

      element.appendChild(this.topArrow.outline);
      element.appendChild(this.bottomArrow.outline);

      return this;
    },
    display(visibility: string): Arrows {

      this.listOfArrows.forEach((arrow: Arrow) => arrow.display(visibility));

      return this;
    },
    fade(): Arrows {

      this.fader.start();

      return this;
    },
    hide(): Arrows {

      this.display(invisible);

      return this;
    },
    setBorderWidth(borderWidth: number = 0): Arrows {

      this.borderWidth = borderWidth;

      return this;
    },
    setPosition(position: Position): Arrows {

      const spaceBetweenArrows = this.spaceBetweenArrows;
      const borderWidth = this.borderWidth;
      const {x, y}: Position = position;
      const arrowSize = this.arrowWidth / 2;
      const top = y - arrowSize - borderWidth;
      const left = x;
      const width = x - (borderWidth * 2);
      const bottom = top + position.y + arrowSize + (borderWidth * 3);
      const center = (width / 2) - arrowSize;
      const centeredPositionOfArrows = left + center;
      const positionOfTopArrow = top - spaceBetweenArrows - this.topArrowPosition;
      const positionOfBottomArrow = bottom + spaceBetweenArrows + this.bottomArrowPosition;

      this.topArrow.setPosition(createPosition(centeredPositionOfArrows, positionOfTopArrow));
      this.bottomArrow.setPosition(createPosition(centeredPositionOfArrows, positionOfBottomArrow));

      return this;
    },
    setPositionOfBottomArrow(position: Position | ElementPosition): Arrows {

      this.bottomArrow.setPosition(position);

      return this;
    },
    setPositionOfTopArrow(position: Position): Arrows {

      this.topArrow.setPosition(position);

      return this;
    },
    setSize(size: number): Arrows {

      this.setWidth(size);

      this.listOfArrows.map((arrow: Arrow) => arrow.setSize(size));

      return this;
    },
    setSpaceBetweenArrows(spaceBetweenArrows: number): Arrows {

      this.spaceBetweenArrows = spaceBetweenArrows;

      return this;
    },
    setTop(position: number): Arrows {

      this.bottomArrow.setTop(position);
      this.topArrow.setTop(position);

      return this;
    },
    show(): Arrows {

      this.display(null);

      return this;
    },
    stopFading(): Arrows {

      this.fader.stop();

      return this;
    },
  };

  return function(positionOfTopArrow: number = 0,
                  positionOfBottomArrow: number = 0,
                  spaceBetweenArrows: number = 0,
                  arrowWidth: number = 30): Arrows {

    const borderWidth: number = 0;
    const methods: any = Object.create(arrowsPrototype);
    const topArrow: Arrow = createArrow(upFacingArrow);
    const bottomArrow: Arrow = createArrow(downFacingArrow);
    const listOfArrows: Arrow[] = [topArrow, bottomArrow];
    const fader: Fader = createFader();

    fader.setCallback((lightness: number) => {
      const color: string = arrowColor.setLightness(lightness).format();
      topArrow.setColor(color);
      bottomArrow.setColor(color);
    });

    return Object.assign(methods, {

      arrowWidth,
      borderWidth,
      bottomArrow,
      fader,
      listOfArrows,
      positionOfBottomArrow,
      positionOfTopArrow,
      spaceBetweenArrows,
      topArrow,
    });
  };
}());
