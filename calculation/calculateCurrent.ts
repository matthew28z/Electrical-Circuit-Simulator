import { allPaths, currentPathData } from "../logic/paths";
import { simData, data } from "./data";

//This function does not attempt anything more than to directly apply Ohm's Law, it returns true only if every path under it has been mapped
export function applyOhmLawCurrent(pathData: currentPathData): boolean | undefined {
    const simData: simData = data.get(pathData.color)!; //this function is only called once the data has been initialised

    if (simData.pathVoltage && simData.pathResistance) {
        simData.pathCurrent = simData.pathVoltage / simData.pathResistance;

        let everythingMapped: boolean = true;

        for (const color of simData.splitsTo) {
            const result = applyOhmLawCurrent(allPaths.get(color)!);

            if (result === undefined) {
                console.log("IMPOSSIBLE USER ASSOCIATED DATA");

                return undefined;
            }

            const splitSimData: simData = data.get(color)!;
            
            if (result) {
                let calculatedCurrent = 0;
                let wait = false;

                for (const parallelColor of splitSimData.parallelTo) {
                    const parallelSimData: simData = data.get(parallelColor)!;

                    if (parallelSimData.pathCurrent === null) {
                        wait = true;

                        break;// the check should happen when the parallel path is completed
                    }
                    
                    calculatedCurrent += parallelSimData.pathCurrent;
                }

                if (!wait && calculatedCurrent !== simData.pathCurrent) {
                    console.log("IMPOSSIBLE USER ASSOCIATED DATA");  
                    
                    return undefined;
                }
            } else {
                everythingMapped = false; // simply flag that the inner calculations failed at some point
            }
        }

        return everythingMapped;
    }

    return false; // the calculations failed at this path
}