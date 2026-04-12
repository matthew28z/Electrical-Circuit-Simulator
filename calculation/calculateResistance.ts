import { breaks, allPaths, currentPathData } from "../logic/paths";
import { data, simData } from "./data";
import { findValue } from "./commonFunctions.js";

export function getResistance(pathData: currentPathData): boolean {
    //We first try to get the nested paths (if they exist)
    if (pathData.splitsTo !== undefined) {
        for (const color of pathData.splitsTo) {
            const splitPathData = allPaths.get(color);

            if (!splitPathData) {
                console.log("BAD DATA");

                return false;
            }

            if (!getResistance(splitPathData)) {
                return false;
            }
        }
    }

    let pathResistance = 0;

    //Now we go element by element
    for (const value of pathData.path) {
        if (typeof value !== "string") { 
            const resValue: number | null = findValue("resistance", value.element);

            if (resValue === null) {
                console.log("MISSING VALUES");

                return false;
            }

            pathResistance += resValue;
        } else { // a new branch is detected
            const breakData: currentPathData[] | undefined = breaks.get(value);

            if (!breakData) {
                console.log("CORRUPTED DATA");

                return false;
            }

            const parallelResistance: number | null = calculateParallelResistance(breakData);

            if (parallelResistance === null) {
                console.log("MISSING VALUES");

                return false;
            }

            pathResistance += parallelResistance;
        }
    }

    const pathSimData: simData | undefined = data.get(pathData.color);

    if (!pathSimData) {
        console.log("UNINITIALISED DATA");

        return false;
    }

    pathSimData.pathResistance = pathResistance;

    return true;
}

export function calculateParallelResistance(breakData: currentPathData[]): number | null {
    let parallelResistance : number = 0;

    for (const pathData of breakData) {
        const pathSimData: simData | undefined = data.get(pathData.color);

        if (!pathSimData) {
            console.log("UNINITIALISED DATA");

            return null;
        }

        const pathResistance : null | number = pathSimData.pathResistance;

        if (pathResistance === null) {
            console.log("MISSING VALUES");

            return null;
        }

        parallelResistance += 1 / pathResistance;
    }

    return 1 / parallelResistance;
}