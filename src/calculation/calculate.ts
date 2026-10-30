import { calculateParallelResistance } from "./calculateResistance";
import { applyMillmanThereom } from "./calculateVoltage";
import { pathColors, currentPathData, allPaths, breaks, currentColor, pathObject } from "../app/logic/paths";
import { simData, data } from "./data";
import { findGroups, getValueFromAO, findParallelPaths, isKnown, closeEnough } from "./utilities";

export default function ZiLE_Basic(mainPathData: currentPathData): boolean {
    //Processes the data produced from the pathfinding algorithm into something the engine can use directly
    initiateSimData();

    const validTopology = readConstraints(mainPathData);

    if (!validTopology)
        return false;

    const simData = data.get(mainPathData.color)!; //when this function is called prior checks for this will have been made

    calculate(simData);

    if (!assert(simData))
        return false;    

    return true;
}

//Main helper
function calculate(
    simData: simData,
    { REQ, VEQ }: { REQ: number, VEQ: number } = { REQ: 0, VEQ: 0 }
): boolean {
    if (!isKnown(simData)) { //avoids redoing calculations
        //First check if there is an active CS in the branch that sets the current
        if (simData.pathCurrent !== null) { 
            //As of v2.1.0 this topology can only be solved if the branch has other branches parallel to it without a CS
            if (simData.parallelTo.size === 0) {
                console.log("Upgrade to ZiLE-Advanced");

                return false;
            }

            //add logic here
        } else if (simData.descendantOf) { //checks to see if it isnt the main path
            if (VEQ !== 0) { //basically if there are any VS
                //add more logic here
            } else { //CDR
                simData.pathCurrent = data.get(simData.descendantOf)!.pathCurrent! * REQ / simData.pathResistance;

                simData.pathVoltage = -simData.pathResistance * simData.pathCurrent;
            }
        } else { //for the main path simple logic is enough
            simData.pathCurrent = simData.forcedVoltage / simData.pathResistance; //Ohm's Law

            simData.pathVoltage = simData.forcedVoltage - simData.pathCurrent * simData.pathResistance; //KVL 
        }

        console.log(simData)
    }

    //progresses top down
    for (const group of simData.splitsToGroups) {
        const REQ: number = calculateParallelResistance(group)!;
        const VEQ: number = applyMillmanThereom(group, REQ);

        for (const subColor of group)
            calculate(data.get(subColor)!, { REQ, VEQ });
    }
    
    return assert(simData); //checks for contradictions
} 

//Processes the data produced by the pathFinding algorithm such that it can be used by ZiLE-Basic
function initiateSimData() : void {
    pathColors.forEach(color => {
        const AE = allPaths.get(color);

        if (!AE) {
            console.log("CORRUPTED PATH DATA");

            return;
        }

        data.set(color, {
            path: color,
            forcedVoltage: 0,
            pathResistance: 0,
            pathVoltage: null,
            pathCurrent: null,
            splitsToGroups: findGroups(color),
            descendantOf: AE.descendantOf,
            parallelTo: findParallelPaths(color)
        });
    })
}
//A helper function
function callCheckForSplits(groups: currentColor[][]): boolean {
    return groups.every(group => checkInnerContradictions(group));
}

//Another helper
function assert(simData: simData): boolean {
    //Check for KCL and KVL
    for (const group of simData.splitsToGroups) {
        if (!checkInnerContradictions(group, true)) //KVL
            return false;

        let subCurrent = 0;

        for (const subColor of group) 
            subCurrent += data.get(subColor)!.pathCurrent as number;
        
        if (!closeEnough(simData.pathCurrent!, subCurrent)) //KCL
            return false;
    }

    return true;
}

