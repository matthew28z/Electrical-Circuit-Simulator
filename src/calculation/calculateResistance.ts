import { currentColor, currentPathData } from "../app/logic/paths";
import { data, simData } from "./data";

export function calculateParallelResistance(breakData: currentPathData[] | currentColor[]): number | null {
    let parallelResistance : number = 0;

    for (const entry of breakData) {
        let key: currentColor;

        if (typeof entry === "string") 
            key = entry;
        else 
            key = entry.color

        const pathSimData: simData | undefined = data.get(key);

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