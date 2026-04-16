import { calculateParallelResistance, applyOhmLawResistance } from "./calculateResistance";
import { pathColors, currentPathData, allPaths, breaks, currentColor } from "../logic/paths";
import { simData, data } from "./data";
import { findSplits, getValueFromAO, findParallelPaths } from "./utilities";

function iniateSimData() : void {
    pathColors.forEach(color => {
        const AE = allPaths.get(color);

        if (!AE) {
            console.log("CORRUPTED PATH DATA");

            return;
        }

        data.set(color, {
            path: color,
            pathResistance: null,
            pathVoltage: null,
            pathCurrent: null,
            splitsTo: findSplits(color),
            descendantOf: AE.descendantOf,
            parallelTo: findParallelPaths(color)
        });
    })
}

function getValues(pathData: currentPathData): {
    resistance: boolean,
    voltage: boolean | undefined,
    current: boolean | undefined
} { //This function checks if the data the user provided breaks any law of physics directly
    const result: {
        resistance: boolean,
        voltage: boolean | undefined,
        current: boolean | undefined
    } = { resistance: true, voltage: true, current: false }; //current starts as false as it has special logic

    //We first try to get the nested paths (if they exist)
    const splits = data.get(pathData.color)?.splitsTo;

    if (!splits) {
        return { resistance: false, voltage: false, current: false };;
    }

    if (splits.size > 0) {
        for (const color of splits) {
            const splitPathData = allPaths.get(color);

            if (!splitPathData) { //there is no point to continue the calculations as the data is corrupted
                console.log("BAD DATA");

                return { resistance: false, voltage: false, current: false };
            }

            const innerResult = getValues(splitPathData);

            result.resistance = result.resistance && innerResult.resistance;

            if (innerResult.voltage === undefined) {
                console.log("IMPOSSIBLE USER ASSOCIATED DATA");

                result.voltage = undefined;
            } else {
                result.voltage = result.voltage && innerResult.voltage;
            }

            if (innerResult.current === undefined) {
                console.log("IMPOSSIBLE USER ASSOCIATED DATA");

                result.current = undefined;
            } else {
                result.current = result.current || innerResult.current; //we can now the path's current without knowing the inner paths' currents directly
            }             
        }
    }

    let pathResistance = 0;
    let pathCurrent: number | undefined;
    let pathVoltage = 0;

    //Now we go element by element
    for (const value of pathData.path) {
        if (typeof value !== "number") {
            //~~~~Resistance~~~~
            if (result.resistance) {
                const resValue: number | null = getValueFromAO("resistance", value.element);

                if (resValue === null) {
                    console.log("MISSING VALUES");

                    result.resistance = false;
                } else {
                    pathResistance += resValue;
                }
            }

            //~~~~Voltage~~~~
            if (result.voltage && value.element.dataset.belongsTo === "voltageSources") {
                const voltValue: number | null = getValueFromAO("voltage", value.element);
                
                if (voltValue === null) {
                    console.log("MISSING VALUES");

                    result.voltage = false;
                } else {
                    pathVoltage += voltValue;
                }
            }

            //~~~~Current~~~~
            if (value.element.dataset.belongsTo === "amperometer") { //No need to check for result.current as this is independent of the inner paths
                const currValue: number | null = getValueFromAO("current", value.element);

                if (currValue === null) {
                    console.log("Value Not Assigned");
                } else if (pathCurrent === undefined){
                    pathCurrent = currValue;

                    result.current = true;
                } else if (pathCurrent !== currValue) {
                    console.log("IMPOSSIBLE USER ASSOCIATED DATA");

                    result.current = undefined; //this is a flag for the end
                }
            }

        } else { // a new branch is detected
            const breakData: currentPathData[] | undefined = breaks.at(value);

            if (!breakData) {
                console.log("CORRUPTED DATA");

                return { resistance: false, voltage: false, current: false };
            }

            //~~~~Resistance~~~~
            if (result.resistance) {
                //If result.resistance is still true then all the inner paths have been graphed correctly
                //We need to check if all the parallel branches have the same voltage
                pathResistance += calculateParallelResistance(breakData)!;
            }

            //~~~~Voltage~~~~
            if (result.voltage) {
                //If result.resistance is still true then all the inner paths have been graphed correctly
                //It is impossible for the data to have been mapped and not exist at the same time
                
                const parallelVoltage : number = data.get(breakData[0].color)!.pathVoltage!;

                //We need to check if all the parallel branches are equal
                if (breakData.some(breakPathData => data.get(breakPathData.color)!.pathVoltage !== parallelVoltage)) {
                    console.log("IMPOSSIBLE USER ASSOCIATED DATA");

                    result.voltage = undefined;
                } else {
                    pathVoltage += parallelVoltage;
                }

            }

            //~~~~Current~~~~
            if (result.current) { //this is dependnent on the inner paths
                let calculatedCurrent = 0;

                breakData.forEach(breakPathData => {
                    //We apply Kirchoff's Current Law
                    calculatedCurrent += data.get(breakPathData.color)!.pathCurrent!; //same logic as before
                })

                if (pathCurrent !== undefined) {
                    if (pathCurrent !== calculatedCurrent) {
                        console.log("IMPOSSIBLE USER ASSOCIATED DATA");

                        result.current = undefined; //this is a flag for the end
                    } 
                } else {
                    pathCurrent = calculatedCurrent;
                } 
            }
        }
    }

    const pathSimData: simData | undefined = data.get(pathData.color);

    if (!pathSimData) {
        console.log("UNINITIALISED DATA");

        return { resistance: false, voltage: false, current: false };
    }

    if (result.current) {
        pathSimData.pathCurrent = pathCurrent!; //due to the way the data is handled
    }

    if (result.voltage) {
        pathSimData.pathVoltage = pathVoltage;
    }

    if (result.resistance) {
        pathSimData.pathResistance = pathResistance;
    }

    return result;
}  

export default function calculate(mainPathData : currentPathData) : boolean {
    iniateSimData();

    //We first try to add every value we can to the data map
    const getResults = getValues(mainPathData);

    if (getResults.current !== undefined) {
        if (getResults.voltage !== undefined) {
            console.log("The Data Submitted Breaks The Laws Of Physics (Current, Voltage)");

            return false;
        }

        console.log("The Data Submitted Breaks The Laws Of Physics (Current)");

        return false;
    } 

    if (getResults.voltage !== undefined) {
        console.log("The Data Submitted Breaks The Laws Of Physics (Voltage)");

        return false;      
    }

    //~~~~Data~Is~Valid~~~~
    if (getResults.resistance && getResults.current && getResults.voltage) {
        console.log("The Calculations Are Completed");

        return true;
    } 
    //We first check the three easy scenarios 
    const mainSimData: simData = data.get(mainPathData.color)!;

    let finished: boolean = false;

    if (getResults.resistance && getResults.current) {
        mainSimData.pathVoltage = mainSimData.pathResistance! * mainSimData.pathCurrent!;

        //solve for the rest
    } else if (getResults.resistance && getResults.voltage) {
        mainSimData.pathCurrent = mainSimData.pathVoltage! / mainSimData.pathResistance!;

        //solve for the rest
    } else if (getResults.voltage && getResults.current) {
        mainSimData.pathResistance = mainSimData.pathVoltage! / mainSimData.pathCurrent!;

        finished = applyOhmLawResistance(mainPathData);
    }

    if (!finished) {
        //More Complicated Logic
    }

    return false;
}