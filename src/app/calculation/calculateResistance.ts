import { allPaths, currentPathData } from "../logic/paths";
import { data, simData } from "./data";

//This function does not attempt anything more than to directly apply Ohm's Law, it returns true only if every path under it has been mapped
export function applyOhmLawResistance(pathData: currentPathData): boolean {
    const simData: simData = data.get(pathData.color)!; //this function is only called once the data has been initialised
    
    if (simData.pathResistance) {
        return true; //it is impossible for the inner paths to not have their data calculated if this is true
    }

    if (simData.pathVoltage && simData.pathCurrent) {
        simData.pathResistance = simData.pathVoltage / simData.pathCurrent;

        let everythingMapped: boolean = true;

        simData.splitsTo.forEach(color => {
            everythingMapped = everythingMapped && applyOhmLawResistance(allPaths.get(color)!);
        })

        return everythingMapped;
    }

    return false;
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