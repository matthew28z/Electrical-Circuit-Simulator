import { handleAllClicks, removeAllClicks } from "./commonFunctions.js"
import { allObject } from "./management.js"
const body = document.body;

export const voltageSources = [];

const handleClick = (event) => {
    handleAllClicks("voltageSource", voltageSources, event)

    const element = voltageSources[voltageSources.length - 1]

    voltageSources[voltageSources.length - 1] = {element: element, voltage: null, resistance: 0}
}

export const addVoltage = () => {
    body.addEventListener("click", handleClick)
}

export function removeVoltage() {
    removeAllClicks(handleClick)
}