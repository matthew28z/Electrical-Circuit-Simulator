import { currentColor } from "../logic/paths";

export interface simData {
    path: currentColor;
    pathResistance: number | null;
    pathVoltage: number | null;
    pathCurrent: number | null;
    splitsTo: Set<currentColor>;
    parallelTo: Set<currentColor>;
    descendantOf: currentColor | undefined;
}

export const data : Map<currentColor, simData> = new Map();