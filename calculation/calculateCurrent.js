import { data } from "./data.js";
import { breaks } from "../logic/paths.js";
import { calculateNodeVoltage } from "./calculateVoltage.js";
import { calculateParallelResistance } from "./calculateResistance.js";
import { determineBreak } from "./commonFunctions.js";

export function calculateCurrent(mainPathObject) {
    let lackOfInformation = false

    //Finds the main current
    const mainResistance = data[0].pathResistance
    const mainVoltage = data[0].pathVoltage

    let mainCurrent;
    if (!(mainVoltage === null || mainResistance === null || mainResistance === 0)) {
        mainCurrent = mainVoltage / mainResistance
    } else if (mainResistance === 0) {
        if (mainVoltage !== 0) {
            mainCurrent = mainVoltage > 0 ? +Infinity : -Infinity
        } else {
            console.log("INDETERMINATE CURRENT, IMPOSSIBLE CIRCUITRY")
        }
    } else {
        lackOfInformation = true
    }

    if (!lackOfInformation) {
        data[0].pathCurrent = mainCurrent

        const nodes = breaks.flatMap((array, index) => array.map(object => {
            const nodeResistance = calculateParallelResistance(index)
            const nodeVoltage = calculateNodeVoltage(index)

            return {resistance: nodeResistance, voltage: nodeVoltage, splitsTo: data.find(obj => obj.path === object.descendantOf).splitsTo}
        }))

        for (const node of nodes) {
            const splits = node.splitsTo

            splits.forEach(split => {
                const values = data.find(obj => obj.path === split)

                const splitCurrent = (node.voltage + values.pathVoltage) / values.pathResistance

                values.pathCurrent = splitCurrent
            })
        }
    }

    return data
}

