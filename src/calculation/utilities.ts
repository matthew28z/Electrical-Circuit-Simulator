import { allObject } from "../app/logic/management";
import { currentColor, breaks, currentPathData } from "../app/logic/paths";
import { simData, data } from "./data";

export function findGroups(pathColor: currentColor): currentColor[][] {
    const res: currentColor[][] = [];

    breaks.forEach(breakEntry => {
        if (breakEntry[0].descendantOf === pathColor) {
            res.push(breakEntry.map(entry => entry.color));
        }
    })

    return res;
}

export function findParallelPaths(pathColor: currentColor) : Set<currentColor> {
    return new Set(breaks.find(entry => entry.find(pathData => pathData.color === pathColor))?.map(subPath => subPath.color));
}

export function getValueFromAO(valueToGet: string, element: HTMLElement): number | null {
    const AO: any = allObject[element.dataset.belongsTo as string].find(object => object.element === element);

    if (!AO) {
        console.log("CORRUPTED DATA (allObject)");

        return null;
    }

    return AO[valueToGet].value;
}

export function isKnown(sData: simData): boolean {
    return sData.pathCurrent !== null && sData.pathVoltage !== null;
}

export function closeEnough(a: number, b: number, relativeTol: number = 1e-6, absoluteTol: number = 1e-9): boolean {
    return Math.abs(a - b) <= Math.max(absoluteTol, relativeTol * (Math.abs(a) - Math.abs(b)));
}