import { allObject } from "../logic/management.js";

function uniqueClass(element){
    return Array.from(element.classList).filter(val => val !== "userCreated")[0];
}

export function findValue(valueWanted, element) {
    return allObject[uniqueClass(element) + "s"].find(object => object.element === element)[valueWanted];
}

export function determineBreak(string) {
    return Number(string.split("-")[1])
}