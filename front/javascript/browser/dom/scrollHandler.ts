export interface ScrollHandler {

    outOfBounds(index: number): boolean;
    setAmountOfAllowedElements(maximum: number): ScrollHandler;
    moveToIndex(targetPosition: number): ScrollHandler;
}

export default function(maximumAmountOfDisplayedElements: number = 0): ScrollHandler {

    let allowed: number = maximumAmountOfDisplayedElements;
    let top: number = 0;
    let bottom: number = 0;

    const outOfBounds = (index: number): boolean => index < top || index > bottom;
    const setAmountOfAllowedElements = function(amountOfElementsToDisplay: number): ScrollHandler {

        bottom += amountOfElementsToDisplay;
        allowed = amountOfElementsToDisplay;

        return this;
    };
    const moveToIndex = function(targetPosition: number): ScrollHandler {

        if (targetPosition > bottom) {

            bottom = targetPosition;
            top = targetPosition - allowed;

        } else if (targetPosition < top) {

            bottom = targetPosition + allowed;
            top = targetPosition;
        }

        return this;
    };

    setAmountOfAllowedElements(maximumAmountOfDisplayedElements);

    return {

        outOfBounds,
        setAmountOfAllowedElements,
        moveToIndex,
    };
}
