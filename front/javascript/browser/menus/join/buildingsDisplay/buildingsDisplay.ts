import capitalizeFirstLetter from "../../../../tools/stringManipulation/capitalizeFirstLetter";
import {Element} from "../../../dom/element/element";
import createGameMenu, {GameMenu} from "../../elements/gameMenu";
import createField from "./buildingDisplayField";

export interface BuildingCount {

    airport?: number;
    city?: number;
    base?: number;
    seaport?: number;
    [feild: string]: number;
}

export interface BuildingsDisplay extends GameMenu<any> {

    airportCount(): number;
    baseCount(): number;
    cityCount(): number;
    clearCount(): BuildingsDisplay;
    seaportCount(): number;
    set(count: BuildingCount): BuildingCount;
    setAirportCount(amount: number): BuildingsDisplay;
    setBaseCount(amount: number): BuildingsDisplay;
    setCityCount(amount: number): BuildingsDisplay;
    setSeaportCount(amount: number): BuildingsDisplay;
}

export default function(): BuildingsDisplay {

    const fields: string[] = ["city", "base", "airport", "seaport"];
    const buildingsDisplay: GameMenu<any> = createGameMenu("buildingsDisplay", "section");
    const setField = (field: string, value: number): void => {

        buildingsDisplay.children.get(field)
            .setText(`${value}`)
            .setValue(value);
    };

    const set = function(count: BuildingCount): BuildingsDisplay {

        fields.forEach((field): void => setField(field, count[field] || 0));

        return this;
    };

    const clearCount = function(): BuildingsDisplay {

        set({});

        return this;
    };

    buildingsDisplay.set = set;
    buildingsDisplay.clearCount = clearCount;
    buildingsDisplay.children.get = (name: string): Element<any> => {

        return buildingsDisplay.innerScreen.children.get(name);
    };

    fields.forEach((field: string): any => {

        const methodName: string = `${field}Count`;

        buildingsDisplay.appendChild(createField(field));

        buildingsDisplay[methodName] = (): number => buildingsDisplay.children.get(field).value();
        buildingsDisplay[`set${capitalizeFirstLetter(methodName)}`] = function(amount: number): BuildingsDisplay {

            setField(field, amount);

            return this;
        };
    });

    return buildingsDisplay as BuildingsDisplay;
}
