import { allPaths, currentPathData } from "../logic/paths";
import { simData, data } from "./data";

//This function does not attempt anything more than to directly apply Ohm's Law, it returns true only if every path under it has been mapped
export function applyOhmLawVoltage(pathData: currentPathData): boolean | undefined {
    const simData: simData = data.get(pathData.color)!; //this function is only called once the data has been initialised

    if (simData.pathVoltage && simData.pathCurrent) {
        simData.pathResistance = simData.pathVoltage / simData.pathCurrent;

        let everythingMapped: boolean = true;

        simData.splitsTo.forEach(color => {
            const result = applyOhmLawVoltage(allPaths.get(color)!);

            if (result === undefined) {
                console.log("IMPOSSIBLE USER ASSOCIATED DATA");

                return undefined;
            }

            const splitSimData: simData = data.get(color)!;
            
            if (result) {
                for (const parallelColor of splitSimData.parallelTo) {
                    const parallelSimData: simData = data.get(parallelColor)!;

                    if (parallelSimData.pathVoltage !== null && parallelSimData.pathVoltage !== simData.pathVoltage) {
                        console.log("IMPOSSIBLE USER ASSOCIATED DATA");                        

                        return undefined;
                    }
                }
            } else {
                everythingMapped = false;
            }
        })

        return everythingMapped;
    }

    return false;
}