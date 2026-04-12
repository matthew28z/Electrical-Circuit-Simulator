import { currentColor } from "../logic/paths";

export interface simData {
    path: currentColor;
    pathResistance: number | null;
    pathVoltge: number | null;
    pathCurrent: number | null;
    splitsTo: Set<currentColor> | undefined;
}

export const data : Map<currentColor, simData> = new Map();