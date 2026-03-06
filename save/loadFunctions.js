import { allObject } from "../logic/management.js";
import { allElements } from "../logic/paths.js";
import { changeTransform } from "../camera/move.js";
import { changeValues } from "../logic/management.js";
import { changeAllElements } from "../logic/paths.js";
import { addScreen } from "../save/toggleScreens.js";
import { wires } from "../logic/wires.js";
import { processAllElementsId, processAllObjectId, processWiresId } from "./commonFunctions.js";

export function loadCircuit(name, isCopy = false) {
    console.log(wires)
    const allElementsId = JSON.parse(localStorage.getItem(`${name}-allElementsId`));
    const allObjectId = JSON.parse(localStorage.getItem(`${name}-allObjectId`));
    const wiresId = JSON.parse(localStorage.getItem(`${name}-wiresId`))

    addScreen(true); //adds a new screen and changes to it

    document.querySelector(".screen.visible").innerHTML = localStorage.getItem(`${name}-circuitHTML`)

    processWires(wiresId)
    processLoadedData(allObjectId, allElementsId)

    console.log(allObject)
    console.log(allElements)
    console.log(wires)
}

function processLoadedData(allObjectId, allElementsId) {
    const screen = document.querySelector(".screen.visible");

    const svg = d3.select(screen.querySelector(".overlay"));

    const allG = svg.select(".allG");
    const bridgeG = allG.select(".bridgeG");
    const cBridgeG = allG.select(".cBridgeG");
    const currentG = allG.select(".currentG");
    const fakeWireG = allG.select(".fakeWireG");
    const wireG = allG.select(".wireG");

    //Creates a usable allElements from allElementsId
    const newAllElements = processAllElementsId(allElementsId);

    //ids will be cleared after this as there is no recursion

    //Creates a usable allObject from allObjectId
    const newAllObject = processAllObjectId(allObjectId);

    changeValues(screen, svg, bridgeG, cBridgeG, currentG, fakeWireG, wireG, allG, newAllObject);
    changeAllElements(newAllElements);
    changeTransform({x: 0, y: 0, z: 1});
}

//This need to run before processLoadedData, as it also needs the userCreated elements to have IDs
export function processWires(wiresId) {
    //Since wires stores more than just the loaded data, we only need to push the new data to it, after we process them
    const processedWires = processWiresId(wiresId);

    wires.push(...processedWires)
}