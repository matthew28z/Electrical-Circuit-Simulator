import { start } from "node:repl";
import { getRandomInt } from "./commonFunctions.js";

//Types-Interfaces
type currentHue = "yellowish" | "lightBlueish";
type currentColor = `rgb(${number}, ${number}, ${number})`;
type side = "left" | "right";
type point = "leftPoint" | "rightPoint" | "actualPoint";

interface connectionList {
    left: Set<HTMLElement>;
    right: Set<HTMLElement>;
}

interface AE {
    element: HTMLElement;
    connections: connectionList;
}

interface pathObject {
    element: HTMLElement;
    point: point;
}

interface currentPath {
    color: currentColor;
    path: pathObject[];
    isClosed: boolean;
    descendantOf: currentColor | null;
}

const scenario : currentHue = getRandomInt(1, 2) === 1 ? "yellowish" : "lightBlueish";

export const pathColors: currentColor[] = [];

export let allElements : Map<HTMLElement, AE>= new Map();

export function updateAllElements(
    element: HTMLElement,
    connectedElement: HTMLElement | null = null,
    side: side | null = null
) : void {
    const objectToUpdate : AE | undefined = allElements.get(element);

    if (!objectToUpdate) { //is a new element
        if (connectedElement) {
            if (side === "left") {
                allElements.set(element, { element: element, connections: { left: new Set([connectedElement]), right: new Set() } });
            } else {
                allElements.set(element, { element: element, connections: { left: new Set(), right: new Set([connectedElement]) } });
            };
        } else {
            allElements.set(element, { element: element, connections: { left: new Set(), right: new Set() } });
        }
    } else if (side && connectedElement) { 
        //For an element to not be new this means that there is a connectedElement and a side specified
        objectToUpdate.connections[side].add(connectedElement); //avoids duplicates since it is a set
    }    
}

export const breaks: currentPath[] = [];

function findPathStart(voltageSources : any) : HTMLElement | undefined {
    let startingElement : HTMLElement | undefined;
    
    for (const object of voltageSources) {
        const voltageSource : HTMLElement = object.element;
        
        const AEObject : AE | undefined = allElements.get(voltageSource);

        if (AEObject && AEObject.connections.left.size !== 0 && AEObject.connections.right.size !== 0) {
            startingElement = voltageSource;
            break;
        }
    }

    return startingElement;
}

export function findMainPath(voltageSources : any) : currentPath | void {
    const startingElement : HTMLElement | undefined = findPathStart(voltageSources);
    
    if (startingElement) {
        let currentElement: HTMLElement = startingElement;
        let side : side = "left";
        let isClosed : boolean = false;
        
        const mainPath: currentPath = {
            color: findColor(),
            path: [],
            isClosed: false,
            descendantOf: null
        };

        while (!isClosed) {
            const AEObject : AE | undefined = allElements.get(currentElement);

            if (AEObject) {
                const nextSide : side = side === "left" ? "right" : "left";
                if (AEObject.connections[nextSide].size === 0) {
                    console.log("NO PATH FOUND");

                    return;
                } else if (AEObject.connections[nextSide].size === 1) {
                    const nextElement : HTMLElement | undefined = AEObject.connections[nextSide].values().next().value;
                    
                    if (!nextElement) {
                        console.log("FATAL ERROR (CORRUPTED DATA)")
                        return;
                    } 

                    const currentPoint : point = side === "left" ? "leftPoint" : "rightPoint";

                    mainPath.path.push({ element: currentElement, point: currentPoint });

                    currentElement = nextElement;
                    side = nextSide;
                } else {
                    //const breakPath = 
                }
            } else {
                console.log("FATAL ERROR (CORRUPTED DATA)")
                return;
            }
        }
    }
}

function findBreakPath(startingConnection : HTMLElement) : currentPath | void {
    
}

function findColor() : currentColor {
    let red : number;
    let green : number;
    let blue : number;

    let color : currentColor;
    if (scenario === "yellowish") {
        do {
            red   = getRandomInt(230, 255); 
            green = getRandomInt(220, 250);  
            blue  = getRandomInt(150, 210);  


            color = `rgb(${red}, ${green}, ${blue})`
        } while (pathColors.includes(color))  
    } else {
        do {
            red   = getRandomInt(200, 245);  
            green = getRandomInt(210, 255);  
            blue  = getRandomInt(180, 240);  


            color = `rgb(${red}, ${green}, ${blue})`
        } while (pathColors.includes(color))
    }

    pathColors.push(color)

    return color
}