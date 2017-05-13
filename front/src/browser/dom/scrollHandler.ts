export interface ScrollHandler {

    outOfBounds(index: number): boolean;
    setAmountOfAllowedElements(maximum: number): ScrollHandler;
    moveToIndex(targetPosition: number): ScrollHandler;
}

export default function(maximumAmountOfDisplayedElements: number = 0): ScrollHandler {

    let allowed = maximumAmountOfDisplayedElements;
    let top = 0;
    let bottom = 0;

    return {

        outOfBounds: (index: number): boolean => index < top || index > bottom,
        setAmountOfAllowedElements(amountOfElementsToDisplay: number): ScrollHandler {

            bottom += amountOfElementsToDisplay;
            allowed = amountOfElementsToDisplay;

            return this;
        },
        moveToIndex(targetPosition: number): ScrollHandler {

            if (targetPosition > bottom) {

                bottom = targetPosition;
                top = targetPosition - allowed;

            } else if (targetPosition < top) {

                bottom = targetPosition + allowed;
                top = targetPosition;
            }

            return this;
        },
    };
}
