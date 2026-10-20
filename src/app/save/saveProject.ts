import { allObject } from "../logic/management";
import { prepareData, prepareWires } from "./saveFunctions";
import { screensObject } from "./toggleScreens";
import { wires } from "../logic/wires.js";

interface CircuitData {
    allElementsId: any[];
    allObjectId: any;
    circuitHTML: string;
}

export interface Circuit {
    name: string;
    index: number; //must be >= 0
    data: CircuitData;
}

export interface Project {
    circuits: Circuit[];
    wiresId: any[];
}
const projectData = localStorage.getItem("projectData");

const projects: Record<string, Project> = projectData ? JSON.parse(projectData) : {};

export function saveProject(name: string): void {
    //This function does not check for duplicates, if one exists it will erase the old one
    projects[name].wiresId = wires.map(object => {
        const { element, connections, ...rest } = object;

        return { id: element.id, connections: (connections as any[]).map(el => el.id), ...rest };
    });
    projects[name].circuits.length = 0; //deletes all prior data or creates a new entry

    Array.from(document.querySelectorAll<HTMLElement>(".screen")).forEach((screen, index) => {
        const allG = screen.querySelector<HTMLElement>(".allG");

        if (!allG)
            throw new Error("Corrupted Circuit Data");

        allG.dataset.zoomObject = JSON.stringify(screensObject[`screen_${index}`].transform);

        const preparedData = prepareData(screen);

        projects[name].circuits.push({
            name: screen.dataset.circuit ?? screen.id,
            index: Number(index),
            data: {
                allElementsId: preparedData.allElementsId,
                allObjectId: preparedData.allObjectId,
                circuitHTML: screen.innerHTML
            }
        })
    })

    localStorage.setItem("projectData", JSON.stringify(projects));
}