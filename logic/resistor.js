import { handleAllClicks, removeAllClicks, userCreatedTab } from "./commonFunctions.js"
import { allObject } from "./management.js"

const body = document.body;

const resistors = allObject.resistors;

const handleClick = (event) => {
    const goodClick = handleAllClicks("resistor", resistors, event)

    if (goodClick) {
        const resistor = resistors[resistors.length - 1]

        resistors[resistors.length - 1] = {element: resistor, resistance: null}

        resistor.addEventListener("mousedown", (event) => {
            if (event.button === 2) {
                userCreatedTab(resistor, resistors)
            }
        })
    }
}

export const addResistor = () => {
    body.addEventListener("click", handleClick)
}

export function removeResistor() {
    removeAllClicks(handleClick)
}
