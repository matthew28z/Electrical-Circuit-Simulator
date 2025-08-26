import { handleAllClicks, removeAllClicks, userCreatedTab } from "./commonFunctions.js"
import { allObject } from "./management.js";

const body = document.body;
const screen = document.getElementById("screen");

export const voltageSources = [];

const handleClick = (event) => {
    const goodClick = handleAllClicks("voltageSource", voltageSources, event)

    if (goodClick) {
        const element = voltageSources[voltageSources.length - 1]

        voltageSources[voltageSources.length - 1] = {element: element, voltage: {value: null, UM: "(V)"}, resistance: {value: 0, UM: "(Ω)"}, hasTab: false}
    

        element.addEventListener("mousedown", (event) => {
            if (event.button === 2) {
                userCreatedTab(element, voltageSources)
            }
        })
    }
}

export const addVoltage = () => {
    screen.addEventListener("click", handleClick)
}

export function removeVoltage() {
    removeAllClicks(handleClick)
}