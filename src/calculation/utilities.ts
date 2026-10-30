import { allObject } from "../app/logic/management";
import { currentColor, breaks, currentPathData } from "../app/logic/paths";
import { simData, data } from "./data";

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

export function findParallelGroups(splits: Set<currentColor>): currentColor[][] {
    const parallelGroups: currentColor[][] = [];

    for (const split of splits) { //it checks every split and puts them in groups
        const splitData: simData | undefined = data.get(split);

        if (!splitData)
            throw new Error("Failed to initialise data");

        let tracker = true;

        for (const group of parallelGroups) {
            if (splitData.parallelTo.has(group[0])) { //it checks if the split is parallel to any group
                group.push(split);
                tracker = false;

                break;
            }
        }

        if (tracker)
            parallelGroups.push([split]); //creates a new group
    }

    return parallelGroups;
}