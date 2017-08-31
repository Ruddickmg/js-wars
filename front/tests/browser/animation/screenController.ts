import {default as createPosition, Position} from "../../game/map/elements/position.js";
import {default as time, Time} from "../../tools/calculations/time";
import {default as createDimensions, Dimensions} from "./dimensions";
import {AnimationHandler} from "./animationHandler.js";

import cursor = require("../controller/cursorController.js");
import app = require('../configuration/settings/app.js');

export interface ScreenController {

    width(): number
    height(): number
    pixels(): number
    dimensions(): Dimensions
    position(): Position
    top(): number
    bottom(): number
    left(): number
    right(): number
    focused(): boolean
    setDimensions(dimensions: Dimensions, base: number): ScreenController
    reset(): ScreenController
    scroll(): ScreenController
    moveTo(coordinates): ScreenController
    focus(): ScreenController
    withinDimensions({x, y}: Position): boolean
}

export default function(mapDimensions: Dimensions, animation: AnimationHandler): ScreenController {

    let
        squaresFromEdgeBeforeMoving: number = 2,
        cursorBoundary: number = 1,
        bottomOrLeftEdgeOfScreen: number = 0,
        scrollSpeed: number = 50,
        focused: boolean = false,
        screenDimensions: Dimensions,
        dimensions: Dimensions;

	const
        screenPosition: Position = createPosition(0,0),
        listOfAxis: string[] = ['x', 'y'],
        periodOfTime: Time = time(),
		refreshScreen = (): AnimationHandler => animation.show('terrain', 'cursor', 'building', 'unit', 'effects'),
		refreshMap = (): AnimationHandler => animation.show("unit","building"),
        moveScreen = (distance: number, position: number, limit: number, sign: number, axis: string): void => {

            const
                minimumDistance: number = 0,
                withinMapDimensions = (view: number, sign: number, limit: number): boolean => view * sign + sign < limit,
                movementStillRemains = (distance: number): boolean => distance >= minimumDistance;

            periodOfTime.wait(scrollSpeed)
                .then((): void => {

                    if (movementStillRemains(distance) && withinMapDimensions(position, sign, limit)) {

                        screenPosition[axis] += sign;
                        refreshScreen();
                        moveScreen(distance - 1, position + sign, limit, sign, axis);
                    }
                })
                .catch((error: Error): void => console.log(error));
        },
        cursorAtBottomOrLeftOfScreen = (cursorPosition: number, screenPosition: number): boolean => {

            return cursorPosition >= bottomOrLeftEdgeOfScreen
                && cursorPosition < screenPosition + squaresFromEdgeBeforeMoving
                && screenPosition > bottomOrLeftEdgeOfScreen;
        },
        cursorAtTopOrRightOfScreen = (

            cursorPosition: number,
            screenPosition: number,
            edgeOfScreen: number,
            edgeOfMap: number

        ): boolean => {

            return cursorPosition < edgeOfMap
                && cursorPosition > screenPosition + edgeOfScreen - squaresFromEdgeBeforeMoving
                && screenPosition < edgeOfMap - cursorBoundary;
        };

	return {

        width:(): number => screenDimensions.width,
        height:(): number => screenDimensions.height,
        pixels:(): number => screenDimensions.width * screenDimensions.height,
        dimensions:(): Dimensions => dimensions,
        position:(): Position => screenPosition,
        top:(): number => screenPosition.y,
        bottom:(): number => screenPosition.y + dimensions.height,
        left:(): number => screenPosition.x,
        right:(): number => screenPosition.x + dimensions.width,
        focused:(): boolean => focused,
		setDimensions({width, height}:Dimensions, baseSize: number): ScreenController {

			screenDimensions = createDimensions(width, height);
			dimensions = screenDimensions.scaleToGrid(baseSize);

			return this;
		},
        reset(): ScreenController {

            ['actionHud', 'damageDisplay', 'buildUnitScreen', 'unitInfoScreen', 'optionsMenu']
                .forEach((screen) => app.dom.removePlayer(screen));

            app.coStatus.show();
            app.hud.show();
            app.options.deactivate();
            app.path.clear();
            app.inRange.clear();
            cursor.deselect();
            cursor.show();

            animation.show('cursor', 'unit', 'effects');

            return this;
        },
        scroll(): ScreenController {

            const cursorLocation = cursor.position();

            listOfAxis.forEach((axis) => {

                const
                    edgeOfMap = mapDimensions[axis],
                    edgeOfScreen = dimensions[axis],
                    cursorPosition = cursorLocation[axis],
                    position = screenPosition[axis];

                if (cursorAtBottomOrLeftOfScreen(cursorPosition, position)) {

                    screenPosition[axis] -= 1;
                }

                if (cursorAtTopOrRightOfScreen(cursorPosition, position, edgeOfScreen, edgeOfMap)) {

                    screenPosition[axis] += 1;
                }
            });

            refreshScreen();

            return this;
        },
        moveTo(coordinates): ScreenController {

            cursor.setPosition(coordinates);

            listOfAxis.forEach((axis) => {

                const
                    target = coordinates[axis],
                    leftOrBottomEdgeOfScreen = screenPosition[axis],
                    rightOrTopEdgeOfScreen = screenPosition[axis] + dimensions[axis],
                    middleOfScreen = rightOrTopEdgeOfScreen - Math.ceil(dimensions[axis] / 2);

                let
                    sign = -1,
                    limit = -1,
                    distance = middleOfScreen - target,
                    view = leftOrBottomEdgeOfScreen;

                if (target > middleOfScreen) {

                    sign = 1;
                    limit = mapDimensions[axis];
                    distance = target - middleOfScreen;
                    view = rightOrTopEdgeOfScreen;
                }

                moveScreen(distance, view, limit, sign, axis);
            });

            return this;
		},
        focus(): ScreenController {

            const
                holdingDownFocusKey = app.key.pressed(app.key.map()) && app.key.undo(app.key.map()),
                releasedFocusKey = app.key.keyUp(app.key.map()) && app.key.undoKeyUp(app.key.map());

            if (releasedFocusKey) {

                app.hud.show();
                app.coStatus.show();
                cursor.show();

                focused = false;

            } else if (holdingDownFocusKey && !focused) {

                app.hud.hideCurrentElement();
                app.coStatus.hideCurrentElement();
                cursor.hideCurrentElement();

                focused = true;
            }

            refreshMap();

            return this;
        },
        withinDimensions({x, y}: Position): boolean {

            const
                edgeOfBottomOrLeftScreen = 0,
                screenPositionX = screenPosition.x,
                screenPositionY = screenPosition.y;

            return x >= edgeOfBottomOrLeftScreen + screenPositionX
                && y >= edgeOfBottomOrLeftScreen + screenPositionY
                && x <= screenDimensions.width + screenPositionX
                && y <= screenDimensions.height + screenPositionY;
        }
    };
}