
export interface Title {

    element: any;
    change(name: string): void;
}

export default function(initialTitle: string): Title {

    const element = document.createElement("h1");
    const change = (title: string): void => {

        element.innerHTML = title;
    };

    element.setAttribute("id", "title");

    change(initialTitle);

    return {

        element,
        change,
    };
}
