import { currentPathData } from "../app/logic/paths";
import { data, simData } from "./data";

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