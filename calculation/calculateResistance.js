import { breaks, pathColors } from "../logic/paths.js";
import { allObject } from "../logic/management.js";
import { data } from "./data.js";
import { findValue, determineBreak } from "./commonFunctions.js";

function initiateData() {
    pathColors.forEach(color => {
        data.resistance.push({path: color, pathResistance: null, splitsTo: breaks.filter(object => object.descendantOf === color).map(object => object.color)})
    })
}


export function calculateResistance(pathObj) {
    initiateData()
    /*Older approach, fails due to the array containing DOM Elements
    //Flips the data to start from the latest descendants and go upwards since their relation fits this scheme
    const flippedBreaks = structuredClone(breaks).reverse() //creates a deep-copy so that the original data stays in its intended form
    */

    console.log(data.resistance.find(object => object.path === pathObj.color))

    let lackOfInformation = false;

    //Calculates the resistance of the broken paths
    for (let i = breaks.length - 1; i >= 0; i--) {
        const array = breaks[i]

        array.forEach(pathObject => {
            let pathResistance = 0

            pathObject.path.forEach(value => {
                if (typeof value !== "string") {
                    const values = findValue(value.element, "resistance", pathResistance)

                    lackOfInformation = values.boolean
                    pathResistance = values.data
                } else {
                    pathResistance += calculateParallelResistance(determineBreak(value))
                }
            })
            
            if (!lackOfInformation) { //allows the paths parallel to the one checked to also be checked since they do not inherently require information about each other
                data.resistance.find(obj => obj.path === pathObject.color).pathResistance = pathResistance
            }
        })

        if (lackOfInformation) {
            break
        }
    }

    if (!lackOfInformation) { //checks if the previous procedure failed/stopped prematurely
        //Determines the resistance of the main path
        let pathResistance = 0

        for (let i = 0; i < pathObj.path.length - 1; i++) {
            const value = pathObj.path[i]

            if (typeof value !== "string") {
                const values = findValue(value.element, "resistance", pathResistance)

                lackOfInformation = values.boolean
                pathResistance = values.data
            } else {
                pathResistance += calculateParallelResistance(determineBreak(value))
            }
        }

        data.resistance.find(object => object.path === pathObj.color).pathResistance = pathResistance

    }

    return data
}


function calculateParallelResistance(breakNumber) {
    const breakPaths = breaks[breakNumber]

    let flippedResistance = 0

    breakPaths.forEach(breakPath => {
        flippedResistance += Math.pow(data.resistance.find(object => object.path === breakPath.color).pathResistance, -1)
    })

    return Math.pow(flippedResistance, -1)
}