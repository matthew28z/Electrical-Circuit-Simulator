import { getResistance } from "./calculateResistance";
import { pathColors, currentPathData, allPaths } from "../logic/paths";
import { data } from "./data";

function iniateSimData() : void {
    pathColors.forEach(color => {
        const pathData: currentPathData | undefined = allPaths.get(color);

        if (pathData) {
            data.set(color, { path: color, pathResistance: null, pathVoltge: null, pathCurrent: null, splitsTo: pathData.splitsTo });
        }
    })
}

export default function calculate(mainPathData : currentPathData) {
    iniateSimData();

    //We first try to add every value we can to the data map
    const getRes: boolean = getResistance(mainPathData);
    
}