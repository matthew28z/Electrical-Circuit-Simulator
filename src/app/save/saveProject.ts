import { allObject } from "../logic/management";
import { prepareData, prepareWires } from "./saveFunctions";
import { screensObject } from "./toggleScreens";

interface CircuitData {
    wiresId: any[];
    allElementsId: any[];
    allObjectId: any;
    circuitHTML: string;
}

interface Circuit {
    name: string;
    index: number; //must be >= 0
    data: CircuitData;
}

const projectData = localStorage.getItem("projectData");

const projects: Record<string, Circuit[]> = projectData ? JSON.parse(projectData) : {};

export function saveProject(name: string): void {
    //This function does not check for duplicates, if one exists it will erase the old one
    projects[name] = []; //deletes all prior data or creates a new entry

    Array.from(document.querySelectorAll<HTMLElement>(".screen")).forEach((screen, index) => {
        const allG = screen.querySelector<HTMLElement>(".allG");

        if (!allG)
            throw new Error("Corrupted Circuit Data");

        allG.dataset.zoomObject = JSON.stringify(screensObject[`screen_${index}`].transform);

        const preparedData = prepareData(screen);

        projects[name].push({
            name: screen.dataset.circuit!,
            index: Number(index),
            data: {
                wiresId: prepareWires(screen),
                allElementsId: preparedData.allElementsId,
                allObjectId: preparedData.allObjectId,
                circuitHTML: screen.innerHTML
            }
        })
    })

    localStorage.setItem("projectData", JSON.stringify(projects));
}