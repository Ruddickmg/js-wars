import settings from "../../../settings/settings";
import {Hsl} from "../../color/hsl";
import createFader, {Fader} from "../../effects/fade";
import createArrow, {Arrow} from "./arrow";

export interface Arrows {

    bottomArrow: Arrow;
    fader: Fader;
    listOfArrows: Arrow[];
    positionOfBottomArrow: number;
    positionOfTopArrow: number;
    spaceBetweenArrows: number;
    topArrow: Arrow;
    attachToElement(element: any): void;
    display(visibility: string): void;
    fade(): void;
    hide(): void;
    setPosition({dimensions, border}: any): void;
    setPositionOfBottomArrow(position: number): void;
    setPositionOfTopArrow(position: number): void;
    setSize(size: number): void;
    setSpaceBetweenArrows(spaceBetweenArrows: number): void;
    show(): void;
    stopFading(): void;
}

export default (function() {

    const arrowColor: Hsl = settings().get("color", "white");
    const upFacingArrow = "up";
    const downFacingArrow = "down";
    const invisible = "none";

    const arrowsPrototype: any = {

        attachToElement(element: any): void {

            element.appendChild(this.topArrow.outline);
            element.appendChild(this.bottomArrow.outline);
        },
        display(visibility: string): void {

            this.listOfArrows.forEach((arrow: Arrow) => arrow.display(visibility));
        },
        fade(): void {

            this.fader.start((color: string, arrows: Arrow[]) => {

                arrows.forEach((arrow: Arrow) => arrow.setColor(color));
            });
        },
        hide(): void {

            this.display(invisible);
        },
        setPosition({dimensions, border}: any): void {

            const spaceBetweenArrows = this.setSpaceBetweenArrows;
            const possibleBorderWidth = border ? border() : border;
            const borderWidth = possibleBorderWidth || 0;
            const {x, y} = dimensions;
            const arrowSize = this.width() / 2;
            const top = y - arrowSize - borderWidth;
            const left = x;
            const width = x - (borderWidth * 2);
            const bottom = top + dimensions.y + arrowSize + (borderWidth * 3);
            const center = (width / 2) - arrowSize;
            const centeredPositionOfArrows = left + center;
            const positionOfTopArrow = top - spaceBetweenArrows - this.topArrowPosition;
            const positionOfBottomArrow = bottom + spaceBetweenArrows + this.bottomArrowPosition;

            this.topArrow.setPosition(centeredPositionOfArrows, positionOfTopArrow);
            this.bottomArrow.setPosition(centeredPositionOfArrows, positionOfBottomArrow);
        },
        setPositionOfBottomArrow(position: number): void {

            this.positionOfBottomArrow = position;
        },
        setPositionOfTopArrow(position: number): void {

            this.positionOfTopArrow = position;
        },
        setSize(size: number): void {

            this.setWidth(size);

            this.listOfArrows.map((arrow: Arrow) => arrow.setSize(size));
        },
        setSpaceBetweenArrows(spaceBetweenArrows: number): void {

            this.setSpaceBetweenArrows = spaceBetweenArrows;
        },
        show(): void {

            this.display(null);
        },
        stopFading(): void {

            this.fader.stop();
        },
    };

    return function(

        positionOfTopArrow: number = 0,
        positionOfBottomArrow: number = 0,
        spaceBetweenArrows: number = 0,

    ): Arrows {

        const methods = Object.create(arrowsPrototype);
        const topArrow = createArrow(upFacingArrow);
        const bottomArrow = createArrow(downFacingArrow);
        const listOfArrows: Arrow[] = [topArrow, bottomArrow];
        const fader: Fader = createFader(listOfArrows, arrowColor);

        return Object.assign(methods, {

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
