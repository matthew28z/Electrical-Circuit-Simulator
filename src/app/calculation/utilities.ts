import { allObject } from "../logic/management";
import { currentColor, breaks, currentPathData } from "../logic/paths";

export function findSplits(pathColor: currentColor): Set<currentColor> {
    const res: Set<currentColor> = new Set();

    breaks.forEach(breakEntry => {
        if (breakEntry[0].descendantOf === pathColor) {
            breakEntry.forEach(pathData => {
                res.add(pathData.color);
            })
        }
    })

    return res;
}

export function findParallelPaths(pathColor: currentColor) : Set<currentColor> {
    const res: Set<currentColor> = new Set();

    const breakEntry: currentPathData[] | undefined = breaks.find(entry => entry.find(pathData => pathData.color === pathColor));

    if (!breakEntry) {
        return new Set();
    }

    breakEntry.forEach(pathData => {
        res.add(pathData.color);
    })

    return res;
}

export function getValueFromAO(valueToGet: string, element: HTMLElement): number | null {
    const AO: any = allObject[element.dataset.belongsTo as string].find(object => object.element === element);

    if (!AO) {
        console.log("CORRUPTED DATA (allObject)");

        return null;
    }

    return AO[valueToGet].value;
}