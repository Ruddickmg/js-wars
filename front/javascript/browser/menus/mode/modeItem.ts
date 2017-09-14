import capitalizeFirstLetter from "../../../tools/stringManipulation/capitalizeFirstLetter";

export interface ModeMenuItem {

    display: string;
    id: string;
    type: string;
    options?: string[];
}

export default function(id: string, options?: string[], type: string = id) {

    const display: string = capitalizeFirstLetter(id);

    return {

        display,
        id,
        options,
        type,
    };
}
