import { allPaths, breaks, pathColors, allElements } from "../../src/app/logic/paths";
import { allObject } from "../../src/app/logic/management";
import { data } from "../../src/calculation/data";

// Helper to create a fake DOM element
let idCounter = 0;
export function createFakeElement(type) {
    const el = document.createElement("div");
    el.dataset.belongsTo = type;
    el.dataset.testid = `fake-element-${idCounter++}`;
    return el;
}

// Reset everything for a clean slate before each test
export function resetEngineData() {
    allPaths.clear();
    breaks.length = 0;
    pathColors.clear();
    allElements.clear();
    data.clear();

    allObject.values.forEach(array => array.length = 0);
}

// Helper to mock user values in allObject
export function addComponentValue(type, element, ...keyValues) {
    let obj = allObject[type].find(o => o.element === element); //finds the element's entry

    if (!obj) { //or creates one
        obj = { element };
        allObject[type].push(obj);
    }

    for (const {key, value} of keyValues) { //assigns the values
        obj[key] = { value };
    }
}
