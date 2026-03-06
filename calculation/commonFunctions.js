import { allObject } from "../logic/management.js";

export function findValue(element, valueWanted, data) {
    let tempData = data;

    let valueNotSet = false; //this is outside the if loop since for connections it can never be true

    if (!element.classList.contains("connection")) {

        const elementType = element.classList.value.split(" ").filter(value => value !== "userCreated")[0]
        console.log(elementType + "s")

        const value = allObject[elementType + "s"].find(obj => obj.element === element)[valueWanted].value
                    
        if (value === null) {
            valueNotSet = true
        } else {
            tempData += value
        }
    }

    return {boolean: valueNotSet, data: tempData}
}

export function determineBreak(string) {
    return Number(string.split("-")[1])
}