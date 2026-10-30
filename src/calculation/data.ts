import { currentColor } from "../app/logic/paths";

export interface simData {
    path: currentColor;
    pathResistance: number; //Thevenin Equivalent Resistance
    forcedVoltage: number; //this number is set from the sum of active VS across a branch (basically Thevenin Equivalent)
    pathVoltage: number | null; //this is the actual ΔV at the ends of the branch
    pathCurrent: number | null; //this is the actual current flowing through with any CS
    splitsTo: Set<currentColor>;
    parallelTo: Set<currentColor>;
    descendantOf: currentColor | undefined;
}

export const data : Map<currentColor, simData> = new Map();