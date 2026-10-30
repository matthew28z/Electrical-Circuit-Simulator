import { currentPathData } from "../app/logic/paths";
import { data } from "./data";

//This function applies Millman's Theorem to calculate the equivalent Voltage Source of parallel branches
export function applyMillmanThereom(breakData: currentPathData[], parallelResistance: number): number {
    let equivalentVoltage: number = 0;

    for (const pathData of breakData) {
        const simData = data.get(pathData.color);

        if (!simData)
            throw new Error("Uninitialised Data");

        if (simData.pathCurrent !== null) //the sub-branch has an active CS
            equivalentVoltage += simData.pathCurrent;
        else 
            equivalentVoltage += simData.forcedVoltage / simData.pathResistance //forcedVoltage is always set at a value
    }

    return equivalentVoltage * parallelResistance;
}