import { rightClick as rCVoltage} from "./voltage.js";
import { handleMouseClick as rCConnection} from "./connection.js";
import { rightClick as rCResistor } from "./resistor.js";

const eventListenerFunctions = [
    { tag: "voltageSource", operation: rCVoltage },
    { tag: "connection", operation: rCConnection },
    { tag: "resistor", operation: rCResistor }
];

export let operation;

export function addEventListeners(newScreen) { //this must be called after changeOperation
    newScreen.addEventListener("mousedown", operation);
}

export function removeEventListeners(oldScreen) { //this must be called before changeOperation
    oldScreen.removeEventListener("mousedown", operation);
}

export function changeOperation(newScreen) {
    operation = (event) => {
        const element = event.target;

        let uniqueClass;

        if (element.classList.contains("userCreated")) {
            uniqueClass = Array.from(element.classList).find(c => c != "userCreated")
        
            for (const object of eventListenerFunctions) {
                if (uniqueClass === object.tag) {
                    object.operation(event);

                    return; //break early
                }
            }
        }
    }
}