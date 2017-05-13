import setText from "./setText";

export default function(nameOfRow: string, data: any[] = [], typeOfData: string = "td") {

    const row = document.createElement("tr");

    const createField = (textValue: any, elementType: string) => {

        const fieldElement = document.createElement(elementType);

        if (textValue || !isNaN(textValue)) {

            setText(fieldElement, `${textValue}`);
        }

        return fieldElement;
    };

    row.setAttribute("id", nameOfRow);

    data.forEach((pieceOfData) => {

        const field = createField(pieceOfData, typeOfData);

        row.appendChild(field);
        data.push(field);
    });

    return {

        createField,
        data,
        row,
    };
}
