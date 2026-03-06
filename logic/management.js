
import * as d3 from "d3";
export let allObject = { 
    voltageSources: [],
    resistors: [],
    connections: [],
    amperometers: []
};

export const minimumValues = {
    voltage: -Infinity,
    resistance: 0,
    current: -Infinity
}

export let screen = document.getElementById("screen-0"); //starting screen

export let svg = d3.select("#screen-0 .overlay");

export let allG = svg.append("g");
allG.classed("allG", true);

export let bridgeG = allG.append("g");
console.log(bridgeG)
bridgeG.classed("bridgeG", true);

export let cBridgeG = allG.append("g");
cBridgeG.classed("cBridgeG", true);

export let currentG = allG.append("g");
currentG.classed("currentG", true);

export let fakeWireG = allG.append("g");
fakeWireG.classed("fakeWireG", true);

export let wireG = allG.append("g");
wireG.classed("wireG", true);

//Creates the correct stack order
wireG.lower()
fakeWireG.raise()
currentG.raise()
bridgeG.raise()
cBridgeG.raise()
allG.lower()

export function changeValues(newScreen, newSVG, newBridgeG, newCBridgeG, newCurrentG, newFakeWireG, newWireG, newAllG, newAllObject) {
    screen = newScreen
    svg = newSVG
    bridgeG = newBridgeG
    cBridgeG = newCBridgeG
    currentG = newCurrentG
    fakeWireG = newFakeWireG
    wireG = newWireG
    allG = newAllG
    allObject = newAllObject
}
