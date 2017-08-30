import capitalizeFirstLetter from "../../../tools/capitalizeFirstLetter";

export interface ModeMenuItem {

    display: string;
    id: string;
    type: string;
    options?: string[];
}

export default function(name: string, options?: string[], type?: string) {

    return {

        display: capitalizeFirstLetter(name),
        id: name,
        type: type || name,
        options,
    };
}
