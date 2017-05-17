import createRow from "./row";
import setText from "./setText";
import createUnorderedList from "./ul";

export default function(name: string, items: any[], userDefinedRows?: string[]) {

    const tableRows: string[] = userDefinedRows || Object.keys(items);
    const tableElement: any = document.createElement("table");
    const headings: any = createRow(name, tableRows, "th").row;
    const title: any = setText(document.createElement("caption"), name);

    tableElement.setAttribute("id", `${name}Table`);
    tableElement.appendChild(title);
    tableElement.appendChild(headings);

    return {

        columns: createUnorderedList(headings),
        element: tableElement,
        elements: items.map((item) => {

            const table = this.element;
            const playerNumber = item.player;
            const rowData = tableRows.map((column) => {

                const columnName = column.toLowerCase();

                return item[columnName];
            });
            const newRow = createRow(`player${playerNumber}${name}`, rowData).row;

            table.appendChild(newRow);

            return newRow;
        }),
        rows: createUnorderedList(this.element, this.elements),
        sortBy(parameter: string) {

            const sortedItems = items.sort((a, b) => a[parameter] - b[parameter]);

            this.setElements(sortedItems);
        },
        setElements: (listOfElements: any[]) => {

            const table = this.element;
            const elements = table.childNodes;
            const index = this.rows.index();

            let l = elements.length - 2;

            while (l--) {

                table.removeChild(table.lastChild);
            }

            return this.rows.setElements(listOfElements.map((row) => {

                const rowData = tableRows.map((column) => row[column.toLowerCase()]);
                const newRow = createRow(`player${row.player}${name}`, rowData).row;

                table.appendChild(newRow);

                return newRow;
            }))
            .setIndex(index);
        },
        title,
    };
}
