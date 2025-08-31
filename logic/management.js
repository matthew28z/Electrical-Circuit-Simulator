export const allObject = { 
    voltageSources: [],
    resistors: [],
    connections: []
};

export const minimumValues = {
    voltage: -Infinity,
    resistance: 0,
    current: -Infinity
}

const svg = d3.select("#overlay");
export const bridgeG = svg.append("g");
export const cBridgeG = svg.append("g");
export const currentG = svg.append("g");
export const fakeWireG = svg.append("g");
export const wireG = svg.append("g");

//Creates the correct stack order
wireG.lower()
fakeWireG.raise()
currentG.raise()
bridgeG.raise()
cBridgeG.raise()