/*
This function does two things
it checks for contradictions and if they exist it returns false. For parallel paths contradictions can only be in regards to their voltage (KCL Elswhere)
otherwise, it ensures all inner paths have their data up to date with what is currently known
*/
function checkInnerContradictions(parallelColors: currentColor[], skip: boolean = true): boolean {
    let voltage: number | null = null;

    const colorsToUpdate: currentColor[] = [];

    for (const parallelColor of parallelColors) {
        const simData: simData | undefined = data.get(parallelColor);

        if (!simData)
            throw new Error("Failed to initialise data");

        //This checks if it can calculate the path voltage, it filters out sub-branches with CS 
        if (!skip && simData.pathVoltage === null && simData.pathCurrent === null) {
            if (simData.pathResistance === 0)
                simData.pathVoltage = simData.forcedVoltage; 
        }

        if (simData.pathVoltage !== null) { //checks against null because 0 is falsy
            if (voltage === null)
                voltage = simData.pathVoltage; //found the first branch with a constraint in voltage
            else if (!closeEnough(voltage, simData.pathVoltage)) //checks to see if constraints are contradictory
                return false; //exits the function
        } else
            colorsToUpdate.push(parallelColor); //stores the branch to update its data later on
    }

    //If this point is reached it means that there are no contradictions
    if (voltage !== null) { //checks to see if a constraint was found and updates the parallel paths to have it too
        for (const color of colorsToUpdate) 
            data.get(color)!.pathVoltage = voltage; //if they were undefined the previous loop would throw an error
    }

    return true;
}

//Reads the constraints given by the user and gives the greenlight if they are not contradictory
export function readConstraints(pathData: currentPathData): boolean {
    const simData: simData | undefined = data.get(pathData.color);

    if (!simData)
        throw new Error("Missing Main Path Data");

    for (const group of simData.splitsToGroups) { //Reads the inner constraints first
        for (const subColor of group) {
            const subData: currentPathData | undefined = allPaths.get(subColor);

            if (!subData)
                throw new Error("Corrupted Path Algorithm Data");

            readConstraints(subData);
        }
    }         
    
    //Ensures the inner constraints do not contain any contradictions
    if (!callCheckForSplits(simData.splitsToGroups)) {
        console.log("The constraints given are contradictory");

        return false;
    }

    //Reads the constraints of this path, all the values of the inner paths should have been calculated already
    const constraints: { res : number, volt: number, cur: number | null } = { res: 0, volt: 0, cur: null };

    for (let i = 0; i < pathData.path.length - 1; i++) { //The last element of a path is always either the starting VS, or just a connection, eitherway it should be skipped
        const entry: pathObject | number = pathData.path[i];

        if (typeof entry === "number") { //a split has been encountered
            const breakEntry = breaks.at(entry);

            if (!breakEntry)
                throw new Error("Corrupted Algorithm Data");

            //Add the equivalent resistance of the sub-branches to the branch.
            const parallelRes = calculateParallelResistance(breakEntry);

            if (parallelRes === null)
                throw new Error("UNKNOWN BUG"); //As of ZiLE-Basic 2.1.0 the engine is supposed to fill all the variables with zero, so this should not fail

            constraints.res += parallelRes;

            //Sum the voltage that is forced from the sub-branches to the branch
            constraints.volt += applyMillmanThereom(breakEntry, parallelRes);
        } else { //just an element
            if (entry.element.dataset.belongsTo !== "connections") { //filter out connections
                if (entry.element.dataset.belongsTo === "currentSources") { //for future logic
                    //here a check for contradictory current sources must happen
                } else if (entry.element.dataset.belongsTo === "voltageSources") {
                    const entryVoltage = getValueFromAO("voltage", entry.element);

                    if (entryVoltage === null)
                        throw new Error("AO's Data is Corrupted");

                    constraints.volt += entryVoltage;
                }

                const entryRes = getValueFromAO("resistance", entry.element);

                if (entryRes === null)
                    throw new Error("AO's Data is Corrupted")

                constraints.res += entryRes;
            }
        }
    }   

    simData.forcedVoltage = constraints.volt;
    simData.pathResistance = constraints.res;
    simData.pathCurrent = constraints.cur; //either null or something set

    return true;
}