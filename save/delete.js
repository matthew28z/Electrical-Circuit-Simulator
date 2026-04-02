import { allElements } from "../logic/paths.js";
import { allObject } from "../logic/management.js";
import { wires, clickedElements } from "../logic/wires.js";

function shallowDeleteAE(elementToDelete, secondElement) {
    const object = allElements.get(secondElement).connections;

    if (!object.left.delete(elementToDelete)) {
        object.right.delete(elementToDelete);
    }
}

export function deleteElementFromAllElements(elementToDelete) {
    //Removes references to the element that is about to be deleted from the rest of the allElement's data
    for (const set of Object.values(allElements.get(elementToDelete).connections)) {
        set.forEach((element) => { 
            shallowDeleteAE(elementToDelete, element);
        })
    }    

    //Deletes the element's entry in the allElements map
    allElements.delete(elementToDelete);
}
