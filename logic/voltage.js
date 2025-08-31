import { handleAllClicks, removeAllClicks, userCreatedTab } from "./commonFunctions.js"
import { allObject } from "./management.js";

const body = document.body;
const screen = document.getElementById("screen");

export const voltageSources = allObject.voltageSources;

const handleClick = (event) => {
    const goodClick = handleAllClicks("voltageSource", voltageSources, event)

    if (goodClick) {
        const element = voltageSources.at(-1)

        voltageSources[voltageSources.length - 1] = {element: element, voltage: {value: null, UM: "(V)"}, resistance: {value: 0, UM: "(Ω)"}, hasTab: false}
    

        element.addEventListener("mousedown", (event) => {
            if (event.button === 2) {
                const tab = userCreatedTab(element, voltageSources)

                //special event listener special to voltage sources
                if (tab) {
                    const voltageInput = tab.querySelector("input") //the first element is the correct one

                    voltageInput.addEventListener("input", (e) => {
                        const currentValue = Number(e.target.value)

                        if (currentValue < 0) {
                            element.style.transform = "rotate(180deg)" 
                        } else {
                            element.style.transform = "rotate(0deg)" 
                        }
                    })
                }
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