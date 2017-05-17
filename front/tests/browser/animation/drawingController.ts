import {default as createPosition, Position} from "../../game/map/elements/position";
import curry from "../../tools/curry.spec";
import screenConfiguration from "../configuration/screenConfig";
import {default as createDimensions, Dimensions} from "./dimensions";
import {default as createDrawingCache, DrawingCache} from "./drawingTool";
import app = require('../configuration/settings/app.js');

app.map = require('../controller/mapController.js');
app.background = require('../effects/background.js');

export interface DrawingController {

    hide(): DrawingController;
    background(): DrawingController;
    building(): DrawingController;
    terrain(): DrawingController;
    unit(): DrawingController;
    weather(): DrawingController;
    hudCanvas(elementName: string, elementType: string): DrawingController;
    effects(): DrawingController;
    cursor(): DrawingController;
}

export default function(canvas: any, context: any, {width, height}: Dimensions, base: number): DrawingController {

    const
        numberOfVerticalGridSquares: number = screenConfiguration.numberOfVerticalGridSquares,
        numberOfHorizontalGridSquares: number = screenConfiguration.numberOfHorizontalGridSquares,
        offsetNeededToCenterDrawing: number = 2,

        pixelWidthOfGridSquare = width / numberOfHorizontalGridSquares,
        pixelHeightOfGridSquare = height / numberOfVerticalGridSquares,

        xOffset = pixelWidthOfGridSquare / offsetNeededToCenterDrawing,
        yOffset = pixelHeightOfGridSquare / offsetNeededToCenterDrawing,

        gridSquareDimensions = createDimensions(
            pixelWidthOfGridSquare,
            pixelHeightOfGridSquare,
        ),

        drawings: DrawingCache = createDrawingCache(
            canvas,
            context,
            gridSquareDimensions,
            base,
            offsetNeededToCenterDrawing,
        ),

        modifyCoordinatesForScrolling = (coordinate: number, dimension: number, position: number): number => {

            return (coordinate * dimension) - (position * dimension);
        },

        drawToCanvas = (name: string, position: Position): void => {

            const
                getDrawing: any = drawings.isCached(name) ? drawings.get : drawings.draw,
                x: number = position.x - xOffset,
                y: number = position.y - yOffset,
                drawing: any = getDrawing(name);

            canvas.drawImage(drawing, x, y);
        },

        drawMapElements = (elements: any, screenPosition?: Position): void => {

            elements.forEach((element) => {

                const
                    {x, y} = element.position,
                    positionOfDrawing = createPosition(

                        modifyCoordinatesForScrolling(x, screenPosition.x, pixelWidthOfGridSquare),
                        modifyCoordinatesForScrolling(y, screenPosition.y, pixelHeightOfGridSquare),
                    );

                if (gameScreen.withinDimensions(positionOfDrawing)) { // figure this out!!!

                    drawToCanvas(element.name, positionOfDrawing);
                }
            });
        },

        fillScreen = (nameOfMapElement: string, dimensions?: Dimensions): void => {

            let x: number = dimensions.width,
                y: number = dimensions.height;

            while (x--) {
                while (y--) {

                    drawToCanvas(
                        nameOfMapElement,
                        createPosition(
                            x * pixelWidthOfGridSquare,
                            y * pixelHeightOfGridSquare,
                        ),
                    );
                }
            }
        };

    return {

        hide: (): DrawingController => {

            drawings.hideCurrentElement();

            return this;
        },
        background(): DrawingController {

            fillScreen(app.background.drawing());

            return this;
        },
        building(): DrawingController {

            drawMapElements(app.map.buildings());

            return this;
        },
        terrain(): DrawingController {

            drawMapElements(app.map.terrain());

            return this;
        },
        unit(): DrawingController {

            drawMapElements(app.map.units());

            return this;
        },
        weather(): DrawingController {

            console.log("To Do: Weather....");

            return this;
        },
        hudCanvas(elementName: string, elementType: string): DrawingController {

            const
                mapElementWithNoBackground: string = "unit",
                position = createPosition(0, 0);

            if (elementType !== mapElementWithNoBackground) {

                drawToCanvas("plain", position);
            }

            drawToCanvas(elementName, position);

            return this;
        },
        effects(): DrawingController {

            const
                toDrawableObject = curry((name: string, position: Position): object => ({position, name})),
                mapElements = [

                    app.highlight.movementRange().map(toDrawableObject("movementRange")),
                    app.highlight.path().map(toDrawableObject("path")),
                    app.highlight.attackRange().map(toDrawableObject("attackRange"))
                ];

            mapElements.forEach((elements) => drawMapElements(elements));

            return this;
        },
        cursor(): DrawingController {

            const
                cursorIsActive = !app.cursor.hidden() && app.user.turn(),
                targetIsActive = app.target.active();

            if (targetIsActive) {

                drawMapElements([{
                    name: "target",
                    position: app.target.position()
                }]);
            }
            else if (cursorIsActive) {

                drawMapElements([{
                    name: "cursor",
                    position: app.cursor.position()
                }]);
            }

            return this;
        }
    };
}