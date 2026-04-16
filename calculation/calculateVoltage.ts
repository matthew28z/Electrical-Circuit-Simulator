import { allPaths, currentPathData } from "../logic/paths";
import { simData, data } from "./data";

//This function does not attempt anything more than to directly apply Ohm's Law
export function applyOhmLawVoltage(pathData: currentPathData): boolean | undefined {
    const simData: simData = data.get(pathData.color)!; //this function is only called once the data has been initialised

    if (simData.pathVoltage && simData.pathCurrent) {
        simData.pathResistance = simData.pathVoltage / simData.pathCurrent;

        let everythingMapped: boolean = true;
        simData.splitsTo.forEach(color => {
            //everythingMapped = everythingMapped && applyOhmLawVoltage(allPaths.get(color)!);
        })

        return everythingMapped;
    }

    return false;
}