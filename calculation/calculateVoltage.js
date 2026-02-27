import { voltageSources } from "../logic/voltage.js";
import { data } from "./data.js";
import { breaks } from "../logic/paths.js";
import { determineBreak } from "./commonFunctions.js";
import { allObject } from "../logic/management.js";

/*
function checkForParallelIdealVoltageSources(pathObject) {
    const sourcesFound = [];

    //Finds all the voltage-sources and the paths they are on
    fillSources(pathObject, sourcesFound)

    //keeps only the ideal voltage sources
    const idealSources = sourcesFound.filter(object => {
        const element = object.element 

        return isIdeal(element)
    })

    console.log(idealSources)

    //checks if all the ideal sources are in series
    return {boolean: !idealSources.every(object => object.path === idealSources[0].path), array: idealSources}
}*/



function fillSources(pathObject, sourcesFound = []) {
    for (const value of pathObject.path) {
        if (typeof value === "string") {
            const breakNumber = determineBreak(value)

            const array = breaks[breakNumber]
            
            for (const newPathObj of array) {
                fillSources(newPathObj, sourcesFound)
            }        
        } else {
            const element = value.element

            if (element.classList.contains("voltageSource")) {
                sourcesFound.push({element: element, path: pathObject.color, voltage: voltageSources().find(obj => obj.element === element).voltage.value})
            }
        }
    }
}


function calculateSeries(pathObject) {
    const path = pathObject.path;

    let totalVoltage = 0;
    let lackOfInformation = false

    const sourcesFound = new Set();

    for (const value of path) {
        if (typeof value === "string") { //break
            const values = calculateNodeVoltage(determineBreak(value), lackOfInformation)

            lackOfInformation = values.lackOfInformation
            
            if (!lackOfInformation) {
                totalVoltage += values.nodeVoltage
            }
        } else {
            if (value.element.classList.contains("voltageSource") && !sourcesFound.has(value.element)) {
                sourcesFound.add(value.element)

                const voltage = voltageSources().find(val => val.element === value.element).voltage.value

                if (voltage === null) {
                    lackOfInformation = true
                } else {
                    totalVoltage += voltage
                }
            }
        }

    }

    if (!lackOfInformation) {
        data.find(object => object.path === pathObject.color).pathVoltage = totalVoltage
    }

    return lackOfInformation
}

export function calculateVoltage(mainPathObject) {
    //const object = checkForParallelIdealVoltageSources(mainPathObject)
    const boolean = checkValueOfParallelIdealVoltageSources(breaks)

    let totalVoltage;

    if (boolean) {
        
            console.log("yes")
            let lackOfInformation = false;

            //Starts from the last break and makes its way to the top
            for (let i = breaks.length - 1; i >= 0; i--) {
                const array = breaks[i]

                array.forEach(object => {
                    lackOfInformation = calculateSeries(object)
                })

                if (lackOfInformation) {
                    break
                }
            }

            //Follow the main branch
            if (!lackOfInformation) {
                calculateSeries(mainPathObject)
            }
            //Old Code
            //Since the circuitry is valid, all the nodes containg ideal voltage sources happen to have the same ideal voltage
            
            //Due to lack of expertise in the field the user will be prompted that the solution may not be accurate in this edge case
            

            /*breaks.forEach(array => {
                array.forEach(obj => {
                    for (const value of obj.path) {
                        if (typeof value !== "string") {
                            if (value.element.classList.contains("voltageSource")) {
                                if (voltageSources.find(val => val.element === value.element).resistance.value === 0) {
                                    data.find(val => val.path === obj.color).pathVoltage = idealVoltage
                                } else {
                                    calculateSeries(obj)
                                }
                            }

                        }
                    }
                })
            })*/

            //calculateSeries(mainPathObject)

            //console.log("UNSURE OF THE DATA'S VALIDITY, CONSULT A PROFESSOR")

       
    } else {
        console.log("IMPOSSIBLE CIRCUITRY, SHORT-CIRCUIT")

    }

    return data
}

export function calculateNodeVoltage(breakNumber) {
    /*
    Vnode = (Σ(i = 1 -> n) (Vi / Ri)) / (Σ(i = 1 -> n) (1 / Ri))
    */

    let numerator = 0;
    let denumerator = 0;

    let lackOfInformation = false;

    for (const object of breaks[breakNumber]) {
        const values = data.find(obj => obj.path === object.color)

        const voltage = values.pathVoltage
        const resistance = values.pathResistance

        if (!(resistance === null || resistance === 0 || voltage === null)) {
            numerator += voltage / resistance
            denumerator += Math.pow(resistance, -1)
        } else if (resistance === 0) { 
            return {nodeVoltage: voltage, lackOfInformation: null, ideal: true}
        } else {
            lackOfInformation = true
        }
    }

    if (!lackOfInformation) {
        return {nodeVoltage: numerator / denumerator, lackOfInformation: false, ideal: false}
    } 

    return {nodeVoltage: null, lackOfInformation: true, ideal: false}
}

function checkValueOfParallelIdealVoltageSources(breaks) {
    for (let i = breaks.length - 1; i >= 0; i--) {
        const array = breaks[i]

        const idealSources = []

        array.forEach(object => {
            const path = object.path

            const currentIdealSources = []

            let shouldStop = false;

            path.forEach(value => {
                if (!shouldStop) {
                    if (typeof value === "string") {
                        const values = calculateNodeVoltage(determineBreak(value))

                        if (values.ideal) {
                            const idealNodeVoltage = values.nodeVoltage

                            currentIdealSources.push(idealNodeVoltage)
                        } else {
                            currentIdealSources.length = 0 
                            shouldStop = true
                        }
                    } else {
                        if (value.element.classList.contains("voltageSource")) {
                            if (isIdeal(value.element)) {
                                const idealVoltage = voltageSources().find(obj => obj.element === value.element).voltage.value

                                currentIdealSources.push(idealVoltage)
                            } else {
                                currentIdealSources.length = 0
                                shouldStop = true
                            }
                        }
                    }
                }
            })

            const idealPathVoltage = shouldStop ? null : currentIdealSources.reduce((acc, val) => acc += val, 0)
        
            idealSources.push(idealPathVoltage)
        })

        const randomValue = idealSources.find(val => val !== null)

        if (randomValue) { //at least one path with an ideal voltage source exists
            const boolean = idealSources.every(val => val === null || val === randomValue)

            if (!boolean) {
                return false
            }
        }
    }

    return true
}


function isIdeal(voltageSource) {
    return voltageSources().find(obj => obj.element === voltageSource).resistance.value === 0
}